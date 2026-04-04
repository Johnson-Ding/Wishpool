package com.wishpool.app.feature.wishchat

/**
 * 场景匹配器 - 基于 demo 的 scenario-matcher.ts
 */
object ScenarioMatcher {

    private val SCENARIO_KEYWORDS = listOf(
        ScenarioKeyword(2, listOf("滑雪", "雪", "崇礼", "雪场", "单板", "双板")),
        ScenarioKeyword(4, listOf("火锅", "吃饭", "一个人吃", "一人食", "小馆子", "餐馆", "餐厅", "探店")),
        ScenarioKeyword(1, listOf("夜跑", "跑步", "跑团", "慢跑", "运动")),
        ScenarioKeyword(3, listOf("露营", "营地", "天幕", "野餐", "户外")),
        ScenarioKeyword(8, listOf("我姐", "和我姐", "拉我姐", "拉姐姐", "姐姐一起", "哥哥一起", "弟弟一起", "妹妹一起", "照顾爸妈", "陪爸妈")),
        ScenarioKeyword(7, listOf("爸妈", "父母", "家庭旅行", "短途旅行", "带家人", "旅行"))
    )

    private const val FALLBACK_SCENARIO_ID = 2

    data class ScenarioKeyword(
        val scenarioId: Int,
        val keywords: List<String>
    )

    data class MatchResult(
        val scenarioId: Int,
        val needsClarification: Boolean
    )

    /**
     * 根据用户输入匹配场景
     */
    fun matchScenarioByWishInput(wishInput: String): MatchResult {
        val normalizedInput = wishInput.trim().lowercase()

        if (normalizedInput.isEmpty()) {
            return MatchResult(FALLBACK_SCENARIO_ID, needsClarification = true)
        }

        val matched = SCENARIO_KEYWORDS.find { scenario ->
            scenario.keywords.any { keyword ->
                normalizedInput.contains(keyword.lowercase())
            }
        }

        return MatchResult(
            scenarioId = matched?.scenarioId ?: FALLBACK_SCENARIO_ID,
            needsClarification = matched == null
        )
    }

    /**
     * 检测是否为许愿内容（包含场景关键词）
     */
    fun isWishContent(input: String): Boolean {
        val normalizedInput = input.trim().lowercase()

        if (normalizedInput.isEmpty()) {
            return false
        }

        return SCENARIO_KEYWORDS.any { scenario ->
            scenario.keywords.any { keyword ->
                normalizedInput.contains(keyword.lowercase())
            }
        }
    }

    /**
     * 检测是否为碎碎念内容（非许愿内容）
     */
    fun isCasualContent(input: String): Boolean {
        return !isWishContent(input) && input.trim().isNotEmpty()
    }
}
