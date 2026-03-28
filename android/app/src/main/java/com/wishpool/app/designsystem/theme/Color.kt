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

fun tagColor(tag: String): Color = when {
    tag.contains("梦想") -> TagDream
    tag.contains("治愈") -> TagHealing
    tag.contains("成长") -> TagGrowth
    tag.contains("冒险") -> TagAdventure
    tag.contains("日常") -> TagDaily
    else -> MoonGold
}
