package com.wishpool.app.data.repository

import com.wishpool.app.core.common.DeviceIdProvider
import com.wishpool.app.data.remote.ClarifyWishRequest
import com.wishpool.app.data.remote.CreateWishRequest
import com.wishpool.app.data.remote.WishpoolApi
import com.wishpool.app.domain.wishflow.ValidationRound
import com.wishpool.app.domain.wishflow.WishExecutionStatus
import com.wishpool.app.domain.wishflow.WishTask
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

interface WishesRepository {
    suspend fun listMyWishes(): List<WishTask>
    suspend fun createWish(intent: String, city: String?, budget: String?, timeWindow: String?): WishTask
    suspend fun getWish(id: String): WishTask
    suspend fun clarifyWish(id: String, intent: String?, city: String?, budget: String?, timeWindow: String?): WishTask
    suspend fun confirmWishPlan(id: String): WishTask
    suspend fun listRounds(id: String): List<ValidationRound>
}

class NetworkWishesRepository(
    private val api: WishpoolApi,
    private val deviceIdProvider: DeviceIdProvider,
) : WishesRepository {
    override suspend fun listMyWishes(): List<WishTask> = withContext(Dispatchers.IO) {
        runCatching {
        api.listMyWishes(deviceIdProvider.getOrCreate())
        }.getOrElse {
            listOf(
                WishTask(id = "offline-1", title = "周末去滑雪", intent = "我想去崇礼滑雪，找个有车的搭子一起出发", status = WishExecutionStatus.CLARIFYING, city = "北京", createdAt = "2026-03-25T08:00:00.000Z", updatedAt = "2026-03-26T10:00:00.000Z"),
                WishTask(id = "offline-2", title = "城市夜跑", intent = "我想开始参加城市夜跑，找到固定搭子一起坚持", status = WishExecutionStatus.IN_PROGRESS, city = "上海", createdAt = "2026-03-20T19:00:00.000Z", updatedAt = "2026-03-27T20:00:00.000Z"),
                WishTask(id = "offline-3", title = "组织露营", intent = "我想组织一次周末露营，把报名和物资都安排明白", status = WishExecutionStatus.PLANNING, city = "杭州", createdAt = "2026-03-22T12:00:00.000Z", updatedAt = "2026-03-26T15:00:00.000Z"),
                WishTask(id = "offline-4", title = "一人食探店", intent = "我想找到一家适合一个人安静吃饭的小馆子", status = WishExecutionStatus.COMPLETED, city = "广州", createdAt = "2026-03-15T18:00:00.000Z", updatedAt = "2026-03-18T21:00:00.000Z"),
                WishTask(id = "offline-5", title = "带爸妈旅行", intent = "我想带爸妈来一次轻松的短途旅行", status = WishExecutionStatus.READY, city = "苏州", createdAt = "2026-03-18T09:00:00.000Z", updatedAt = "2026-03-27T14:00:00.000Z"),
            )
        }
    }

    override suspend fun createWish(intent: String, city: String?, budget: String?, timeWindow: String?): WishTask {
        return withContext(Dispatchers.IO) {
            api.createWish(
                CreateWishRequest(
                    deviceId = deviceIdProvider.getOrCreate(),
                    intent = intent,
                    city = city,
                    budget = budget,
                    timeWindow = timeWindow,
                    rawInput = intent,
                ),
            )
        }
    }

    override suspend fun getWish(id: String): WishTask = withContext(Dispatchers.IO) {
        api.getWish(id)
    }

    override suspend fun clarifyWish(
        id: String,
        intent: String?,
        city: String?,
        budget: String?,
        timeWindow: String?,
    ): WishTask = api.clarifyWish(
        id = id,
        input = ClarifyWishRequest(
            intent = intent,
            city = city,
            budget = budget,
            timeWindow = timeWindow,
            rawInput = intent,
        ),
    )

    override suspend fun confirmWishPlan(id: String): WishTask = withContext(Dispatchers.IO) {
        api.confirmWishPlan(id)
    }

    override suspend fun listRounds(id: String): List<ValidationRound> = withContext(Dispatchers.IO) {
        runCatching {
        api.listRounds(id)
        }.getOrDefault(emptyList())
    }
}
