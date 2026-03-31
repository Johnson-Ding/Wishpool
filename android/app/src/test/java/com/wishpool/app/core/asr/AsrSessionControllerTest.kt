package com.wishpool.app.core.asr

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.yield
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AsrSessionControllerTest {

    @Test
    fun `primary success should keep primary chain and expose result`() = runBlocking {
        val primary = FakeAsrEngine(resultText = "primary result")
        val fallback = FakeAsrEngine(resultText = "fallback result")
        val controller = AsrSessionController(
            primary = primary,
            fallback = fallback,
            scope = CoroutineScope(Dispatchers.Unconfined),
        )

        yield()
        controller.startRecording()
        waitForCondition { controller.state.value == AsrState.Result("primary result") }

        assertTrue(primary.startCalled)
        assertEquals(0, fallback.startCount)
        assertEquals(AsrState.Result("primary result"), controller.state.value)
    }

    @Test
    fun `primary error should activate fallback and expose fallback result`() = runBlocking {
        val primary = FakeAsrEngine()
        val fallback = FakeAsrEngine(resultText = "fallback result")
        var fallbackReason: String? = null
        val controller = AsrSessionController(
            primary = primary,
            fallback = fallback,
            scope = CoroutineScope(Dispatchers.Unconfined),
            onFallbackActivated = { reason -> fallbackReason = reason },
        )

        yield()
        controller.startRecording()
        primary.emit(AsrState.Error("primary failed"))
        waitForCondition { controller.state.value == AsrState.Result("fallback result") }

        assertEquals("primary failed", fallbackReason)
        assertEquals(1, fallback.startCount)
        assertEquals(AsrState.Result("fallback result"), controller.state.value)
    }

    @Test
    fun `reset should always return idle state`() = runBlocking {
        val primary = FakeAsrEngine()
        val fallback = FakeAsrEngine(resultText = "fallback result")
        val controller = AsrSessionController(
            primary = primary,
            fallback = fallback,
            scope = CoroutineScope(Dispatchers.Unconfined),
        )

        yield()
        controller.startRecording()
        primary.emit(AsrState.Error("primary failed"))
        waitForCondition { controller.state.value == AsrState.Result("fallback result") }

        controller.reset()

        assertEquals(AsrState.Idle, controller.state.value)
    }

    private class FakeAsrEngine(
        private val resultText: String? = null,
    ) : AsrEngine {
        private val mutableState = MutableStateFlow<AsrState>(AsrState.Idle)

        var startCalled = false
        var startCount = 0

        override val state: StateFlow<AsrState> = mutableState

        override suspend fun startRecording() {
            startCalled = true
            startCount += 1
            resultText?.let { mutableState.value = AsrState.Result(it) }
        }

        override suspend fun stopRecording() = Unit

        override suspend fun reset() {
            mutableState.value = AsrState.Idle
        }

        override fun warmUp() = Unit

        fun emit(state: AsrState) {
            mutableState.value = state
        }
    }

    private suspend fun waitForCondition(condition: () -> Boolean) {
        repeat(20) {
            if (condition()) return
            yield()
        }
    }
}
