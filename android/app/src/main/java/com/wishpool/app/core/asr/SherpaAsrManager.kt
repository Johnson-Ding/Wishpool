package com.wishpool.app.core.asr

import android.content.Context
import com.k2fsa.sherpa.onnx.FeatureConfig
import com.k2fsa.sherpa.onnx.OnlineModelConfig
import com.k2fsa.sherpa.onnx.OnlineRecognizer
import com.k2fsa.sherpa.onnx.OnlineRecognizerConfig
import com.k2fsa.sherpa.onnx.OnlineTransducerModelConfig
import com.k2fsa.sherpa.onnx.OnlineStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class SherpaAsrManager(
    private val context: Context,
    private val modelManager: ModelManager,
    private val audioSource: AudioPcmSource = AudioRecordManager(),
) : AsrManager {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val mutex = Mutex()
    private val _state = MutableStateFlow<AsrState>(AsrState.Idle)

    private var recognizer: OnlineRecognizer? = null
    private var stream: OnlineStream? = null
    private var latestText: String = ""
    private var stopping = false

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

                recognizer = activeRecognizer
                stream = activeStream
                latestText = ""
                _state.value = AsrState.Recording(partialText = "")

                audioSource.start { samples ->
                    onAudioSamples(samples)
                }
            } catch (error: Throwable) {
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
                releaseSession()
                stopping = false
            }
        }
    }

    override suspend fun reset() {
        mutex.withLock {
            stopping = false
            latestText = ""
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

        activeStream.acceptWaveform(samples, AudioRecordManager.SAMPLE_RATE)
        while (activeRecognizer.isReady(activeStream)) {
            activeRecognizer.decode(activeStream)
        }

        val result = activeRecognizer.getResult(activeStream)
        val partialText = result.text.trim()
        if (partialText.isNotBlank()) {
            latestText = partialText
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
        return OnlineRecognizer(context.assets, config)
    }

    private fun releaseSession() {
        runCatching { stream?.release() }
        runCatching { recognizer?.release() }
        stream = null
        recognizer = null
    }
}
