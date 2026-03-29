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
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.wishpool.app.core.asr.AsrManager
import com.wishpool.app.core.asr.AsrState
import com.wishpool.app.core.asr.PublisherSheetUiModel
import com.wishpool.app.designsystem.component.AsrStatusIndicator
import com.wishpool.app.designsystem.theme.wishpoolPalette
import kotlinx.coroutines.launch

@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun DirectPublishSheet(
    asrManager: AsrManager,
    onDismiss: () -> Unit,
    onSubmit: (String) -> Unit,
) {
    val palette = wishpoolPalette()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val coroutineScope = rememberCoroutineScope()
    val permissionState = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    val asrState by asrManager.state.collectAsState()

    // 手动输入降级方案
    var manualText by rememberSaveable { mutableStateOf("") }
    var useManualInput by rememberSaveable { mutableStateOf(false) }

    val effectiveState = if (permissionState.status.isGranted) {
        asrState
    } else {
        AsrState.PermissionRequired
    }

    // Use special UI model for direct mode
    val uiModel = PublisherSheetUiModel.fromDirect(effectiveState)

    // 检测 ASR 错误状态，自动切换到手动输入
    LaunchedEffect(effectiveState) {
        if (effectiveState is AsrState.Error) {
            useManualInput = true
        }
    }

    LaunchedEffect(Unit) {
        permissionState.launchPermissionRequest()
    }

    LaunchedEffect(permissionState.status.isGranted) {
        if (permissionState.status.isGranted && !useManualInput) {
            asrManager.startRecording()
        } else {
            asrManager.reset()
        }
    }

    // Key difference: Auto-submit when recording completes
    LaunchedEffect(asrState) {
        when (val state = asrState) {
            is AsrState.Result -> {
                if (state.text.isNotBlank()) {
                    onSubmit(state.text)
                }
            }
            else -> Unit
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            coroutineScope.launch {
                asrManager.reset()
            }
        }
    }

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
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            if (useManualInput) {
                // 手动输入模式（ASR 不可用时的降级方案）
                Text(
                    "语音输入暂时不可用",
                    style = MaterialTheme.typography.titleMedium,
                    color = palette.textPrimary,
                    modifier = Modifier.padding(bottom = 8.dp),
                )

                Text(
                    (effectiveState as? AsrState.Error)?.message ?: "请手动输入你的心愿",
                    style = MaterialTheme.typography.bodySmall,
                    color = palette.textMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 16.dp),
                )

                OutlinedTextField(
                    value = manualText,
                    onValueChange = { manualText = it },
                    placeholder = { Text("说出你的心愿...") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5,
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { onSubmit(manualText) },
                    enabled = manualText.isNotBlank(),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("提交心愿")
                }

                TextButton(
                    onClick = {
                        useManualInput = false
                        if (permissionState.status.isGranted) {
                            coroutineScope.launch {
                                asrManager.reset()
                                asrManager.startRecording()
                            }
                        }
                    },
                    modifier = Modifier.padding(top = 8.dp),
                ) {
                    Text("重试语音输入")
                }
            } else {
                // 语音输入模式
                // Enhanced ASR status indicator
                AsrStatusIndicator(
                    asrState = effectiveState,
                    statusText = uiModel.statusText,
                    modifier = Modifier.padding(bottom = 32.dp)
                )

                // Instruction text - no input field for direct mode
                Text(
                    "说完后将自动发送心愿",
                    style = MaterialTheme.typography.bodyMedium,
                    color = palette.textMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 32.dp),
                )

                // 切换到手动输入
                TextButton(
                    onClick = { useManualInput = true },
                    modifier = Modifier.padding(top = 16.dp),
                ) {
                    Text("切换到文字输入")
                }
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}
