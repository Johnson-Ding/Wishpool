package com.wishpool.app.core.config

import org.junit.Assert.assertEquals
import org.junit.Test

class ApiBaseUrlTest {
    @Test
    fun `normalize api base url trims whitespace and appends api suffix`() {
        assertEquals(
            "http://192.168.1.7:4000/api/",
            normalizeApiBaseUrl("  http://192.168.1.7:4000  "),
        )
    }

    @Test
    fun `normalize api base url preserves existing api suffix`() {
        assertEquals(
            "https://wishpool.example.com/api/",
            normalizeApiBaseUrl("https://wishpool.example.com/api/"),
        )
    }
}

