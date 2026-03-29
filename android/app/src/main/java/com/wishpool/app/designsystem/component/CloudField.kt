package com.wishpool.app.designsystem.component

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import kotlin.random.Random

/**
 * 云朵背景动画组件 - 朵朵云主题
 * 柔和的云朵漂浮效果，带模糊光晕
 */
@Composable
fun CloudField(
    modifier: Modifier = Modifier,
    cloudColor: Color = Color(0xFFFFF5F0),
) {
    val random = remember { Random(123) }

    // 预生成云朵数据
    val clouds = remember {
        List(5) {
            CloudData(
                x = random.nextFloat() * 0.8f + 0.1f,
                y = random.nextFloat() * 0.6f + 0.2f,
                size = random.nextFloat() * 80f + 60f,
                driftSpeed = random.nextFloat() * 20000f + 25000f,
                driftDelay = random.nextInt(5000).toLong(),
            )
        }
    }

    // 创建动画状态（在Composable作用域内）
    val infiniteTransition = rememberInfiniteTransition(label = "clouds")
    val animatedOffsets = clouds.mapIndexed { index, cloud ->
        infiniteTransition.animateFloat(
            initialValue = -0.1f,
            targetValue = 0.1f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = cloud.driftSpeed.toInt(),
                    easing = LinearEasing,
                ),
                repeatMode = RepeatMode.Reverse,
                initialStartOffset = StartOffset(cloud.driftDelay.toInt()),
            ),
            label = "drift_$index",
        )
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        clouds.forEachIndexed { index, cloud ->
            val offsetX = animatedOffsets[index].value
            val centerX = cloud.x * width + offsetX * width * 0.5f
            val centerY = cloud.y * height

            // 绘制柔和的云朵光晕
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        cloudColor.copy(alpha = 0.15f),
                        cloudColor.copy(alpha = 0.05f),
                        Color.Transparent,
                    ),
                    center = Offset(centerX, centerY),
                    radius = cloud.size * 1.5f,
                ),
                radius = cloud.size * 1.5f,
                center = Offset(centerX, centerY),
            )

            // 绘制云朵主体
            drawCircle(
                color = cloudColor.copy(alpha = 0.08f),
                radius = cloud.size,
                center = Offset(centerX, centerY),
            )
        }
    }
}

private data class CloudData(
    val x: Float,
    val y: Float,
    val size: Float,
    val driftSpeed: Float,
    val driftDelay: Long,
)

@Preview
@Composable
private fun CloudFieldPreview() {
    CloudField()
}
