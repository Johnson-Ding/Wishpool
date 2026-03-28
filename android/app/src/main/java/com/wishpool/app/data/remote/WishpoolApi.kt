package com.wishpool.app.data.remote

import com.wishpool.app.core.network.HttpClient
import com.wishpool.app.domain.wishflow.FeedComment
import com.wishpool.app.domain.wishflow.FeedItem
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishExecutionStatus
import com.wishpool.app.domain.wishflow.WishTask
import org.json.JSONArray
import org.json.JSONObject

/**
 * Supabase PostgREST + RPC direct access.
 * No Express middleware needed.
 */
class WishpoolApi(
    supabaseUrl: String,
    supabaseAnonKey: String,
    enableVerboseLogs: Boolean,
) {
    private val restBase = "$supabaseUrl/rest/v1"
    private val http = HttpClient(
        defaultHeaders = mapOf(
            "apikey" to supabaseAnonKey,
            "Authorization" to "Bearer $supabaseAnonKey",
            "Prefer" to "return=representation",
        ),
        enableVerboseLogs = enableVerboseLogs,
    )

    // ── Feed (PostgREST direct) ─────────────────────────────────────

    fun listFeed(limit: Int = 20): List<FeedItem> {
        val json = http.get("$restBase/drift_bottles?is_active=eq.true&order=created_at.desc&limit=$limit")
        return parseArray(json) { it.toFeedDomain() }
    }

    fun likeFeedItem(id: Int): FeedItem {
        val body = JSONObject().put("p_bottle_id", id)
        val json = http.post("$restBase/rpc/like_bottle", body.toString())
        return JSONObject(json).toFeedDomain()
    }

    fun listComments(bottleId: Int): List<FeedComment> {
        val json = http.get("$restBase/drift_bottle_comments?drift_bottle_id=eq.$bottleId&order=created_at.asc")
        return parseArray(json) { it.toFeedCommentDomain() }
    }

    fun createComment(bottleId: Int, content: String, authorName: String?): FeedComment {
        val body = JSONObject()
            .put("drift_bottle_id", bottleId)
            .put("content", content)
            .put("author_name", authorName ?: "匿名用户")

        val json = http.post("$restBase/drift_bottle_comments?select=*", body.toString())
        return JSONArray(json).getJSONObject(0).toFeedCommentDomain()
    }

    // ── Wishes (RPC + PostgREST) ────────────────────────────────────

    fun createWish(input: CreateWishRequest): WishTask {
        val body = JSONObject()
            .put("p_device_id", input.deviceId)
            .put("p_intent", input.intent)
            .put("p_title", input.title ?: "untitled wish")
            .putOpt("p_city", input.city)
            .putOpt("p_budget", input.budget)
            .putOpt("p_time_window", input.timeWindow)
            .putOpt("p_raw_input", input.rawInput)

        val json = http.post("$restBase/rpc/create_wish", body.toString())
        return JSONObject(json).toWishDomain()
    }

    fun listMyWishes(deviceId: String): List<WishTask> {
        val body = JSONObject().put("p_device_id", deviceId)
        val json = http.post("$restBase/rpc/list_my_wishes", body.toString())
        return parseArray(json) { it.toWishDomain() }
    }

    fun getWish(id: String): WishTask {
        val json = http.get("$restBase/wish_tasks?id=eq.$id")
        return JSONArray(json).getJSONObject(0).toWishDomain()
    }

    fun clarifyWish(id: String, input: ClarifyWishRequest): WishTask {
        val body = JSONObject()
            .put("p_wish_id", id)
            .putOpt("p_title", input.title)
            .putOpt("p_intent", input.intent)
            .putOpt("p_city", input.city)
            .putOpt("p_budget", input.budget)
            .putOpt("p_time_window", input.timeWindow)
            .putOpt("p_raw_input", input.rawInput)

        val json = http.post("$restBase/rpc/clarify_wish", body.toString())
        return JSONObject(json).toWishDomain()
    }

    fun confirmWishPlan(id: String): WishTask {
        val body = JSONObject().put("p_wish_id", id)
        val json = http.post("$restBase/rpc/confirm_wish_plan", body.toString())
        return JSONObject(json).toWishDomain()
    }

    fun listRounds(id: String): List<ValidationRound> {
        val json = http.get("$restBase/validation_rounds?wish_task_id=eq.$id&order=round_number.asc")
        return parseArray(json) { it.toValidationRoundDomain() }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private fun <T> parseArray(json: String, mapper: (JSONObject) -> T): List<T> {
        val array = JSONArray(json)
        return buildList {
            for (index in 0 until array.length()) {
                add(mapper(array.getJSONObject(index)))
            }
        }
    }
}

data class CreateWishRequest(
    val deviceId: String,
    val intent: String,
    val title: String? = null,
    val city: String? = null,
    val budget: String? = null,
    val timeWindow: String? = null,
    val rawInput: String? = null,
)

data class ClarifyWishRequest(
    val intent: String? = null,
    val title: String? = null,
    val city: String? = null,
    val budget: String? = null,
    val timeWindow: String? = null,
    val rawInput: String? = null,
)

// ── JSON → Domain (snake_case from PostgREST) ──────────────────────

private fun JSONObject.toWishDomain(): WishTask = WishTask(
    id = getString("id"),
    title = getString("title"),
    intent = getString("intent"),
    status = WishExecutionStatus.fromRaw(getString("status")),
    city = optNullableString("city"),
    budget = optNullableString("budget"),
    timeWindow = optNullableString("time_window"),
    rawInput = optNullableString("raw_input"),
    confirmedAt = optNullableString("confirmed_at"),
    createdAt = getString("created_at"),
    updatedAt = getString("updated_at"),
)

private fun JSONObject.toValidationRoundDomain(): ValidationRound = ValidationRound(
    id = getString("id"),
    roundNumber = getInt("round_number"),
    summary = getString("summary"),
    humanCheckPassed = if (isNull("human_check_passed")) null else getBoolean("human_check_passed"),
    createdAt = getString("created_at"),
)

private fun JSONObject.toFeedDomain(): FeedItem = FeedItem(
    id = getInt("id"),
    tag = getString("tag"),
    type = optString("type"),
    title = getString("title"),
    meta = getString("meta"),
    loc = getString("loc"),
    excerpt = getString("excerpt"),
    likes = getInt("likes"),
)

private fun JSONObject.toFeedCommentDomain(): FeedComment = FeedComment(
    id = getString("id"),
    bottleId = getInt("drift_bottle_id"),
    authorName = getString("author_name"),
    content = getString("content"),
    createdAt = getString("created_at"),
)

private fun JSONObject.optNullableString(key: String): String? =
    if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }
