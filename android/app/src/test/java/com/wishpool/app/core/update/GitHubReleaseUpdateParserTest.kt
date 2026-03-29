package com.wishpool.app.core.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GitHubReleaseUpdateParserTest {
    @Test
    fun `parse app update from github release payload`() {
        val payload = """
            {
              "tag_name": "v0.3.3",
              "body": "ASR fixed\nCloud theme parity",
              "assets": [
                {
                  "name": "app-release.apk",
                  "size": 104838067,
                  "state": "uploaded",
                  "browser_download_url": "https://github.com/Johnson-Ding/Wishpool/releases/download/v0.3.3/app-release.apk"
                }
              ]
            }
        """.trimIndent()

        val update = GitHubReleaseUpdateParser.parseAppUpdate(payload)

        assertEquals("0.3.3", update.versionName)
        assertEquals(303, update.versionCode)
        assertEquals(104838067L, update.fileSize)
        assertTrue(update.downloadUrl.endsWith("/v0.3.3/app-release.apk"))
        assertEquals("ASR fixed\nCloud theme parity", update.releaseNotes)
    }

    @Test
    fun `recognizes newer semantic version from github tag`() {
        assertTrue(GitHubReleaseUpdateParser.isNewerVersion("0.3.3", "0.3.4"))
        assertTrue(GitHubReleaseUpdateParser.isNewerVersion("0.3.3-debug", "0.3.4"))
        assertFalse(GitHubReleaseUpdateParser.isNewerVersion("0.3.3", "0.3.3"))
        assertFalse(GitHubReleaseUpdateParser.isNewerVersion("0.3.4", "0.3.3"))
    }

    @Test
    fun `normalizes github style version tags`() {
        assertEquals("1.2.3", GitHubReleaseUpdateParser.normalizeVersionName("v1.2.3"))
        assertEquals("1.2.3", GitHubReleaseUpdateParser.normalizeVersionName("1.2.3-release"))
        assertEquals("1.2", GitHubReleaseUpdateParser.normalizeVersionName("v1.2-beta"))
    }
}
