package com.wishpool.app.core.config

enum class AppEnvironment {
    DEV,
    STAGING,
    PROD,
}

data class AppConfig(
    val environment: AppEnvironment,
    val supabaseUrl: String,
    val supabaseAnonKey: String,
    val enableVerboseLogs: Boolean,
)

object AppConfigs {
    private const val SUPABASE_URL = "https://hfwqkeycrxbmeinyrkdh.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3FrZXljcnhibWVpbnlya2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY2MTUsImV4cCI6MjA5MDE1MjYxNX0.G3ohFCS7gYVHjGxe-v4UkIXlFEsOcd5HTL0_dKRSNT0"

    val debug = AppConfig(
        environment = AppEnvironment.DEV,
        supabaseUrl = SUPABASE_URL,
        supabaseAnonKey = SUPABASE_ANON_KEY,
        enableVerboseLogs = true,
    )

    val release = AppConfig(
        environment = AppEnvironment.PROD,
        supabaseUrl = SUPABASE_URL,
        supabaseAnonKey = SUPABASE_ANON_KEY,
        enableVerboseLogs = false,
    )
}
