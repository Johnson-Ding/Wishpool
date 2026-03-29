import Foundation
import Combine
#if canImport(Speech)
import Speech
#endif
#if canImport(AVFoundation)
@preconcurrency import AVFoundation
#endif

/// iOS 原生语音识别管理器
/// 使用 SFSpeechRecognizer + AVAudioEngine 实现实时语音转文字
/// 对标 Android 端 AndroidAsrManager.kt（使用原生 SpeechRecognizer）
public class NativeSpeechASRManager: ASRManager, @unchecked Sendable {
    @Published public private(set) var state: ASRState = .idle
    public var statePublisher: Published<ASRState>.Publisher { $state }

    #if canImport(Speech)
    private let speechRecognizer: SFSpeechRecognizer?
    private let audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    #endif
    private var latestText: String = ""
    private var isStopping: Bool = false
    /// 静音计时器：检测用户停顿后自动结束
    private var silenceTimer: Timer?
    private let silenceTimeout: TimeInterval = 2.0

    public init() {
        #if canImport(Speech)
        self.speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN"))
        #endif
    }

    // MARK: - ASRManager 协议实现

    public func startRecording() async {
        guard !isStopping else { return }

        #if canImport(Speech)
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            await MainActor.run { state = .error(message: "语音识别不可用") }
            return
        }

        // 请求语音识别权限
        let authStatus = await requestSpeechAuthorization()
        guard authStatus == .authorized else {
            await MainActor.run { state = .permissionRequired }
            return
        }

        // 请求麦克风权限
        let micPermission = await requestMicrophonePermission()
        guard micPermission else {
            await MainActor.run { state = .permissionRequired }
            return
        }

        do {
            // 停止之前的任务
            recognitionTask?.cancel()
            recognitionTask = nil

            // 配置音频会话
            #if os(iOS)
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            #endif

            // 创建识别请求
            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            // 设备端识别（iOS 13+，隐私友好）
            if #available(iOS 13, macOS 10.15, *) {
                request.requiresOnDeviceRecognition = false // 先用在线模式确保质量
            }
            self.recognitionRequest = request

            latestText = ""
            await MainActor.run { state = .recording(partialText: "") }

            // 创建识别任务
            recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
                guard let self = self else { return }

                if let result = result {
                    let text = result.bestTranscription.formattedString
                    self.latestText = text

                    DispatchQueue.main.async {
                        if self.isStopping {
                            self.state = .result(text: text)
                        } else {
                            self.state = .recording(partialText: text)
                        }
                    }

                    // 重置静音计时器
                    self.resetSilenceTimer()

                    if result.isFinal {
                        self.finishRecognition(text: text)
                    }
                }

                if let error = error {
                    // 忽略取消错误
                    let nsError = error as NSError
                    if nsError.domain == "kAFAssistantErrorDomain" && nsError.code == 216 {
                        // 用户取消，不是真正的错误
                        return
                    }
                    DispatchQueue.main.async {
                        if self.latestText.isEmpty {
                            self.state = .error(message: "识别出错: \(error.localizedDescription)")
                        } else {
                            // 有部分结果时，仍然返回结果
                            self.state = .result(text: self.latestText)
                        }
                    }
                    self.cleanupAudioEngine()
                }
            }

            // 安装音频 tap
            let inputNode = audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                request.append(buffer)
            }

            audioEngine.prepare()
            try audioEngine.start()

            // 启动静音计时器
            startSilenceTimer()

        } catch {
            await MainActor.run { state = .error(message: "启动录音失败: \(error.localizedDescription)") }
            cleanupAudioEngine()
        }
        #else
        await MainActor.run { state = .error(message: "当前平台不支持语音识别") }
        #endif
    }

    public func stopRecording() async {
        guard !isStopping else { return }
        isStopping = true

        #if canImport(Speech)
        await MainActor.run { state = .processing(partialText: latestText) }

        invalidateSilenceTimer()
        recognitionRequest?.endAudio()
        cleanupAudioEngine()

        // 等待最终结果
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5s

        await MainActor.run {
            if latestText.isEmpty {
                state = .error(message: "未识别到有效语音，请再试一次")
            } else {
                state = .result(text: latestText)
            }
        }

        recognitionTask = nil
        recognitionRequest = nil
        isStopping = false
        #endif
    }

    public func reset() async {
        isStopping = false
        latestText = ""
        invalidateSilenceTimer()

        #if canImport(Speech)
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        cleanupAudioEngine()
        #endif

        await MainActor.run { state = .idle }
    }

    public func warmUp() {
        // 原生 Speech 不需要预热
    }

    // MARK: - 私有方法

    #if canImport(Speech)
    private func requestSpeechAuthorization() async -> SFSpeechRecognizerAuthorizationStatus {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
    }
    #endif

    private func requestMicrophonePermission() async -> Bool {
        #if os(iOS)
        if #available(iOS 17.0, *) {
            return await withCheckedContinuation { continuation in
                AVAudioApplication.requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        } else {
            return await withCheckedContinuation { continuation in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        }
        #elseif os(macOS)
        return true
        #else
        return true
        #endif
    }

    #if canImport(Speech)
    private func cleanupAudioEngine() {
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        audioEngine.inputNode.removeTap(onBus: 0)
    }

    private func finishRecognition(text: String) {
        invalidateSilenceTimer()
        DispatchQueue.main.async {
            self.state = .result(text: text)
        }
        cleanupAudioEngine()
        recognitionTask = nil
        recognitionRequest = nil
        isStopping = false
    }
    #endif

    // MARK: - 静音检测

    private func startSilenceTimer() {
        invalidateSilenceTimer()
        DispatchQueue.main.async {
            self.silenceTimer = Timer.scheduledTimer(withTimeInterval: self.silenceTimeout, repeats: false) { [weak self] _ in
                guard let self = self else { return }
                // 超过静音时间，自动停止
                if !self.latestText.isEmpty {
                    Task { await self.stopRecording() }
                }
            }
        }
    }

    private func resetSilenceTimer() {
        startSilenceTimer()
    }

    private func invalidateSilenceTimer() {
        DispatchQueue.main.async {
            self.silenceTimer?.invalidate()
            self.silenceTimer = nil
        }
    }
}
