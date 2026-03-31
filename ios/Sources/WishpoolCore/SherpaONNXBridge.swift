import Foundation

// MARK: - Sherpa ONNX 桥接层 (目前为模拟实现，等C API集成完成后替换)

/// Sherpa ONNX 识别器Swift包装类
class SherpaONNXRecognizer: @unchecked Sendable {
    private let config: SherpaONNXOnlineRecognizerConfig

    init(config: SherpaONNXOnlineRecognizerConfig) throws {
        self.config = config
        print("📝 [模拟] 创建Sherpa ONNX识别器")
        print("    模型配置: encoder=\(config.modelConfig.transducer.encoder)")
        print("    采样率: \(config.featConfig.sampleRate)")
    }

    func createStream() throws -> SherpaONNXStream {
        print("📝 [模拟] 创建识别流")
        return SherpaONNXStream()
    }

    func isReady(_ stream: SherpaONNXStream) -> Bool {
        // 模拟：总是准备好
        return true
    }

    func decode(_ stream: SherpaONNXStream) throws {
        print("📝 [模拟] 解码音频数据")
        stream.latestResult = "模拟识别中..."
    }

    func getResult(_ stream: SherpaONNXStream) throws -> SherpaONNXResult {
        let text = stream.latestResult.isEmpty ? "模拟语音识别结果" : stream.latestResult
        print("📝 [模拟] 获取识别结果: \(text)")
        return SherpaONNXResult(text: text)
    }

    func isEndpoint(_ stream: SherpaONNXStream) -> Bool {
        // 模拟：接收足够音频后触发端点
        return stream.audioChunkCount > 10
    }

    func release() {
        print("📝 [模拟] 释放识别器资源")
    }
}

/// Sherpa ONNX 流Swift包装类
class SherpaONNXStream: @unchecked Sendable {
    var latestResult: String = ""
    var audioChunkCount: Int = 0

    init() {
        print("📝 [模拟] 初始化识别流")
    }

    func acceptWaveform(samples: [Float], sampleRate: Float) throws {
        audioChunkCount += 1
        let duration = Float(samples.count) / sampleRate
        print("📝 [模拟] 接收音频: \(samples.count)样本, 时长\(String(format: "%.2f", duration))秒")

        // 模拟渐进式识别结果
        switch audioChunkCount {
        case 1...3:
            latestResult = "正在"
        case 4...6:
            latestResult = "正在识别"
        case 7...10:
            latestResult = "正在识别中文"
        default:
            latestResult = "正在识别中文语音内容"
        }
    }

    func inputFinished() throws {
        print("📝 [模拟] 音频输入结束")
        if latestResult.isEmpty {
            latestResult = "识别完成"
        }
    }

    func release() {
        print("📝 [模拟] 释放流资源")
    }
}

/// Sherpa ONNX 识别结果
struct SherpaONNXResult: Sendable {
    let text: String
}

/// Sherpa ONNX 在线识别器配置
struct SherpaONNXOnlineRecognizerConfig: Sendable {
    let featConfig: SherpaONNXFeatureConfig
    let modelConfig: SherpaONNXOnlineModelConfig
    let enableEndpoint: Bool
    let decodingMethod: String
}

/// Sherpa ONNX 特征配置
struct SherpaONNXFeatureConfig: Sendable {
    let sampleRate: Float
    let featureDim: Int
    let dither: Float
}

/// Sherpa ONNX 在线模型配置
struct SherpaONNXOnlineModelConfig: Sendable {
    let transducer: SherpaONNXOnlineTransducerModelConfig
    let tokens: String
    let numThreads: Int
    let debug: Bool
    let provider: String
    let modelType: String
    let modelingUnit: String
}

/// Sherpa ONNX 在线转换器模型配置
struct SherpaONNXOnlineTransducerModelConfig: Sendable {
    let encoder: String
    let decoder: String
    let joiner: String
}

/// Legacy Sherpa 模型文件描述。
/// 仅保留给桥接层使用，不再参与 iOS 正式 ASR 主链路。
struct ModelFiles: Sendable {
    let encoder: URL
    let decoder: URL
    let joiner: URL
    let tokens: URL
}

// MARK: - 便利扩展

extension SherpaONNXOnlineRecognizerConfig {
    /// 创建默认的中文zipformer配置
    static func zipformerChinese(modelFiles: ModelFiles) -> SherpaONNXOnlineRecognizerConfig {
        return SherpaONNXOnlineRecognizerConfig(
            featConfig: SherpaONNXFeatureConfig(
                sampleRate: 16000.0,
                featureDim: 80,
                dither: 0.0
            ),
            modelConfig: SherpaONNXOnlineModelConfig(
                transducer: SherpaONNXOnlineTransducerModelConfig(
                    encoder: modelFiles.encoder.path,
                    decoder: modelFiles.decoder.path,
                    joiner: modelFiles.joiner.path
                ),
                tokens: modelFiles.tokens.path,
                numThreads: 2,
                debug: false,
                provider: "cpu",
                modelType: "zipformer",
                modelingUnit: "cjkchar"
            ),
            enableEndpoint: true,
            decodingMethod: "greedy_search"
        )
    }
}
