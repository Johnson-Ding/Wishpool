package com.wishpool.app.designsystem.theme

import androidx.compose.ui.graphics.Color

// ── Moon Theme — 深夜水墨·月光容器 ──────────────────────────
val MoonBackground      = Color(0xFF0A0E1A)   // 深靛蓝黑
val MoonForeground      = Color(0xFFEBE6DF)   // 月光暖白
val MoonGold            = Color(0xFFF5C842)   // 月光金 (primary)
val MoonGoldDim         = Color(0xFFD4A835)   // 暗金 (gradient end)
val MoonTeal            = Color(0xFF4AADA0)   // 月光青 (accent)
val MoonCard            = Color(0xFF141A2E)   // 卡片底色
val MoonSurfaceVariant  = Color(0xFF1C2338)   // 浅深蓝
val MoonMuted           = Color(0xFF1A1F33)   // 静默区域
val MoonMutedForeground = Color(0xFF8B8680)   // 弱化文字
val MoonBorder          = Color(0x14FFFFFF)   // 白 8%

// ── Feed 标签色 ─────────────────────────────────────────────
val TagDream     = Color(0xFFFBBF24)   // 梦想 — 金
val TagHealing   = Color(0xFFA78BFA)   // 治愈 — 紫
val TagGrowth    = Color(0xFF4ADE80)   // 成长 — 绿
val TagAdventure = Color(0xFFF97316)   // 冒险 — 橙
val TagDaily     = Color(0xFF60A5FA)   // 日常 — 蓝

val TagPurple   = Color(0xFFA78BFA)   // 碎碎念/小诗
val TagYellow   = Color(0xFFFACC15)   // 好消息
val TagOrange   = Color(0xFFFB923C)   // 本地推荐
val TagGreen    = Color(0xFF4ADE80)   // 全球好消息
val TagEmerald  = Color(0xFF34D399)   // 家庭时光
val TagAmber    = Color(0xFFFBBF24)   // 金句
val TagLilac    = Color(0xFFC084FC)   // 小诗

fun tagColor(tag: String): Color = when {
    tag.contains("活动") || tag.contains("夜跑") -> MoonTeal
    tag.contains("碎碎念") -> TagPurple
    tag.contains("好消息") && !tag.contains("全球") -> TagYellow
    tag.contains("推荐") || tag.contains("探店") -> TagOrange
    tag.contains("全球") -> TagGreen
    tag.contains("小诗") -> TagLilac
    tag.contains("家庭") || tag.contains("旅行") -> TagEmerald
    tag.contains("金句") -> TagAmber
    tag.contains("梦想") -> TagDream
    tag.contains("治愈") -> TagHealing
    tag.contains("成长") -> TagGrowth
    tag.contains("冒险") -> TagAdventure
    tag.contains("日常") -> TagDaily
    else -> MoonTeal
}

fun typeLabel(type: String): String = when (type) {
    "story" -> "愿望故事"
    "mumble" -> "碎碎念"
    "news" -> "好消息"
    "rec" -> "探店推荐"
    "goodnews" -> "全球好消息"
    "poem" -> "小诗"
    "quote" -> "金句"
    else -> ""
}

// ── Cloud Theme — 晨风白昼·植绒呼吸 ──────────────────────────
val CloudBackground      = Color(0xFFF0F9FF)   // 晨曦白 (lch 0.99 0.005 220)
val CloudForeground      = Color(0xFF1F1F23)   // 深蓝灰 (lch 0.12 0.01 240)
val CloudPrimary         = Color(0xFFF97066)   // 浅桃粉 (lch 0.65 0.15 20)
val CloudSecondary       = Color(0xFF60A5FA)   // 天蓝 (lch 0.75 0.1 220)
val CloudCard            = Color(0xFFFFFFFF)   // 纯白 (lch 1 0 0 / 95%)
val CloudSurfaceVariant  = Color(0xFFF1F5F9)   // 浅灰蓝 (lch 0.96 0.01 220)
val CloudMuted           = Color(0xFFF0F0F3)   // 柔雾灰 (lch 0.94 0.01 220)
val CloudMutedForeground = Color(0xFF6B7280)   // 中性灰 (lch 0.45 0.02 240)
val CloudBorder          = Color(0x0F000000)   // 黑 6% (border: oklch(0 0 0 / 6%))
val CloudAccent          = CloudSecondary      // 天蓝作为辅助色
