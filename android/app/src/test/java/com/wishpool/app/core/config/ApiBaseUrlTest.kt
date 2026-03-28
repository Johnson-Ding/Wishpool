package com.wishpool.app.core.config

import org.junit.Assert.assertTrue
import org.junit.Test

class AppConfigTest {
    @Test
    fun `debug config has valid supabase url`() {
        assertTrue(AppConfigs.debug.supabaseUrl.startsWith("https://"))
    }

    @Test
    fun `debug config has non-empty anon key`() {
        assertTrue(AppConfigs.debug.supabaseAnonKey.isNotBlank())
    }
}
