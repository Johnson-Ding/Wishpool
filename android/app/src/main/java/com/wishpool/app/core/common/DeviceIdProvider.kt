package com.wishpool.app.core.common

import android.content.Context
import java.util.UUID

class DeviceIdProvider(context: Context) {
    private val prefs = context.getSharedPreferences("wishpool_device", Context.MODE_PRIVATE)

    fun getOrCreate(): String {
        val existing = prefs.getString(KEY_DEVICE_ID, null)
        if (!existing.isNullOrBlank()) {
            return existing
        }

        val generated = UUID.randomUUID().toString()
        prefs.edit().putString(KEY_DEVICE_ID, generated).apply()
        return generated
    }

    private companion object {
        const val KEY_DEVICE_ID = "device_id"
    }
}

