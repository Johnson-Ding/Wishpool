package com.wishpool.app.core.asr

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PublisherSheetUiModelTest {

    @Test
    fun `recording state keeps submit disabled and shows listening copy`() {
        val model = PublisherSheetUiModel.from(
            asrState = AsrState.Recording(partialText = "我想"),
            editableText = "我想",
        )

        assertTrue(model.showRecordingDot)
        assertEquals("正在聆听...", model.statusText)
        assertFalse(model.submitEnabled)
        assertEquals("我想", model.textFieldValue)
    }

    @Test
    fun `result state enables submit when text is present`() {
        val model = PublisherSheetUiModel.from(
            asrState = AsrState.Result(text = "我想去海边放松一下"),
            editableText = "我想去海边放松一下",
        )

        assertFalse(model.showRecordingDot)
        assertEquals("已听到你的心愿 ✨", model.statusText)
        assertTrue(model.submitEnabled)
    }

    @Test
    fun `permission required state surfaces explicit guidance`() {
        val model = PublisherSheetUiModel.from(
            asrState = AsrState.PermissionRequired,
            editableText = "",
        )

        assertEquals("需要麦克风权限", model.statusText)
        assertFalse(model.submitEnabled)
    }
}
