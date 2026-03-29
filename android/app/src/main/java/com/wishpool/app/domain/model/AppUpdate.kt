package com.wishpool.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class AppUpdate(
    val versionCode: Int,
    val versionName: String,
    val downloadUrl: String,
    val releaseNotes: String,
    val isForceUpdate: Boolean = false,
    val fileSize: Long = 0L // Size in bytes
)

data class UpdateStatus(
    val hasUpdate: Boolean = false,
    val update: AppUpdate? = null,
    val isChecking: Boolean = false,
    val isDownloading: Boolean = false,
    val downloadProgress: Float = 0f,
    val error: String? = null
)