import Foundation
import Testing
@testable import WishpoolCore

@Test("NativeSpeechASRManager 会同步 engine 的 partial 与 final 事件")
func nativeSpeechManagerMirrorsEngineResultEvents() async {
    let engine = MockSpeechRecognitionEngine()
    let manager = NativeSpeechASRManager(engine: engine)

    await manager.startRecording()
    #expect(manager.state == .recording(partialText: ""))

    engine.emit(.partialText("我想去云南"))
    await waitForState { manager.state == .recording(partialText: "我想去云南") }
    #expect(manager.state == .recording(partialText: "我想去云南"))

    engine.emit(.finalText("我想去云南玩一周"))
    await waitForState { manager.state == .result(text: "我想去云南玩一周") }
    #expect(manager.state == .result(text: "我想去云南玩一周"))
}

@Test("NativeSpeechASRManager reset 会归位到 idle 并通知 engine")
func nativeSpeechManagerResetReturnsToIdle() async {
    let engine = MockSpeechRecognitionEngine()
    let manager = NativeSpeechASRManager(engine: engine)

    await manager.startRecording()
    engine.emit(.partialText("先来点文本"))
    await waitForState { manager.state == .recording(partialText: "先来点文本") }

    await manager.reset()

    #expect(manager.state == .idle)
    #expect(engine.resetInvocations == 1)
}

@Test("NativeSpeechASRManager 会原样暴露 permission 与 error")
func nativeSpeechManagerExposesPermissionAndError() async {
    let engine = MockSpeechRecognitionEngine()
    let manager = NativeSpeechASRManager(engine: engine)

    await manager.startRecording()

    engine.emit(.permissionRequired)
    await waitForState { manager.state == .permissionRequired }
    #expect(manager.state == .permissionRequired)

    engine.emit(.failure("语音识别不可用"))
    await waitForState { manager.state == .error(message: "语音识别不可用") }
    #expect(manager.state == .error(message: "语音识别不可用"))
}

private func waitForState(_ condition: @escaping @Sendable () -> Bool) async {
    for _ in 0..<50 {
        if condition() {
            return
        }
        try? await Task.sleep(nanoseconds: 10_000_000)
    }
}

private final class MockSpeechRecognitionEngine: SpeechRecognitionEngine, @unchecked Sendable {
    var onEvent: (@Sendable (SpeechRecognitionEvent) -> Void)?

    var startInvocations = 0
    var stopInvocations = 0
    var resetInvocations = 0
    var warmUpInvocations = 0

    func start() async throws {
        startInvocations += 1
    }

    func stop() async throws {
        stopInvocations += 1
    }

    func reset() async {
        resetInvocations += 1
    }

    func warmUp() {
        warmUpInvocations += 1
    }

    func emit(_ event: SpeechRecognitionEvent) {
        onEvent?(event)
    }
}
