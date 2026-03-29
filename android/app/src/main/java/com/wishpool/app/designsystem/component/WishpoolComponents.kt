package com.wishpool.app.designsystem.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.StartOffset
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.wishpool.app.R
import com.wishpool.app.designsystem.theme.currentThemeType
import com.wishpool.app.designsystem.theme.wishpoolPalette
import kotlin.random.Random

// ── 星空背景 ────────────────────────────────────────────────────

private data class Star(val x: Float, val y: Float, val radius: Float, val baseAlpha: Float)

@Composable
fun StarField(modifier: Modifier = Modifier) {
    val stars = remember {
        val rng = Random(42)
        List(30) {
            Star(
                x = rng.nextFloat(),
                y = rng.nextFloat(),
                radius = rng.nextFloat() * 1.4f + 0.6f,
                baseAlpha = rng.nextFloat() * 0.45f + 0.25f,
            )
        }
    }

    val transition = rememberInfiniteTransition(label = "stars")
    val alphas = (0..3).map { i ->
        transition.animateFloat(
            initialValue = 0.35f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 2200 + i * 600, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse,
                initialStartOffset = StartOffset(i * 700),
            ),
            label = "twinkle_$i",
        )
    }

    androidx.compose.foundation.Canvas(modifier = modifier.fillMaxSize()) {
        stars.forEachIndexed { idx, star ->
            val a = alphas[idx % 4].value * star.baseAlpha
            drawCircle(
                color = Color.White.copy(alpha = a),
                radius = star.radius.dp.toPx(),
                center = Offset(star.x * size.width, star.y * size.height),
            )
        }
    }
}

// ── 径向光晕（呼吸脉冲）──────────────────────────────────────────

@Composable
fun RadialGlow(
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.primary,
) {
    val transition = rememberInfiniteTransition(label = "glow")
    val alpha by transition.animateFloat(
        initialValue = 0.06f,
        targetValue = 0.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "glow_alpha",
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(color.copy(alpha = alpha), Color.Transparent),
                    center = Offset(0.5f, 0.4f),
                    radius = 800f,
                ),
            ),
    )
}

@Composable
fun WishpoolBackdrop(modifier: Modifier = Modifier) {
    val palette = wishpoolPalette()
    val themeType = currentThemeType()

    Box(
        modifier = modifier.fillMaxSize(),
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
            alpha = 0.6f,
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
                                    palette.screenBackground.copy(alpha = 0.3f),
                                ),
                            ),
                        ),
                )
            }
        }
    }
}

// ── 金色微光文字 ──────────────────────────────────────────────────

@Composable
fun GoldShimmerText(
    text: String,
    style: TextStyle,
    modifier: Modifier = Modifier,
) {
    val palette = wishpoolPalette()
    val transition = rememberInfiniteTransition(label = "text_shimmer")
    val offset by transition.animateFloat(
        initialValue = -300f,
        targetValue = 800f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "shimmer_offset",
    )

    Text(
        text = text,
        style = style.copy(
            brush = Brush.linearGradient(
                colors = listOf(palette.primaryAccent, palette.shimmerMiddle, palette.primaryAccent),
                start = Offset(offset, 0f),
                end = Offset(offset + 250f, 0f),
            ),
        ),
        modifier = modifier,
    )
}

// ── 毛玻璃卡片 ──────────────────────────────────────────────────

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    borderColor: Color = wishpoolPalette().border,
    content: @Composable ColumnScope.() -> Unit,
) {
    val palette = wishpoolPalette()
    val shape = RoundedCornerShape(16.dp)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(palette.cardBackgroundElevated)
            .border(width = 1.dp, color = borderColor, shape = shape)
            .padding(18.dp),
        content = content,
    )
}

// ── 金色渐变按钮（带按压反馈）──────────────────────────────────────

@Composable
fun GoldButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    text: String,
) {
    val palette = wishpoolPalette()
    val shape = RoundedCornerShape(16.dp)
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium,
        ),
        label = "btn_scale",
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(shape)
            .background(
                brush = if (enabled) {
                    Brush.linearGradient(listOf(palette.buttonGradientStart, palette.buttonGradientEnd))
                } else {
                    Brush.linearGradient(
                        listOf(
                            MaterialTheme.colorScheme.surfaceVariant,
                            MaterialTheme.colorScheme.surfaceVariant,
                        ),
                    )
                }
            )
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                enabled = enabled,
                onClick = onClick,
            )
            .padding(vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.titleMedium,
            color = if (enabled) palette.buttonText else palette.textMuted,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

// ── Shimmer 加载占位 ──────────────────────────────────────────────

@Composable
fun ShimmerLoading(modifier: Modifier = Modifier) {
    val palette = wishpoolPalette()
    val transition = rememberInfiniteTransition(label = "shimmer_load")
    val offset by transition.animateFloat(
        initialValue = -300f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
        ),
        label = "shimmer_offset",
    )

    val brush = Brush.linearGradient(
        colors = listOf(
            palette.cardStackBackground.copy(alpha = 0.45f),
            palette.cardStackBackground.copy(alpha = 0.8f),
            palette.cardStackBackground.copy(alpha = 0.45f),
        ),
        start = Offset(offset, 0f),
        end = Offset(offset + 300f, 0f),
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        repeat(3) {
            GlassCard {
                Box(
                    Modifier
                        .fillMaxWidth(0.6f)
                        .height(18.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(brush),
                )
                Box(
                    Modifier
                        .padding(top = 12.dp)
                        .fillMaxWidth()
                        .height(12.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(brush),
                )
                Box(
                    Modifier
                        .padding(top = 8.dp)
                        .fillMaxWidth(0.75f)
                        .height(12.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(brush),
                )
            }
        }
    }
}

// ── 卡片揭示动画 ──────────────────────────────────────────────────

@Composable
fun CardReveal(
    index: Int = 0,
    content: @Composable () -> Unit,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(
            animationSpec = tween(
                durationMillis = 400,
                delayMillis = index * 80,
                easing = FastOutSlowInEasing,
            ),
        ) + slideInVertically(
            animationSpec = tween(
                durationMillis = 400,
                delayMillis = index * 80,
                easing = FastOutSlowInEasing,
            ),
            initialOffsetY = { it / 5 },
        ),
    ) {
        content()
    }
}

// ── 主题输入框 ──────────────────────────────────────────────────

@Composable
fun WishpoolTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    minLines: Int = 1,
) {
    val palette = wishpoolPalette()
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier.fillMaxWidth(),
        minLines = minLines,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = palette.primaryAccent,
            unfocusedBorderColor = palette.border,
            focusedLabelColor = palette.primaryAccent,
            unfocusedLabelColor = palette.textMuted,
            cursorColor = palette.primaryAccent,
            focusedTextColor = palette.textPrimary,
            unfocusedTextColor = palette.textPrimary,
        ),
        shape = RoundedCornerShape(12.dp),
    )
}
