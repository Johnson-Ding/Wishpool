package com.wishpool.app.designsystem.component

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.StartOffset
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.wishpool.app.designsystem.theme.MoonBackground
import com.wishpool.app.designsystem.theme.MoonBorder
import com.wishpool.app.designsystem.theme.MoonCard
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonGoldDim
import com.wishpool.app.designsystem.theme.MoonMuted
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import kotlin.random.Random

// ── 星空背景 ────────────────────────────────────────────────

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

// ── 毛玻璃卡片 ──────────────────────────────────────────────

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    borderColor: Color = MoonBorder,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(16.dp)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(MoonCard.copy(alpha = 0.78f))
            .border(width = 1.dp, color = borderColor, shape = shape)
            .padding(18.dp),
        content = content,
    )
}

// ── 金色渐变按钮 ────────────────────────────────────────────

@Composable
fun GoldButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    text: String,
) {
    val shape = RoundedCornerShape(16.dp)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(
                brush = if (enabled) Brush.linearGradient(listOf(MoonGold, MoonGoldDim))
                else Brush.linearGradient(listOf(MoonMuted, MoonMuted)),
            )
            .clickable(enabled = enabled, onClick = onClick)
            .padding(vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.titleMedium,
            color = if (enabled) MoonBackground else MoonMutedForeground,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

// ── 主题输入框 ──────────────────────────────────────────────

@Composable
fun WishpoolTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    minLines: Int = 1,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier.fillMaxWidth(),
        minLines = minLines,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = MoonGold,
            unfocusedBorderColor = MoonBorder,
            focusedLabelColor = MoonGold,
            unfocusedLabelColor = MoonMutedForeground,
            cursorColor = MoonGold,
        ),
        shape = RoundedCornerShape(12.dp),
    )
}
