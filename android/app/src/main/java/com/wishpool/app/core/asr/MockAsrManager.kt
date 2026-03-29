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
        _state.value = AsrState.Recording("")

        // 模拟录音过程
        scope.launch {
            delay(1000) // 模拟 1 秒录音
            _state.value = AsrState.Processing("")

            delay(500) // 模拟处理时间

            // 返回模拟结果
            _state.value = AsrState.Result("这是模拟的语音识别结果，用于测试")
        }
    }

    override suspend fun stopRecording() {
        when (val currentState = _state.value) {
            is AsrState.Recording -> {
                _state.value = AsrState.Processing(currentState.partialText)
                delay(300) // 短暂处理时间

                val result = "我想去海边放松一下"
                _state.value = AsrState.Result(result)
            }
            else -> {
                // 如果不在录音状态，直接设为结果
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