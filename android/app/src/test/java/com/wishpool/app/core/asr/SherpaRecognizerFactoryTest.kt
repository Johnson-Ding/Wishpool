package com.wishpool.app.core.asr

import android.content.res.AssetManager
import com.k2fsa.sherpa.onnx.FeatureConfig
import com.k2fsa.sherpa.onnx.OnlineModelConfig
import com.k2fsa.sherpa.onnx.OnlineRecognizerConfig
import com.k2fsa.sherpa.onnx.OnlineTransducerModelConfig
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Test

class SherpaRecognizerFactoryTest {

    @Test
    fun `file backed recognizer uses file loading mode`() {
        val config = OnlineRecognizerConfig(
            featConfig = FeatureConfig(
                sampleRate = AudioRecordManager.SAMPLE_RATE,
                featureDim = 80,
                dither = 0f,
            ),
            modelConfig = OnlineModelConfig(
                transducer = OnlineTransducerModelConfig(
                    encoder = "/tmp/encoder.onnx",
                    decoder = "/tmp/decoder.onnx",
                    joiner = "/tmp/joiner.onnx",
                ),
                tokens = "/tmp/tokens.txt",
                numThreads = 2,
                debug = false,
                provider = "cpu",
                modelType = "zipformer",
                modelingUnit = "cjkchar",
            ),
            enableEndpoint = true,
            decodingMethod = "greedy_search",
        )
        var capturedAssetManager: AssetManager? = null
        var capturedConfig: OnlineRecognizerConfig? = null

        val result = SherpaRecognizerFactory.createFromFiles(config) { assetManager, recognizerConfig ->
            capturedAssetManager = assetManager
            capturedConfig = recognizerConfig
            "created"
        }

        assertEquals("created", result)
        assertNull(capturedAssetManager)
        assertSame(config, capturedConfig)
    }
}
