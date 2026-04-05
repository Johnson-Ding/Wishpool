package com.wishpool.app.core.asr

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

/**
 * Android 内置语音识别实现
 * 使用 Android 系统的 SpeechRecognizer API
 */
class AndroidAsrManager internal constructor(
    private val context: Context,
    private val mainDispatcher: CoroutineDispatcher,
    private val permissionChecker: () -> Boolean,
    private val recognizerFactory: SpeechRecognizerFactory,
    private val recognizerIntentFactory: () -> Intent,
) : AsrEngine {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    constructor(context: Context) : this(
        context = context,
        mainDispatcher = Dispatchers.Main.immediate,
        permissionChecker = {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        },
        recognizerFactory = SystemSpeechRecognizerFactory(),
        recognizerIntentFactory = {
            Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
                putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 1_500L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1_500L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1_000L)
            }
        },
    )

    private val _state = MutableStateFlow<AsrState>(AsrState.Idle)
    override val state: StateFlow<AsrState> = _state

    private var speechRecognizer: SpeechRecognizerHandle? = null
    @Volatile private var sessionToken = 0L
    @Volatile private var sessionStartedAtMs = 0L
    @Volatile private var lastProgressAtMs = 0L
    @Volatile private var hasDetectedSpeech = false
    private var monitoringJob: Job? = null

    override fun warmUp() {
        // Android 内置语音识别不需要特殊预热
        checkPermissionAndInitialize()
    }

    private fun checkPermissionAndInitialize() {
        val hasPermission = permissionChecker()

        if (!hasPermission) {
            _state.value = AsrState.PermissionRequired
            return
        }

        // 不再检查 isRecognitionAvailable — 部分国产 ROM 有语音服务但返回 false
        // 改为在 startRecording 时 try-catch 实际创建，失败再报错
        _state.value = AsrState.Idle
    }

    override suspend fun startRecording() {
        withContext(mainDispatcher) {
            checkPermissionAndInitialize()

            if (_state.value is AsrState.PermissionRequired) {
                return@withContext
            }

            stopRecordingInternal()

            try {
                resetSessionTelemetry()
                speechRecognizer = recognizerFactory.create(context, recognitionListener)
                _state.value = AsrState.Recording("", 0f, false)
                speechRecognizer?.startListening(recognizerIntentFactory())
                startMonitoringSession()
                logDebug("Android SpeechRecognizer started, sessionToken=$sessionToken")
            } catch (error: Throwable) {
                stopMonitoringSession()
                _state.value = AsrState.Error("系统语音识别启动失败: ${error.message}")
                logWarn("Android SpeechRecognizer failed to start", error)
            }
        }
    }

    override suspend fun stopRecording() {
        withContext(mainDispatcher) {
            stopRecordingInternal()
        }
    }

    override suspend fun reset() {
        stopRecording()
        _state.value = AsrState.Idle
    }

    private fun stopRecordingInternal() {
        stopMonitoringSession()
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
    }

    private fun resetSessionTelemetry() {
        sessionToken += 1L
        val now = nowMs()
        sessionStartedAtMs = now
        lastProgressAtMs = now
        hasDetectedSpeech = false
    }

    private fun markProgress(detectedSpeech: Boolean = false) {
        lastProgressAtMs = nowMs()
        if (detectedSpeech) {
            hasDetectedSpeech = true
        }
    }

    private fun startMonitoringSession() {
        stopMonitoringSession()
        val activeToken = sessionToken
        monitoringJob = scope.launch {
            while (isActive) {
                delay(MONITOR_INTERVAL_MS)

                if (activeToken != sessionToken || speechRecognizer == null) {
                    return@launch
                }

                val now = nowMs()
                val currentState = _state.value

                if (
                    currentState is AsrState.Processing &&
                    now - lastProgressAtMs > PROCESSING_RESULT_TIMEOUT_MS
                ) {
                    failSession(activeToken, "系统语音识别整理结果超时，请重试")
                    return@launch
                }

                if (
                    hasDetectedSpeech &&
                    currentState is AsrState.Recording &&
                    now - lastProgressAtMs > AFTER_SPEECH_RESULT_TIMEOUT_MS
                ) {
                    failSession(activeToken, "系统语音识别长时间没有返回文字，请重试")
                    return@launch
                }

                if (
                    !hasDetectedSpeech &&
                    currentState is AsrState.Recording &&
                    now - sessionStartedAtMs > INITIAL_LISTENING_TIMEOUT_MS
                ) {
                    failSession(activeToken, "系统语音识别长时间未检测到语音，请重试")
                    return@launch
                }
            }
        }
    }

    private fun stopMonitoringSession() {
        monitoringJob?.cancel()
        monitoringJob = null
    }

    private suspend fun failSession(token: Long, message: String) {
        withContext(mainDispatcher) {
            if (token != sessionToken || speechRecognizer == null) return@withContext

            logWarn("Android SpeechRecognizer session stalled, message=$message, state=${_state.value}")
            monitoringJob = null
            speechRecognizer?.stopListening()
            speechRecognizer?.destroy()
            speechRecognizer = null
            _state.value = AsrState.Error(message)
        }
    }

    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            markProgress()
            _state.value = AsrState.Recording("", 0f, false)
            logDebug("onReadyForSpeech")
        }

        override fun onBeginningOfSpeech() {
            markProgress(detectedSpeech = true)
            logDebug("onBeginningOfSpeech")
        }

        override fun onRmsChanged(rmsdB: Float) {
            if (rmsdB > SPEECH_RMS_DB_THRESHOLD) {
                markProgress(detectedSpeech = true)
            }
        }

        override fun onBufferReceived(buffer: ByteArray?) {
            // 音频缓冲区数据
        }

        override fun onEndOfSpeech() {
            markProgress(detectedSpeech = true)
            _state.value = AsrState.Processing("", 0f)
            logDebug("onEndOfSpeech")
        }

        override fun onError(error: Int) {
            stopMonitoringSession()
            val errorMessage = when (error) {
                SpeechRecognizer.ERROR_AUDIO -> "音频录制错误"
                SpeechRecognizer.ERROR_CLIENT -> "客户端错误"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "权限不足"
                SpeechRecognizer.ERROR_NETWORK -> "网络错误"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "网络超时"
                SpeechRecognizer.ERROR_NO_MATCH -> "未识别到语音"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "识别服务忙"
                SpeechRecognizer.ERROR_SERVER -> "服务器错误"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "语音输入超时"
                else -> "未知错误: $error"
            }
            _state.value = AsrState.Error(errorMessage)
            logWarn("onError error=$error, message=$errorMessage")
        }

        override fun onResults(results: Bundle?) {
            stopMonitoringSession()
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val recognizedText = matches?.firstOrNull() ?: ""

            if (recognizedText.isNotEmpty()) {
                _state.value = AsrState.Result(recognizedText)
                logDebug("onResults text=$recognizedText")
            } else {
                _state.value = AsrState.Error("未识别到语音内容")
                logWarn("onResults empty")
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val partialText = matches?.firstOrNull() ?: ""

            if (partialText.isNotEmpty()) {
                markProgress(detectedSpeech = true)
                logDebug("onPartialResults text=$partialText")
            }
            _state.value = AsrState.Recording(partialText, 0.7f, false)
        }

        override fun onEvent(eventType: Int, params: Bundle?) {
            // 其他事件
        }
    }

    companion object {
        private const val LOG_TAG = "WishpoolASR"
        private const val MONITOR_INTERVAL_MS = 250L
        private const val INITIAL_LISTENING_TIMEOUT_MS = 8_000L
        private const val AFTER_SPEECH_RESULT_TIMEOUT_MS = 5_000L
        private const val PROCESSING_RESULT_TIMEOUT_MS = 3_000L
        private const val SPEECH_RMS_DB_THRESHOLD = -2f
    }

    private fun logDebug(message: String) {
        runCatching { Log.d(LOG_TAG, message) }
    }

    private fun logWarn(message: String, error: Throwable? = null) {
        runCatching {
            if (error != null) {
                Log.w(LOG_TAG, message, error)
            } else {
                Log.w(LOG_TAG, message)
            }
        }
    }

    private fun nowMs(): Long = System.nanoTime() / 1_000_000L
}

internal interface SpeechRecognizerHandle {
    fun startListening(intent: Intent)
    fun stopListening()
    fun destroy()
}

internal fun interface SpeechRecognizerFactory {
    fun create(context: Context, listener: RecognitionListener): SpeechRecognizerHandle
}

internal class SystemSpeechRecognizerFactory : SpeechRecognizerFactory {
    override fun create(context: Context, listener: RecognitionListener): SpeechRecognizerHandle {
        val recognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(listener)
        }
        return object : SpeechRecognizerHandle {
            override fun startListening(intent: Intent) {
                recognizer.startListening(intent)
            }

            override fun stopListening() {
                recognizer.stopListening()
            }

            override fun destroy() {
                recognizer.destroy()
            }
        }
    }
}
