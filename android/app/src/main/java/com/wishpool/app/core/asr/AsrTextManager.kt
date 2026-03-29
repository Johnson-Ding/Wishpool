package com.wishpool.app.core.asr

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.TextFieldValue

/**
 * ASR 文本智能管理器
 * 负责协调用户编辑和 ASR 识别结果，保持良好的用户体验
 */
class AsrTextManager {
    data class TextState(
        val textFieldValue: TextFieldValue,
        val isUserEditing: Boolean,
        val lastAsrUpdate: Long = 0L
    )

    companion object {
        const val USER_EDIT_TIMEOUT = 2000L // 用户停止编辑后2秒允许ASR更新
    }

    fun mergeAsrResult(
        currentState: TextState,
        asrText: String,
        isStable: Boolean
    ): TextState {
        val now = System.currentTimeMillis()

        // 如果用户正在编辑且时间间隔很短，不更新
        if (currentState.isUserEditing &&
            (now - currentState.lastAsrUpdate) < USER_EDIT_TIMEOUT) {
            return currentState
        }

        // 如果ASR文本为空，保持当前状态
        if (asrText.isBlank()) {
            return currentState
        }

        val currentText = currentState.textFieldValue.text
        val newText = when {
            // 当前文本为空，直接使用ASR结果
            currentText.isBlank() -> asrText

            // 如果ASR文本比当前文本长且包含当前文本，进行智能替换
            asrText.length > currentText.length && asrText.contains(currentText) -> asrText

            // 如果是稳定结果，直接替换
            isStable -> asrText

            // 否则保持当前文本
            else -> currentText
        }

        // 智能光标位置：放在文本末尾
        val newSelection = TextRange(newText.length)

        return currentState.copy(
            textFieldValue = TextFieldValue(text = newText, selection = newSelection),
            isUserEditing = false,
            lastAsrUpdate = now
        )
    }

    fun onUserEdit(
        currentState: TextState,
        newTextFieldValue: TextFieldValue
    ): TextState {
        return currentState.copy(
            textFieldValue = newTextFieldValue,
            isUserEditing = true
        )
    }
}

/**
 * ASR 感知的文本管理 Composable
 */
@Composable
fun rememberAsrTextState(
    asrState: AsrState,
    initialText: String = ""
): Pair<TextFieldValue, (TextFieldValue) -> Unit> {
    val textManager = remember { AsrTextManager() }

    var textState by remember {
        mutableStateOf(
            AsrTextManager.TextState(
                textFieldValue = TextFieldValue(initialText),
                isUserEditing = false
            )
        )
    }

    var lastAsrText by remember { mutableStateOf("") }
    var userEditCounter by remember { mutableIntStateOf(0) }

    // 处理ASR状态变化
    LaunchedEffect(asrState) {
        when (val state = asrState) {
            is AsrState.Recording -> {
                if (state.partialText != lastAsrText && state.partialText.isNotBlank()) {
                    textState = textManager.mergeAsrResult(
                        currentState = textState,
                        asrText = state.partialText,
                        isStable = state.isStable
                    )
                    lastAsrText = state.partialText
                }
            }

            is AsrState.Processing -> {
                if (state.partialText != lastAsrText && state.partialText.isNotBlank()) {
                    textState = textManager.mergeAsrResult(
                        currentState = textState,
                        asrText = state.partialText,
                        isStable = true // Processing阶段认为是稳定的
                    )
                    lastAsrText = state.partialText
                }
            }

            is AsrState.Result -> {
                textState = textManager.mergeAsrResult(
                    currentState = textState,
                    asrText = state.text,
                    isStable = true
                )
                lastAsrText = state.text
            }

            else -> { /* 其他状态不处理文本 */ }
        }
    }

    // 用户编辑超时检测
    LaunchedEffect(userEditCounter) {
        if (textState.isUserEditing) {
            kotlinx.coroutines.delay(AsrTextManager.USER_EDIT_TIMEOUT)
            if (textState.isUserEditing) {
                textState = textState.copy(isUserEditing = false)
            }
        }
    }

    val onValueChange: (TextFieldValue) -> Unit = { newValue ->
        textState = textManager.onUserEdit(textState, newValue)
        userEditCounter++
    }

    return Pair(textState.textFieldValue, onValueChange)
}