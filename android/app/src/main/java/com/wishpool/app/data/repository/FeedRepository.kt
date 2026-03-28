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
                FeedItem(id = 1, type = "story", tag = "城市活动", title = "第一次参加城市夜跑，认识了固定搭子", meta = "3人助力 · 6天完成", loc = "上海 · 上周", excerpt = "我只说了一句想重新把运动捡起来，AI就帮我匹配了附近跑团、合适的集合时间和同频搭子，现在每周三都有人等我一起出发。", likes = 132),
                FeedItem(id = 2, type = "mumble", tag = "碎碎念", title = "为什么下班以后，还是觉得这一天不像自己的", meta = "社区动态 · 63条共鸣", loc = "匿名 · 今天", excerpt = "白天一直在回消息、开会、补需求，忙到晚上却说不上自己真正推进了什么。想给生活留一点属于自己的力气，怎么这么难。", likes = 286),
                FeedItem(id = 3, type = "news", tag = "\uD83C\uDF89 好消息", title = "第一次自己组织周末露营，报名和物资都搞定了！", meta = "AI直出 · 4天完成", loc = "杭州 · 本月", excerpt = "从营地筛选、天气确认到食材和天幕清单，AI把准备工作一次性列清楚了，朋友们直接按分工认领，这周终于能成行。", likes = 198),
                FeedItem(id = 4, type = "rec", tag = "\uD83C\uDF5C 本地推荐", title = "找到一家适合一个人安静吃饭的小馆子", meta = "AI直出 · 独处友好", loc = "广州 · 本周", excerpt = "我想找那种不催人、灯光舒服、一个人坐着也不尴尬的小店，AI最后给了这家藏在居民区里的汤粉馆，老板还会主动少放香菜。", likes = 94),
                FeedItem(id = 5, type = "goodnews", tag = "\uD83C\uDF0D 全球好消息", title = "养老院里的猫咪成了老人们的治愈伙伴", meta = "BBC · 3天前", loc = "英国 · 全球好消息", excerpt = "一只原本被救助的猫咪住进养老院后，成了老人们每天最期待见到的朋友。护士说，自从它来了，大家聊天和出门的次数都明显变多了。", likes = 1847),
                FeedItem(id = 6, type = "poem", tag = "✨ 小诗一首", title = "小诗一首", meta = "", loc = "", excerpt = "我许了个愿\n风把它吹走了\n后来我才知道\n它是去替我找路", likes = 522),
                FeedItem(id = 7, type = "story", tag = "家庭时光", title = "第一次带爸妈短途旅行，终于成行", meta = "AI直出 · 10天完成", loc = "苏州 · 上月", excerpt = "以前总说等有空再带爸妈出去走走，这次AI帮我把高铁、酒店和轻松路线都排好了，还考虑了他们的步行强度，终于不再只是说说。", likes = 367),
                FeedItem(id = 8, type = "quote", tag = "\uD83D\uDCAC 今日金句", title = "今日金句", meta = "", loc = "", excerpt = "愿望先被说出口\n生活才知道\n该往哪里\n轻轻推你一把。", likes = 941),
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
