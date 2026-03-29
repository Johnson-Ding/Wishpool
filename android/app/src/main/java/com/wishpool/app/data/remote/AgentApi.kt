package com.wishpool.app.data.remote

import android.util.Log
import com.wishpool.app.domain.model.AiPlanStep
import com.wishpool.app.domain.model.DecisionOption
import com.wishpool.app.domain.model.GeneratedPlan
import com.wishpool.app.domain.model.WishAnalysis
import org.json.JSONObject

/**
 * AI Server 调用接口 — 对标 Web 端 agent-api.ts
 * 调用本地 AI Server (localhost:3100)，失败时降级到本地模板
 */
class AgentApi(
    private val aiServerUrl: String = AI_SERVER_URL,
) {
    private val http = com.wishpool.app.core.network.HttpClient(
        enableVerboseLogs = true,
    )

    /**
     * 调用 AI Server 生成方案
     * POST /plan { wishInput }
     */
    fun generatePlan(wishInput: String): AiPlanResult {
        return try {
            Log.d(TAG, "调用 AI Server 生成方案: $wishInput")
            val body = JSONObject()
                .put("wishInput", wishInput)

            val json = http.post("$aiServerUrl/plan", body.toString())
            val data = JSONObject(json)

            if (data.optBoolean("success", false)) {
                // 优先从 plan 字段解析（AI Server 返回的 GeneratedPlan 格式）
                val planJson = data.optJSONObject("plan")
                if (planJson != null) {
                    val plan = parsePlan(planJson, wishInput)
                    val provider = data.optString("provider", "ai-server")
                    Log.d(TAG, "AI 方案生成成功 ($provider)")
                    AiPlanResult.Success(plan, provider)
                } else {
                    Log.w(TAG, "AI Server 返回成功但无 plan 字段，降级到本地模板")
                    AiPlanResult.Success(generateLocalTemplate(wishInput), "local-template")
                }
            } else {
                val error = data.optString("error", "未知错误")
                Log.w(TAG, "AI Server 返回失败: $error，降级到本地模板")
                AiPlanResult.Success(generateLocalTemplate(wishInput), "local-fallback")
            }
        } catch (e: Exception) {
            Log.w(TAG, "AI Server 不可用，降级到本地模板: ${e.message}")
            AiPlanResult.Success(generateLocalTemplate(wishInput), "local-fallback")
        }
    }

    /**
     * 调用 AI Server 进行意图分析
     * POST /analyze { wish }
     */
    fun analyzeWish(wish: String): WishAnalysis? {
        return try {
            val body = JSONObject()
                .put("wish", wish)

            val json = http.post("$aiServerUrl/analyze", body.toString())
            val data = JSONObject(json)

            if (data.optBoolean("success", false)) {
                val analysis = data.optJSONObject("analysis") ?: return null
                parseAnalysis(analysis)
            } else {
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "AI Server 意图分析不可用: ${e.message}")
            null
        }
    }

    private fun parsePlan(json: JSONObject, fallbackWishText: String): GeneratedPlan {
        val options = buildList {
            val arr = json.optJSONArray("decisionOptions")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val opt = arr.getJSONObject(i)
                    add(DecisionOption(opt.getString("key"), opt.getString("label")))
                }
            }
        }

        val steps = buildList {
            val arr = json.optJSONArray("planSteps")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val s = arr.getJSONObject(i)
                    add(
                        AiPlanStep(
                            num = s.optString("num", "①"),
                            title = s.getString("title"),
                            type = s.getString("type"),
                            typeColor = s.optString("typeColor", "var(--accent)"),
                            desc = s.optString("desc", ""),
                        ),
                    )
                }
            }
        }

        return GeneratedPlan(
            wishText = json.optString("wishText", fallbackWishText),
            durationText = json.optString("durationText", "预计 5 天完成"),
            decisionTitle = json.optString("decisionTitle", ""),
            decisionOptions = options,
            planSteps = steps,
            category = json.optString("category", "生活体验"),
            difficulty = json.optString("difficulty", "medium"),
            estimatedDays = json.optInt("estimatedDays", 5),
        )
    }

    private fun parseAnalysis(json: JSONObject): WishAnalysis {
        val constraints = buildList {
            val arr = json.optJSONArray("constraints")
            if (arr != null) for (i in 0 until arr.length()) add(arr.getString(i))
        }
        val preferences = buildList {
            val arr = json.optJSONArray("preferences")
            if (arr != null) for (i in 0 until arr.length()) add(arr.getString(i))
        }

        return WishAnalysis(
            intentType = json.optString("intentType", "execution"),
            confidence = json.optDouble("confidence", 0.5),
            executableAutomatically = json.optBoolean("executableAutomatically", false),
            needsFriendHelp = json.optBoolean("needsFriendHelp", false),
            needsCommunityHelp = json.optBoolean("needsCommunityHelp", false),
            goal = json.optString("goal", ""),
            constraints = constraints,
            preferences = preferences,
            timeframe = json.optString("timeframe").takeIf { it.isNotBlank() },
            budget = json.optString("budget").takeIf { it.isNotBlank() },
        )
    }

    companion object {
        private const val TAG = "AgentApi"
        // Android 模拟器访问宿主机 localhost 需要用 10.0.2.2
        // 真机调试需要用电脑的局域网 IP
        const val AI_SERVER_URL = "http://10.0.2.2:3100"
    }
}

