package com.wishpool.app.feature.home

import android.Manifest
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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.wishpool.app.core.asr.AsrManager
import com.wishpool.app.core.asr.AsrState
import com.wishpool.app.core.asr.PublisherSheetUiModel
import com.wishpool.app.core.asr.rememberAsrTextState
import com.wishpool.app.designsystem.component.AsrAwareTextField
import com.wishpool.app.designsystem.component.AsrStatusIndicator
import com.wishpool.app.designsystem.component.GoldButton
import com.wishpool.app.designsystem.theme.wishpoolPalette
import kotlinx.coroutines.launch

@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun PublisherSheet(
    asrManager: AsrManager,
    onDismiss: () -> Unit,
    onSubmit: (String) -> Unit,
) {
    val palette = wishpoolPalette()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val coroutineScope = rememberCoroutineScope()
    val permissionState = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    val asrState by asrManager.state.collectAsState()

    // 使用智能ASR文本管理
    val (textFieldValue, onTextFieldValueChange) = rememberAsrTextState(asrState)
    val transcribedText = textFieldValue.text

    val effectiveState = if (permissionState.status.isGranted) {
        asrState
    } else {
        AsrState.PermissionRequired
    }
    val uiModel = PublisherSheetUiModel.from(
        asrState = effectiveState,
        editableText = transcribedText,
    )

    androidx.compose.runtime.LaunchedEffect(Unit) {
        permissionState.launchPermissionRequest()
    }

    androidx.compose.runtime.LaunchedEffect(permissionState.status.isGranted) {
        if (permissionState.status.isGranted) {
            asrManager.startRecording()
        } else {
            asrManager.reset()
        }
    }

    // ASR文本管理已由 rememberAsrTextState 处理，移除手动文本更新逻辑

    DisposableEffect(Unit) {
        onDispose {
            coroutineScope.launch {
                asrManager.reset()
            }
        }
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
        onDismissRequest = {
            coroutineScope.launch {
                asrManager.reset()
            }
            onDismiss()
        },
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface,
        dragHandle = {
            BottomSheetDefaults.DragHandle(color = palette.textMuted.copy(alpha = 0.4f))
        },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .navigationBarsPadding(),
        ) {
            // Enhanced ASR status indicator
            AsrStatusIndicator(
                asrState = effectiveState,
                statusText = uiModel.statusText,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // ASR感知的文本输入框
            AsrAwareTextField(
                value = textFieldValue,
                onValueChange = onTextFieldValueChange,
                asrState = asrState,
                label = "你的心愿",
                minLines = 3,
            )

            Spacer(modifier = Modifier.height(24.dp))

            GoldButton(
                onClick = {
                    coroutineScope.launch {
                        asrManager.stopRecording()
                        onSubmit(transcribedText)
                    }
                },
                enabled = uiModel.submitEnabled,
                text = "开始许愿",
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
