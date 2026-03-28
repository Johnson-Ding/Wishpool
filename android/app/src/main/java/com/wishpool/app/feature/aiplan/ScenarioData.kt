package com.wishpool.app.feature.aiplan

data class PlanStep(
    val num: String,
    val title: String,
    val type: String,
    val typeColor: Long,
    val desc: String,
)

data class WishScenario(
    val id: Int,
    val wishText: String,
    val durationText: String,
    val planSteps: List<PlanStep>,
)

fun matchScenario(input: String): Pair<WishScenario, Boolean> {
    val text = input.lowercase()
    val scenario = when {
        text.containsAny("滑雪", "雪场", "单板", "双板") -> SCENARIOS[2]
        text.containsAny("火锅", "一人食", "探店", "吃饭", "馆子") -> SCENARIOS[4]
        text.containsAny("夜跑", "跑步", "跑团", "运动") -> SCENARIOS[1]
        text.containsAny("露营", "营地", "天幕", "camping") -> SCENARIOS[3]
        text.containsAny("爸妈", "父母", "家庭旅行", "带家人") -> SCENARIOS[7]
        text.containsAny("海边", "海", "沙滩", "度假") -> SCENARIOS[2]
        else -> null
    }
    return if (scenario != null) {
        scenario to false
    } else {
        (SCENARIOS[2] ?: DEFAULT_SCENARIO) to true
    }
}

private fun String.containsAny(vararg keywords: String): Boolean =
    keywords.any { this.contains(it) }

private val DEFAULT_SCENARIO = WishScenario(
    id = 2,
    wishText = "我想去崇礼滑雪，找个有车的搭子一起出发",
    durationText = "预计 5 天完成",
    planSteps = listOf(
        PlanStep("①", "筛选崇礼雪场 + 锁定新手友好线路", "线上直出", 0xFF4AADA0, "AI 自动完成"),
        PlanStep("②", "整理拼车时间 + 雪具租赁建议", "资源助力", 0xFFF5C842, "平台资源助力"),
        PlanStep("③", "匹配有车且节奏合适的滑雪搭子", "人群助力", 0xFFC084FC, "AI发邀约·按滑雪画像"),
        PlanStep("④", "按约定出发滑雪 + 回填体验反馈", "需你到场", 0xFFF97316, "你本人参与"),
    ),
)

val SCENARIOS: Map<Int, WishScenario> = mapOf(
    1 to WishScenario(
        id = 1,
        wishText = "我想开始参加城市夜跑，找到固定搭子一起坚持",
        durationText = "预计 6 天完成",
        planSteps = listOf(
            PlanStep("①", "筛选附近夜跑团 + 锁定合适线路", "线上直出", 0xFF4AADA0, "AI 自动完成"),
            PlanStep("②", "同步集合时间 + 装备建议", "资源助力", 0xFFF5C842, "平台资源助力"),
            PlanStep("③", "匹配稳定出勤的跑步搭子", "人群助力", 0xFFC084FC, "AI发邀约·按节奏画像"),
            PlanStep("④", "首跑打卡 + 反馈跑后感受", "需你到场", 0xFFF97316, "你本人参与"),
        ),
    ),
    2 to DEFAULT_SCENARIO,
    3 to WishScenario(
        id = 3,
        wishText = "我想组织一次周末露营，把报名和物资都安排明白",
        durationText = "预计 4 天完成",
        planSteps = listOf(
            PlanStep("①", "筛选营地 + 核对天气窗口", "线上直出", 0xFF4AADA0, "AI 自动完成"),
            PlanStep("②", "整理报名名单 + 分配物资", "资源助力", 0xFFF5C842, "平台资源助力"),
            PlanStep("③", "匹配有经验露营伙伴协助带队", "人群助力", 0xFFC084FC, "AI发邀约·按经验画像"),
            PlanStep("④", "现场搭建 + 完成回收反馈", "需你到场", 0xFFF97316, "你本人参与"),
        ),
    ),
    4 to WishScenario(
        id = 4,
        wishText = "我想找到一家适合一个人安静吃饭的小馆子",
        durationText = "预计 2 天完成",
        planSteps = listOf(
            PlanStep("①", "筛选独处友好餐馆 + 营业时段", "线上直出", 0xFF4AADA0, "AI 自动完成"),
            PlanStep("②", "核对高峰时段与候位情况", "资源助力", 0xFFF5C842, "平台资源助力"),
            PlanStep("③", "补充真实一人食体验反馈", "人群助力", 0xFFC084FC, "AI汇总用户评价"),
            PlanStep("④", "到店体验 + 回填感受", "需你到场", 0xFFF97316, "你本人参与"),
        ),
    ),
    7 to WishScenario(
        id = 7,
        wishText = "我想带爸妈来一次轻松的短途旅行",
        durationText = "预计 10 天完成",
        planSteps = listOf(
            PlanStep("①", "筛选适合爸妈的短途城市和酒店", "线上直出", 0xFF4AADA0, "AI 自动完成"),
            PlanStep("②", "整理高铁时间 + 无障碍动线", "资源助力", 0xFFF5C842, "平台资源助力"),
            PlanStep("③", "补充当地真实踩点建议", "人群助力", 0xFFC084FC, "AI汇总真实经验"),
            PlanStep("④", "按轻松路线出行 + 完成反馈", "需你到场", 0xFFF97316, "你本人参与"),
        ),
    ),
)
