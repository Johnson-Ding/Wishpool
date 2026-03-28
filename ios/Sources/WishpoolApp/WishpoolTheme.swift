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
