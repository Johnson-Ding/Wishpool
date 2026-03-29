package com.wishpool.app.core.asr

data class PublisherSheetUiModel(
    val statusText: String,
    val showRecordingDot: Boolean,
    val submitEnabled: Boolean,
    val textFieldValue: String,
) {
    companion object {
        fun from(
            asrState: AsrState,
            editableText: String,
        ): PublisherSheetUiModel {
            val trimmed = editableText.trim()
            return when (asrState) {
                AsrState.Idle -> PublisherSheetUiModel(
                    statusText = "准备开始聆听...",
                    showRecordingDot = false,
                    submitEnabled = trimmed.isNotBlank(),
                    textFieldValue = editableText,
                )

                AsrState.PermissionRequired -> PublisherSheetUiModel(
                    statusText = "需要麦克风权限",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = editableText,
                )

                is AsrState.Downloading -> PublisherSheetUiModel(
                    statusText = "正在准备语音识别...",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = editableText,
                )

                is AsrState.Recording -> {
                    val statusText = when {
                        asrState.partialText.isNotBlank() && asrState.isStable ->
                            "听到了：${asrState.partialText.take(10)}${if(asrState.partialText.length > 10) "..." else ""}"
                        asrState.partialText.isNotBlank() ->
                            "正在识别..."
                        else ->
                            "正在聆听..."
                    }
                    PublisherSheetUiModel(
                        statusText = statusText,
                        showRecordingDot = true,
                        submitEnabled = false,
                        textFieldValue = editableText,
                    )
                }

                is AsrState.Processing -> {
                    val confidenceText = if (asrState.confidence > 0.8f) "质量良好" else "正在优化"
                    PublisherSheetUiModel(
                        statusText = "正在整理语音...（$confidenceText）",
                        showRecordingDot = false,
                        submitEnabled = false,
                        textFieldValue = editableText,
                    )
                }

                is AsrState.Result -> PublisherSheetUiModel(
                    statusText = "已听到你的心愿 ✨",
                    showRecordingDot = false,
                    submitEnabled = trimmed.isNotBlank(),
                    textFieldValue = editableText,
                )

                is AsrState.Error -> PublisherSheetUiModel(
                    statusText = asrState.message,
                    showRecordingDot = false,
                    submitEnabled = trimmed.isNotBlank(),
                    textFieldValue = editableText,
                )
            }
        }

        fun fromDirect(asrState: AsrState): PublisherSheetUiModel {
            return when (asrState) {
                AsrState.Idle -> PublisherSheetUiModel(
                    statusText = "准备开始聆听...",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = "",
                )

                AsrState.PermissionRequired -> PublisherSheetUiModel(
                    statusText = "需要麦克风权限",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = "",
                )

                is AsrState.Downloading -> PublisherSheetUiModel(
                    statusText = "正在准备语音识别...",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = "",
                )

                is AsrState.Recording -> {
                    val statusText = when {
                        asrState.partialText.isNotBlank() && asrState.isStable ->
                            "听到了：${asrState.partialText.take(15)}${if(asrState.partialText.length > 15) "..." else ""}"
                        asrState.partialText.isNotBlank() ->
                            "正在识别...（完成后直接发送）"
                        else ->
                            "正在聆听...（完成后直接发送）"
                    }
                    PublisherSheetUiModel(
                        statusText = statusText,
                        showRecordingDot = true,
                        submitEnabled = false,
                        textFieldValue = "",
                    )
                }

                is AsrState.Processing -> {
                    val confidenceText = if (asrState.confidence > 0.8f) "质量良好" else "正在优化"
                    PublisherSheetUiModel(
                        statusText = "正在整理语音...（$confidenceText，即将发送）",
                        showRecordingDot = false,
                        submitEnabled = false,
                        textFieldValue = "",
                    )
                }

                is AsrState.Result -> PublisherSheetUiModel(
                    statusText = "录音完成，正在发送...",
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = "",
                )

                is AsrState.Error -> PublisherSheetUiModel(
                    statusText = asrState.message,
                    showRecordingDot = false,
                    submitEnabled = false,
                    textFieldValue = "",
                )
            }
        }
    }
}
