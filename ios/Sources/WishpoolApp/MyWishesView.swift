import SwiftUI
import WishpoolCore

struct MyWishesView: View {
    let state: Loadable<[WishTask]>
    let onOpenWish: @Sendable (WishTask) async -> Void

    @Environment(\.themedPalette) private var palette
    @State private var showThemeSelector = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                // 标题栏与设置按钮
                HStack {
                    Text("我的心愿")
                        .font(.system(size: 30, weight: .bold, design: .serif))
                        .foregroundStyle(palette.foreground)

                    Spacer()

                    Button {
                        showThemeSelector = true
                    } label: {
                        Image(systemName: "paintpalette.fill")
                            .font(.title2)
                            .foregroundStyle(palette.primary)
                    }
                    .buttonStyle(ScaleButtonStyle())
                }
                .staggeredEntrance(index: 0)

                switch state {
                case .idle, .loading:
                    WishpoolLoadingView(message: "正在同步你的愿望")
                        .frame(maxWidth: .infinity)
                case let .failed(message):
                    Text(message)
                        .foregroundStyle(palette.mutedForeground)
                        .wishpoolCardStyle()
                case let .loaded(wishes):
                    ForEach(WishSectionBuilder.build(from: wishes), id: \.title) { section in
                        VStack(alignment: .leading, spacing: 12) {
                            Text(section.title)
                                .font(.headline)
                                .foregroundStyle(section.title == "待决策" ? palette.primary : palette.mutedForeground)

                            ForEach(section.items) { wish in
                                let index = section.items.firstIndex(where: { $0.id == wish.id }) ?? 0
                                Button {
                                    Task { await onOpenWish(wish) }
                                } label: {
                                    VStack(alignment: .leading, spacing: 10) {
                                        HStack {
                                            Text(wish.title)
                                                .font(.headline)
                                                .foregroundStyle(palette.foreground)
                                            Spacer()
                                            Text(statusLabel(for: wish.status))
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(palette.primary)
                                        }
                                        Text(wish.aiPlan.summary)
                                            .foregroundStyle(palette.mutedForeground)
                                            .multilineTextAlignment(.leading)
                                        Text(wish.updatedAt)
                                            .font(.caption)
                                            .foregroundStyle(palette.mutedForeground.opacity(0.7))
                                    }
                                    .wishpoolCardStyle()
                                }
                                .buttonStyle(ScaleButtonStyle())
                                .staggeredEntrance(index: index + 1)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 24)
        }
        .background(palette.background)
        .hideNavigationBar()
        .sheet(isPresented: $showThemeSelector) {
            ThemeSelector(isPresented: $showThemeSelector)
        }
    }

    private func statusLabel(for status: WishExecutionStatus) -> String {
        switch status {
        case .clarifying:
            return "需补充信息"
        case .planning:
            return "方案待确认"
        case .validating:
            return "校验中"
        case .locking:
            return "锁定中"
        case .ready:
            return "可出发"
        case .inProgress:
            return "进行中"
        case .completed:
            return "已完成"
        case .failed:
            return "失败"
        case .cancelled:
            return "已取消"
        case .draft:
            return "草稿"
        }
    }
}
