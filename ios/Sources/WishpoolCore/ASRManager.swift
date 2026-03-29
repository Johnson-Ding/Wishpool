import Foundation
import Combine
#if canImport(AVFoundation)
@preconcurrency import AVFoundation
#endif

/// ASR管理器协议，与Android端AsrManager.kt保持接口一致
/// 对应路径: android/app/src/main/java/com/wishpool/app/core/asr/AsrManager.kt
public protocol ASRManager: ObservableObject {
    /// ASR状态流，对应Android: val state: StateFlow<AsrState>
    var state: ASRState { get }

    /// ASR状态发布器，用于SwiftUI绑定
    var statePublisher: Published<ASRState>.Publisher { get }

    /// 开始录音，对应Android: suspend fun startRecording()
    func startRecording() async

    /// 停止录音，对应Android: suspend fun stopRecording()
    func stopRecording() async

    /// 重置状态，对应Android: suspend fun reset()
    func reset() async

    /// 预热模型，对应Android: fun warmUp()
    func warmUp()
}

/// Sherpa ONNX ASR管理器实现
/// 对应Android: class SherpaAsrManager
public class SherpaASRManager: ASRManager, @unchecked Sendable {
    @Published public private(set) var state: ASRState = .idle

    public var statePublisher: Published<ASRState>.Publisher { $state }

    // MARK: - 私有属性

    private let modelManager: ModelManager
    private let audioRecordManager: AudioRecordManager
    private var recognizer: SherpaONNXRecognizer?
    private var stream: SherpaONNXStream?
    private var latestText: String = ""
    private var isStopping: Bool = false

    // MARK: - 初始化

    public init(modelManager: ModelManager = DefaultModelManager(),
                audioRecordManager: AudioRecordManager = DefaultAudioRecordManager()) {
        self.modelManager = modelManager
        self.audioRecordManager = audioRecordManager
        setupAudioRecordCallback()
    }

    // MARK: - ASRManager协议实现

    public func startRecording() async {
        guard stream == nil && !isStopping else { return }

        do {
            // 检查麦克风权限
            let hasPermission = await requestMicrophonePermission()
            guard hasPermission else {
                state = .permissionRequired
                return
            }

            // 下载和准备模型
            state = .downloading(progress: 0.0)
            let modelFiles = try await modelManager.prepareModel { progress in
                DispatchQueue.main.async {
                    self.state = .downloading(progress: progress)
                }
            }

            // 创建识别器和流
            let activeRecognizer = try createRecognizer(modelFiles: modelFiles)
            let activeStream = try activeRecognizer.createStream()

            recognizer = activeRecognizer
            stream = activeStream
            latestText = ""
            state = .recording(partialText: "")

            // 开始录音
            try await audioRecordManager.startRecording()

        } catch {
            await releaseSession()
            state = .error(message: error.localizedDescription)
        }
    }

    public func stopRecording() async {
        guard stream != nil && !isStopping else { return }
        isStopping = true

        do {
            state = .processing(partialText: latestText)

            // 停止录音
            await audioRecordManager.stopRecording()

            // 获取最终结果
            if let finalStream = stream, let finalRecognizer = recognizer {
                do {
                    let result = try finalRecognizer.getResult(finalStream)
                    if !result.text.isEmpty {
                        latestText = result.text
                    }
                } catch {
                    print("获取最终识别结果失败: \(error)")
                }
            }

            if latestText.isEmpty {
                state = .error(message: "未识别到有效语音，请再试一次")
            } else {
                state = .result(text: latestText)
            }

        } catch {
            state = .error(message: error.localizedDescription)
        }

        await releaseSession()
        isStopping = false
    }

    public func reset() async {
        isStopping = false
        latestText = ""
        await audioRecordManager.stopRecording()
        await releaseSession()
        state = .idle
    }

