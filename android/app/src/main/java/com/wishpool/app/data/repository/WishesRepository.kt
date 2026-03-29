package com.wishpool.app.data.repository

import com.wishpool.app.data.cache.AiPlanCache
import com.wishpool.app.data.remote.AgentApi
import com.wishpool.app.data.remote.AiPlanResult
import com.wishpool.app.data.remote.ClarifyWishRequest
import com.wishpool.app.data.remote.CreateWishRequest
import com.wishpool.app.data.remote.WishpoolApi
import com.wishpool.app.domain.model.GeneratedPlan
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
    suspend fun generateAIPlan(wishText: String): GeneratedPlan?
    suspend fun getCachedPlan(wishId: String): GeneratedPlan?
    suspend fun cachePlan(wishId: String, plan: GeneratedPlan)
}

class NetworkWishesRepository(
    private val api: WishpoolApi,
    private val agentApi: AgentApi,
    private val aiPlanCache: AiPlanCache,
) : WishesRepository {
    override suspend fun listMyWishes(): List<WishTask> = withContext(Dispatchers.IO) {
        runCatching {
            api.listMyWishes()
        }.getOrElse {
            // 网络失败时返回空列表，避免展示假数据
            emptyList()
        }
    }

    override suspend fun createWish(intent: String, city: String?, budget: String?, timeWindow: String?): WishTask {
        return withContext(Dispatchers.IO) {
            api.createWish(
                CreateWishRequest(
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

    override suspend fun generateAIPlan(wishText: String): GeneratedPlan? = withContext(Dispatchers.IO) {
        val result = agentApi.generatePlan(wishText)
        when (result) {
            is AiPlanResult.Success -> result.plan
            is AiPlanResult.Error -> null
        }
    }

    override suspend fun getCachedPlan(wishId: String): GeneratedPlan? {
        return aiPlanCache.getPlan(wishId)
    }

    override suspend fun cachePlan(wishId: String, plan: GeneratedPlan) {
        aiPlanCache.savePlan(wishId, plan)
    }
}
