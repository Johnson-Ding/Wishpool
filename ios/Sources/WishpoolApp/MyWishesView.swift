import SwiftUI
import WishpoolCore

struct MyWishesView: View {
    let state: Loadable<[WishTask]>
    let onOpenWish: @Sendable (WishTask) async -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("我的心愿")
                    .font(.system(size: 30, weight: .bold, design: .serif))
                    .foregroundStyle(WishpoolPalette.textPrimary)

                switch state {
                case .idle, .loading:
                    ProgressView("正在同步你的愿望")
                        .tint(WishpoolPalette.gold)
                case let .failed(message):
                    Text(message)
                        .foregroundStyle(WishpoolPalette.textSecondary)
                        .wishpoolCardStyle()
                case let .loaded(wishes):
                    ForEach(WishSectionBuilder.build(from: wishes), id: \.title) { section in
                        VStack(alignment: .leading, spacing: 12) {
                            Text(section.title)
                                .font(.headline)
                                .foregroundStyle(section.title == "待决策" ? WishpoolPalette.gold : WishpoolPalette.textSecondary)

                            ForEach(section.items) { wish in
                                Button {
                                    Task { await onOpenWish(wish) }
                                } label: {
                                    VStack(alignment: .leading, spacing: 10) {
                                        HStack {
                                            Text(wish.title)
                                                .font(.headline)
                                                .foregroundStyle(WishpoolPalette.textPrimary)
                                            Spacer()
                                            Text(statusLabel(for: wish.status))
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(WishpoolPalette.gold)
                                        }
                                        Text(wish.aiPlan.summary)
                                            .foregroundStyle(WishpoolPalette.textSecondary)
                                            .multilineTextAlignment(.leading)
                                        Text(wish.updatedAt)
                                            .font(.caption)
                                            .foregroundStyle(WishpoolPalette.textSecondary.opacity(0.7))
                                    }
                                    .wishpoolCardStyle()
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 24)
        }
        .background(WishpoolPalette.background)
        .hideNavigationBar()
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