    public func warmUp() {
        guard !modelManager.hasPreparedModel() else { return }

        Task {
            do {
                _ = try await modelManager.prepareModel(progressCallback: nil)
            } catch {
                // 预热失败不影响主流程，仅记录日志
                print("ASR warmUp failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - 私有方法

    private func setupAudioRecordCallback() {
        audioRecordManager.onAudioSamples = { [weak self] samples in
            await self?.processAudioSamples(samples)
        }
    }

    private func processAudioSamples(_ samples: [Float]) async {
        guard let activeRecognizer = recognizer,
              let activeStream = stream else { return }

        do {
            // 喂入音频数据
            try activeStream.acceptWaveform(samples: samples, sampleRate: DefaultAudioRecordManager.sampleRate)

            // 解码处理
            while activeRecognizer.isReady(activeStream) {
                try activeRecognizer.decode(activeStream)
            }

            // 获取部分结果
            let partialText = try activeRecognizer.getResult(activeStream).text.trimmingCharacters(in: .whitespacesAndNewlines)
            if !partialText.isEmpty {
                latestText = partialText
            }

            await MainActor.run {
                state = .recording(partialText: partialText)
            }

            // 检查是否到达端点
            if activeRecognizer.isEndpoint(activeStream) && !partialText.isEmpty {
                await stopRecording()
            }

        } catch {
            await MainActor.run {
                state = .error(message: "音频处理失败: \(error.localizedDescription)")
            }
        }
    }

    private func createRecognizer(modelFiles: ModelFiles) throws -> SherpaONNXRecognizer {
        // 使用桥接层的便利配置方法，与Android端保持一致
        let config = SherpaONNXOnlineRecognizerConfig.zipformerChinese(modelFiles: modelFiles)
        return try SherpaONNXRecognizer(config: config)
    }

    private func releaseSession() async {
        stream?.release()
        recognizer?.release()
        stream = nil
        recognizer = nil
    }

    private func requestMicrophonePermission() async -> Bool {
        // iOS麦克风权限申请逻辑
        // 这里需要根据实际的权限管理实现
        return await withCheckedContinuation { continuation in
            // 实际实现中需要使用AVAudioSession或其他权限管理方案
            continuation.resume(returning: true) // 临时返回true
        }
    }
}

// MARK: - 相关模型定义

/// 模型文件信息，对应Android的SherpaModelFiles
public struct ModelFiles {
    let encoder: URL
    let decoder: URL
    let joiner: URL
    let tokens: URL
}

/// 模型管理器协议，对应Android的ModelManager
public protocol ModelManager: Sendable {
    func prepareModel(progressCallback: (@Sendable (Float) -> Void)?) async throws -> ModelFiles
    func hasPreparedModel() -> Bool
}

/// 音频录制管理器协议，对应Android的AudioPcmSource
public protocol AudioRecordManager: AnyObject, Sendable {
    static var sampleRate: Float { get }
    var onAudioSamples: (@Sendable ([Float]) async -> Void)? { get set }

    func startRecording() async throws
    func stopRecording() async
}

// MARK: - 占位实现（实际使用时需要完整实现）

public class DefaultModelManager: ModelManager, @unchecked Sendable {
    private let modelDirectory = "sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23"
    private var cachedModelFiles: ModelFiles?

    public init() {}

    public func prepareModel(progressCallback: (@Sendable (Float) -> Void)?) async throws -> ModelFiles {
        // 如果已经缓存了，直接返回
        if let cached = cachedModelFiles {
            progressCallback?(1.0)
            return cached
        }

        let modelURL = try findModelDirectory()
        let modelFiles = try createModelFiles(from: modelURL)
        cachedModelFiles = modelFiles
        progressCallback?(1.0)
        return modelFiles
    }

    private func findModelDirectory() throws -> URL {
        // 1. 尝试从Bundle中查找
        let bundle = Bundle.main
        if let modelsPath = bundle.path(forResource: modelDirectory, ofType: nil, inDirectory: "Models/asr") {
            return URL(fileURLWithPath: modelsPath)
        }

        // 2. 尝试从当前源码目录查找软链接
        let currentPath = URL(fileURLWithPath: #file).deletingLastPathComponent()
        let asrModelsPath = currentPath.appendingPathComponent("ASRModels")
        if FileManager.default.fileExists(atPath: asrModelsPath.path) {
            return asrModelsPath
        }

        // 3. 尝试从项目根目录查找（开发时）
        let workingPath = FileManager.default.currentDirectoryPath
        let searchPaths = [
            "Models/asr/\(modelDirectory)",
            "../Models/asr/\(modelDirectory)",
            "../../Models/asr/\(modelDirectory)",
            "ios/Models/asr/\(modelDirectory)"
        ]

        for relativePath in searchPaths {
            let fullPath = URL(fileURLWithPath: workingPath).appendingPathComponent(relativePath)
            if FileManager.default.fileExists(atPath: fullPath.path) {
                return fullPath
            }
        }

        throw NSError(domain: "ASR", code: -1, userInfo: [
            NSLocalizedDescriptionKey: """
            找不到ASR模型文件。请确保模型已下载到以下位置之一：
            - Bundle: Models/asr/\(modelDirectory)
            - 项目根目录: Models/asr/\(modelDirectory)

            当前搜索路径：\(workingPath)
            """
        ])
    }

    public func hasPreparedModel() -> Bool {
        if cachedModelFiles != nil {
            return true
        }

        // 尝试查找模型目录
        return (try? findModelDirectory()) != nil
    }

    private func createModelFiles(from modelURL: URL) throws -> ModelFiles {
        let fileManager = FileManager.default

        // 查找模型文件
        let encoder = try findModelFile(in: modelURL, prefix: "encoder", fileManager: fileManager)
        let decoder = try findModelFile(in: modelURL, prefix: "decoder", fileManager: fileManager)
        let joiner = try findModelFile(in: modelURL, prefix: "joiner", fileManager: fileManager)
        let tokens = modelURL.appendingPathComponent("tokens.txt")

        // 验证tokens.txt存在
        guard fileManager.fileExists(atPath: tokens.path) else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "找不到tokens.txt文件：\(tokens.path)"
            ])
        }

        return ModelFiles(encoder: encoder, decoder: decoder, joiner: joiner, tokens: tokens)
    }

    private func findModelFile(in directory: URL, prefix: String, fileManager: FileManager) throws -> URL {
        guard let files = try? fileManager.contentsOfDirectory(atPath: directory.path) else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "无法读取模型目录：\(directory.path)"
            ])
        }

