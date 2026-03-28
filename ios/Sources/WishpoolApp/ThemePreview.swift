import SwiftUI
import WishpoolCore

/// 主题预览视图，用于验证主题系统是否正常工作
struct ThemePreview: View {
    @Environment(\.themedPalette) private var palette
    @Environment(\.themeProvider) private var themeProvider

    var body: some View {
        VStack(spacing: 20) {
            // 当前主题信息
            VStack {
                Text(themeProvider.character.emoji)
                    .font(.largeTitle)
                Text(themeProvider.character.name)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(palette.foreground)
                Text(themeProvider.character.description)
                    .font(.caption)
                    .foregroundStyle(palette.mutedForeground)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(palette.card)
                    .stroke(palette.border, lineWidth: 1)
            )

            // 配色预览
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                colorSwatch("Primary", palette.primary)
                colorSwatch("Accent", palette.accent)
                colorSwatch("Card", palette.card)
                colorSwatch("Background", palette.background)
            }

            // 按钮测试
            VStack(spacing: 12) {
                Button("主要按钮") {}
                    .font(.headline)
                    .foregroundStyle(palette.primaryForeground)
                    .padding()
                    .background(palette.primary, in: RoundedRectangle(cornerRadius: 12))

                Button("次要按钮") {}
                    .font(.headline)
                    .foregroundStyle(palette.secondaryForeground)
                    .padding()
                    .background(palette.secondary, in: RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding()
        .background(palette.background)
    }

    private func colorSwatch(_ name: String, _ color: Color) -> some View {
        VStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(height: 40)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(palette.border, lineWidth: 1)
                )

            Text(name)
                .font(.caption2)
                .foregroundStyle(palette.mutedForeground)
        }
    }
}

#Preview("Moon Theme") {
    let themeProvider = ThemeProvider()
    themeProvider.setTheme(.moon)

    return ThemePreview()
        .withThemeProvider(themeProvider)
        .withCurrentTheme()
}

#Preview("Cloud Theme") {
    let themeProvider = ThemeProvider()
    themeProvider.setTheme(.cloud)

    return ThemePreview()
        .withThemeProvider(themeProvider)
        .withCurrentTheme()
}