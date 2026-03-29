package com.wishpool.app.core.update

import com.wishpool.app.domain.model.AppUpdate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

private val githubReleaseJson = Json { ignoreUnknownKeys = true }

@Serializable
data class GitHubRelease(
    @SerialName("tag_name")
    val tagName: String,
    val body: String = "",
    val assets: List<GitHubReleaseAsset> = emptyList(),
)

@Serializable
data class GitHubReleaseAsset(
    val name: String,
    val size: Long = 0L,
    val state: String? = null,
    @SerialName("browser_download_url")
    val browserDownloadUrl: String,
)

object GitHubReleaseUpdateParser {
    fun parseAppUpdate(jsonText: String): AppUpdate {
        val release = githubReleaseJson.decodeFromString<GitHubRelease>(jsonText)
        return toAppUpdate(release)
    }

    fun toAppUpdate(release: GitHubRelease): AppUpdate {
        val versionName = normalizeVersionName(release.tagName)
            ?: throw IllegalArgumentException("Release tag 不符合版本格式: ${release.tagName}")
        val asset = release.assets.firstOrNull { asset ->
            asset.name.endsWith(".apk", ignoreCase = true) &&
                (asset.state == null || asset.state.equals("uploaded", ignoreCase = true))
        } ?: throw IllegalArgumentException("Release 未包含可下载 APK")

        return AppUpdate(
            versionCode = semanticVersionToCode(versionName),
            versionName = versionName,
            downloadUrl = asset.browserDownloadUrl,
            releaseNotes = release.body.trim(),
            fileSize = asset.size,
        )
    }

    fun isNewerVersion(currentVersionName: String?, latestVersionName: String): Boolean {
        val current = normalizeVersionName(currentVersionName) ?: return true
        val latest = normalizeVersionName(latestVersionName)
            ?: throw IllegalArgumentException("最新版本格式不合法: $latestVersionName")
        return compareSemanticVersions(latest, current) > 0
    }

    internal fun normalizeVersionName(rawVersionName: String?): String? {
        if (rawVersionName.isNullOrBlank()) {
            return null
        }
        val match = VERSION_REGEX.find(rawVersionName.trim()) ?: return null
        return match.groupValues[1]
    }

    internal fun semanticVersionToCode(versionName: String): Int {
        val parts = versionName.split('.').map { it.toInt() }
        val major = parts.getOrElse(0) { 0 }
        val minor = parts.getOrElse(1) { 0 }
        val patch = parts.getOrElse(2) { 0 }
        return (major * 10_000) + (minor * 100) + patch
    }

    internal fun compareSemanticVersions(left: String, right: String): Int {
        val leftParts = left.split('.').map { it.toInt() }
        val rightParts = right.split('.').map { it.toInt() }
        val maxSize = maxOf(leftParts.size, rightParts.size)
        repeat(maxSize) { index ->
            val delta = leftParts.getOrElse(index) { 0 } - rightParts.getOrElse(index) { 0 }
            if (delta != 0) {
                return delta
            }
        }
        return 0
    }

    private val VERSION_REGEX = Regex("^v?(\\d+(?:\\.\\d+){0,2})")
}
