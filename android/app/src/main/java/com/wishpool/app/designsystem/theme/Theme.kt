package com.wishpool.app.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// ── 主题类型枚举 ──────────────────────────────────────────────
enum class WishpoolThemeType {
    MOON,    // 深夜水墨·月光容器
    CLOUD,   // 晨风白昼·植绒呼吸
    // STAR,  // 深空极光·荧光果冻 (Phase 2)
}

data class WishpoolPalette(
    val screenBackground: Color,
    val cardBackground: Color,
    val cardBackgroundElevated: Color,
    val cardStackBackground: Color,
    val bottomBarBackground: Color,
    val textPrimary: Color,
    val textMuted: Color,
    val primaryAccent: Color,
    val secondaryAccent: Color,
    val border: Color,
    val buttonGradientStart: Color,
    val buttonGradientEnd: Color,
    val buttonText: Color,
    val glowColor: Color,
    val shimmerMiddle: Color,
    val overlayScrim: Color,
    val showStars: Boolean,
)

fun wishpoolPaletteFor(themeType: WishpoolThemeType): WishpoolPalette = when (themeType) {
    WishpoolThemeType.MOON -> WishpoolPalette(
        screenBackground = MoonBackground,
        cardBackground = MoonCard,
        cardBackgroundElevated = MoonCard.copy(alpha = 0.78f),
        cardStackBackground = MoonCard,
        bottomBarBackground = MoonCard.copy(alpha = 0.92f),
        textPrimary = MoonForeground,
        textMuted = MoonMutedForeground,
        primaryAccent = MoonGold,
        secondaryAccent = MoonTeal,
        border = MoonBorder,
        buttonGradientStart = MoonGold,
        buttonGradientEnd = MoonGoldDim,
        buttonText = MoonBackground,
        glowColor = MoonGold,
        shimmerMiddle = MoonForeground,
        overlayScrim = Color(0x73000000),
        showStars = true,
    )
    WishpoolThemeType.CLOUD -> WishpoolPalette(
        screenBackground = CloudBackground,
        cardBackground = CloudCard,
        cardBackgroundElevated = CloudCard.copy(alpha = 0.95f),
        cardStackBackground = CloudSurfaceVariant,
        bottomBarBackground = CloudCard.copy(alpha = 0.96f),
        textPrimary = CloudForeground,
        textMuted = CloudMutedForeground,
        primaryAccent = CloudPrimary,
        secondaryAccent = CloudAccent,
        border = CloudBorder,
        buttonGradientStart = CloudPrimary,
        buttonGradientEnd = Color(0xFFFFB38A),
        buttonText = Color.White,
        glowColor = CloudSecondary,
        shimmerMiddle = CloudForeground,
        overlayScrim = Color(0x59363C46),
        showStars = false,
    )
}

// ── 主题配色方案 ──────────────────────────────────────────────
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

private val CloudColorScheme = lightColorScheme(
    primary = CloudPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFE4E1),  // 极浅桃粉
    onPrimaryContainer = Color(0xFF8B2635),  // 深桃红
    secondary = CloudSecondary,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFDBEAFE),  // 极浅蓝
    onSecondaryContainer = Color(0xFF1E3A8A),  // 深蓝
    background = CloudBackground,
    onBackground = CloudForeground,
    surface = CloudCard,
    onSurface = CloudForeground,
    surfaceVariant = CloudSurfaceVariant,
    onSurfaceVariant = CloudMutedForeground,
    outline = CloudBorder,
    outlineVariant = Color(0x0A000000),  // 黑 4%
    error = Color(0xFFDC2626),
    onError = Color.White,
)

private val WishpoolShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

// ── 主题上下文 ──────────────────────────────────────────────
val LocalWishpoolTheme = staticCompositionLocalOf { WishpoolThemeType.MOON }
val LocalWishpoolPalette = staticCompositionLocalOf { wishpoolPaletteFor(WishpoolThemeType.MOON) }

@Composable
fun WishpoolTheme(
    themeType: WishpoolThemeType = WishpoolThemeType.MOON,
    content: @Composable () -> Unit,
) {
    val colorScheme = when (themeType) {
        WishpoolThemeType.MOON -> MoonColorScheme
        WishpoolThemeType.CLOUD -> CloudColorScheme
    }
    val palette = wishpoolPaletteFor(themeType)

    CompositionLocalProvider(
        LocalWishpoolTheme provides themeType,
        LocalWishpoolPalette provides palette,
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = WishpoolTypography,
            shapes = WishpoolShapes,
            content = content,
        )
    }
}

// ── 主题工具函数 ──────────────────────────────────────────────
@Composable
fun currentThemeType(): WishpoolThemeType = LocalWishpoolTheme.current

@Composable
fun wishpoolPalette(): WishpoolPalette = LocalWishpoolPalette.current

fun WishpoolThemeType.displayName(): String = when (this) {
    WishpoolThemeType.MOON -> "眠眠月 🌙"
    WishpoolThemeType.CLOUD -> "朵朵云 ☁️"
}

fun WishpoolThemeType.emoji(): String = when (this) {
    WishpoolThemeType.MOON -> "🌙"
    WishpoolThemeType.CLOUD -> "☁️"
}
