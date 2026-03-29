import Foundation

/// ASR状态枚举，与Android端AsrState.kt保持完全一致
/// 对应路径: android/app/src/main/java/com/wishpool/app/core/asr/AsrState.kt
public enum ASRState: Equatable, Sendable {
    /// 空闲状态，对应Android: data object Idle
    case idle

    /// 需要权限状态，对应Android: data object PermissionRequired
    case permissionRequired

    /// 下载中状态，对应Android: data class Downloading(val progress: Float)
    case downloading(progress: Float)

    /// 录音中状态，对应Android: data class Recording(val partialText: String)
    case recording(partialText: String)

    /// 处理中状态，对应Android: data class Processing(val partialText: String)
    case processing(partialText: String)

    /// 结果状态，对应Android: data class Result(val text: String)
    case result(text: String)

    /// 错误状态，对应Android: data class Error(val message: String)
    case error(message: String)
}

// MARK: - ASRState 便捷属性和方法

extension ASRState {
    /// 是否正在录音
    public var isRecording: Bool {
        if case .recording = self {
            return true
        }
        return false
    }

    /// 是否正在处理
    var isProcessing: Bool {
        if case .processing = self {
            return true
        }
        return false
    }

    /// 是否处于活跃状态（录音或处理中）
    var isActive: Bool {
        return isRecording || isProcessing
    }

    /// 是否处于错误状态
    var isError: Bool {
        if case .error = self {
            return true
        }
        return false
    }

    /// 是否有结果
    var hasResult: Bool {
        if case .result = self {
            return true
        }
        return false
    }

    /// 获取当前显示的文本（部分结果或最终结果）
    public var displayText: String {
        switch self {
        case .recording(let partialText):
            return partialText
        case .processing(let partialText):
            return partialText
        case .result(let text):
            return text
        default:
            return ""
        }
    }

    /// 获取错误信息
    var errorMessage: String? {
        if case .error(let message) = self {
            return message
        }
        return nil
    }

    /// 获取下载进度
    var downloadProgress: Float? {
        if case .downloading(let progress) = self {
            return progress
        }
        return nil
    }
}

// MARK: - 状态转换描述（用于调试和日志）

extension ASRState: CustomStringConvertible {
    public var description: String {
        switch self {
        case .idle:
            return "Idle"
        case .permissionRequired:
            return "PermissionRequired"
        case .downloading(let progress):
            return "Downloading(progress: \(progress))"
        case .recording(let partialText):
            return "Recording(partialText: \"\(partialText)\")"
        case .processing(let partialText):
            return "Processing(partialText: \"\(partialText)\")"
        case .result(let text):
            return "Result(text: \"\(text)\")"
        case .error(let message):
            return "Error(message: \"\(message)\")"
        }
    }
}