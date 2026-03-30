package com.wishpool.app.core.asr

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files

class ModelManagerTest {

    @Test
    fun `resolve model files from extracted zipformer directory`() {
        val modelDir = Files.createTempDirectory("zipformer-model").toFile().apply {
            File(this, "encoder-epoch-99-avg-1.int8.onnx").writeText("encoder")
            File(this, "decoder-epoch-99-avg-1.onnx").writeText("decoder")
            File(this, "joiner-epoch-99-avg-1.onnx").writeText("joiner")
            File(this, "tokens.txt").writeText("token")
        }

        val resolved = SherpaModelLayoutResolver.resolve(modelDir)

        assertEquals(
            "encoder-epoch-99-avg-1.int8.onnx",
            resolved.encoder.name,
        )
        assertEquals("decoder-epoch-99-avg-1.onnx", resolved.decoder.name)
        assertEquals("joiner-epoch-99-avg-1.onnx", resolved.joiner.name)
        assertEquals("tokens.txt", resolved.tokens.name)
    }

    @Test(expected = IllegalStateException::class)
    fun `resolve model files fails when joiner file is missing`() {
        val modelDir = Files.createTempDirectory("zipformer-model-missing").toFile().apply {
            File(this, "encoder-epoch-99-avg-1.int8.onnx").writeText("encoder")
            File(this, "decoder-epoch-99-avg-1.onnx").writeText("decoder")
            File(this, "tokens.txt").writeText("token")
        }

        SherpaModelLayoutResolver.resolve(modelDir)
    }

    @Test
    fun `zipformer model spec points to bundled directory and expected files`() {
        val spec = SherpaModelCatalog.zipformerZh14M()

        assertEquals("zh", spec.languageTag)
        assertEquals(
            "sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23",
            spec.directoryName,
        )
        assertEquals(
            listOf(
                "encoder-epoch-99-avg-1.int8.onnx",
                "decoder-epoch-99-avg-1.onnx",
                "joiner-epoch-99-avg-1.onnx",
                "tokens.txt",
            ),
            spec.requiredFiles,
        )
    }
}
