package com.wishpool.app.core.asr

import android.content.Context
import android.os.SystemClock
import com.k2fsa.sherpa.onnx.FeatureConfig
import com.k2fsa.sherpa.onnx.OnlineModelConfig
import com.k2fsa.sherpa.onnx.OnlineRecognizer
import com.k2fsa.sherpa.onnx.OnlineRecognizerConfig
import com.k2fsa.sherpa.onnx.OnlineTransducerModelConfig
import com.k2fsa.sherpa.onnx.OnlineStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.math.sqrt

class SherpaAsrManager(
    private val context: Context,
    private val modelManager: ModelManager,
    private val audioSource: AudioPcmSource = AudioRecordManager(),
) : AsrEngine {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val mutex = Mutex()
    private val _state = MutableStateFlow<AsrState>(AsrState.Idle)

    private var recognizer: OnlineRecognizer? = null
    private var stream: OnlineStream? = null
    @Volatile private var latestText: String = ""
    @Volatile private var stopping = false
    @Volatile private var sessionToken = 0L
    @Volatile private var sessionStartedAtMs = 0L
    @Volatile private var lastAudioFrameAtMs = 0L
    @Volatile private var firstSpeechAtMs = 0L
    @Volatile private var lastSpeechAtMs = 0L
    @Volatile private var speechActivityMs = 0L
    private var monitoringJob: Job? = null

    override val state: StateFlow<AsrState> = _state.asStateFlow()

    override suspend fun startRecording() {
        mutex.withLock {
            if (stream != null || stopping) return

            try {
                _state.value = AsrState.Downloading(0f)
                val modelFiles = modelManager.prepareModel { progress ->
                    _state.value = AsrState.Downloading(progress)
                }
                val activeRecognizer = createRecognizer(modelFiles)
                val activeStream = activeRecognizer.createStream()
                val now = SystemClock.elapsedRealtime()

                recognizer = activeRecognizer
                stream = activeStream
                resetSessionTelemetry(now)
                _state.value = AsrState.Recording(partialText = "")

                audioSource.start { samples ->
                    onAudioSamples(samples)
                }
                startMonitoringSession()
            } catch (error: Throwable) {
                stopMonitoringSession()
                releaseSession()
                _state.value = AsrState.Error(error.message ?: "语音识别启动失败")
            }
        }
    }

    override suspend fun stopRecording() {
        mutex.withLock {
            if (stream == null || stopping) return
            stopping = true
            try {
                _state.value = AsrState.Processing(
                    partialText = latestText,
                    confidence = 0.9f
                )
                audioSource.stop()

                val activeStream = stream
                val activeRecognizer = recognizer
                if (activeStream != null && activeRecognizer != null) {
                    activeStream.inputFinished()
                    while (activeRecognizer.isReady(activeStream)) {
                        activeRecognizer.decode(activeStream)
                    }
                    val finalText = activeRecognizer.getResult(activeStream).text.trim()
                    if (finalText.isNotBlank()) {
                        latestText = finalText
                    }
                }

                if (latestText.isBlank()) {
                    _state.value = AsrState.Error("未识别到有效语音，请再试一次")
                } else {
                    _state.value = AsrState.Result(latestText)
                }
            } catch (error: Throwable) {
                _state.value = AsrState.Error(error.message ?: "语音识别失败")
            } finally {
                stopMonitoringSession()
                releaseSession()
                stopping = false
            }
        }
    }

    override suspend fun reset() {
        mutex.withLock {
            stopping = false
            stopMonitoringSession()
            resetSessionTelemetry()
            runCatching { audioSource.stop() }
            releaseSession()
            _state.value = AsrState.Idle
        }
    }

    override fun warmUp() {
        if (modelManager.hasPreparedModel()) return
        scope.launch {
            runCatching { modelManager.prepareModel() }
        }
    }

    private fun onAudioSamples(samples: FloatArray) {
        val activeRecognizer = recognizer ?: return
        val activeStream = stream ?: return
        val now = SystemClock.elapsedRealtime()

        lastAudioFrameAtMs = now
        if (hasSpeechEnergy(samples)) {
            if (firstSpeechAtMs == 0L) {
                firstSpeechAtMs = now
            }
            lastSpeechAtMs = now
            speechActivityMs += samples.size * 1000L / AudioRecordManager.SAMPLE_RATE
        }

        activeStream.acceptWaveform(samples, AudioRecordManager.SAMPLE_RATE)
        while (activeRecognizer.isReady(activeStream)) {
            activeRecognizer.decode(activeStream)
        }

        val result = activeRecognizer.getResult(activeStream)
        val partialText = result.text.trim()
        if (partialText.isNotBlank()) {
            latestText = partialText
            lastSpeechAtMs = now
        }

        // 判断识别结果的稳定性
        val isStable = partialText.isNotBlank() && partialText == latestText
        val confidence = if (partialText.isNotBlank()) 0.8f else 0f

        _state.value = AsrState.Recording(
            partialText = partialText,
            confidence = confidence,
            isStable = isStable
        )

        if (activeRecognizer.isEndpoint(activeStream) && partialText.isNotBlank()) {
            scope.launch {
                stopRecording()
            }
        }
    }

    private fun startMonitoringSession() {
        stopMonitoringSession()
        val activeToken = sessionToken
        monitoringJob = scope.launch {
            while (isActive) {
                delay(SESSION_MONITOR_INTERVAL_MS)

                if (activeToken != sessionToken || stream == null || stopping) {
                    return@launch
                }

                val now = SystemClock.elapsedRealtime()
                val hasTranscript = latestText.isNotBlank()
                val hasMeaningfulSpeech = speechActivityMs >= MIN_SPEECH_ACTIVITY_FOR_RECOVERY_MS

                if (now - lastAudioFrameAtMs > NO_AUDIO_FRAME_TIMEOUT_MS) {
                    failSession(
                        token = activeToken,
                        message = "本地语音链路没有收到麦克风数据，正在切换识别方案",
                    )
                    return@launch
                }

                if (
                    hasMeaningfulSpeech &&
                    !hasTranscript &&
                    firstSpeechAtMs > 0L &&
                    now - firstSpeechAtMs > SPEECH_TO_TEXT_TIMEOUT_MS
                ) {
                    failSession(
                        token = activeToken,
                        message = "本地语音识别没有产出文字，正在切换系统识别",
                    )
                    return@launch
                }

                if (
                    hasTranscript &&
                    lastSpeechAtMs > 0L &&
                    now - lastSpeechAtMs > AUTO_STOP_AFTER_SILENCE_MS
                ) {
                    scope.launch {
                        stopRecording()
                    }
                    return@launch
                }

                if (now - sessionStartedAtMs > MAX_RECORDING_DURATION_MS) {
                    if (hasTranscript) {
                        scope.launch {
                            stopRecording()
                        }
                    } else {
                        failSession(
                            token = activeToken,
                            message = "本地语音识别超时未产出结果，正在切换系统识别",
                        )
                    }
                    return@launch
                }
            }
        }
    }

    private fun stopMonitoringSession() {
        monitoringJob?.cancel()
        monitoringJob = null
    }

    private fun resetSessionTelemetry(now: Long = SystemClock.elapsedRealtime()) {
        sessionToken += 1L
        latestText = ""
        sessionStartedAtMs = now
        lastAudioFrameAtMs = now
        firstSpeechAtMs = 0L
        lastSpeechAtMs = 0L
        speechActivityMs = 0L
    }

    private suspend fun failSession(token: Long, message: String) {
        mutex.withLock {
            if (token != sessionToken || stream == null || stopping) return

            stopping = true
            monitoringJob = null
            runCatching { audioSource.stop() }
            releaseSession()
            _state.value = AsrState.Error(message)
            stopping = false
        }
    }

    private fun hasSpeechEnergy(samples: FloatArray): Boolean {
        if (samples.isEmpty()) return false

        var energy = 0.0
        samples.forEach { sample ->
            energy += sample * sample
        }
        val rms = sqrt(energy / samples.size)
        return rms >= SPEECH_RMS_THRESHOLD
    }

    private fun createRecognizer(modelFiles: SherpaModelFiles): OnlineRecognizer {
        val modelConfig = OnlineModelConfig(
            transducer = OnlineTransducerModelConfig(
                encoder = modelFiles.encoder.absolutePath,
                decoder = modelFiles.decoder.absolutePath,
                joiner = modelFiles.joiner.absolutePath,
            ),
            tokens = modelFiles.tokens.absolutePath,
            numThreads = 2,
            debug = false,
            provider = "cpu",
            modelType = "zipformer",
            modelingUnit = "cjkchar",
        )
        val config = OnlineRecognizerConfig(
            featConfig = FeatureConfig(
                sampleRate = AudioRecordManager.SAMPLE_RATE,
                featureDim = 80,
                dither = 0f,
            ),
            modelConfig = modelConfig,
            enableEndpoint = true,
            decodingMethod = "greedy_search",
        )
        return SherpaRecognizerFactory.createFromFiles(config, ::OnlineRecognizer)
    }

    private fun releaseSession() {
        runCatching { stream?.release() }
        runCatching { recognizer?.release() }
        stream = null
        recognizer = null
    }

    companion object {
        private const val SESSION_MONITOR_INTERVAL_MS = 250L
        private const val NO_AUDIO_FRAME_TIMEOUT_MS = 2_500L
        private const val MIN_SPEECH_ACTIVITY_FOR_RECOVERY_MS = 700L
        private const val SPEECH_TO_TEXT_TIMEOUT_MS = 3_500L
        private const val AUTO_STOP_AFTER_SILENCE_MS = 1_400L
        private const val MAX_RECORDING_DURATION_MS = 15_000L
        private const val SPEECH_RMS_THRESHOLD = 0.02
    }
}
