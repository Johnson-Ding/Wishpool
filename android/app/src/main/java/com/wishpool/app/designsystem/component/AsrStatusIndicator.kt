package com.wishpool.app.designsystem.component

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.wishpool.app.core.asr.AsrState
import com.wishpool.app.designsystem.theme.wishpoolPalette

/**
 * 增强的 ASR 状态指示器
 * 提供更细致的录音状态反馈
 */
@Composable
fun AsrStatusIndicator(
    asrState: AsrState,
    statusText: String,
    modifier: Modifier = Modifier
) {
    val palette = wishpoolPalette()

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
    ) {
        when (asrState) {
            is AsrState.Recording -> {
                RecordingDot(
                    isActive = true,
                    confidence = asrState.confidence,
                    isStable = asrState.isStable
                )
            }
            is AsrState.Processing -> {
                ProcessingIndicator(confidence = asrState.confidence)
            }
            is AsrState.Downloading -> {
                DownloadingIndicator(progress = asrState.progress)
            }
            else -> {
                // 空白占位
                Spacer(modifier = Modifier.width(10.dp))
            }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Text(
            statusText,
            style = MaterialTheme.typography.bodyMedium,
            color = palette.primaryAccent,
        )
    }
}

@Composable
private fun RecordingDot(
    isActive: Boolean,
    confidence: Float,
    isStable: Boolean,
    modifier: Modifier = Modifier
) {
    val pulseTransition = rememberInfiniteTransition(label = "recording_pulse")
    val dotScale by pulseTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isStable) 1.2f else 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(if (isStable) 800 else 600),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "dot_scale",
    )

    // 颜色随置信度变化
    val dotColor = when {
        confidence > 0.8f -> Color(0xFF10B981) // 绿色 - 高置信度
        confidence > 0.5f -> Color(0xFFF59E0B) // 黄色 - 中等置信度
        else -> Color(0xFFEF4444) // 红色 - 低置信度/正在录音
    }

    Box(
        modifier = modifier
            .size(10.dp)
            .graphicsLayer {
                scaleX = dotScale
                scaleY = dotScale
            }
            .clip(CircleShape)
            .background(dotColor),
    )
}

@Composable
private fun ProcessingIndicator(
    confidence: Float,
    modifier: Modifier = Modifier
) {
    val palette = wishpoolPalette()
    val pulseTransition = rememberInfiniteTransition(label = "processing_pulse")

    val alpha by pulseTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "processing_alpha",
    )

    Box(
        modifier = modifier
            .size(8.dp)
            .clip(CircleShape)
            .background(palette.primaryAccent.copy(alpha = alpha)),
    )
}

@Composable
private fun DownloadingIndicator(
    progress: Float,
    modifier: Modifier = Modifier
) {
    val palette = wishpoolPalette()

    // 简单的进度指示器
    Box(
        modifier = modifier
            .size(8.dp)
            .clip(CircleShape)
            .background(palette.primaryAccent.copy(alpha = 0.3f + progress * 0.7f)),
    )
}