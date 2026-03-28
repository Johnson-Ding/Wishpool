package com.wishpool.app.data.repository

import com.wishpool.app.data.remote.WishpoolApi
import com.wishpool.app.domain.wishflow.FeedComment
import com.wishpool.app.domain.wishflow.FeedItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

interface FeedRepository {
    suspend fun listFeed(limit: Int = 20): List<FeedItem>
    suspend fun likeFeedItem(id: Int): FeedItem
    suspend fun listComments(bottleId: Int): List<FeedComment>
    suspend fun createComment(bottleId: Int, content: String, authorName: String? = null): FeedComment
}

class NetworkFeedRepository(
    private val api: WishpoolApi,
) : FeedRepository {
    override suspend fun listFeed(limit: Int): List<FeedItem> = withContext(Dispatchers.IO) {
        runCatching {
        api.listFeed(limit)
        }.getOrElse {
            listOf(
                FeedItem(
                    id = 1,
                    tag = "城市活动",
                    type = "story",
                    title = "第一次参加城市夜跑，认识了固定搭子",
                    meta = "3人助力 · 6天完成",
                    loc = "上海 · 上周",
                    excerpt = "当前未连到后端，先展示本地兜底内容。",
                    likes = 132,
                ),
            )
        }
    }

    override suspend fun likeFeedItem(id: Int): FeedItem = withContext(Dispatchers.IO) {
        api.likeFeedItem(id)
    }

    override suspend fun listComments(bottleId: Int): List<FeedComment> = withContext(Dispatchers.IO) {
        runCatching {
        api.listComments(bottleId)
        }.getOrDefault(emptyList())
    }

    override suspend fun createComment(bottleId: Int, content: String, authorName: String?): FeedComment {
        return withContext(Dispatchers.IO) {
            api.createComment(
                bottleId = bottleId,
                content = content,
                authorName = authorName,
            )
        }
    }
}
