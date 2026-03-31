import Combine
import Foundation

/// ASR 管理器协议，与 Android 端 AsrManager 保持一致。
/// 业务层只依赖该协议，不感知底层引擎细节。
public protocol ASRManager: ObservableObject {
    /// 当前 ASR 状态
    var state: ASRState { get }

    /// ASR 状态发布器（SwiftUI 绑定）
    var statePublisher: Published<ASRState>.Publisher { get }

    /// 开始录音
    func startRecording() async

    /// 停止录音
    func stopRecording() async

    /// 重置会话
    func reset() async

    /// 引擎预热
    func warmUp()
}
