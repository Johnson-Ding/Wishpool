package com.wishpool.app.designsystem.component

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import kotlin.random.Random

/**
 * 星空背景动画组件 - 眠眠月主题
 * 28颗星星随机分布，有呼吸闪烁效果
 */
@Composable
fun StarField(
    modifier: Modifier = Modifier,
    starCount: Int = 28,
    starColor: Color = Color(0xFFD4B96A),
) {
    val random = remember { Random(42) }

    // 预生成星星数据
    val stars = remember {
        List(starCount) {
            StarData(
                x = random.nextFloat(),
                y = random.nextFloat(),
                baseSize = random.nextFloat() * 2f + 1f,
                twinkleSpeed = random.nextFloat() * 2000f + 1500f,
                twinkleDelay = random.nextInt(2000).toLong(),
                maxAlpha = random.nextFloat() * 0.5f + 0.5f,
            )
        }
    }

    // 创建动画状态（在Composable作用域内）
    val infiniteTransition = rememberInfiniteTransition(label = "stars")
    val animatedAlphas = stars.mapIndexed { index, star ->
        infiniteTransition.animateFloat(
            initialValue = 0.3f,
            targetValue = star.maxAlpha,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = star.twinkleSpeed.toInt(),
                    easing = FastOutSlowInEasing,
                ),
                repeatMode = RepeatMode.Reverse,
                initialStartOffset = StartOffset(star.twinkleDelay.toInt()),
            ),
            label = "twinkle_$index",
        )
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        stars.forEachIndexed { index, star ->
            val alpha = animatedAlphas[index].value
            drawCircle(
                color = starColor.copy(alpha = alpha),
                radius = star.baseSize,
                center = Offset(star.x * width, star.y * height),
            )
        }
    }
}

private data class StarData(
    val x: Float,
    val y: Float,
    val baseSize: Float,
    val twinkleSpeed: Float,
    val twinkleDelay: Long,
    val maxAlpha: Float,
)

@Preview
@Composable
private fun StarFieldPreview() {
    StarField()
}
