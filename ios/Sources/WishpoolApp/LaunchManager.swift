import SwiftUI

/// 启动状态管理器，控制开屏页面的显示和转场
@MainActor
final class LaunchManager: ObservableObject {
    /// 当前启动阶段
    @Published var currentScreen: LaunchScreen = .splash

    /// 是否显示开屏页面
    var shouldShowSplash: Bool {
        currentScreen == .splash
    }

    /// 完成开屏，转到主界面
    func completeSplash() {
        withAnimation(.easeInOut(duration: 0.5)) {
            currentScreen = .ready
        }
    }

    /// 开始开屏倒计时（2600ms 与 Android/Web 保持一致）
    func startSplashCountdown() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.6) {
            self.completeSplash()
        }
    }
}

/// 启动阶段枚举
enum LaunchScreen {
    case splash  // 开屏页面
    case ready   // 主界面
}