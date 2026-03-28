package com.wishpool.app.data.remote

import com.wishpool.app.core.network.HttpClient
import com.wishpool.app.domain.wishflow.FeedComment
import com.wishpool.app.domain.wishflow.FeedItem
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishExecutionStatus
import com.wishpool.app.domain.wishflow.WishTask
import org.json.JSONArray
import org.json.JSONObject

class WishpoolApi(
    private val baseUrl: String,
    enableVerboseLogs: Boolean,
) {
    private val http = HttpClient(enableVerboseLogs = enableVerboseLogs)

    fun listFeed(limit: Int = 20): List<FeedItem> {
        val json = http.get("${baseUrl}feed?limit=$limit")
        return parseDataArray(json) { item -> item.toFeedDomain() }
    }

    fun likeFeedItem(id: Int): FeedItem {
        val json = http.post("${baseUrl}feed/$id/like", body = "{}")
        return parseDataObject(json).toFeedDomain()
    }

    fun listComments(bottleId: Int): List<FeedComment> {
        val json = http.get("${baseUrl}feed/$bottleId/comments")
        return parseDataArray(json) { item -> item.toFeedCommentDomain() }
    }

    fun createComment(bottleId: Int, deviceId: String, content: String, authorName: String?): FeedComment {
        val body = JSONObject()
            .put("deviceId", deviceId)
            .put("content", content)
            .apply {
                if (!authorName.isNullOrBlank()) put("authorName", authorName)
            }

        val json = http.post("${baseUrl}feed/$bottleId/comments", body.toString())
        return parseDataObject(json).toFeedCommentDomain()
    }

    fun createWish(input: CreateWishRequest): WishTask {
        val body = JSONObject()
            .put("deviceId", input.deviceId)
            .put("intent", input.intent)
            .put("title", input.title)
            .put("city", input.city)
            .put("budget", input.budget)
            .put("timeWindow", input.timeWindow)
            .put("rawInput", input.rawInput)

        val json = http.post("${baseUrl}wishes", body.toString())
        return parseDataObject(json).toWishDto().toDomain()
    }

    fun listMyWishes(deviceId: String): List<WishTask> {
        val json = http.get("${baseUrl}wishes?deviceId=$deviceId")
        return parseDataArray(json) { item -> item.toWishDto().toDomain() }
    }

    fun getWish(id: String): WishTask {
        val json = http.get("${baseUrl}wishes/$id")
        return parseDataObject(json).toWishDto().toDomain()
    }

    fun clarifyWish(id: String, input: ClarifyWishRequest): WishTask {
        val body = JSONObject()
            .put("intent", input.intent)
            .put("title", input.title)
            .put("city", input.city)
            .put("budget", input.budget)
            .put("timeWindow", input.timeWindow)
            .put("rawInput", input.rawInput)

        val json = http.patch("${baseUrl}wishes/$id/clarify", body.toString())
        return parseDataObject(json).toWishDto().toDomain()
    }

    fun confirmWishPlan(id: String): WishTask {
        val json = http.post("${baseUrl}wishes/$id/plan/confirm", "{}")
        return parseDataObject(json).toWishDto().toDomain()
    }

    fun listRounds(id: String): List<ValidationRound> {
        val json = http.get("${baseUrl}wishes/$id/rounds")
        return parseDataArray(json) { item -> item.toValidationRoundDomain() }
    }

    private fun parseDataObject(json: String): JSONObject = JSONObject(json).getJSONObject("data")

    private fun <T> parseDataArray(json: String, mapper: (JSONObject) -> T): List<T> {
        val array = JSONObject(json).getJSONArray("data")
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

data class WishDto(
    val id: String,
    val anonymousUserId: String,
    val title: String,
    val intent: String,
    val status: String,
    val city: String?,
    val budget: String?,
    val timeWindow: String?,
    val rawInput: String?,
    val confirmedAt: String?,
    val createdAt: String,
    val updatedAt: String,
)

fun WishDto.toDomain(): WishTask = WishTask(
    id = id,
    title = title,
    intent = intent,
    status = WishExecutionStatus.fromRaw(status),
    city = city,
    budget = budget,
    timeWindow = timeWindow,
    rawInput = rawInput,
    confirmedAt = confirmedAt,
    createdAt = createdAt,
    updatedAt = updatedAt,
)

private fun JSONObject.toWishDto(): WishDto = WishDto(
    id = getString("id"),
    anonymousUserId = getString("anonymousUserId"),
    title = getString("title"),
    intent = getString("intent"),
    status = getString("status"),
    city = optNullableString("city"),
    budget = optNullableString("budget"),
    timeWindow = optNullableString("timeWindow"),
    rawInput = optNullableString("rawInput"),
    confirmedAt = optNullableString("confirmedAt"),
    createdAt = getString("createdAt"),
    updatedAt = getString("updatedAt"),
)

private fun JSONObject.toValidationRoundDomain(): ValidationRound = ValidationRound(
    id = getString("id"),
    roundNumber = getInt("roundNumber"),
    summary = getString("summary"),
    humanCheckPassed = if (isNull("humanCheckPassed")) null else getBoolean("humanCheckPassed"),
    createdAt = getString("createdAt"),
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
    bottleId = getInt("bottleId"),
    authorName = getString("authorName"),
    content = getString("content"),
    createdAt = getString("createdAt"),
)

private fun JSONObject.optNullableString(key: String): String? =
    if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }

