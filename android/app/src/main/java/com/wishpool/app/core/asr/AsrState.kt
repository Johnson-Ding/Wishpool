package com.wishpool.app.core.asr

sealed interface AsrState {
    data object Idle : AsrState

    data object PermissionRequired : AsrState

    data class Downloading(val progress: Float) : AsrState

    data class Recording(
        val partialText: String,
        val confidence: Float = 0f,
        val isStable: Boolean = false
    ) : AsrState

    data class Processing(
        val partialText: String,
        val confidence: Float = 0f
    ) : AsrState

    data class Result(val text: String) : AsrState

    data class Error(val message: String) : AsrState
}
