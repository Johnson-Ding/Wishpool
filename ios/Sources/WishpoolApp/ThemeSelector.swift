import SwiftUI
import WishpoolCore

/// 主题选择器 Sheet
struct ThemeSelector: View {
    @Environment(\.themeProvider) private var themeProvider
    @Environment(\.themedPalette) private var palette
    @Binding var isPresented: Bool

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("选择你的陪伴搭子")
                    .font(.headline)
                    .foregroundStyle(palette.foreground)
                    .padding(.top)

                VStack(spacing: 16) {
                    ForEach(Theme.allCases) { theme in
                        ThemeOptionView(
                            theme: theme,
                            isSelected: themeProvider.currentTheme == theme,
                            onSelect: {
                                themeProvider.setTheme(theme)
                                isPresented = false
                            }
                        )
                    }
                }
                .padding(.horizontal)

                Spacer()
            }
            .background(palette.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("完成") {
                        isPresented = false
                    }
                    .foregroundStyle(palette.primary)
                }
            }
        }
        .withCurrentTheme()
    }
}

/// 单个主题选项视图
struct ThemeOptionView: View {
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
                // 主题预览色块
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(theme.colorScheme.background)
                        .frame(width: 48, height: 48)

                    Text(theme.character.emoji)
                        .font(.title2)

                    if isSelected {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(theme.colorScheme.primary, lineWidth: 2)
                            .frame(width: 48, height: 48)
                    }
                }
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(palette.border, lineWidth: 1)
                        .frame(width: 48, height: 48)
                )

                // 主题信息
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(theme.character.name)
                            .font(.headline)
                            .foregroundStyle(palette.foreground)

                        if isSelected {
                            Text("当前")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(theme.colorScheme.primary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(
                                    theme.colorScheme.primary.opacity(0.2),
                                    in: RoundedRectangle(cornerRadius: 6)
                                )
                        }

                        if !theme.isAvailable {
                            Text("即将上线")
                                .font(.caption.weight(.semibold))
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
                        .font(.caption)
                        .foregroundStyle(palette.mutedForeground)
                }

                Spacer()

                // 配色点
                HStack(spacing: 4) {
                    Circle()
                        .fill(theme.colorScheme.primary)
                        .frame(width: 12, height: 12)

                    Circle()
                        .fill(theme.colorScheme.accent)
                        .frame(width: 12, height: 12)
                }
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(isSelected ? theme.colorScheme.primary.opacity(0.1) : palette.card)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(
                                isSelected ? theme.colorScheme.primary.opacity(0.6) : palette.border,
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
        }
        .disabled(!theme.isAvailable)
        .opacity(theme.isAvailable ? 1.0 : 0.6)
        .buttonStyle(ScaleButtonStyle(scale: 0.98))
    }
}

// MARK: - Preview

#Preview {
    @State var isPresented = true
    let themeProvider = ThemeProvider()

    return Color.clear
        .withThemeProvider(themeProvider)
        .sheet(isPresented: $isPresented) {
            ThemeSelector(isPresented: $isPresented)
        }
}