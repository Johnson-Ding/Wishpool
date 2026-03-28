package com.wishpool.app.data.remote

import com.wishpool.app.domain.wishflow.WishExecutionStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WishpoolDtoMapperTest {

    @Test
    fun `maps wish dto into domain model with normalized status`() {
        val dto = WishDto(
            id = "wish-1",
            anonymousUserId = "anon-1",
            title = "周末去滑雪",
            intent = "我想去崇礼滑雪",
            status = "planning",
            city = "北京",
            budget = "1500",
            timeWindow = "下周末",
            rawInput = "我想去崇礼滑雪",
            confirmedAt = null,
            createdAt = "2026-03-28T08:00:00.000Z",
            updatedAt = "2026-03-28T08:30:00.000Z",
        )

        val model = dto.toDomain()

        assertEquals("wish-1", model.id)
        assertEquals(WishExecutionStatus.PLANNING, model.status)
        assertEquals("北京", model.city)
        assertEquals("1500", model.budget)
        assertNull(model.confirmedAt)
    }
}
