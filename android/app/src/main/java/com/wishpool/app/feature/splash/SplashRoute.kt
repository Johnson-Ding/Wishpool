package com.wishpool.app.feature.splash

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.wishpool.app.R
import com.wishpool.app.designsystem.component.CloudField
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.RadialGlow
import com.wishpool.app.designsystem.component.StarField
import com.wishpool.app.designsystem.theme.WishpoolThemeType
import com.wishpool.app.designsystem.theme.currentThemeType
import com.wishpool.app.designsystem.theme.wishpoolPalette
import kotlinx.coroutines.delay

@Composable
fun SplashRoute(onTimeout: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(2600)
        onTimeout()
    }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    val scale by animateFloatAsState(
        targetValue = if (visible) 1f else 0.7f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = 300f,
        ),
        label = "splash_scale",
    )

    // Moon pulse glow
    val pulseTransition = rememberInfiniteTransition(label = "moon_pulse")
    val pulseAlpha by pulseTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.6f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse_alpha",
    )
    val pulseScale by pulseTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse_scale",
    )

    val themeType = currentThemeType()
    val palette = wishpoolPalette()
    val isMoon = themeType == WishpoolThemeType.MOON

    Box(
        modifier = Modifier.fillMaxSize(),
    ) {
        // 背景图片 — 主题切换
        val bgResId = when (themeType) {
            WishpoolThemeType.MOON -> R.drawable.moon_bg
            WishpoolThemeType.CLOUD -> R.drawable.cloud_bg
        }
        Image(
            painter = painterResource(id = bgResId),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = if (isMoon) 0.55f else 0.7f,
        )

        // 渐变叠加层
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            palette.screenBackground.copy(alpha = 0.3f),
                            palette.screenBackground.copy(alpha = 0.85f),
                        ),
                    ),
                ),
        )

        // 主题动画效果
        when (themeType) {
            WishpoolThemeType.MOON -> {
                StarField()
                RadialGlow(color = palette.glowColor)
            }
            WishpoolThemeType.CLOUD -> {
                CloudField()
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    palette.screenBackground.copy(alpha = 0.2f),
                                ),
                            ),
                        ),
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    scaleX = scale
                    scaleY = scale
                },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            // 头像 — 主题切换：使用实际图片资源
            val avatarResId = when (themeType) {
                WishpoolThemeType.MOON -> R.drawable.moon_avatar
                WishpoolThemeType.CLOUD -> R.drawable.cloud_avatar
            }

            Box(contentAlignment = Alignment.Center) {
                // 外层脉冲光晕
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .graphicsLayer {
                            scaleX = pulseScale
                            scaleY = pulseScale
                            alpha = pulseAlpha
                        }
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    palette.primaryAccent.copy(alpha = 0.3f),
                                    palette.primaryAccent.copy(alpha = 0f),
                                ),
                            ),
                        ),
                )

                // 头像圆形容器
                Image(
                    painter = painterResource(id = avatarResId),
                    contentDescription = "许愿池",
                    modifier = Modifier
                        .size(88.dp)
                        .clip(CircleShape)
                        .border(
                            width = 1.5.dp,
                            brush = Brush.linearGradient(
                                listOf(
                                    palette.primaryAccent.copy(alpha = 0.6f),
                                    palette.buttonGradientEnd.copy(alpha = 0.3f),
                                ),
                            ),
                            shape = CircleShape,
                        ),
                    contentScale = ContentScale.Crop,
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            GoldShimmerText(
                text = "许愿池",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold,
                ),
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "AI 帮你实现心愿，不只是建议",
                style = MaterialTheme.typography.bodyMedium,
                color = palette.textMuted,
                textAlign = TextAlign.Center,
            )
        }
    }
}
