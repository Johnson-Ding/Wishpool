package com.wishpool.app.data.remote

import com.wishpool.app.domain.wishflow.WishExecutionStatus
import org.junit.Assert.assertEquals
import org.junit.Test

class WishExecutionStatusMapperTest {

    @Test
    fun `maps raw status strings to domain enum`() {
        assertEquals(WishExecutionStatus.PLANNING, WishExecutionStatus.fromRaw("planning"))
        assertEquals(WishExecutionStatus.CLARIFYING, WishExecutionStatus.fromRaw("clarifying"))
        assertEquals(WishExecutionStatus.READY, WishExecutionStatus.fromRaw("ready"))
    }

    @Test
    fun `create wish request preserves input fields`() {
        val req = CreateWishRequest(
            deviceId = "device-1",
            intent = "想去滑雪",
            city = "北京",
            budget = "1500",
        )
        assertEquals("device-1", req.deviceId)
        assertEquals("想去滑雪", req.intent)
        assertEquals("北京", req.city)
        assertEquals("1500", req.budget)
    }
}
