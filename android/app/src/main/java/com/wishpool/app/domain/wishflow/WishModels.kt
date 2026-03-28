package com.wishpool.app.domain.wishflow

enum class WishExecutionStatus {
    DRAFT,
    CLARIFYING,
    PLANNING,
    VALIDATING,
    LOCKING,
    READY,
    IN_PROGRESS,
    COMPLETED,
    FAILED,
    CANCELLED,

    ;

    companion object {
        fun fromRaw(raw: String): WishExecutionStatus = when (raw.lowercase()) {
            "draft" -> DRAFT
            "clarifying" -> CLARIFYING
            "planning" -> PLANNING
            "validating" -> VALIDATING
            "locking" -> LOCKING
            "ready" -> READY
            "in_progress" -> IN_PROGRESS
            "completed" -> COMPLETED
            "failed" -> FAILED
            "cancelled" -> CANCELLED
            else -> DRAFT
        }
    }
}

data class WishTask(
    val id: String,
    val title: String,
    val intent: String,
    val status: WishExecutionStatus,
    val city: String? = null,
    val budget: String? = null,
    val timeWindow: String? = null,
    val rawInput: String? = null,
    val confirmedAt: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

data class FeedItem(
    val id: Int,
    val tag: String,
    val type: String,
    val title: String,
    val meta: String,
    val loc: String,
    val excerpt: String,
    val likes: Int,
)

data class FeedComment(
    val id: String,
    val bottleId: Int,
    val authorName: String,
    val content: String,
    val createdAt: String,
)

data class ValidationRound(
    val id: String,
    val roundNumber: Int,
    val summary: String,
    val humanCheckPassed: Boolean?,
    val createdAt: String,
)
