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
 * 统一编排 ASR 会话生命周期：
 * - 优先 primary engine
 * - primary 失败时按需切 fallback engine
 * - 对外统一暴露 AsrManager 抽象
 */
class AsrSessionController(
    private val primary: AsrEngine,
    private val fallback: AsrEngine? = null,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
    private val onFallbackActivated: ((String) -> Unit)? = null,
) : AsrManager {
    private val mutex = Mutex()
    private val _state = MutableStateFlow(primary.state.value)

    private var activeEngine: AsrEngine = primary
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
            activeEngine.startRecording()
        } catch (error: Throwable) {
            val activeFallback = fallback
            if (activeEngine === primary && activeFallback != null) {
                activateFallback(activeFallback, error.message ?: "primary engine start failed")
            } else {
                throw error
            }
        }
    }

    override suspend fun stopRecording() {
        mutex.withLock {
            pendingRecording = false
        }
        activeEngine.stopRecording()
    }

    override suspend fun reset() {
        mutex.withLock {
            pendingRecording = false
            activeEngine = primary
        }

        runCatching { primary.reset() }
        runCatching { fallback?.reset() }

        observeState(primary)
        _state.value = AsrState.Idle
    }

    override fun warmUp() {
        primary.warmUp()
    }

    private fun observeState(engine: AsrEngine) {
        stateCollectionJob?.cancel()
        stateCollectionJob = scope.launch {
            engine.state.collectLatest { state ->
                if (engine !== activeEngine) return@collectLatest

                val activeFallback = fallback
                if (engine === primary && state is AsrState.Error && activeFallback != null) {
                    activateFallback(activeFallback, state.message)
                    return@collectLatest
                }

                _state.value = state
            }
        }
    }

    private suspend fun activateFallback(fallbackEngine: AsrEngine, reason: String) {
        val shouldStartRecording = mutex.withLock {
            if (activeEngine === fallbackEngine) {
                return
            }

            activeEngine = fallbackEngine
            pendingRecording
        }

        runCatching { primary.reset() }
        fallbackEngine.warmUp()
        observeState(fallbackEngine)
        onFallbackActivated?.invoke(reason)

        if (shouldStartRecording) {
            fallbackEngine.startRecording()
        } else {
            _state.value = fallbackEngine.state.value
        }
    }
}
