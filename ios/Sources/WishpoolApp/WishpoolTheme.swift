import SwiftUI

enum WishpoolPalette {
    static let background = Color(red: 10 / 255, green: 14 / 255, blue: 26 / 255)
    static let surface = Color(red: 19 / 255, green: 27 / 255, blue: 46 / 255)
    static let surfaceRaised = Color(red: 28 / 255, green: 36 / 255, blue: 58 / 255)
    static let gold = Color(red: 245 / 255, green: 200 / 255, blue: 66 / 255)
    static let mint = Color(red: 74 / 255, green: 173 / 255, blue: 160 / 255)
    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.72)
    static let danger = Color(red: 239 / 255, green: 68 / 255, blue: 68 / 255)
}

struct WishpoolCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(WishpoolPalette.surface.opacity(0.92))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.08))
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
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .overlay(
                Circle()
                    .stroke(WishpoolPalette.gold.opacity(isPulsing ? 0 : 0.35), lineWidth: 2)
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
