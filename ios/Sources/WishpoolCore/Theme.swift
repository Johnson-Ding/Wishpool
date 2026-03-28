import SwiftUI
import Foundation

// MARK: - Theme Definition

/// 三角色主题枚举
public enum Theme: String, CaseIterable, Identifiable {
    case moon = "moon"
    case cloud = "cloud"
    case star = "star"

    public var id: String { rawValue }

    /// 角色信息
    public var character: ThemeCharacter {
        switch self {
        case .moon:
            return ThemeCharacter(
                emoji: "🌙",
                name: "眠眠月",
                description: "深夜水墨 · 月光容器"
            )
        case .cloud:
            return ThemeCharacter(
                emoji: "☁️",
                name: "朵朵云",
                description: "晨曦白昼 · 植绒呼吸"
            )
        case .star:
            return ThemeCharacter(
                emoji: "🌱",
                name: "芽芽星",
                description: "深空极光 · 荧光果冻"
            )
        }
    }

    /// 获取主题配色
    public var colorScheme: ThemeColorScheme {
        switch self {
        case .moon:
            return .moon
        case .cloud:
            return .cloud
        case .star:
            return .star
        }
    }

    /// 主题是否可用
    public var isAvailable: Bool {
        switch self {
        case .moon, .cloud:
            return true
        case .star:
            return false // 即将上线
        }
    }
}

// MARK: - Theme Character

public struct ThemeCharacter {
    public let emoji: String
    public let name: String
    public let description: String
}

// MARK: - Theme Color Scheme

public struct ThemeColorScheme {
    public let background: Color
    public let foreground: Color
    public let card: Color
    public let cardForeground: Color
    public let primary: Color
    public let primaryForeground: Color
    public let secondary: Color
    public let secondaryForeground: Color
    public let accent: Color
    public let accentForeground: Color
    public let muted: Color
    public let mutedForeground: Color
    public let border: Color
    public let ring: Color
    public let fontFamily: String

    /// 月亮主题配色（基于 Web 端 Moon 主题）
    public static let moon = ThemeColorScheme(
        background: Color(red: 10/255, green: 14/255, blue: 26/255),        // #0A0E1A
        foreground: Color.white,
        card: Color(red: 19/255, green: 27/255, blue: 46/255),              // #131B2E
        cardForeground: Color.white,
        primary: Color(red: 245/255, green: 200/255, blue: 66/255),         // #F5C842 月光金
        primaryForeground: Color(red: 10/255, green: 14/255, blue: 26/255),
        secondary: Color(red: 28/255, green: 36/255, blue: 58/255),         // #1C243A
        secondaryForeground: Color.white.opacity(0.75),
        accent: Color(red: 74/255, green: 173/255, blue: 160/255),          // #4AADA0 月光青
        accentForeground: Color.white,
        muted: Color(red: 28/255, green: 36/255, blue: 58/255),
        mutedForeground: Color.white.opacity(0.55),
        border: Color.white.opacity(0.08),
        ring: Color(red: 245/255, green: 200/255, blue: 66/255).opacity(0.5),
        fontFamily: "Noto Serif SC"
    )

    /// 朵朵云主题配色（基于 Web 端 Cloud 主题）
    public static let cloud = ThemeColorScheme(
        background: Color(red: 240/255, green: 249/255, blue: 255/255),     // #F0F9FF 晨曦白
        foreground: Color(red: 31/255, green: 41/255, blue: 61/255),        // #1F2937 深灰文字
        card: Color.white.opacity(0.95),                                     // 近实心白卡片
        cardForeground: Color(red: 31/255, green: 41/255, blue: 61/255),
        primary: Color(red: 249/255, green: 112/255, blue: 102/255),        // #F97066 桃粉
        primaryForeground: Color.white,
        secondary: Color(red: 245/255, green: 247/255, blue: 250/255),      // #F5F7FA
        secondaryForeground: Color(red: 75/255, green: 85/255, blue: 99/255),
        accent: Color(red: 96/255, green: 165/255, blue: 250/255),          // #60A5FA 天蓝
        accentForeground: Color(red: 31/255, green: 41/255, blue: 61/255),
        muted: Color(red: 239/255, green: 242/255, blue: 246/255),          // #EFF2F6
        mutedForeground: Color(red: 107/255, green: 114/255, blue: 128/255),
        border: Color.black.opacity(0.06),
        ring: Color(red: 249/255, green: 112/255, blue: 102/255).opacity(0.3),
        fontFamily: "Fraunces"
    )

    /// 芽芽星主题配色（基于 Web 端 Star 主题）
    public static let star = ThemeColorScheme(
        background: Color(red: 26/255, green: 15/255, blue: 46/255),        // #1A0F2E 太空深紫
        foreground: Color(red: 250/255, green: 251/255, blue: 252/255),
        card: Color(red: 38/255, green: 20/255, blue: 74/255).opacity(0.65), // #26144A 半透明
        cardForeground: Color(red: 250/255, green: 251/255, blue: 252/255),
        primary: Color(red: 74/255, green: 222/255, blue: 128/255),         // #4ADE80 霓虹薄荷
        primaryForeground: Color(red: 26/255, green: 15/255, blue: 46/255),
        secondary: Color(red: 51/255, green: 20/255, blue: 74/255),         // #33144A
        secondaryForeground: Color(red: 216/255, green: 222/255, blue: 233/255),
        accent: Color(red: 34/255, green: 211/255, blue: 238/255),          // #22D3EE 亮青
        accentForeground: Color(red: 26/255, green: 15/255, blue: 46/255),
        muted: Color(red: 46/255, green: 15/255, blue: 74/255),
        mutedForeground: Color(red: 165/255, green: 132/255, blue: 183/255),
        border: Color.white.opacity(0.2),
        ring: Color(red: 74/255, green: 222/255, blue: 128/255).opacity(0.6),
        fontFamily: "Outfit"
    )
}