package com.wishpool.app.core.asr

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * 优先使用端侧 Sherpa ASR；如果启动或运行时失败，则切到 Android 原生语音识别。
 * 这样不会因为某一条识别链路失效导致整条语音入口完全不可用。
 */
class FallbackAsrManager(
    private val primary: AsrManager,
    private val fallback: AsrManager,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
    private val onFallbackActivated: ((String) -> Unit)? = null,
) : AsrManager {
    private val mutex = Mutex()
    private val _state = MutableStateFlow(primary.state.value)

    private var activeManager: AsrManager = primary
    private var stateCollectionJob: Job? = null
    private var pendingRecording = false

    override val state: StateFlow<AsrState> = _state.asStateFlow()

    init {
        observeState(primary)
    }

    override suspend fun startRecording() {
        mutex.withLock {
            pendingRecording = true
        }

        try {
            activeManager.startRecording()
        } catch (error: Throwable) {
            if (activeManager === primary) {
                activateFallback(error.message ?: "Sherpa ASR 启动失败")
            } else {
                throw error
            }
        }
    }

    override suspend fun stopRecording() {
        mutex.withLock {
            pendingRecording = false
        }
        activeManager.stopRecording()
    }

    override suspend fun reset() {
        mutex.withLock {
            pendingRecording = false
        }
        activeManager.reset()
        _state.value = activeManager.state.value
    }

    override fun warmUp() {
        primary.warmUp()
    }

    private fun observeState(manager: AsrManager) {
        stateCollectionJob?.cancel()
        stateCollectionJob = scope.launch {
            manager.state.collectLatest { state ->
                if (manager !== activeManager) return@collectLatest

                if (manager === primary && state is AsrState.Error) {
                    activateFallback(state.message)
                    return@collectLatest
                }

                _state.value = state
            }
        }
    }

    private suspend fun activateFallback(reason: String) {
        val shouldStartRecording = mutex.withLock {
            if (activeManager === fallback) {
                return
            }

            activeManager = fallback
            pendingRecording
        }

        runCatching { primary.reset() }
        fallback.warmUp()
        observeState(fallback)
        onFallbackActivated?.invoke(reason)

        if (shouldStartRecording) {
            fallback.startRecording()
        } else {
            _state.value = fallback.state.value
        }
    }
}
