package com.wishpool.app.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = Clay,
    secondary = Moss,
    tertiary = Ink,
    background = Sand,
    surface = Mist,
)

private val DarkColorScheme = darkColorScheme(
    primary = Clay,
    secondary = Moss,
    tertiary = Sand,
)

@Composable
fun WishpoolTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = WishpoolTypography,
        content = content,
    )
}