sealed class AiPlanResult {
    data class Success(val plan: GeneratedPlan, val provider: String) : AiPlanResult()
    data class Error(val message: String) : AiPlanResult()
}

// ── 本地模板降级方案 — 对标 Web 端 generatePlanFromTemplate ──

private fun generateLocalTemplate(wishInput: String): GeneratedPlan {
    val input = wishInput.trim().lowercase()

    if (input.containsAny("海边", "海滩", "放松", "旅行", "度假")) {
        return GeneratedPlan(
            wishText = wishInput.trim(),
            durationText = "预计 3-5 天完成",
            decisionTitle = "AI 需要你决定：这次海边之行你更想要什么体验？",
            decisionOptions = listOf(
                DecisionOption("relax", "纯放松休闲"),
                DecisionOption("activity", "海上活动体验"),
                DecisionOption("photo", "拍照打卡风景"),
            ),
            planSteps = listOf(
                AiPlanStep("①", "筛选适合的海边目的地和住宿", "线上直出", "#4AADA0", "AI 自动搜索推荐"),
                AiPlanStep("②", "预订交通和酒店，准备物品清单", "资源助力", "#F5C842", "平台资源助力"),
                AiPlanStep("③", "找同行伙伴或当地向导推荐", "人群助力", "#c084fc", "AI匹配志同道合的旅友"),
                AiPlanStep("④", "开始海边放松之旅", "需你到场", "#f97316", "你本人享受旅程"),
            ),
            category = "生活体验",
            difficulty = "easy",
            estimatedDays = 4,
        )
    }

    if (input.containsAny("学习", "技能", "考试", "读书")) {
        return GeneratedPlan(
            wishText = wishInput.trim(),
            durationText = "预计 10-14 天完成",
            decisionTitle = "AI 需要你决定：你更偏好哪种学习模式？",
            decisionOptions = listOf(
                DecisionOption("self", "自主学习"),
                DecisionOption("course", "系统课程"),
                DecisionOption("mentor", "导师指导"),
            ),
            planSteps = listOf(
                AiPlanStep("①", "制定学习计划和时间安排", "线上直出", "#4AADA0", "AI 自动规划"),
                AiPlanStep("②", "整理学习资源和材料", "资源助力", "#F5C842", "平台资源助力"),
                AiPlanStep("③", "寻找学习伙伴或导师", "人群助力", "#c084fc", "AI匹配学习搭子"),
                AiPlanStep("④", "开始系统化学习", "需你到场", "#f97316", "你本人投入学习"),
            ),
            category = "学习成长",
            difficulty = "medium",
            estimatedDays = 12,
        )
    }

    if (input.containsAny("运动", "跑步", "健身", "锻炼")) {
        return GeneratedPlan(
            wishText = wishInput.trim(),
            durationText = "预计 7 天完成",
            decisionTitle = "AI 需要你决定：你更喜欢哪种运动节奏？",
            decisionOptions = listOf(
                DecisionOption("light", "轻松入门"),
                DecisionOption("regular", "规律训练"),
                DecisionOption("intense", "高强度挑战"),
            ),
            planSteps = listOf(
                AiPlanStep("①", "制定适合的运动计划", "线上直出", "#4AADA0", "AI 个性化规划"),
                AiPlanStep("②", "准备运动装备和场地", "资源助力", "#F5C842", "平台资源助力"),
                AiPlanStep("③", "寻找运动伙伴或教练", "人群助力", "#c084fc", "AI匹配运动搭子"),
                AiPlanStep("④", "开始规律运动", "需你到场", "#f97316", "你本人坚持锻炼"),
            ),
            category = "运动健康",
            difficulty = "easy",
            estimatedDays = 7,
        )
    }

    // 通用模板
    return GeneratedPlan(
        wishText = wishInput.trim(),
        durationText = "预计 5 天完成",
        decisionTitle = "AI 需要你决定：你更偏好哪种执行方式？",
        decisionOptions = listOf(
            DecisionOption("solo", "独自完成"),
            DecisionOption("partner", "寻找搭子"),
            DecisionOption("community", "社区协助"),
        ),
        planSteps = listOf(
            AiPlanStep("①", "分析需求并制定计划", "线上直出", "#4AADA0", "AI 智能分析"),
            AiPlanStep("②", "准备必要的资源和信息", "资源助力", "#F5C842", "平台资源助力"),
            AiPlanStep("③", "寻找合适的协助伙伴", "人群助力", "#c084fc", "AI匹配合适搭子"),
            AiPlanStep("④", "开始执行你的心愿", "需你到场", "#f97316", "你本人参与"),
        ),
        category = "生活体验",
        difficulty = "medium",
        estimatedDays = 5,
    )
}

private fun String.containsAny(vararg keywords: String): Boolean =
    keywords.any { this.contains(it) }
