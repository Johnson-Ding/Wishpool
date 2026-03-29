import SwiftUI
import Foundation
@preconcurrency import Observation

// MARK: - Theme Provider

/// 主题状态管理器，使用 @Observable 宏实现响应式状态管理
@Observable
public final class ThemeProvider {
    /// 当前选中的主题
    public private(set) var currentTheme: Theme

    /// UserDefaults key
    private static let themeKey = "wishpool_selected_theme"

    /// 初始化，从 UserDefaults 恢复上次选择的主题
    public init() {
        if let savedTheme = UserDefaults.standard.string(forKey: Self.themeKey),
           let theme = Theme(rawValue: savedTheme) {
            self.currentTheme = theme
        } else {
            // 默认使用月亮主题
            self.currentTheme = .moon
        }
    }

    /// 切换到指定主题
    public func setTheme(_ theme: Theme) {
        guard theme.isAvailable else { return }

        currentTheme = theme

        // 持久化到 UserDefaults
        UserDefaults.standard.set(theme.rawValue, forKey: Self.themeKey)
    }

    /// 获取当前主题的配色方案
    public var colorScheme: ThemeColorScheme {
        currentTheme.colorScheme
    }

    /// 获取当前主题的角色信息
    public var character: ThemeCharacter {
        currentTheme.character
    }
}

// MARK: - SwiftUI Environment

/// SwiftUI 环境键
private struct ThemeProviderKey: EnvironmentKey {
    static let defaultValue = ThemeProvider()
}

extension EnvironmentValues {
    /// 在 SwiftUI 中访问主题提供器
    public var themeProvider: ThemeProvider {
        get { self[ThemeProviderKey.self] }
        set { self[ThemeProviderKey.self] = newValue }
    }
}

// MARK: - Convenience Extensions

extension View {
    /// 注入主题提供器到环境
    public func withThemeProvider(_ provider: ThemeProvider) -> some View {
        environment(\.themeProvider, provider)
    }
}