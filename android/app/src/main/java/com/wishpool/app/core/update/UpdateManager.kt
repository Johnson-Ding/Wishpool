package com.wishpool.app.core.update

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import com.wishpool.app.BuildConfig
import com.wishpool.app.domain.model.AppUpdate
import com.wishpool.app.domain.model.UpdateStatus
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

class UpdateManager(private val context: Context) {

    private val _updateStatus = MutableStateFlow(UpdateStatus())
    val updateStatus: StateFlow<UpdateStatus> = _updateStatus.asStateFlow()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val coroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    companion object {
        private const val MAX_RETRIES = 3
        private const val INITIAL_RETRY_DELAY_MS = 1000L
    }

    private var downloadId: Long? = null
    private val downloadReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            if (id == downloadId) {
                handleDownloadComplete()
            }
        }
    }

    init {
        context.registerReceiver(
            downloadReceiver,
            IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            Context.RECEIVER_NOT_EXPORTED
        )
    }

    suspend fun checkForUpdates(): AppUpdate? = withContext(Dispatchers.IO) {
        _updateStatus.value = _updateStatus.value.copy(isChecking = true, error = null)

        var lastException: Exception? = null

        for (attempt in 1..MAX_RETRIES) {
            try {
                val result = doCheckForUpdates()
                _updateStatus.value = _updateStatus.value.copy(isChecking = false)
                return@withContext result
            } catch (e: Exception) {
                lastException = e
                if (attempt < MAX_RETRIES && isRetryable(e)) {
                    val delayMs = INITIAL_RETRY_DELAY_MS * (1L shl (attempt - 1))
                    delay(delayMs)
                } else {
                    break
                }
            }
        }

        val errorMessage = classifyError(lastException)
        _updateStatus.value = _updateStatus.value.copy(
            isChecking = false,
            error = errorMessage
        )
        null
    }

    private fun doCheckForUpdates(): AppUpdate? {
        val request = Request.Builder()
            .url(BuildConfig.VERSION_CHECK_URL)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "Wishpool-Android")
            .build()

        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw HttpException(response.code, response.message)
        }
        val responseBody = response.body?.string() ?: return null

        val latestUpdate = GitHubReleaseUpdateParser.parseAppUpdate(responseBody)
        val currentVersionName = getCurrentVersionName()

        if (GitHubReleaseUpdateParser.isNewerVersion(currentVersionName, latestUpdate.versionName)) {
            _updateStatus.value = _updateStatus.value.copy(
                hasUpdate = true,
                update = latestUpdate,
                error = null,
            )
            return latestUpdate
        }

        _updateStatus.value = _updateStatus.value.copy(
            hasUpdate = false,
            update = null,
            error = null,
        )
        return null
    }

    private fun isRetryable(e: Exception): Boolean = when (e) {
        is HttpException -> e.code in listOf(403, 429, 500, 502, 503, 504)
        is SocketTimeoutException -> true
        is IOException -> true
        else -> false
    }

    private fun classifyError(e: Exception?): String = when (e) {
        is HttpException -> when (e.code) {
            403 -> "GitHub API 访问受限（请求频率过高），请稍后再试"
            429 -> "请求过于频繁，请稍后再试"
            404 -> "未找到版本信息"
            in 500..599 -> "GitHub 服务暂时不可用，请稍后再试"
            else -> "服务器返回错误 (${e.code})"
        }
        is SocketTimeoutException -> "连接超时，请检查网络后重试"
        is UnknownHostException -> "无法连接到服务器，请检查网络连接"
        is IOException -> "网络异常，请检查网络后重试"
        else -> "检查更新失败: ${e?.message ?: "未知错误"}"
    }

    fun downloadUpdate(update: AppUpdate) {
        try {
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

            val request = DownloadManager.Request(Uri.parse(update.downloadUrl))
                .setTitle("许愿池更新")
                .setDescription("正在下载 v${update.versionName}")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "wishpool-${update.versionName}.apk")
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)

            downloadId = downloadManager.enqueue(request)

            _updateStatus.value = _updateStatus.value.copy(
                isDownloading = true,
                error = null
            )

            // Monitor download progress
            monitorDownloadProgress(downloadId!!)

        } catch (e: Exception) {
            _updateStatus.value = _updateStatus.value.copy(
                error = "下载失败: ${e.message}",
                isDownloading = false
            )
        }
    }

    private fun monitorDownloadProgress(downloadId: Long) {
        coroutineScope.launch {
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

            while (_updateStatus.value.isDownloading) {
                val query = DownloadManager.Query().setFilterById(downloadId)
                val cursor = downloadManager.query(query)

                if (cursor.moveToFirst()) {
                    val bytesDownloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
                    val bytesTotal = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))

                    if (bytesTotal > 0) {
                        val progress = (bytesDownloaded * 100f) / bytesTotal
                        _updateStatus.value = _updateStatus.value.copy(downloadProgress = progress / 100f)
                    }

                    val status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                    if (status == DownloadManager.STATUS_FAILED) {
                        _updateStatus.value = _updateStatus.value.copy(
                            error = "下载失败",
                            isDownloading = false
                        )
                        break
                    }
                }
                cursor.close()
                delay(500) // Update every 500ms
            }
        }
    }

    private fun handleDownloadComplete() {
        _updateStatus.value = _updateStatus.value.copy(
            isDownloading = false,
            downloadProgress = 1f
        )

        // Get the downloaded file
        val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val query = DownloadManager.Query().setFilterById(downloadId!!)
        val cursor = downloadManager.query(query)

        if (cursor.moveToFirst()) {
            val uriString = cursor.getString(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI))
            cursor.close()

            uriString?.let { installApk(Uri.parse(it)) }
        }
    }

    private fun installApk(apkUri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    // For API 24+, use FileProvider
                    val file = File(apkUri.path!!)
                    val fileProviderUri = FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.fileprovider",
                        file
                    )
                    setDataAndType(fileProviderUri, "application/vnd.android.package-archive")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                } else {
                    setDataAndType(apkUri, "application/vnd.android.package-archive")
                }
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            _updateStatus.value = _updateStatus.value.copy(
                error = "安装失败: ${e.message}"
            )
        }
    }

    private fun getCurrentVersionCode(): Int {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode
            }
        } catch (e: PackageManager.NameNotFoundException) {
            0
        }
    }

    private fun getCurrentVersionName(): String? {
        return try {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    fun clearError() {
        _updateStatus.value = _updateStatus.value.copy(error = null)
    }

    fun cleanup() {
        try {
            context.unregisterReceiver(downloadReceiver)
        } catch (e: Exception) {
            // Receiver already unregistered
        }
        coroutineScope.cancel()
    }
}

private class HttpException(val code: Int, message: String) : Exception("HTTP $code: $message")
