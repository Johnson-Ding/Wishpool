package com.wishpool.app.data.cache

import android.content.Context
import android.content.SharedPreferences
import com.wishpool.app.domain.model.AiPlanStep
import com.wishpool.app.domain.model.DecisionOption
import com.wishpool.app.domain.model.GeneratedPlan
import org.json.JSONArray
import org.json.JSONObject

/**
 * AI 方案本地缓存 — SharedPreferences 实现
 * 缓存 key: ai_plan_{wishId}
 */
class AiPlanCache(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("ai_plan_cache", Context.MODE_PRIVATE)

    fun savePlan(wishId: String, plan: GeneratedPlan) {
        val json = serializePlan(plan)
        prefs.edit().putString("ai_plan_$wishId", json.toString()).apply()
    }

    fun getPlan(wishId: String): GeneratedPlan? {
        val raw = prefs.getString("ai_plan_$wishId", null) ?: return null
        return try {
            deserializePlan(JSONObject(raw))
        } catch (e: Exception) {
            null
        }
    }

    fun clearPlan(wishId: String) {
        prefs.edit().remove("ai_plan_$wishId").apply()
    }

    /**
     * 按心愿文本查找缓存（模糊匹配，用于创建后还没有 wishId 的场景）
     */
    fun findByWishText(wishText: String): GeneratedPlan? {
        val allEntries = prefs.all
        for ((_, value) in allEntries) {
            if (value is String) {
                try {
                    val json = JSONObject(value)
                    if (json.optString("wishText") == wishText) {
                        return deserializePlan(json)
                    }
                } catch (_: Exception) {
                    // skip invalid entries
                }
            }
        }
        return null
    }

    private fun serializePlan(plan: GeneratedPlan): JSONObject {
        return JSONObject().apply {
            put("wishText", plan.wishText)
            put("durationText", plan.durationText)
            put("decisionTitle", plan.decisionTitle)
            put("category", plan.category)
            put("difficulty", plan.difficulty)
            put("estimatedDays", plan.estimatedDays)
            put("decisionOptions", JSONArray().apply {
                plan.decisionOptions.forEach { opt ->
                    put(JSONObject().put("key", opt.key).put("label", opt.label))
                }
            })
            put("planSteps", JSONArray().apply {
                plan.planSteps.forEach { step ->
                    put(JSONObject().apply {
                        put("num", step.num)
                        put("title", step.title)
                        put("type", step.type)
                        put("typeColor", step.typeColor)
                        put("desc", step.desc)
                    })
                }
            })
        }
    }

    private fun deserializePlan(json: JSONObject): GeneratedPlan {
        val options = buildList {
            val arr = json.optJSONArray("decisionOptions")
            if (arr != null) for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                add(DecisionOption(o.getString("key"), o.getString("label")))
            }
        }
        val steps = buildList {
            val arr = json.optJSONArray("planSteps")
            if (arr != null) for (i in 0 until arr.length()) {
                val s = arr.getJSONObject(i)
                add(AiPlanStep(
                    num = s.getString("num"),
                    title = s.getString("title"),
                    type = s.getString("type"),
                    typeColor = s.getString("typeColor"),
                    desc = s.getString("desc"),
                ))
            }
        }
        return GeneratedPlan(
            wishText = json.getString("wishText"),
            durationText = json.getString("durationText"),
            decisionTitle = json.getString("decisionTitle"),
            decisionOptions = options,
            planSteps = steps,
            category = json.getString("category"),
            difficulty = json.getString("difficulty"),
            estimatedDays = json.getInt("estimatedDays"),
        )
    }
}
