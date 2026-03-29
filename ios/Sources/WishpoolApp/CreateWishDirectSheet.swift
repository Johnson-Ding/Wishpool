import SwiftUI
@preconcurrency import AVFoundation
import WishpoolCore
#if canImport(UIKit)
import UIKit
#endif

/// iOS版本的DirectPublishSheet - 语音直发模式
/// 对应Android的DirectPublishSheet.kt
/// 核心特性：录音完成后自动提交，无编辑界面
struct CreateWishDirectSheet: View {
    let onSubmit: @Sendable (String) async -> Void

    @Environment(\.dismiss) private var dismiss
    @StateObject private var asrManager: SherpaASRManager
    @State private var showingPermissionAlert = false

    init(onSubmit: @escaping @Sendable (String) async -> Void,
         asrManager: SherpaASRManager = SherpaASRManager()) {
        self.onSubmit = onSubmit
        self._asrManager = StateObject(wrappedValue: asrManager)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                // 录音状态指示器
                recordingStatusIndicator

                // 指导文案
                instructionText

                Spacer()
            }
            .padding(32)
            .background(WishpoolPalette.background)
            .navigationTitle("快速许愿")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("取消") {
                        Task { await asrManager.reset() }
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            asrManager.warmUp()
            startDirectVoiceInput()
        }
        .onDisappear {
            Task { await asrManager.reset() }
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
                dismiss()
            }
        } message: {
            Text("需要麦克风权限才能使用语音输入功能，请在设置中允许访问麦克风。")
        }
    }

    // MARK: - 子视图组件

    private var recordingStatusIndicator: some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                if asrManager.state.isRecording {
                    recordingDot
                }

                Text(directModeStatusText)
                    .font(.title3)
                    .fontWeight(.medium)
                    .foregroundStyle(directModeStatusColor)
                    .multilineTextAlignment(.center)
            }

            // 可选：显示部分转录文本（但不可编辑）
            if !asrManager.state.displayText.isEmpty {
                Text(asrManager.state.displayText)
                    .font(.body)
                    .foregroundStyle(WishpoolPalette.textSecondary)
                    .padding(.horizontal, 24)
                    .multilineTextAlignment(.center)
            }
        }
    }

    private var recordingDot: some View {
        Circle()
            .fill(Color.red)
            .frame(width: 12, height: 12)
            .scaleEffect(1.2)
            .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: asrManager.state.isRecording)
    }

    private var instructionText: some View {
        VStack(spacing: 8) {
            Text("说完后将自动发送心愿")
                .font(.body)
                .foregroundStyle(WishpoolPalette.textSecondary)

            if case .permissionRequired = asrManager.state {
                Button("允许麦克风访问") {
                    showingPermissionAlert = true
                }
                .foregroundStyle(WishpoolPalette.gold)
            }
        }
        .multilineTextAlignment(.center)
    }

    // MARK: - 状态文本（对应Android的fromDirect模式）

    private var directModeStatusText: String {
        switch asrManager.state {
        case .idle:
            return "准备开始聆听..."
        case .permissionRequired:
            return "需要麦克风权限"
        case .downloading(_):
            return "正在准备语音识别..."
        case .recording:
            return "正在聆听...（完成后直接发送）"
        case .processing:
            return "正在整理语音...（即将发送）"
        case .result:
            return "录音完成，正在发送..."
        case .error(let message):
            return message
        }
    }

    private var directModeStatusColor: Color {
        switch asrManager.state {
        case .idle:
            return WishpoolPalette.textSecondary
        case .permissionRequired, .error:
            return Color.red
        case .downloading, .processing, .result:
            return WishpoolPalette.gold
        case .recording:
            return Color.green
        }
    }

    // MARK: - 核心逻辑方法

    private func startDirectVoiceInput() {
        Task {
            // 检查麦克风权限
            #if os(iOS) || os(watchOS) || os(tvOS)
            switch await requestMicrophonePermission() {
            case .granted:
                await asrManager.startRecording()
            case .denied:
                showingPermissionAlert = true
            case .undetermined:
                // 会自动弹出系统权限对话框
                break
            @unknown default:
                break
            }
            #else
            // macOS简化处理
            let hasPermission = await requestMicrophonePermission()
            if hasPermission {
                await asrManager.startRecording()
            } else {
                showingPermissionAlert = true
            }
            #endif
        }
    }

    private func handleASRStateChange(_ state: ASRState) {
        switch state {
        case .result(let text):
            // 关键区别：自动提交，无编辑步骤
            if !text.isEmpty {
                Task {
                    await onSubmit(text)
                    dismiss()
                }
            }
        case .error:
            // 错误状态下延迟关闭，让用户看到错误信息
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                dismiss()
            }
        case .permissionRequired:
            showingPermissionAlert = true
        default:
            break
        }
    }

    #if os(iOS) || os(watchOS) || os(tvOS)
    private func requestMicrophonePermission() async -> AVAudioSession.RecordPermission {
        return await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                let permission: AVAudioSession.RecordPermission = granted ? .granted : .denied
                continuation.resume(returning: permission)
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
//     CreateWishDirectSheet { text in
//         print("Direct submit: \(text)")
//     }
// }