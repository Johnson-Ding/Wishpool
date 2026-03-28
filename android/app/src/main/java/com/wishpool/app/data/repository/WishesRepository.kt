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
                WishTask(
                    id = "offline-1",
                    title = "周末去滑雪",
                    intent = "我想在下个月体验一次滑雪",
                    status = WishExecutionStatus.PLANNING,
                    city = "北京",
                    createdAt = "2026-03-28T08:00:00.000Z",
                    updatedAt = "2026-03-28T08:30:00.000Z",
                ),
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
