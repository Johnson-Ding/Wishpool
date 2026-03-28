import SwiftUI
import WishpoolCore

@main
struct WishpoolApp: App {
    @State private var model = WishpoolAppModel(repository: WishpoolBootstrap.makeRepository())
    @State private var themeProvider = ThemeProvider()

    var body: some Scene {
        WindowGroup {
            WishpoolAppRootView(model: model)
                .withThemeProvider(themeProvider)
                .withCurrentTheme()
                .preferredColorScheme(colorScheme)
                .task {
                    await model.bootstrap()
                }
        }
    }

    /// 根据当前主题决定系统配色方案
    private var colorScheme: ColorScheme? {
        switch themeProvider.currentTheme {
        case .moon, .star:
            return .dark
        case .cloud:
            return .light
        }
    }
}
