package com.wishpool.app.core.asr

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Mock ASR 实现，用于在缺少 Sherpa ONNX 依赖时提供基本功能
 * 这是一个临时方案，不依赖任何外部库
 */
class MockAsrManager : AsrManager {

    private val _state = MutableStateFlow<AsrState>(AsrState.Idle)
    private val scope = CoroutineScope(Dispatchers.Main)

    override val state: StateFlow<AsrState> = _state

    override suspend fun startRecording() {
        _state.value = AsrState.Recording("", confidence = 0f, isStable = false)

        // 模拟录音过程
        scope.launch {
            delay(800)
            _state.value = AsrState.Recording("我想", confidence = 0.6f, isStable = false)

            delay(600)
            _state.value = AsrState.Recording("我想去海边", confidence = 0.8f, isStable = true)

            delay(800)
            _state.value = AsrState.Processing("我想去海边放松一下", confidence = 0.9f)

            delay(500)
            _state.value = AsrState.Result("我想去海边放松一下")
        }
    }

    override suspend fun stopRecording() {
        when (val currentState = _state.value) {
            is AsrState.Recording -> {
                val finalText = if (currentState.partialText.isNotBlank()) {
                    currentState.partialText
                } else {
                    "我想去海边放松一下"
                }
                _state.value = AsrState.Processing(finalText, confidence = 0.9f)
                delay(300) // 短暂处理时间

                _state.value = AsrState.Result(finalText)
            }
            else -> {
                _state.value = AsrState.Result("已完成识别")
            }
        }
    }

    override suspend fun reset() {
        _state.value = AsrState.Idle
    }

    override fun warmUp() {
        // Mock 实现无需预热
    }
}