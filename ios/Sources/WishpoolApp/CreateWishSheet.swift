import SwiftUI

struct CreateWishSheet: View {
    let onSubmit: @Sendable (String, String, String, String) async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var intent = ""
    @State private var city = ""
    @State private var budget = ""
    @State private var timeWindow = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("把一个模糊愿望说清楚，系统会先帮你进入澄清和计划阶段。")
                        .foregroundStyle(WishpoolPalette.textSecondary)

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

                    Group {
                        textField("城市", text: $city)
                        textField("预算", text: $budget)
                        textField("时间窗口", text: $timeWindow)
                    }

                    Button {
                        Task {
                            await onSubmit(intent, city, budget, timeWindow)
                            dismiss()
                        }
                    } label: {
                        Text("开始许愿")
                            .font(.headline)
                            .foregroundStyle(WishpoolPalette.background)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Capsule().fill(WishpoolPalette.gold))
                    }
                    .disabled(intent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .opacity(intent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.5 : 1)
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
