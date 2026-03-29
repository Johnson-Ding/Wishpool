import SwiftUI
import WishpoolCore

/// AI 方案制定页面 — 对标 Android 端 AiPlanRoute.kt
/// 展示 AI 生成的执行步骤（分步动画），确认后回到主页
struct AiPlanView: View {
    let wishInput: String
    let onConfirm: () -> Void
    let onBack: () -> Void

    @Environment(\.themedPalette) private var palette
    @State private var uiState: AiPlanUiState = .loading
    @State private var revealedSteps: Int = 0

    private let agentApi = AgentApi()

    var body: some View {
        ZStack {
            palette.background.ignoresSafeArea()

            switch uiState {
            case .loading:
                loadingView
            case .error(let message):
                errorView(message: message)
            case .success(let plan):
                planContentView(plan: plan)
            }
        }
        .task {
            await loadPlan()
        }
    }

    // MARK: - 加载状态

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(palette.accent)
                .scaleEffect(1.2)
            Text("AI 正在分析你的心愿...")
                .font(.subheadline)
                .foregroundStyle(palette.mutedForeground)
        }
    }

    // MARK: - 错误状态

    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Text(message)
                .font(.body)
                .foregroundStyle(palette.mutedForeground)
                .multilineTextAlignment(.center)

            Button("重试") {
                Task { await loadPlan() }
            }
            .foregroundStyle(palette.accent)
        }
        .padding()
    }

    // MARK: - 方案内容

    private func planContentView(plan: GeneratedPlan) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // 顶部导航栏
                headerBar

                // 心愿卡片
                wishCard(plan: plan)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)

                // 执行方案标题
                Text("执行方案")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(palette.foreground)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
                    .padding(.bottom, 16)

                // 步骤列表
                ForEach(Array(plan.planSteps.enumerated()), id: \.offset) { index, step in
                    stepRow(step: step, index: index)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 16)
                }

                // 确认按钮
                confirmButton(enabled: revealedSteps >= plan.planSteps.count)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 32)
            }
        }
    }

    // MARK: - 顶部导航

    private var headerBar: some View {
        HStack {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(palette.foreground)
                    .padding(12)
            }

            Spacer()

            Text("AI 为你制定方案")
                .font(.headline)
                .foregroundStyle(palette.primary)

            Spacer()

            // 占位，保持居中
            Color.clear
                .frame(width: 44, height: 44)
        }
        .padding(.horizontal, 8)
    }

    // MARK: - 心愿卡片

    private func wishCard(plan: GeneratedPlan) -> some View {
        let displayWish = wishInput.isEmpty ? plan.wishText : wishInput

        return VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Image(systemName: "sparkles")
                    .font(.caption)
                Text("你的心愿")
                    .font(.caption.weight(.medium))
            }
            .foregroundStyle(palette.accent)

            Text(displayWish)
                .font(.body.weight(.medium))
                .foregroundStyle(palette.foreground)

            HStack(spacing: 8) {
                Text(plan.durationText)
                    .font(.caption)
                    .foregroundStyle(palette.mutedForeground)
                Text("·")
                    .foregroundStyle(palette.mutedForeground)
                Text(plan.category)
                    .font(.caption)
                    .foregroundStyle(palette.accent)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(palette.card)
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .strokeBorder(palette.accent.opacity(0.2))
                )
        )
    }

    // MARK: - 步骤行

    private func stepRow(step: AiPlanStep, index: Int) -> some View {
        let visible = index < revealedSteps
        let stepColor = parseStepColor(step.typeColor)

        return HStack(alignment: .top, spacing: 14) {
            // 步骤编号圆圈
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [stepColor, stepColor.opacity(0.6)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 36, height: 36)

                Text(step.num)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white)
            }

            // 步骤内容
            VStack(alignment: .leading, spacing: 4) {
                Text(step.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(palette.foreground)

                HStack(spacing: 8) {
                    Text(step.type)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(stepColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            RoundedRectangle(cornerRadius: 4)
                                .fill(stepColor.opacity(0.12))
                        )

                    Text(step.desc)
                        .font(.caption2)
                        .foregroundStyle(palette.mutedForeground)
                }
            }
        }
        .opacity(visible ? 1 : 0)
        .offset(y: visible ? 0 : 20)
        .animation(.easeOut(duration: 0.4), value: visible)
    }

    // MARK: - 确认按钮

    private func confirmButton(enabled: Bool) -> some View {
        Button(action: onConfirm) {
            Text("确认方案，开始执行")
                .font(.headline)
                .foregroundStyle(palette.background)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [palette.primary, palette.primary.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                )
        }
        .buttonStyle(ScaleButtonStyle())
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.5)
    }

    // MARK: - 数据加载

    private func loadPlan() async {
        uiState = .loading
        let result = await agentApi.generatePlan(wishInput: wishInput)
        switch result {
        case .success(let plan, _):
            uiState = .success(plan)
            // 逐步揭示步骤动画
            for i in 1...plan.planSteps.count {
                try? await Task.sleep(nanoseconds: 400_000_000) // 400ms
                revealedSteps = i
            }
        case .error(let message):
            uiState = .error(message)
        }
    }

    // MARK: - 颜色解析

    private func parseStepColor(_ colorStr: String) -> Color {
        if colorStr.hasPrefix("var(") {
            if colorStr.contains("accent") { return Color(red: 0.29, green: 0.68, blue: 0.63) }
            if colorStr.contains("primary") { return Color(red: 0.96, green: 0.78, blue: 0.26) }
            return Color(red: 0.29, green: 0.68, blue: 0.63)
        }

        if colorStr.hasPrefix("#") && colorStr.count == 7 {
            let hex = String(colorStr.dropFirst())
            if let rgb = UInt64(hex, radix: 16) {
                return Color(
                    red: Double((rgb >> 16) & 0xFF) / 255.0,
                    green: Double((rgb >> 8) & 0xFF) / 255.0,
                    blue: Double(rgb & 0xFF) / 255.0
                )
            }
        }

        return Color(red: 0.29, green: 0.68, blue: 0.63)
    }
}

// MARK: - UI State

private enum AiPlanUiState {
    case loading
    case error(String)
    case success(GeneratedPlan)
}
