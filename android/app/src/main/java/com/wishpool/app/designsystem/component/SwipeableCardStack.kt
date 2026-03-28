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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.wishpool.app.designsystem.theme.wishpoolPalette
import kotlinx.coroutines.launch

@Composable
fun <T> SwipeableCardStack(
    items: List<T>,
    modifier: Modifier = Modifier,
    onSwipe: (index: Int) -> Unit = {},
    emptyContent: @Composable () -> Unit = {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                "暂无更多内容",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    },
    content: @Composable (T) -> Unit,
) {
    val palette = wishpoolPalette()
    var currentIndex by rememberSaveable { mutableIntStateOf(0) }
    val offsetX = remember { Animatable(0f) }
    val cardAlpha = remember { Animatable(1f) }
    val rotation = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    fun goNext() {
        if (currentIndex >= items.size - 1) return
        scope.launch {
            // Animate out to left
            launch { offsetX.animateTo(-400f, tween(280)) }
            launch { cardAlpha.animateTo(0f, tween(250)) }
            launch { rotation.animateTo(-6f, tween(280)) }
            // Snap new card in from right
            onSwipe(currentIndex)
            currentIndex++
            offsetX.snapTo(350f)
            cardAlpha.snapTo(0f)
            rotation.snapTo(6f)
            // Animate in
            launch { offsetX.animateTo(0f, spring(stiffness = 280f, dampingRatio = 0.7f)) }
            launch { cardAlpha.animateTo(1f, tween(220)) }
            launch { rotation.animateTo(0f, spring(stiffness = 280f, dampingRatio = 0.7f)) }
        }
    }

    fun goPrev() {
        if (currentIndex <= 0) return
        scope.launch {
            // Animate out to right
            launch { offsetX.animateTo(400f, tween(280)) }
            launch { cardAlpha.animateTo(0f, tween(250)) }
            launch { rotation.animateTo(6f, tween(280)) }
            // Snap new card in from left
            currentIndex--
            offsetX.snapTo(-350f)
            cardAlpha.snapTo(0f)
            rotation.snapTo(-6f)
            // Animate in
            launch { offsetX.animateTo(0f, spring(stiffness = 280f, dampingRatio = 0.7f)) }
            launch { cardAlpha.animateTo(1f, tween(220)) }
            launch { rotation.animateTo(0f, spring(stiffness = 280f, dampingRatio = 0.7f)) }
        }
    }

    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Progress dots (top, like web demo)
        if (items.isNotEmpty()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 4.dp, bottom = 8.dp),
            ) {
                items.indices.forEach { i ->
                    val isCurrent = i == currentIndex
                    Box(
                        modifier = Modifier
                            .height(3.dp)
                            .width(if (isCurrent) 20.dp else 8.dp)
                            .clip(CircleShape)
                            .background(
                                if (isCurrent) palette.primaryAccent
                                else palette.textMuted.copy(alpha = 0.20f),
                            ),
                    )
                }
            }
        }

        // Card area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentAlignment = Alignment.Center,
        ) {
            if (currentIndex >= items.size) {
                emptyContent()
            } else {
                // Background depth layers (narrower = further back)
                for (depth in minOf(2, items.size - currentIndex - 1) downTo 1) {
                    val layerIndex = currentIndex + depth
                    if (layerIndex < items.size) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = (depth * 12).dp)
                                .clip(RoundedCornerShape(24.dp))
                                .background(palette.cardStackBackground.copy(alpha = 1f - depth * 0.15f))
                                .graphicsLayer {
                                    translationY = depth * 8.dp.toPx()
                                },
                        )
                    }
                }

                // Current card (draggable, carousel-style)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer {
                            translationX = offsetX.value
                            rotationZ = rotation.value
                            alpha = cardAlpha.value
                        }
                        .pointerInput(currentIndex) {
                            detectHorizontalDragGestures(
                                onDragEnd = {
                                    scope.launch {
                                        val v = offsetX.value
                                        when {
                                            v < -120f -> goNext()
                                            v > 120f -> goPrev()
                                            else -> {
                                                launch { offsetX.animateTo(0f, spring(dampingRatio = 0.65f, stiffness = 400f)) }
                                                launch { rotation.animateTo(0f, spring(dampingRatio = 0.65f, stiffness = 400f)) }
                                            }
                                        }
                                    }
                                },
                                onHorizontalDrag = { change, dragAmount ->
                                    change.consume()
                                    scope.launch {
                                        offsetX.snapTo(offsetX.value + dragAmount * 0.8f)
                                        rotation.snapTo(offsetX.value * 0.012f)
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
                color = palette.textMuted.copy(alpha = 0.4f),
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
    }
}
