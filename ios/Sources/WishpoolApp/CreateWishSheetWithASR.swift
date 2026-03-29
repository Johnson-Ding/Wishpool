import SwiftUI
@preconcurrency import AVFoundation
import WishpoolCore
#if canImport(UIKit)
import UIKit
#endif
#if canImport(AVAudioApplication)
import AVAudioApplication
#endif

/// 支持语音输入的心愿创建界面（编辑模式）
/// 改造自原版CreateWishSheet.swift，添加语音识别功能
/// 对应Android端PublisherSheet.kt的功能（长按FAB触发）
/// 特性：语音转录后可编辑，手动提交
struct CreateWishSheetWithASR: View {
    let onSubmit: @Sendable (String, String, String, String) async -> Void

    @Environment(\.dismiss) private var dismiss
    @StateObject private var asrManager: SherpaASRManager
    @State private var intent = ""
    @State private var city = ""
    @State private var budget = ""
    @State private var timeWindow = ""
    @State private var inputMode: InputMode = .text
    @State private var showingPermissionAlert = false

    /// 输入模式：文本输入或语音输入
    enum InputMode {
        case text    // 文本输入模式
        case voice   // 语音输入模式
    }

    init(onSubmit: @escaping @Sendable (String, String, String, String) async -> Void,
         asrManager: SherpaASRManager = SherpaASRManager()) {
        self.onSubmit = onSubmit
        self._asrManager = StateObject(wrappedValue: asrManager)
    }

