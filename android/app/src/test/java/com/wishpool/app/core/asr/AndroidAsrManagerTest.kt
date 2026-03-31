package com.wishpool.app.core.asr

import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class AndroidAsrManagerTest {

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun `startRecording should switch speech recognizer work onto main dispatcher`() = runBlocking {
        val mainDispatcher = newSingleThreadContext("android-asr-main")
        try {
            val recognizer = FakeSpeechRecognizerHandle()
            val manager = AndroidAsrManager(
                context = object : ContextWrapper(null) {
                    override fun getPackageName(): String = "com.wishpool.app"
                },
                mainDispatcher = mainDispatcher,
                permissionChecker = { true },
                recognizerFactory = object : SpeechRecognizerFactory {
                    override fun create(
                        context: Context,
                        listener: RecognitionListener,
                    ): SpeechRecognizerHandle {
                        recognizer.listener = listener
                        return recognizer
                    }
                },
                recognizerIntentFactory = { Intent("test-recognizer") },
            )

            manager.startRecording()

            assertTrue(
                "expected startListening on android-asr-main, actualThread=${recognizer.startThreadName}, state=${manager.state.value}",
                recognizer.startThreadName?.contains("android-asr-main") == true,
            )
        } finally {
            mainDispatcher.close()
        }
    }

    private class FakeSpeechRecognizerHandle : SpeechRecognizerHandle {
        var listener: RecognitionListener? = null
        var startThreadName: String? = null

        override fun startListening(intent: Intent) {
            startThreadName = Thread.currentThread().name
            listener?.onReadyForSpeech(Bundle())
        }

        override fun stopListening() = Unit

        override fun destroy() = Unit
    }
}
