import SwiftUI
import WishpoolCore

/// 公开的根视图入口，供 Xcode 项目的 ContentView 使用
public struct WishpoolRootView: View {
    @State private var model = WishpoolAppModel(repository: WishpoolBootstrap.makeRepository())
    @State private var themeProvider = ThemeProvider()
    @State private var launchManager = LaunchManager()

    public init() {}

    public var body: some View {
        Group {
            if launchManager.shouldShowSplash {
                SafeSplashView(launchManager: launchManager)
                    .transition(.opacity)
            } else {
                WishpoolAppRootView(model: model)
                    .transition(.opacity)
                    .task {
                        await model.bootstrap()
                    }
            }
        }
        .withThemeProvider(themeProvider)
        .withCurrentTheme()
        .preferredColorScheme(colorScheme)
    }

    private var colorScheme: ColorScheme? {
        switch themeProvider.currentTheme {
        case .moon, .star:
            return .dark
        case .cloud:
            return .light
        }
    }
}
