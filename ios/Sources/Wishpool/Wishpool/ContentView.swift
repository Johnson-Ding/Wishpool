//
//  ContentView.swift
//  Wishpool
//
//  Created by Cookie on 30/3/26.
//

import SwiftUI
import WishpoolCore
import WishpoolApp

struct ContentView: View {
    @State private var model = WishpoolAppModel(repository: WishpoolBootstrap.makeRepository())
    @State private var themeProvider = ThemeProvider()
    @State private var launchManager = LaunchManager()

    var body: some View {
        Group {
            if launchManager.shouldShowSplash {
                SplashView(launchManager: launchManager)
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

#Preview {
    ContentView()
}
