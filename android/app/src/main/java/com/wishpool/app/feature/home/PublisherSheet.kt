package com.wishpool.app.feature.home

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.component.WishpoolTextField
import com.wishpool.app.designsystem.theme.MoonCard
import com.wishpool.app.designsystem.theme.MoonGold
import com.wishpool.app.designsystem.theme.MoonMutedForeground
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublisherSheet(
    onDismiss: () -> Unit,
    onSubmit: (String) -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var transcribedText by rememberSaveable { mutableStateOf("") }
    var isRecording by rememberSaveable { mutableStateOf(true) }

    // Mock transcription: characters appear one by one
    val fullText = "我想去海边放松一下"
    LaunchedEffect(Unit) {
        transcribedText = ""
        for (i in fullText.indices) {
            delay(120L)
            transcribedText = fullText.substring(0, i + 1)
        }
        delay(300)
        isRecording = false
    }

    // Recording dot pulse
    val pulseTransition = rememberInfiniteTransition(label = "rec_pulse")
    val dotScale by pulseTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(600),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "dot_scale",
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MoonCard,
        dragHandle = {
            BottomSheetDefaults.DragHandle(color = MoonMutedForeground.copy(alpha = 0.4f))
        },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .navigationBarsPadding(),
        ) {
            // Recording indicator
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 16.dp),
            ) {
                if (isRecording) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .graphicsLayer {
                                scaleX = dotScale
                                scaleY = dotScale
                            }
                            .clip(CircleShape)
                            .background(Color(0xFFEF4444)),
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        "正在聆听...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MoonGold,
                    )
                } else {
                    Text(
                        "已听到你的心愿 ✨",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MoonGold,
                    )
                }
            }

            // Transcribed text input
            WishpoolTextField(
                value = transcribedText,
                onValueChange = { transcribedText = it },
                label = "你的心愿",
                minLines = 3,
            )

            Spacer(modifier = Modifier.height(24.dp))

            GoldButton(
                onClick = { onSubmit(transcribedText) },
                enabled = transcribedText.isNotBlank() && !isRecording,
                text = "开始许愿",
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
