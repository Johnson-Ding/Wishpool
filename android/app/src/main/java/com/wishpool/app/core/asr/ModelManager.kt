package com.wishpool.app.core.asr

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

data class SherpaModelSpec(
    val languageTag: String,
    val directoryName: String,
    val archiveName: String,
    val archiveUrl: String,
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
        archiveName = "sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23.tar.bz2",
        archiveUrl = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/" +
            "sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23.tar.bz2",
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
    private val httpClient: OkHttpClient = OkHttpClient(),
) {
    private val mutex = Mutex()
    private val spec = SherpaModelCatalog.zipformerZh14M()
    private val asrRootDir = File(context.filesDir, "asr")
    private val archiveDir = File(asrRootDir, "archives")
    private val modelDir = File(asrRootDir, "models/${spec.directoryName}")

    suspend fun prepareModel(onProgress: (Float) -> Unit = {}): SherpaModelFiles = mutex.withLock {
        withContext(Dispatchers.IO) {
            archiveDir.mkdirs()
            modelDir.mkdirs()

            val alreadyPrepared = runCatching { SherpaModelLayoutResolver.resolve(modelDir) }.getOrNull()
            if (alreadyPrepared != null) {
                onProgress(1f)
                return@withContext alreadyPrepared
            }

            val archiveFile = downloadArchiveIfNeeded(onProgress)
            extractArchiveIfNeeded(archiveFile)
            onProgress(1f)
            SherpaModelLayoutResolver.resolve(modelDir)
        }
    }

    fun hasPreparedModel(): Boolean = runCatching {
        SherpaModelLayoutResolver.resolve(modelDir)
    }.isSuccess

    private fun downloadArchiveIfNeeded(onProgress: (Float) -> Unit): File {
        val archiveFile = File(archiveDir, spec.archiveName)
        if (archiveFile.exists() && archiveFile.length() > 0L) {
            return archiveFile
        }

        val request = Request.Builder().url(spec.archiveUrl).build()
        httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IllegalStateException("下载 ASR 模型失败: HTTP ${response.code}")
            }
            val body = response.body ?: throw IllegalStateException("下载 ASR 模型失败: 响应体为空")
            val totalBytes = body.contentLength().takeIf { it > 0 } ?: -1L

            body.byteStream().use { input ->
                FileOutputStream(archiveFile).use { output ->
                    val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                    var downloaded = 0L
                    while (true) {
                        val read = input.read(buffer)
                        if (read == -1) break
                        output.write(buffer, 0, read)
                        downloaded += read
                        if (totalBytes > 0) {
                            onProgress(downloaded.toFloat() / totalBytes.toFloat())
                        }
                    }
                }
            }
        }
        return archiveFile
    }

    private fun extractArchiveIfNeeded(archiveFile: File) {
        val extracted = runCatching { SherpaModelLayoutResolver.resolve(modelDir) }.getOrNull()
        if (extracted != null) return

        val tempDir = File(modelDir.parentFile, "_tmp_${spec.directoryName}")
        if (tempDir.exists()) {
            tempDir.deleteRecursively()
        }
        tempDir.mkdirs()
        extractTarBz2(archiveFile, tempDir)

        val root = resolveArchiveRoot(tempDir)
        if (modelDir.exists()) {
            modelDir.deleteRecursively()
        }
        root.copyRecursively(modelDir, overwrite = true)
        tempDir.deleteRecursively()
    }

    private fun extractTarBz2(archiveFile: File, destinationDir: File) {
        val rootCanonical = destinationDir.canonicalPath
        FileInputStream(archiveFile).use { fileInput ->
            BZip2CompressorInputStream(fileInput).use { bzipInput ->
                TarArchiveInputStream(bzipInput).use { tarInput ->
                    var entry = tarInput.nextTarEntry
                    while (entry != null) {
                        val cleanName = entry.name.trimStart('/')
                        if (cleanName.isNotBlank()) {
                            val target = File(destinationDir, cleanName)
                            val targetCanonical = target.canonicalPath
                            val withinRoot = targetCanonical == rootCanonical ||
                                targetCanonical.startsWith("$rootCanonical${File.separator}")
                            if (!withinRoot) {
                                throw SecurityException("Invalid archive entry: ${entry.name}")
                            }
                            if (entry.isDirectory) {
                                target.mkdirs()
                            } else {
                                target.parentFile?.mkdirs()
                                FileOutputStream(target).use { output ->
                                    tarInput.copyTo(output)
                                }
                            }
                        }
                        entry = tarInput.nextTarEntry
                    }
                }
            }
        }
    }

    private fun resolveArchiveRoot(tempDir: File): File {
        val children = tempDir.listFiles().orEmpty()
        val singleDir = children.singleOrNull { it.isDirectory }
        return if (singleDir != null && children.size == 1) singleDir else tempDir
    }
}
