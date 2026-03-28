package com.wishpool.app.core.theme

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import com.wishpool.app.designsystem.theme.WishpoolThemeType
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * 管理用户主题偏好设置
 * 使用 SharedPreferences 持久化存储，支持 Flow 响应式更新
 */
class ThemePreference(context: Context) {
    private val sharedPreferences: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME,
        Context.MODE_PRIVATE
    )

    private val _themeType = MutableStateFlow(getStoredTheme())
    val themeType: StateFlow<WishpoolThemeType> = _themeType.asStateFlow()

    private fun getStoredTheme(): WishpoolThemeType {
        val savedTheme = sharedPreferences.getString(KEY_THEME, null)
        return when (savedTheme) {
            "MOON" -> WishpoolThemeType.MOON
            "CLOUD" -> WishpoolThemeType.CLOUD
            else -> WishpoolThemeType.MOON  // 默认为月亮主题
        }
    }

    fun updateTheme(newTheme: WishpoolThemeType) {
        sharedPreferences.edit {
            putString(KEY_THEME, newTheme.name)
        }
        _themeType.value = newTheme
    }

    companion object {
        private const val PREFS_NAME = "wishpool_theme_prefs"
        private const val KEY_THEME = "selected_theme"
    }
}