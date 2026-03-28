package com.wishpool.app.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val MoonColorScheme = darkColorScheme(
    primary = MoonGold,
    onPrimary = MoonBackground,
    primaryContainer = Color(0xFF2A2418),
    onPrimaryContainer = MoonGold,
    secondary = MoonTeal,
    onSecondary = MoonBackground,
    secondaryContainer = Color(0xFF142E2A),
    onSecondaryContainer = MoonTeal,
    background = MoonBackground,
    onBackground = MoonForeground,
    surface = MoonCard,
    onSurface = MoonForeground,
    surfaceVariant = MoonSurfaceVariant,
    onSurfaceVariant = MoonMutedForeground,
    outline = MoonBorder,
    outlineVariant = Color(0x0DFFFFFF),
    error = Color(0xFFCF6679),
    onError = Color.Black,
)

private val WishpoolShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

@Composable
fun WishpoolTheme(
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = MoonColorScheme,
        typography = WishpoolTypography,
        shapes = WishpoolShapes,
        content = content,
    )
}
