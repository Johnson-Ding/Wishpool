package com.wishpool.app.core.asr

import android.content.res.AssetManager
import com.k2fsa.sherpa.onnx.OnlineRecognizerConfig

internal object SherpaRecognizerFactory {
    fun <T> createFromFiles(
        config: OnlineRecognizerConfig,
        builder: (AssetManager?, OnlineRecognizerConfig) -> T,
    ): T = builder(null, config)
}
