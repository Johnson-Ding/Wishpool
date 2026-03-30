package com.wishpool.app.core.asr

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.yield
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FallbackAsrManagerTest {

    @Test
    fun `switches to fallback when primary emits error during recording`() = runBlocking {
        val primary = FakeAsrManager()
        val fallback = FakeAsrManager(resultText = "fallback result")
        var fallbackReason: String? = null

        val manager = FallbackAsrManager(
            primary = primary,
            fallback = fallback,
            scope = this,
            onFallbackActivated = { fallbackReason = it },
        )

        manager.startRecording()
        primary.emit(AsrState.Error("primary failed"))
        yield()

        assertEquals("primary failed", fallbackReason)
        assertTrue(fallback.startCalled)
        assertEquals(AsrState.Result("fallback result"), manager.state.value)
    }

    @Test
    fun `keeps primary when primary recording works`() = runBlocking {
        val primary = FakeAsrManager(resultText = "primary result")
        val fallback = FakeAsrManager(resultText = "fallback result")
        val manager = FallbackAsrManager(primary = primary, fallback = fallback, scope = this)

        manager.startRecording()
        yield()

        assertTrue(primary.startCalled)
        assertEquals(AsrState.Result("primary result"), manager.state.value)
        assertFalse(fallback.startCalled)
    }

    private class FakeAsrManager(
        private val resultText: String? = null,
    ) : AsrManager {
        private val mutableState = MutableStateFlow<AsrState>(AsrState.Idle)

        var startCalled = false

        override val state: StateFlow<AsrState> = mutableState

        override suspend fun startRecording() {
            startCalled = true
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
}
