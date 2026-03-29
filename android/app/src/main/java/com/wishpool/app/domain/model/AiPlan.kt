package com.wishpool.app.domain.model

/**
 * AI 生成的心愿方案 — 对标 Web 端 GeneratedPlan 接口
 */
data class GeneratedPlan(
    val wishText: String,
    val durationText: String,
    val decisionTitle: String,
    val decisionOptions: List<DecisionOption>,
    val planSteps: List<AiPlanStep>,
    val category: String,
    val difficulty: String, // "easy" | "medium" | "hard"
    val estimatedDays: Int,
)

data class DecisionOption(
    val key: String,
    val label: String,
)

data class AiPlanStep(
    val num: String,
    val title: String,
    val type: String,
    val typeColor: String,
    val desc: String,
)

/**
 * AI 意图分析结果 — 对标 Web 端 WishAnalysis 接口
 */
data class WishAnalysis(
    val intentType: String, // "emotional" | "travel" | "local_life" | "growth" | "execution"
    val confidence: Double,
    val executableAutomatically: Boolean,
    val needsFriendHelp: Boolean,
    val needsCommunityHelp: Boolean,
    val goal: String,
    val constraints: List<String>,
    val preferences: List<String>,
    val timeframe: String? = null,
    val budget: String? = null,
)
