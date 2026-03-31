import Combine
import Foundation

/// iOS ASR 会话控制器。
/// 职责仅限于会话状态编排：开始/停止/重置与引擎事件转发。
/// 正式主链路固定为 AppleSpeechRecognitionEngine。
public final class NativeSpeechASRManager: ASRManager, @unchecked Sendable {
    @Published public private(set) var state: ASRState = .idle
    public var statePublisher: Published<ASRState>.Publisher { $state }

    private let engine: SpeechRecognitionEngine
    private var latestText: String = ""
    private var isStopping: Bool = false

    public init(engine: SpeechRecognitionEngine = AppleSpeechRecognitionEngine()) {
        self.engine = engine
        bindEngineEvents()
    }

    public func startRecording() async {
        guard !isStopping else { return }
        latestText = ""
        await updateState(.recording(partialText: ""))

        do {
            try await engine.start()
        } catch {
            await updateState(mapErrorToState(error))
        }
    }

    public func stopRecording() async {
        guard !isStopping else { return }
        isStopping = true
        await updateState(.processing(partialText: latestText))

        do {
            try await engine.stop()
            if latestText.isEmpty {
                await updateState(.error(message: "未识别到有效语音，请再试一次"))
            } else {
                await updateState(.result(text: latestText))
            }
        } catch {
            await updateState(mapErrorToState(error))
        }

        isStopping = false
    }

    public func reset() async {
        isStopping = false
        latestText = ""
        await engine.reset()
        await updateState(.idle)
    }

    public func warmUp() {
        engine.warmUp()
    }

    private func bindEngineEvents() {
        engine.onEvent = { [weak self] event in
            guard let self else { return }
            Task {
                await self.handle(event: event)
            }
        }
    }

    private func handle(event: SpeechRecognitionEvent) async {
        switch event {
        case .partialText(let text):
            guard !isStopping else { return }
            latestText = text
            await updateState(.recording(partialText: text))
        case .finalText(let text):
            latestText = text
            await updateState(.result(text: text))
            isStopping = false
        case .permissionRequired:
            await updateState(.permissionRequired)
            isStopping = false
        case .failure(let message):
            await updateState(.error(message: message))
            isStopping = false
        }
    }

    private func updateState(_ newState: ASRState) async {
        await MainActor.run {
            self.state = newState
        }
    }

    private func mapErrorToState(_ error: Error) -> ASRState {
        if let engineError = error as? SpeechRecognitionEngineError {
            switch engineError {
            case .permissionDenied:
                return .permissionRequired
            case .unavailable:
                return .error(message: "语音识别不可用")
            case .startFailed(let message):
                return .error(message: message)
            case .stopFailed(let message):
                return .error(message: message)
            }
        }

        return .error(message: error.localizedDescription)
    }
}
