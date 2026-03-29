package com.wishpool.app.designsystem.component

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import com.wishpool.app.core.asr.AsrState
import com.wishpool.app.designsystem.theme.wishpoolPalette

/**
 * ASR 感知的文本输入框
 * 提供智能的 ASR 结果集成和视觉反馈
 */
@Composable
fun AsrAwareTextField(
    value: TextFieldValue,
    onValueChange: (TextFieldValue) -> Unit,
    asrState: AsrState,
    label: String,
    modifier: Modifier = Modifier,
    minLines: Int = 1,
) {
    val palette = wishpoolPalette()
    var isFocused by remember { mutableStateOf(false) }

    // 根据ASR状态决定边框颜色和透明度
    val isAsrActive = asrState is AsrState.Recording || asrState is AsrState.Processing
    val borderColor by animateColorAsState(
        targetValue = when {
            isAsrActive && !isFocused -> palette.primaryAccent.copy(alpha = 0.6f)
            isFocused -> palette.primaryAccent
            else -> palette.border
        },
        animationSpec = tween(300),
        label = "border_color"
    )

    val glowAlpha by animateFloatAsState(
        targetValue = if (isAsrActive) 0.4f else 0f,
        animationSpec = tween(300),
        label = "glow_alpha"
    )

    Box(modifier = modifier) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = {
                Text(
                    text = when {
                        isAsrActive -> "$label (正在识别...)"
                        else -> label
                    }
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .onFocusChanged { isFocused = it.isFocused }
                .alpha(if (isAsrActive && !isFocused) 0.9f else 1f),
            minLines = minLines,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = borderColor,
                unfocusedBorderColor = borderColor,
                focusedLabelColor = palette.primaryAccent,
                unfocusedLabelColor = if (isAsrActive) {
                    palette.primaryAccent.copy(alpha = 0.8f)
                } else {
                    palette.textMuted
                },
                cursorColor = palette.primaryAccent,
                focusedTextColor = palette.textPrimary,
                unfocusedTextColor = palette.textPrimary,
            ),
            shape = RoundedCornerShape(12.dp),
        )

        // ASR活动时的发光边框效果
        if (glowAlpha > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = 2.dp,
                        color = palette.primaryAccent.copy(alpha = glowAlpha),
                        shape = RoundedCornerShape(12.dp)
                    )
                    .alpha(glowAlpha)
            )
        }
    }
}

/**
 * 传统的字符串值版本（向后兼容）
 */
@Composable
fun AsrAwareTextField(
    value: String,
    onValueChange: (String) -> Unit,
    asrState: AsrState,
    label: String,
    modifier: Modifier = Modifier,
    minLines: Int = 1,
) {
    val textFieldValue = TextFieldValue(text = value)
    AsrAwareTextField(
        value = textFieldValue,
        onValueChange = { onValueChange(it.text) },
        asrState = asrState,
        label = label,
        modifier = modifier,
        minLines = minLines
    )
}