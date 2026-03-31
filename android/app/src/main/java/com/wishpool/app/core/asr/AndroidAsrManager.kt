package com.wishpool.app.core.asr

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
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
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
        },
    )

    private val _state = MutableStateFlow<AsrState>(AsrState.Idle)
    override val state: StateFlow<AsrState> = _state

    private var speechRecognizer: SpeechRecognizerHandle? = null

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
                speechRecognizer = recognizerFactory.create(context, recognitionListener)
                _state.value = AsrState.Recording("", 0f, false)
                speechRecognizer?.startListening(recognizerIntentFactory())
            } catch (error: Throwable) {
                _state.value = AsrState.Error("系统语音识别启动失败: ${error.message}")
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
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
    }

    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            _state.value = AsrState.Recording("", 0f, false)
        }

        override fun onBeginningOfSpeech() {
            // 用户开始说话
        }

        override fun onRmsChanged(rmsdB: Float) {
            // 音量变化，可以用来显示音量指示器
        }

        override fun onBufferReceived(buffer: ByteArray?) {
            // 音频缓冲区数据
        }

        override fun onEndOfSpeech() {
            _state.value = AsrState.Processing("", 0f)
        }

        override fun onError(error: Int) {
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
        }

        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val recognizedText = matches?.firstOrNull() ?: ""

            if (recognizedText.isNotEmpty()) {
                _state.value = AsrState.Result(recognizedText)
            } else {
                _state.value = AsrState.Error("未识别到语音内容")
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val partialText = matches?.firstOrNull() ?: ""

            _state.value = AsrState.Recording(partialText, 0.7f, false)
        }

        override fun onEvent(eventType: Int, params: Bundle?) {
            // 其他事件
        }
    }
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
