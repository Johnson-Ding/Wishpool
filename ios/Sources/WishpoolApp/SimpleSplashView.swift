import SwiftUI
import WishpoolCore

/// 简化版开屏页面 - 无图片资源依赖，用于快速验证
struct SimpleSplashView: View {
    let launchManager: LaunchManager

    @Environment(\.themedPalette) private var palette
    @State private var scale: CGFloat = 0.8
    @State private var opacity: CGFloat = 0

    var body: some View {
        ZStack {
            // 背景颜色（不依赖图片）
            palette.background
                .ignoresSafeArea()

            VStack(spacing: 24) {
                // 简化的图标（使用 SF Symbols）
                ZStack {
                    Circle()
                        .fill(palette.primary.opacity(0.1))
                        .frame(width: 120, height: 120)

                    Image(systemName: "sparkles.square.filled.on.square")
                        .font(.system(size: 40, weight: .light))
                        .foregroundStyle(palette.primary)
                        .scaleEffect(scale)
                }

                VStack(spacing: 8) {
                    Text("许愿池")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(palette.foreground)

                    Text("AI 帮你实现心愿")
                        .font(.body)
                        .foregroundStyle(palette.mutedForeground)
                }
                .opacity(opacity)
            }
        }
        .onAppear {
            // 启动动画
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                scale = 1.0
                opacity = 1.0
            }

            // 开始倒计时
            launchManager.startSplashCountdown()
        }
    }
}
