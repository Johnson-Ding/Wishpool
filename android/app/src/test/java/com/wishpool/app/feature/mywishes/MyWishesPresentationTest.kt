package com.wishpool.app.feature.mywishes

import com.wishpool.app.domain.wishflow.WishExecutionStatus
import com.wishpool.app.domain.wishflow.WishTask
import org.junit.Assert.assertEquals
import org.junit.Test

class MyWishesPresentationTest {
    @Test
    fun `build wish sections groups wishes by lifecycle buckets`() {
        val wishes = listOf(
            WishTask(id = "1", title = "滑雪", intent = "滑雪", status = WishExecutionStatus.PLANNING),
            WishTask(id = "2", title = "海边", intent = "海边", status = WishExecutionStatus.IN_PROGRESS),
            WishTask(id = "3", title = "看展", intent = "看展", status = WishExecutionStatus.COMPLETED),
        )

        val sections = buildWishSections(wishes)

        assertEquals(listOf("待决策", "进行中", "已完成"), sections.map { it.title })
        assertEquals(listOf("1"), sections[0].items.map { it.id })
        assertEquals(listOf("2"), sections[1].items.map { it.id })
        assertEquals(listOf("3"), sections[2].items.map { it.id })
    }
}
