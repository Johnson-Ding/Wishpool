import SwiftUI
import WishpoolCore

struct WishDetailView: View {
    let wish: WishTask?
    let roundsState: Loadable<[ValidationRound]>
    let onClarify: @Sendable (String, String, String, String) async -> Void
    let onConfirm: @Sendable () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var intent = ""
    @State private var city = ""
    @State private var budget = ""
    @State private var timeWindow = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                if let wish {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text(wish.title)
                                .font(.system(size: 30, weight: .bold, design: .serif))
                                .foregroundStyle(WishpoolPalette.textPrimary)
                            Text(wish.aiPlan.summary)
                                .foregroundStyle(WishpoolPalette.textSecondary)
                        }
                        .wishpoolCardStyle()
                        .staggeredEntrance(index: 0)

                        VStack(alignment: .leading, spacing: 12) {
                            infoRow("当前状态", value: statusLabel(for: wish.status))
                            infoRow("城市", value: wish.city ?? "待补充")
                            infoRow("预算", value: wish.budget ?? "待补充")
                            infoRow("时间窗口", value: wish.timeWindow ?? "待补充")
                        }
                        .wishpoolCardStyle()
                        .staggeredEntrance(index: 1)

                        if wish.status == .clarifying || wish.status == .planning {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("继续澄清")
                                    .font(.headline)
                                    .foregroundStyle(WishpoolPalette.textPrimary)
                                detailField("愿望描述", text: $intent)
                                detailField("城市", text: $city)
                                detailField("预算", text: $budget)
                                detailField("时间窗口", text: $timeWindow)
                                Button("保存澄清信息") {
                                    Task { await onClarify(intent, city, budget, timeWindow) }
                                }
                                .buttonStyle(ScaleButtonStyle())
                                .font(.headline)
                                .foregroundStyle(WishpoolPalette.background)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Capsule().fill(WishpoolPalette.mint))

                                if wish.status == .planning {
                                    Button("确认方案，进入 ready") {
                                        Task { await onConfirm() }
                                    }
                                    .buttonStyle(ScaleButtonStyle())
                                    .font(.headline)
                                    .foregroundStyle(WishpoolPalette.background)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(Capsule().fill(WishpoolPalette.gold))
                                }
                            }
                            .wishpoolCardStyle()
                            .staggeredEntrance(index: 2)
                            .onAppear {
                                intent = wish.intent
                                city = wish.city ?? ""
                                budget = wish.budget ?? ""
                                timeWindow = wish.timeWindow ?? ""
                            }
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            Text("推进轮次")
                                .font(.headline)
                                .foregroundStyle(WishpoolPalette.textPrimary)

                            switch roundsState {
                            case .idle, .loading:
                                WishpoolLoadingView(message: "正在读取轮次")
                                    .frame(maxWidth: .infinity)
                            case let .failed(message):
                                Text(message)
                                    .foregroundStyle(WishpoolPalette.textSecondary)
                            case let .loaded(rounds):
                                if rounds.isEmpty {
                                    Text("当前还没有轮次记录，适合先补充约束。")
                                        .foregroundStyle(WishpoolPalette.textSecondary)
                                } else {
                                    ForEach(rounds) { round in
                                        VStack(alignment: .leading, spacing: 8) {
                                            Text("Round \(round.roundNumber)")
                                                .font(.subheadline.weight(.semibold))
                                                .foregroundStyle(WishpoolPalette.gold)
                                            Text(round.summary)
                                                .foregroundStyle(WishpoolPalette.textSecondary)
                                        }
                                        .padding(14)
                                        .background(
                                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                                .fill(WishpoolPalette.surfaceRaised)
                                        )
                                    }
                                }
                            }
                        }
                        .wishpoolCardStyle()
                        .staggeredEntrance(index: 3)
                    }
                    .padding(18)
                } else {
                    WishpoolLoadingView(message: "正在打开愿望")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(.top, 80)
                }
            }
            .background(WishpoolPalette.background)
            .navigationTitle("愿望详情")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("关闭") { dismiss() }
                }
            }
        }
    }

    private func infoRow(_ title: String, value: String) -> some View {
        HStack {
            Text(title)
                .foregroundStyle(WishpoolPalette.textSecondary)
            Spacer()
            Text(value)
                .foregroundStyle(WishpoolPalette.textPrimary)
        }
        .font(.subheadline)
    }

    private func detailField(_ title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(WishpoolPalette.textPrimary)
            TextField("请输入", text: text)
                .textFieldStyle(.plain)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(WishpoolPalette.surfaceRaised)
                )
                .foregroundStyle(WishpoolPalette.textPrimary)
        }
    }

    private func statusLabel(for status: WishExecutionStatus) -> String {
        switch status {
        case .clarifying:
            return "clarifying"
        case .planning:
            return "planning"
        case .validating:
            return "validating"
        case .locking:
            return "locking"
        case .ready:
            return "ready"
        case .inProgress:
            return "in_progress"
        case .completed:
            return "completed"
        case .failed:
            return "failed"
        case .cancelled:
            return "cancelled"
        case .draft:
            return "draft"
        }
    }
}
