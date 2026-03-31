import Foundation
#if canImport(Speech)
import Speech
#endif
#if canImport(AVFoundation)
@preconcurrency import AVFoundation
#endif

/// 语音引擎输出事件。Session controller 仅消费这些事件，不感知底层框架细节。
public enum SpeechRecognitionEvent: Equatable, Sendable {
    case partialText(String)
    case finalText(String)
    case permissionRequired
    case failure(String)
}

/// 语音识别引擎协议。
public protocol SpeechRecognitionEngine: AnyObject {
    var onEvent: (@Sendable (SpeechRecognitionEvent) -> Void)? { get set }

    func start() async throws
    func stop() async throws
    func reset() async
    func warmUp()
}

enum SpeechRecognitionEngineError: Error {
    case unavailable
    case permissionDenied
    case startFailed(String)
    case stopFailed(String)
}

extension SpeechRecognitionEngineError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .unavailable:
            return "语音识别不可用"
        case .permissionDenied:
            return "需要麦克风和语音识别权限"
        case .startFailed(let message):
            return "启动录音失败: \(message)"
        case .stopFailed(let message):
            return "停止录音失败: \(message)"
        }
    }
}

#if canImport(Speech)
/// Apple Speech 正式引擎实现（iOS 主链路）。
public final class AppleSpeechRecognitionEngine: SpeechRecognitionEngine, @unchecked Sendable {
    public var onEvent: (@Sendable (SpeechRecognitionEvent) -> Void)?

    private let speechRecognizer: SFSpeechRecognizer?
    private let audioEngine: AVAudioEngine
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let silenceTimeout: TimeInterval

    private var latestText: String = ""
    private var hasEmittedFinal: Bool = false
    private var silenceTimer: Timer?

    public init(locale: Locale = Locale(identifier: "zh-CN"), silenceTimeout: TimeInterval = 2.0) {
        self.speechRecognizer = SFSpeechRecognizer(locale: locale)
        self.audioEngine = AVAudioEngine()
        self.silenceTimeout = silenceTimeout
    }

    public func start() async throws {
        guard let speechRecognizer, speechRecognizer.isAvailable else {
            throw SpeechRecognitionEngineError.unavailable
        }

        let speechAuthorization = await requestSpeechAuthorization()
        guard speechAuthorization == .authorized else {
            throw SpeechRecognitionEngineError.permissionDenied
        }

        let hasMicrophonePermission = await requestMicrophonePermission()
        guard hasMicrophonePermission else {
            throw SpeechRecognitionEngineError.permissionDenied
        }

        do {
            await reset()
            try configureAudioSessionIfNeeded()
            try startRecognitionTask(with: speechRecognizer)
            startSilenceTimer()
        } catch {
            await reset()
            throw SpeechRecognitionEngineError.startFailed(error.localizedDescription)
        }
    }

    public func stop() async throws {
        invalidateSilenceTimer()
        recognitionRequest?.endAudio()
        cleanupAudioTapIfNeeded()

        // 给 Apple Speech 一个极短窗口输出 final callback；若未输出则兜底使用 latestText。
        try? await Task.sleep(nanoseconds: 200_000_000)
        if !hasEmittedFinal, !latestText.isEmpty {
            onEvent?(.finalText(latestText))
            hasEmittedFinal = true
        }

        recognitionTask = nil
        recognitionRequest = nil
    }

    public func reset() async {
        invalidateSilenceTimer()
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        latestText = ""
        hasEmittedFinal = false
        cleanupAudioTapIfNeeded()
    }

    public func warmUp() {
        // Apple Speech 无需模型预热
    }

    private func startRecognitionTask(with speechRecognizer: SFSpeechRecognizer) throws {
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        if #available(iOS 13, macOS 10.15, *) {
            request.requiresOnDeviceRecognition = true
        }
        recognitionRequest = request

        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self else { return }

            if let result {
                self.handleRecognitionResult(result)
            }

            if let error {
                self.handleRecognitionError(error)
            }
        }

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()
    }

    private func handleRecognitionResult(_ result: SFSpeechRecognitionResult) {
        let text = result.bestTranscription.formattedString.trimmingCharacters(in: .whitespacesAndNewlines)
        if !text.isEmpty {
            latestText = text
        }

        resetSilenceTimer()

        if result.isFinal {
            if !text.isEmpty {
                onEvent?(.finalText(text))
                hasEmittedFinal = true
            }
            invalidateSilenceTimer()
            cleanupAudioTapIfNeeded()
            recognitionTask = nil
            recognitionRequest = nil
            return
        }

        if !text.isEmpty {
            onEvent?(.partialText(text))
        }
    }

    private func handleRecognitionError(_ error: Error) {
        let nsError = error as NSError
        if nsError.domain == "kAFAssistantErrorDomain" && nsError.code == 216 {
            return
        }

        if !hasEmittedFinal {
            onEvent?(.failure("识别出错: \(error.localizedDescription)"))
        }
        Task {
            await reset()
        }
    }

    private func configureAudioSessionIfNeeded() throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement, options: .duckOthers)
        try session.setActive(true, options: .notifyOthersOnDeactivation)
        #endif
    }

    private func requestSpeechAuthorization() async -> SFSpeechRecognizerAuthorizationStatus {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        #if os(iOS)
        return await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
        #elseif os(macOS)
        return await withCheckedContinuation { continuation in
            AVCaptureDevice.requestAccess(for: .audio) { granted in
                continuation.resume(returning: granted)
            }
        }
        #else
        return true
        #endif
    }

    private func startSilenceTimer() {
        invalidateSilenceTimer()
        guard silenceTimeout > 0 else { return }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.silenceTimer = Timer.scheduledTimer(withTimeInterval: self.silenceTimeout, repeats: false) { [weak self] _ in
                guard let self else { return }
                if self.latestText.isEmpty || self.hasEmittedFinal {
                    return
                }
                Task {
                    try? await self.stop()
                }
            }
        }
    }

    private func resetSilenceTimer() {
        startSilenceTimer()
    }

    private func invalidateSilenceTimer() {
        DispatchQueue.main.async { [weak self] in
            self?.silenceTimer?.invalidate()
            self?.silenceTimer = nil
        }
    }

    private func cleanupAudioTapIfNeeded() {
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        audioEngine.inputNode.removeTap(onBus: 0)
    }
}
#else
public final class AppleSpeechRecognitionEngine: SpeechRecognitionEngine, @unchecked Sendable {
    public var onEvent: (@Sendable (SpeechRecognitionEvent) -> Void)?

    public init(locale: Locale = Locale(identifier: "zh-CN"), silenceTimeout: TimeInterval = 2.0) {}

    public func start() async throws {
        throw SpeechRecognitionEngineError.unavailable
    }

    public func stop() async throws {
        throw SpeechRecognitionEngineError.unavailable
    }

    public func reset() async {}

    public func warmUp() {}
}
#endif
