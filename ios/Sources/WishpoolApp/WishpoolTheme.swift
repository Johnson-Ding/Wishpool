import SwiftUI
import WishpoolCore

/// 旧版调色板，现在基于主题系统实现（保持向后兼容）
enum WishpoolPalette {
    static var background: Color {
        // 默认使用月亮主题，实际使用时应通过 @Environment 获取当前主题
        ThemeColorScheme.moon.background
    }

    static var surface: Color {
        ThemeColorScheme.moon.card
    }

    static var surfaceRaised: Color {
        ThemeColorScheme.moon.secondary
    }

    static var gold: Color {
        ThemeColorScheme.moon.primary
    }

    static var mint: Color {
        ThemeColorScheme.moon.accent
    }

    static var textPrimary: Color {
        ThemeColorScheme.moon.foreground
    }

    static var textSecondary: Color {
        ThemeColorScheme.moon.mutedForeground
    }

    static let danger = Color(red: 239 / 255, green: 68 / 255, blue: 68 / 255)
}

/// 新的主题感知调色板
struct ThemedPalette {
    let colorScheme: ThemeColorScheme

    var background: Color { colorScheme.background }
    var foreground: Color { colorScheme.foreground }
    var card: Color { colorScheme.card }
    var cardForeground: Color { colorScheme.cardForeground }
    var primary: Color { colorScheme.primary }
    var primaryForeground: Color { colorScheme.primaryForeground }
    var secondary: Color { colorScheme.secondary }
    var secondaryForeground: Color { colorScheme.secondaryForeground }
    var accent: Color { colorScheme.accent }
    var accentForeground: Color { colorScheme.accentForeground }
    var muted: Color { colorScheme.muted }
    var mutedForeground: Color { colorScheme.mutedForeground }
    var border: Color { colorScheme.border }
    var ring: Color { colorScheme.ring }
}

/// 环境键，用于在 SwiftUI 中传递主题调色板
private struct ThemedPaletteKey: EnvironmentKey {
    static let defaultValue = ThemedPalette(colorScheme: .moon)
}

extension EnvironmentValues {
    var themedPalette: ThemedPalette {
        get { self[ThemedPaletteKey.self] }
        set { self[ThemedPaletteKey.self] = newValue }
    }
}

struct WishpoolCardModifier: ViewModifier {
    @Environment(\.themedPalette) private var palette

    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(palette.card.opacity(0.92))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .strokeBorder(palette.border)
                    )
            )
    }
}

extension View {
    func wishpoolCardStyle() -> some View {
        modifier(WishpoolCardModifier())
    }

    func hideNavigationBar() -> some View {
        #if os(iOS)
        self.navigationBarHidden(true)
        #else
        self
        #endif
    }

    /// 应用主题到视图
    func withTheme(_ theme: Theme) -> some View {
        environment(\.themedPalette, ThemedPalette(colorScheme: theme.colorScheme))
    }

    /// 应用当前主题提供器的主题
    func withCurrentTheme() -> some View {
        modifier(ThemedViewModifier())
    }
}

/// 主题应用修饰器
private struct ThemedViewModifier: ViewModifier {
    @Environment(\.themeProvider) private var themeProvider

    func body(content: Content) -> some View {
        content
            .environment(\.themedPalette, ThemedPalette(colorScheme: themeProvider.colorScheme))
    }
}

extension ToolbarItemPlacement {
    static var dismissPlacement: ToolbarItemPlacement {
        #if os(iOS)
        .topBarTrailing
        #else
        .automatic
        #endif
    }
}

// MARK: - Animation Helpers

/// 按压缩放反馈 ButtonStyle（模拟 Web Demo 的 whileTap: scale 0.96）
struct ScaleButtonStyle: ButtonStyle {
    var scale: CGFloat = 0.96

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

/// 卡片入场动效：fade + slide-up + scale（模拟 Web Demo 的 cardReveal）
struct StaggeredEntranceModifier: ViewModifier {
    let delay: Double
    @State private var appeared = false

    init(index: Int) {
        self.delay = Double(index) * 0.08
    }

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 20)
            .scaleEffect(appeared ? 1 : 0.97)
            .animation(
                .spring(response: 0.45, dampingFraction: 0.78).delay(delay),
                value: appeared
            )
            .onAppear { appeared = true }
    }
}

/// 中央按钮脉冲光环（模拟 Web Demo 的 moonPulse）
struct PulseRingModifier: ViewModifier {
    @Environment(\.themedPalette) private var palette
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .overlay(
                Circle()
                    .stroke(palette.primary.opacity(isPulsing ? 0 : 0.35), lineWidth: 2)
                    .scaleEffect(isPulsing ? 1.6 : 1.0)
            )
            .onAppear {
                withAnimation(.easeOut(duration: 2.0).repeatForever(autoreverses: false)) {
                    isPulsing = true
                }
            }
    }
}

extension View {
    func staggeredEntrance(index: Int) -> some View {
        modifier(StaggeredEntranceModifier(index: index))
    }

    func pulseRing() -> some View {
        modifier(PulseRingModifier())
    }
}

// MARK: - Decorative Views

/// 星空点缀背景（模拟 Web Demo 的 StarField）
struct StarFieldView: View {
    let seed: Int
    let count: Int

    init(seed: Int = 0, count: Int = 12) {
        self.seed = seed
        self.count = count
    }

    var body: some View {
        GeometryReader { geo in
            ForEach(0..<count, id: \.self) { i in
                Circle()
                    .fill(Color.white.opacity(0.15 + frac(seed: seed &+ i &+ 2997) * 0.3))
                    .frame(
                        width: 1.0 + frac(seed: seed &+ i &+ 1998) * 2.0,
                        height: 1.0 + frac(seed: seed &+ i &+ 1998) * 2.0
                    )
                    .position(
                        x: frac(seed: seed &+ i) * geo.size.width,
                        y: frac(seed: seed &+ i &+ 999) * geo.size.height
                    )
            }
        }
        .allowsHitTesting(false)
    }

    private func frac(seed: Int) -> CGFloat {
        let hash = UInt(bitPattern: seed &* 2654435761)
        return CGFloat(hash % 10000) / 10000.0
    }
}

/// 主题感知加载动画
struct WishpoolLoadingView: View {
    let message: String
    @Environment(\.themedPalette) private var palette
    @Environment(\.themeProvider) private var themeProvider
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(palette.primary.opacity(0.12))
                    .frame(width: 64, height: 64)
                    .scaleEffect(isAnimating ? 1.25 : 0.85)

                Circle()
                    .fill(palette.primary.opacity(0.25))
                    .frame(width: 36, height: 36)
                    .scaleEffect(isAnimating ? 0.85 : 1.15)

                // 根据主题显示不同图标
                Image(systemName: iconName)
                    .font(.system(size: 18))
                    .foregroundStyle(palette.primary)
            }

            Text(message)
                .font(.subheadline)
                .foregroundStyle(palette.mutedForeground)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                isAnimating = true
            }
        }
    }

    private var iconName: String {
        switch themeProvider.currentTheme {
        case .moon:
            return "moon.stars.fill"
        case .cloud:
            return "cloud.fill"
        case .star:
            return "sparkles"
        }
    }
}
