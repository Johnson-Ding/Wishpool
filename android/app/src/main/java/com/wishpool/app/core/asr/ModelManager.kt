package com.wishpool.app.core.asr

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

data class SherpaModelSpec(
    val languageTag: String,
    val directoryName: String,
    val requiredFiles: List<String>,
)

data class SherpaModelFiles(
    val modelDir: File,
    val encoder: File,
    val decoder: File,
    val joiner: File,
    val tokens: File,
)

object SherpaModelCatalog {
    fun zipformerZh14M(): SherpaModelSpec = SherpaModelSpec(
        languageTag = "zh",
        directoryName = "sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23",
        requiredFiles = listOf(
            "encoder-epoch-99-avg-1.int8.onnx",
            "decoder-epoch-99-avg-1.onnx",
            "joiner-epoch-99-avg-1.onnx",
            "tokens.txt",
        ),
    )
}

object SherpaModelLayoutResolver {
    fun resolve(modelDir: File): SherpaModelFiles {
        require(modelDir.exists()) { "Model directory does not exist: ${modelDir.absolutePath}" }

        val encoder = modelDir.findRequiredFile("encoder")
        val decoder = modelDir.findRequiredFile("decoder")
        val joiner = modelDir.findRequiredFile("joiner")
        val tokens = File(modelDir, "tokens.txt").takeIf { it.exists() }
            ?: throw IllegalStateException("Missing tokens.txt in ${modelDir.absolutePath}")

        return SherpaModelFiles(
            modelDir = modelDir,
            encoder = encoder,
            decoder = decoder,
            joiner = joiner,
            tokens = tokens,
        )
    }

    private fun File.findRequiredFile(prefix: String): File {
        return listFiles().orEmpty()
            .firstOrNull { it.name.startsWith(prefix, ignoreCase = true) && it.name.endsWith(".onnx") }
            ?: throw IllegalStateException("Missing $prefix model in ${absolutePath}")
    }
}

class ModelManager(
    private val context: Context,
) {
    private val mutex = Mutex()
    private val spec = SherpaModelCatalog.zipformerZh14M()
    private val asrRootDir = File(context.filesDir, "asr")
    private val modelDir = File(asrRootDir, "models/${spec.directoryName}")
    private val assetModelDir = "asr/${spec.directoryName}"

    suspend fun prepareModel(onProgress: (Float) -> Unit = {}): SherpaModelFiles = mutex.withLock {
        withContext(Dispatchers.IO) {
            modelDir.mkdirs()

            val alreadyPrepared = runCatching { SherpaModelLayoutResolver.resolve(modelDir) }.getOrNull()
            if (alreadyPrepared != null) {
                onProgress(1f)
                return@withContext alreadyPrepared
            }

            copyBundledModelIfNeeded(onProgress)
            onProgress(1f)
            SherpaModelLayoutResolver.resolve(modelDir)
        }
    }

    fun hasPreparedModel(): Boolean = runCatching {
        SherpaModelLayoutResolver.resolve(modelDir)
    }.isSuccess

    private fun copyBundledModelIfNeeded(onProgress: (Float) -> Unit) {
        val assetManager = context.assets
        val sourceFiles = runCatching { assetManager.list(assetModelDir).orEmpty().toSet() }
            .getOrElse { throw IllegalStateException("读取内置 ASR 模型失败: ${it.message}") }

        if (!sourceFiles.containsAll(spec.requiredFiles)) {
            val missing = spec.requiredFiles.filterNot(sourceFiles::contains)
            throw IllegalStateException("APK 内缺少 ASR 模型文件: ${missing.joinToString()}")
        }

        val existingFiles = spec.requiredFiles.count { File(modelDir, it).exists() }
        if (existingFiles == spec.requiredFiles.size) {
            onProgress(1f)
            return
        }

        if (modelDir.exists()) {
            modelDir.deleteRecursively()
        }
        modelDir.mkdirs()

        spec.requiredFiles.forEachIndexed { index, fileName ->
            assetManager.open("$assetModelDir/$fileName").use { input ->
                FileOutputStream(File(modelDir, fileName)).use { output ->
                    input.copyTo(output)
                }
            }
            onProgress((index + 1).toFloat() / spec.requiredFiles.size.toFloat())
        }
    }
}
