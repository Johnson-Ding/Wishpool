package com.wishpool.app.feature.mywishes

import com.wishpool.app.domain.wishflow.WishExecutionStatus
import com.wishpool.app.domain.wishflow.WishTask

data class WishSection(
    val title: String,
    val items: List<WishTask>,
)

fun buildWishSections(wishes: List<WishTask>): List<WishSection> {
    val pending = wishes.filter { it.status in setOf(WishExecutionStatus.CLARIFYING, WishExecutionStatus.PLANNING, WishExecutionStatus.VALIDATING, WishExecutionStatus.LOCKING, WishExecutionStatus.READY) }
    val active = wishes.filter { it.status == WishExecutionStatus.IN_PROGRESS }
    val completed = wishes.filter { it.status in setOf(WishExecutionStatus.COMPLETED, WishExecutionStatus.FAILED, WishExecutionStatus.CANCELLED) }

    return buildList {
        if (pending.isNotEmpty()) add(WishSection("待决策", pending))
        if (active.isNotEmpty()) add(WishSection("进行中", active))
        if (completed.isNotEmpty()) add(WishSection("已完成", completed))
    }
}
