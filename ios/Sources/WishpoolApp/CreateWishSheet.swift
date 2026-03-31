import SwiftUI

struct CreateWishSheet: View {
    let onSubmit: @Sendable (String, String, String, String) async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var intent = ""
    @State private var city = ""
    @State private var budget = ""
    @State private var timeWindow = ""

    private var canSubmit: Bool {
        !intent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("把一个模糊愿望说清楚，系统会先帮你进入澄清和计划阶段。")
                        .foregroundStyle(WishpoolPalette.textSecondary)
                        .staggeredEntrance(index: 0)

                    VStack(alignment: .leading, spacing: 10) {
                        fieldTitle("愿望")
                        TextEditor(text: $intent)
                            .frame(minHeight: 120)
                            .padding(12)
                            .background(
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .fill(WishpoolPalette.surfaceRaised)
                            )
                            .foregroundStyle(WishpoolPalette.textPrimary)
                    }
                    .staggeredEntrance(index: 1)

                    Group {
                        textField("城市", text: $city)
                        textField("预算", text: $budget)
                        textField("时间窗口", text: $timeWindow)
                    }
                    .staggeredEntrance(index: 2)

                    Button {
                        Task {
                            await onSubmit(intent, city, budget, timeWindow)
                        }
                    } label: {
                        Text("开始许愿")
                            .font(.headline)
                            .foregroundStyle(WishpoolPalette.background)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Capsule().fill(WishpoolPalette.gold))
                    }
                    .buttonStyle(ScaleButtonStyle())
                    .disabled(!canSubmit)
                    .opacity(canSubmit ? 1 : 0.5)
                    .staggeredEntrance(index: 3)
                }
                .padding(20)
            }
            .background(WishpoolPalette.background)
            .navigationTitle("发愿")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("关闭") { dismiss() }
                }
            }
        }
    }

    private func fieldTitle(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(WishpoolPalette.textPrimary)
    }

    private func textField(_ title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            fieldTitle(title)
            TextField("可选", text: text)
                .textFieldStyle(.plain)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(WishpoolPalette.surfaceRaised)
                )
                .foregroundStyle(WishpoolPalette.textPrimary)
        }
    }
}
