package com.wishpool.app.core.theme

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wishpool.app.designsystem.theme.WishpoolThemeType
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * 全局主题状态管理
 * 负责协调主题切换，连接 UI 状态与持久化存储
 */
class ThemeViewModel(
    private val themePreference: ThemePreference
) : ViewModel() {

    val currentTheme: StateFlow<WishpoolThemeType> = themePreference.themeType

    fun switchTheme(newTheme: WishpoolThemeType) {
        viewModelScope.launch {
            themePreference.updateTheme(newTheme)
        }
    }

    fun toggleTheme() {
        val newTheme = when (currentTheme.value) {
            WishpoolThemeType.MOON -> WishpoolThemeType.CLOUD
            WishpoolThemeType.CLOUD -> WishpoolThemeType.MOON
        }
        switchTheme(newTheme)
    }
}