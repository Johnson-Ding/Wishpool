package com.wishpool.app.designsystem.component

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import kotlinx.coroutines.launch
import kotlin.math.abs

@Composable
fun <T> SwipeableCardStack(
    items: List<T>,
    modifier: Modifier = Modifier,
    onSwipe: (index: Int) -> Unit = {},
    emptyContent: @Composable () -> Unit = {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("暂无更多内容", style = MaterialTheme.typography.bodyMedium, color = MoonMutedForeground)
        }
    },
    content: @Composable (T) -> Unit,
) {
    var currentIndex by rememberSaveable { mutableIntStateOf(0) }
    val offsetX = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Card area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            contentAlignment = Alignment.Center,
        ) {
            if (currentIndex >= items.size) {
                emptyContent()
            } else {
                // Background layers (render back to front)
                for (depth in minOf(2, items.size - currentIndex - 1) downTo 1) {
                    val layerIndex = currentIndex + depth
                    if (layerIndex < items.size) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .graphicsLayer {
                                    scaleX = 1f - depth * 0.05f
                                    scaleY = 1f - depth * 0.05f
                                    translationY = depth * 12.dp.toPx()
                                    alpha = 1f - depth * 0.15f
                                },
                        ) {
                            content(items[layerIndex])
                        }
                    }
                }

                // Current card (draggable)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .graphicsLayer {
                            translationX = offsetX.value
                            rotationZ = offsetX.value * 0.015f
                        }
                        .pointerInput(currentIndex) {
                            detectHorizontalDragGestures(
                                onDragEnd = {
                                    scope.launch {
                                        if (abs(offsetX.value) > 300f) {
                                            val target = if (offsetX.value > 0) 1500f else -1500f
                                            offsetX.animateTo(target, tween(250))
                                            onSwipe(currentIndex)
                                            currentIndex++
                                            offsetX.snapTo(0f)
                                        } else {
                                            offsetX.animateTo(
                                                0f,
                                                spring(dampingRatio = 0.65f, stiffness = 400f),
                                            )
                                        }
                                    }
                                },
                                onHorizontalDrag = { change, dragAmount ->
                                    change.consume()
                                    scope.launch {
                                        offsetX.snapTo(offsetX.value + dragAmount)
                                    }
                                },
                            )
                        },
                ) {
                    content(items[currentIndex])
                }
            }
        }

        // Swipe hint
        if (currentIndex < items.size) {
            Text(
                "← 左右滑动浏览 →",
                style = MaterialTheme.typography.labelSmall,
                color = MoonMutedForeground.copy(alpha = 0.5f),
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Progress dots
        if (items.isNotEmpty()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 8.dp),
            ) {
                items.indices.forEach { i ->
                    val isCurrent = i == currentIndex
                    Box(
                        modifier = Modifier
                            .height(5.dp)
                            .width(if (isCurrent) 18.dp else 5.dp)
                            .clip(CircleShape)
                            .background(
                                if (isCurrent) MoonGold
                                else MoonMutedForeground.copy(alpha = 0.25f),
                            ),
                    )
                }
            }
        }
    }
}
