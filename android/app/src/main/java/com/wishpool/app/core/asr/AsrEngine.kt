package com.wishpool.app.core.asr

import kotlinx.coroutines.flow.StateFlow

/**
 * ASR 引擎适配层契约。
 * 具体实现负责语音识别链路细节，供 session controller 编排。
 */
interface AsrEngine {
    val state: StateFlow<AsrState>

    suspend fun startRecording()

    suspend fun stopRecording()

    suspend fun reset()

    fun warmUp()
}
