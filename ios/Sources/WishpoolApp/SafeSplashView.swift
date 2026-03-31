import SwiftUI
import WishpoolCore

/// 安全版开屏页面 - 2.6s 自动转场到主界面，完整动画效果 + 安全图片加载
struct SafeSplashView: View {
    let launchManager: LaunchManager

    @Environment(\.themeProvider) private var themeProvider
    @Environment(\.themedPalette) private var palette

    @State private var isVisible = false
    @State private var avatarScale: CGFloat = 0.7
    @State private var avatarPulseScale: CGFloat = 1.0
    @State private var avatarPulseOpacity: CGFloat = 0.3
    @State private var floatOffset: CGFloat = 0

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // 1. 背景图片层 - 使用安全加载
                backgroundImageView(in: geometry)

                // 2. 渐变叠加层（参考 demo 实现）
                backgroundGradientView

                // 3. 主题动画效果层
                themeEffectsView

                // 4. 内容层
                contentView
            }
            .frame(
                width: geometry.size.width,
                height: geometry.size.height
            )
            .ignoresSafeArea()
            .onAppear {
                startAnimations()
                launchManager.startSplashCountdown()

                // 调试：检查图片资源
                #if DEBUG
                let theme = themeProvider.currentTheme
                print("当前主题: \(theme.rawValue)")
                let _ = SafeImage.checkImageResource(theme.character.backgroundImageName)
                let _ = SafeImage.checkImageResource(theme.character.avatarImageName)
                #endif
            }
        }
    }

    // MARK: - Background Layers

    private func backgroundImageView(in geometry: GeometryProxy) -> some View {
        let frame = SplashBackgroundLayout.containerFrame(for: geometry.size)

        return SafeImage(
            themeProvider.currentTheme.character.backgroundImageName,
            fallback: "photo.fill"
        )
        .aspectRatio(contentMode: .fill)
        .frame(width: frame.width, height: frame.height)
        .clipped()
        .opacity(themeProvider.currentTheme == .moon ? 0.55 : 0.7)
    }

    private var backgroundGradientView: some View {
        LinearGradient(
            colors: [
                palette.background.opacity(0.3),
                palette.background.opacity(0.85)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var themeEffectsView: some View {
        ZStack {
            switch themeProvider.currentTheme {
            case .moon:
                StarFieldView(seed: 42, count: 28)

                // 径向光晕（参考 Android RadialGlow）
                RadialGradient(
                    colors: [
                        palette.primary.opacity(0.08),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 50,
                    endRadius: 400
                )

            case .cloud:
                CloudFieldView()

                // 云朵主题柔和渐变
                LinearGradient(
                    colors: [
                        Color.clear,
                        palette.background.opacity(0.2)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

            case .star:
                // Star 主题：更炫酷的星空效果
                StarFieldView(seed: 123, count: 45)

                // 极光光晕效果
                RadialGradient(
                    colors: [
                        palette.accent.opacity(0.15),
                        palette.primary.opacity(0.08),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 80,
                    endRadius: 500
                )
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Content Layer

    private var contentView: some View {
        VStack(spacing: 28) {
            Spacer()

            // 头像容器（带脉冲光晕动画）
            avatarView

            // 标题文案（错差入场动画）
            titleView
                .staggeredEntrance(index: 0)

            // 副文案（错差入场动画）
            subtitleView
                .staggeredEntrance(index: 1)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .scaleEffect(avatarScale) // 整体入场缩放
        .animation(.spring(response: 0.75, dampingFraction: 0.75), value: avatarScale)
    }

    private var avatarView: some View {
        ZStack {
            // 外层脉冲光环（参考 Android 的 pulse glow）
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            palette.primary.opacity(0.3 * avatarPulseOpacity),
                            palette.primary.opacity(0.0)
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 60
                    )
                )
                .frame(width: 120, height: 120)
                .scaleEffect(avatarPulseScale)

            // 头像主体 - 使用安全加载
            avatarImageView
        }
        .offset(y: floatOffset) // 浮动动画
    }

    private var avatarImageView: some View {
        SafeImage(
            themeProvider.currentTheme.character.avatarImageName,
            fallback: "person.circle.fill"
        )
        .aspectRatio(contentMode: .fill)
        .frame(width: 88, height: 88)
        .clipShape(Circle())
        .overlay(
            Circle()
                .stroke(
                    LinearGradient(
                        colors: [
                            palette.primary.opacity(0.6),
                            palette.primary.opacity(0.3)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1.5
                )
        )
    }

    private var titleView: some View {
        Text("许愿池")
            .font(.largeTitle)
            .fontWeight(.bold)
            .foregroundStyle(
                LinearGradient(
                    colors: [palette.primary, palette.foreground, palette.primary],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
    }

    private var subtitleView: some View {
        Text("AI 帮你实现心愿，不只是建议")
            .font(.body)
            .foregroundStyle(palette.mutedForeground)
            .multilineTextAlignment(.center)
    }

    // MARK: - Animation Control

    private func startAnimations() {
        // 入场动画
        withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
            isVisible = true
            avatarScale = 1.0
        }

        // 脉冲动画（3s 周期，参考 demo moonPulse）
        withAnimation(
            .easeInOut(duration: 1.5)
            .repeatForever(autoreverses: true)
        ) {
            avatarPulseScale = 1.15
            avatarPulseOpacity = 0.6
        }

        // 浮动动画（4s 周期，参考 demo float）
        withAnimation(
            .easeInOut(duration: 2.0)
            .repeatForever(autoreverses: true)
        ) {
            floatOffset = -6
        }
    }
}
