import SwiftUI
import WishpoolCore

/// 主题选择器 - 精致底部Sheet样式
/// 参考Web端ThemeSelector设计：底部sheet、角色预览、渐变背景
struct ThemeSelector: View {
    @Environment(\.themeProvider) private var themeProvider
    @Environment(\.themedPalette) private var palette
    @Binding var isPresented: Bool

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 顶部把手
                handleBar
                    .padding(.top, 12)
                    .padding(.bottom, 20)

                // 标题
                Text("选择你的陪伴搭子")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(palette.foreground)
                    .padding(.bottom, 20)

                // 主题选项列表
                VStack(spacing: 12) {
                    ForEach(Theme.allCases) { theme in
                        ThemeOptionCard(
                            theme: theme,
                            isSelected: themeProvider.currentTheme == theme,
                            onSelect: {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                    themeProvider.setTheme(theme)
                                    isPresented = false
                                }
                            }
                        )
                    }
                }
                .padding(.horizontal, 20)

                Spacer()
            }
            .background(
                // 使用当前主题的背景色
                palette.background
                    .ignoresSafeArea()
            )
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .topBarTrailing) {
                    Button("完成") {
                        isPresented = false
                    }
                    .foregroundStyle(palette.primary)
                    .font(.system(size: 17, weight: .semibold))
                }
                #else
                ToolbarItem(placement: .automatic) {
                    Button("完成") {
                        isPresented = false
                    }
                    .foregroundStyle(palette.primary)
                }
                #endif
            }
        }
    }

    private var handleBar: some View {
        RoundedRectangle(cornerRadius: 2.5)
            .fill(palette.border)
            .frame(width: 40, height: 5)
    }
}

/// 主题选项卡片 - 带角色预览和渐变背景
private struct ThemeOptionCard: View {
    let theme: Theme
    let isSelected: Bool
    let onSelect: () -> Void

    @Environment(\.themedPalette) private var palette

    var body: some View {
        Button(action: {
            if theme.isAvailable {
                onSelect()
            }
        }) {
            HStack(spacing: 14) {
                // 角色预览区 - 带渐变背景
                characterPreview

                // 角色信息
                characterInfo

                Spacer()

                // 配色指示点
                colorDots
            }
            .padding(14)
            .background(cardBackground)
        }
        .disabled(!theme.isAvailable)
        .opacity(theme.isAvailable ? 1.0 : 0.5)
        .buttonStyle(ScaleButtonStyle(scale: 0.97))
    }

    /// 角色预览 - 使用实际图片或emoji+渐变背景
    private var characterPreview: some View {
        ZStack {
            // 渐变背景
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            theme.colorScheme.background,
                            theme.colorScheme.background.opacity(0.8)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 52, height: 52)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(theme.colorScheme.border, lineWidth: 1)
                )

            // 角色头像图片（iOS平台且有图片时）或emoji
            #if os(iOS)
            if let uiImage = UIImage(named: theme.character.avatarImageName) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 36, height: 36)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                Text(theme.character.emoji)
                    .font(.system(size: 28))
            }
            #else
            Text(theme.character.emoji)
                .font(.system(size: 28))
            #endif

            // 选中状态边框
            if isSelected {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(theme.colorScheme.primary, lineWidth: 2.5)
                    .frame(width: 52, height: 52)
                    .shadow(
                        color: theme.colorScheme.primary.opacity(0.4),
                        radius: 8,
                        x: 0,
                        y: 0
                    )
            }
        }
    }

    /// 角色信息
    private var characterInfo: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 8) {
                Text(theme.character.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(palette.foreground)

                if isSelected {
                    Text("当前")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(theme.colorScheme.primary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(
                            theme.colorScheme.primary.opacity(0.15),
                            in: RoundedRectangle(cornerRadius: 6)
                        )
                }

                if !theme.isAvailable {
                    Text("即将上线")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(palette.mutedForeground)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(
                            palette.muted,
                            in: RoundedRectangle(cornerRadius: 6)
                        )
                }
            }

            Text(theme.character.description)
                .font(.system(size: 13))
                .foregroundStyle(palette.mutedForeground)
        }
    }

    /// 配色指示点
    private var colorDots: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(theme.colorScheme.primary)
                .frame(width: 12, height: 12)
                .shadow(
                    color: theme.colorScheme.primary.opacity(0.3),
                    radius: 3,
                    x: 0,
                    y: 1
                )

            Circle()
                .fill(theme.colorScheme.accent)
                .frame(width: 12, height: 12)
                .shadow(
                    color: theme.colorScheme.accent.opacity(0.3),
                    radius: 3,
                    x: 0,
                    y: 1
                )
        }
    }

    /// 卡片背景 - 选中时带渐变
    private var cardBackground: some View {
        Group {
            if isSelected {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                theme.colorScheme.primary.opacity(0.12),
                                theme.colorScheme.accent.opacity(0.08)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(
                                theme.colorScheme.primary.opacity(0.5),
                                lineWidth: 1.5
                            )
                    )
            } else {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(palette.card)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(palette.border, lineWidth: 1)
                    )
            }
        }
    }
}

// MARK: - Preview
#if DEBUG
struct ThemeSelector_Previews: PreviewProvider {
    static var previews: some View {
        @State var isPresented = true
        let themeProvider = ThemeProvider()

        ThemeSelector(isPresented: $isPresented)
            .withThemeProvider(themeProvider)
    }
}
#endif
