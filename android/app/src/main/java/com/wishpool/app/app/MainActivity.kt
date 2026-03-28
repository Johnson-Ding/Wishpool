package com.wishpool.app.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.wishpool.app.designsystem.theme.WishpoolTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val app = applicationContext as WishpoolApplication
            val themeViewModel = app.container.themeViewModel
            val currentTheme by themeViewModel.currentTheme.collectAsState()

            WishpoolTheme(themeType = currentTheme) {
                WishpoolApp()
            }
        }
    }
}

