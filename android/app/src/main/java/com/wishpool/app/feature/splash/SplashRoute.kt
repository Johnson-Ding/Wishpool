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
import androidx.compose.ui.unit.sp
import com.wishpool.app.R
import com.wishpool.app.designsystem.component.CloudField
import com.wishpool.app.designsystem.component.GoldShimmerText
import com.wishpool.app.designsystem.component.RadialGlow
import com.wishpool.app.designsystem.component.StarField
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonGoldDim
import com.wishpool.app.designsystem.theme.MoonMutedForeground
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

    Box(
        modifier = Modifier.fillMaxSize(),
    ) {
        // 背景图片
        val bgResId = when (themeType) {
            com.wishpool.app.designsystem.theme.WishpoolThemeType.MOON -> R.drawable.moon_bg
            com.wishpool.app.designsystem.theme.WishpoolThemeType.CLOUD -> R.drawable.cloud_bg
        }
        Image(
            painter = painterResource(id = bgResId),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.55f, // 参考demo透明度：Moon 0.55，Cloud 0.7
        )

        // 渐变叠加层（参考demo实现）
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
            com.wishpool.app.designsystem.theme.WishpoolThemeType.MOON -> {
                StarField()
                RadialGlow(color = palette.glowColor)
            }
            com.wishpool.app.designsystem.theme.WishpoolThemeType.CLOUD -> {
                CloudField()
                // 云朵主题添加柔和光晕
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
            // Moon avatar with pulse glow
            Box(contentAlignment = Alignment.Center) {
                // Outer glow ring
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
                                    MoonGold.copy(alpha = 0.3f),
                                    MoonGold.copy(alpha = 0f),
                                ),
                            ),
                        ),
                )

                // Moon circle
                Box(
                    modifier = Modifier
                        .size(88.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    MoonGold.copy(alpha = 0.15f),
                                    MoonGoldDim.copy(alpha = 0.08f),
                                ),
                            ),
                        )
                        .border(
                            width = 1.5.dp,
                            brush = Brush.linearGradient(
                                listOf(MoonGold.copy(alpha = 0.6f), MoonGoldDim.copy(alpha = 0.3f)),
                            ),
                            shape = CircleShape,
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "🌙",
                        fontSize = 36.sp,
                    )
                }
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
                color = MoonMutedForeground,
                textAlign = TextAlign.Center,
            )
        }
    }
}