    private var canSubmit: Bool {
        !intent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // 顶部说明文本
                    instructionText
                        .staggeredEntrance(index: 0)

                    // 输入模式选择
                    inputModeSelector
                        .staggeredEntrance(index: 1)

                    // 愿望输入区域
                    wishInputSection
                        .staggeredEntrance(index: 2)

                    // 其他字段
                    otherFieldsSection
                        .staggeredEntrance(index: 3)

                    // 提交按钮
                    submitButton
                        .staggeredEntrance(index: 4)
                }
                .padding(20)
            }
            .background(WishpoolPalette.background)
            .navigationTitle("发愿")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("关闭") {
                        Task {
                            await asrManager.reset()
                        }
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            asrManager.warmUp()
        }
        .onDisappear {
            Task {
                await asrManager.reset()
            }
        }
        .onChange(of: asrManager.state) { _, newState in
            handleASRStateChange(newState)
        }
        .alert("麦克风权限", isPresented: $showingPermissionAlert) {
            Button("设置") {
                #if os(iOS)
                if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsUrl)
                }
                #endif
            }
            Button("取消", role: .cancel) {
                inputMode = .text
            }
        } message: {
            Text("需要麦克风权限才能使用语音输入功能，请在设置中允许访问麦克风。")
        }
    }

    // MARK: - 子视图组件

    private var instructionText: some View {
        Text("把一个模糊愿望说清楚，系统会先帮你进入澄清和计划阶段。")
            .foregroundStyle(WishpoolPalette.textSecondary)
    }

    private var inputModeSelector: some View {
        HStack(spacing: 12) {
            // 文本输入模式按钮
            Button(action: {
                if inputMode == .voice {
                    Task { await asrManager.reset() }
                }
                inputMode = .text
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "keyboard")
                        .font(.caption)
                    Text("文字输入")
                        .font(.caption)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(inputMode == .text ? WishpoolPalette.gold : WishpoolPalette.surfaceRaised)
                )
                .foregroundStyle(inputMode == .text ? WishpoolPalette.background : WishpoolPalette.textPrimary)
            }

            // 语音输入模式按钮
            Button(action: {
                inputMode = .voice
                Task { await startVoiceInput() }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "mic.fill")
                        .font(.caption)
                    Text("语音输入")
                        .font(.caption)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(inputMode == .voice ? WishpoolPalette.gold : WishpoolPalette.surfaceRaised)
                )
                .foregroundStyle(inputMode == .voice ? WishpoolPalette.background : WishpoolPalette.textPrimary)
            }

            Spacer()
        }
    }

    private var wishInputSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                fieldTitle("愿望")

                if inputMode == .voice {
                    voiceStatusIndicator
                }
            }

            if inputMode == .text {
                // 文本输入模式
                TextEditor(text: $intent)
                    .frame(minHeight: 120)
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(WishpoolPalette.surfaceRaised)
                    )
                    .foregroundStyle(WishpoolPalette.textPrimary)
            } else {
                // 语音输入模式
                voiceInputArea
            }
        }
    }

    private var voiceStatusIndicator: some View {
        HStack(spacing: 6) {
            if asrManager.state.isRecording {
                recordingDot
            }

            Text(voiceStatusText)
                .font(.caption)
                .foregroundStyle(voiceStatusColor)
        }
    }

    private var recordingDot: some View {
        Circle()
            .fill(Color.red)
            .frame(width: 8, height: 8)
            .scaleEffect(asrManager.state.isRecording ? 1.2 : 1.0)
            .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: asrManager.state.isRecording)
    }

    private var voiceInputArea: some View {
        VStack(spacing: 12) {
            // 语音转换的文本显示区域
            TextEditor(text: $intent)
                .frame(minHeight: 120)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(WishpoolPalette.surfaceRaised)
                        .overlay(
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .stroke(voiceInputBorderColor, lineWidth: 2)
                        )
                )
                .foregroundStyle(WishpoolPalette.textPrimary)

            // 语音控制按钮区域
            voiceControlButtons
        }
    }

    private var voiceControlButtons: some View {
        HStack(spacing: 12) {
            // 开始/停止录音按钮
            Button(action: {
                Task {
                    if asrManager.state.isRecording {
                        await asrManager.stopRecording()
                    } else {
                        await asrManager.startRecording()
                    }
                }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: asrManager.state.isRecording ? "stop.fill" : "mic.fill")
                        .font(.caption)
                    Text(asrManager.state.isRecording ? "停止录音" : "开始录音")
                        .font(.caption)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(asrManager.state.isRecording ? Color.red : WishpoolPalette.gold)
                )
                .foregroundStyle(WishpoolPalette.background)
            }
            .disabled(asrManager.state == .permissionRequired)

            // 重置按钮
            Button(action: {
                Task {
                    await asrManager.reset()
                    intent = ""
                }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.clockwise")
                        .font(.caption)
                    Text("重置")
                        .font(.caption)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(WishpoolPalette.surfaceRaised)
                )
                .foregroundStyle(WishpoolPalette.textPrimary)
            }

            Spacer()
        }
    }

    private var otherFieldsSection: some View {
        Group {
            textField("城市", text: $city)
            textField("预算", text: $budget)
            textField("时间窗口", text: $timeWindow)
        }
    }

    private var submitButton: some View {
        Button {
            Task {
                if inputMode == .voice {
                    await asrManager.stopRecording()
                }
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
        .buttonStyle(ScaleButtonStyle())
        .disabled(!canSubmit)
        .opacity(canSubmit ? 1 : 0.5)
    }

    // MARK: - 辅助属性

    private var voiceStatusText: String {
        switch asrManager.state {
        case .idle:
            return "准备中"
        case .permissionRequired:
            return "需要麦克风权限"
        case .downloading(let progress):
            return "下载模型 \(Int(progress * 100))%"
        case .recording:
            return "正在录音..."
        case .processing:
            return "识别中..."
        case .result:
            return "识别完成"
        case .error:
            return "识别出错"
        }
    }

    private var voiceStatusColor: Color {
        switch asrManager.state {
        case .idle, .result:
            return WishpoolPalette.textSecondary
        case .permissionRequired, .error:
            return Color.red
        case .downloading, .processing:
            return WishpoolPalette.gold
        case .recording:
            return Color.green
        }
    }

    private var voiceInputBorderColor: Color {
        switch asrManager.state {
        case .recording:
            return Color.green
        case .processing:
            return WishpoolPalette.gold
        case .error:
            return Color.red
        default:
            return Color.clear
        }
    }

    // MARK: - 辅助方法

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

    private func startVoiceInput() async {
        // 检查麦克风权限
        let hasPermission = await requestMicrophonePermission()
        if hasPermission {
            await asrManager.startRecording()
        } else {
            showingPermissionAlert = true
            inputMode = .text
        }
    }

    private func handleASRStateChange(_ state: ASRState) {
        switch state {
        case .recording(let partialText):
            if !partialText.isEmpty {
                intent = partialText
            }
        case .processing(let partialText):
            if !partialText.isEmpty {
                intent = partialText
            }
        case .result(let text):
            intent = text
        case .error(let message):
            // 可以显示错误提示
            print("ASR Error: \(message)")
        case .permissionRequired:
            showingPermissionAlert = true
        default:
            break
        }
    }

    #if os(iOS) || os(watchOS) || os(tvOS)
    private func requestMicrophonePermission() async -> Bool {
        if #available(iOS 17.0, watchOS 10.0, tvOS 17.0, *) {
            // iOS 17+ 使用新的 AVAudioApplication API
            return await withCheckedContinuation { continuation in
                AVAudioApplication.requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        } else {
            // iOS 17 以下使用旧 API
            return await withCheckedContinuation { continuation in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        }
    }
    #else
    private func requestMicrophonePermission() async -> Bool {
        // macOS平台的简化实现
        return true
    }
    #endif
}

// MARK: - 预览

// #Preview {
//     CreateWishSheetWithASR { _, _, _, _ in
//         // Preview implementation
//     }
// }

// MARK: - 按钮样式
// ScaleButtonStyle 已在 WishpoolTheme.swift 中定义

// MARK: - 动画扩展

extension View {
    func staggeredEntrance(index: Int, delay: Double = 0.1) -> some View {
        self.opacity(1.0)
            .animation(.easeInOut(duration: 0.3).delay(Double(index) * delay), value: index)
    }
}