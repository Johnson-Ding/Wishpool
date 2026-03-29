package com.wishpool.app.core.asr

import kotlinx.coroutines.flow.StateFlow

/**
 * ASR (Automatic Speech Recognition) 管理器接口
 * 提供语音识别的核心功能
 */
interface AsrManager {
    val state: StateFlow<AsrState>

    suspend fun startRecording()

    suspend fun stopRecording()

    suspend fun reset()

    fun warmUp()
}