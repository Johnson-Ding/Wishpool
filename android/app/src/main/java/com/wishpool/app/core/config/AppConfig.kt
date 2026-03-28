package com.wishpool.app.core.config

enum class AppEnvironment {
    DEV,
    STAGING,
    PROD,
}

data class AppConfig(
    val environment: AppEnvironment,
    val apiBaseUrl: String,
    val enableVerboseLogs: Boolean,
)

object AppConfigs {
    val debug = AppConfig(
        environment = AppEnvironment.DEV,
        apiBaseUrl = "http://10.0.2.2:4000/api/",
        enableVerboseLogs = true,
    )

    val release = AppConfig(
        environment = AppEnvironment.PROD,
        apiBaseUrl = "https://example.com/api/",
        enableVerboseLogs = false,
    )
}