        // Android端使用int8量化版本，iOS也优先使用int8版本以保持一致
        let preferredFile = files.first { name in
            name.lowercased().hasPrefix(prefix.lowercased()) &&
            name.lowercased().contains("int8") &&
            name.hasSuffix(".onnx")
        }

        if let fileName = preferredFile {
            return directory.appendingPathComponent(fileName)
        }

        // 如果没有int8版本，查找普通版本
        let fallbackFile = files.first { name in
            name.lowercased().hasPrefix(prefix.lowercased()) && name.hasSuffix(".onnx")
        }

        guard let fileName = fallbackFile else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "找不到\(prefix)模型文件在：\(directory.path)"
            ])
        }

        return directory.appendingPathComponent(fileName)
    }
}

public class DefaultAudioRecordManager: AudioRecordManager, @unchecked Sendable {
    public static let sampleRate: Float = 16000.0
    public var onAudioSamples: (@Sendable ([Float]) async -> Void)?

    public init() {}

    #if os(iOS) || os(watchOS) || os(tvOS)
    private let audioEngine = AVAudioEngine()
    private let audioSession = AVAudioSession.sharedInstance()
    private var inputNode: AVAudioInputNode?
    #elseif os(macOS)
    private let audioEngine = AVAudioEngine()
    private var inputNode: AVAudioInputNode?
    #endif
    private var isRecording = false

    public func startRecording() async throws {
        guard !isRecording else { return }

        #if os(iOS) || os(watchOS) || os(tvOS)
        try await setupAudioSession()
        #endif
        try setupAudioEngine()

        isRecording = true
        try audioEngine.start()
    }

    public func stopRecording() async {
        guard isRecording else { return }

        isRecording = false
        audioEngine.stop()
        inputNode?.removeTap(onBus: 0)
        inputNode = nil
    }

    #if os(iOS) || os(watchOS) || os(tvOS)
    private func setupAudioSession() async throws {
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
    }
    #endif

    private func setupAudioEngine() throws {
        guard !audioEngine.isRunning else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "音频引擎已在运行"
            ])
        }

        inputNode = audioEngine.inputNode
        guard let inputNode = inputNode else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "无法获取音频输入节点"
            ])
        }

        let inputFormat = inputNode.outputFormat(forBus: 0)

        // 配置音频格式为16kHz单声道，匹配Sherpa ONNX要求
        guard let targetFormat = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: Double(Self.sampleRate),
            channels: 1,
            interleaved: false
        ) else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "无法创建目标音频格式"
            ])
        }

        // 创建格式转换器
        guard let converter = AVAudioConverter(from: inputFormat, to: targetFormat) else {
            throw NSError(domain: "ASR", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "无法创建音频格式转换器"
            ])
        }

        let bufferSize = 1024
        inputNode.installTap(onBus: 0, bufferSize: AVAudioFrameCount(bufferSize), format: inputFormat) { [weak self] buffer, when in
            self?.processAudioBuffer(buffer, converter: converter, targetFormat: targetFormat)
        }

        audioEngine.prepare()
    }

    private func processAudioBuffer(_ buffer: AVAudioPCMBuffer, converter: AVAudioConverter, targetFormat: AVAudioFormat) {
        guard let onAudioSamples = onAudioSamples else { return }

        // 计算转换后的帧数
        let inputFrames = buffer.frameLength
        let outputCapacity = AVAudioFrameCount(Double(inputFrames) * targetFormat.sampleRate / buffer.format.sampleRate)

        guard let outputBuffer = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: outputCapacity) else {
            return
        }

        var error: NSError?
        let inputBuffer = buffer
        converter.convert(to: outputBuffer, error: &error) { packetCount, outStatus in
            outStatus.pointee = .haveData
            return inputBuffer
        }

        if error != nil {
            return
        }

        // 提取Float32数据
        guard let channelData = outputBuffer.floatChannelData?[0] else { return }
        let frameCount = Int(outputBuffer.frameLength)
        let samples = Array(UnsafeBufferPointer(start: channelData, count: frameCount))

        // 异步发送音频数据
        Task { @MainActor in
            await onAudioSamples(samples)
        }
    }
}

// 占位实现已被SherpaONNXBridge.swift中的真实桥接实现替代