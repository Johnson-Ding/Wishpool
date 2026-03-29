# iOS ASR 集成计划

**日期**: 2026-03-29
**需求**: iOS 端集成 Sherpa ONNX ASR 系统，使用与 Android 相同的 zipformer-zh-14M 模型，实现跨端一致的语音识别体验

## 目标和边界

**一句话目标**：在 iOS 端集成 Sherpa ONNX ASR 系统，实现与 Android v0.3.4 完全对齐的双模式语音交互：语音直发模式 + 语音转录编辑模式

**改动范围**：
- iOS 端的语音识别基础设施（新建 ASR 模块）
- **双模式语音界面**：
  - CreateWishDirectSheet.swift — 语音直发模式（对应Android DirectPublishSheet）
  - CreateWishSheetWithASR.swift — 语音转录编辑模式（对应Android PublisherSheet）
- FAB 交互逻辑：单击→直发模式，长按→编辑模式
- 权限申请（麦克风使用权限）
- SPM 依赖配置和 Sherpa ONNX iOS 框架集成

**不改什么**：
- CreateWishSheet.swift 的 UI 结构和视觉样式保持现有设计风格
- 其他端（Web/Android）不涉及
- 后端接口和数据模型不变
- 用户交互流程与 Android 保持一致（按住说话 → 松开处理 → 文本显示）

## 技术方案对比

### 方案选择

**✅ Sherpa ONNX iOS版（推荐）**
- 优势：与 Android 技术栈完全一致，使用相同的 zipformer-zh-14M 模型
- 优势：端侧处理，无需网络，隐私友好
- 优势：官方提供 iOS 支持，有完整文档和示例
- 劣势：需要编译 iOS 框架，增加 APP 体积 ~50MB

**❌ iOS 原生 Speech 框架**
- 优势：系统集成，无需额外依赖
- 劣势：需要网络连接，隐私审核复杂
- 劣势：与 Android 端技术栈不一致，识别结果可能存在差异

## 文件结构

**新建：**
- `ios/Sources/WishpoolCore/ASR/` — ASR 基础设施模块
  - `ASRManager.swift` — Sherpa ONNX Swift 封装，对应 Android 的 AsrManager.kt
  - `ASRState.swift` — ASR 状态枚举，与 Android AsrState.kt 保持一致
  - `AudioRecordManager.swift` — AVAudioEngine 录音管理，对应 Android AudioRecordManager.kt
  - `ModelManager.swift` — 模型下载、缓存、初始化管理
  - `SherpaONNXBridge.swift` — Sherpa ONNX C++ 接口桥接
- `ios/Frameworks/` — Sherpa ONNX iOS 框架存放目录
  - `sherpa-onnx.xcframework` — Sherpa ONNX iOS 框架
  - `ios-onnxruntime.xcframework` — ONNX Runtime iOS 框架

**修改：**
- `ios/Package.swift` — 添加音频处理相关依赖
- `ios/Sources/WishpoolApp/CreateWishSheet.swift` — 添加语音输入模式切换
- `ios/Sources/WishpoolApp/WishpoolAppModel.swift` — 集成 ASR 管理器
- `ios/Info.plist` — 添加麦克风使用权限说明

**不动：**
- `ios/Sources/WishpoolCore/Theme.swift` 等设计系统文件 — UI 样式保持现有设计
- `ios/Sources/WishpoolCore/WishModels.swift` 等领域模型 — 业务模型不受影响

## Task 执行清单

### Task 1: 搭建 Sherpa ONNX iOS 环境

**目标：** 下载编译 Sherpa ONNX iOS 框架，配置基础依赖环境

**Files：**
- Create: `ios/Frameworks/sherpa-onnx.xcframework`
- Create: `ios/Frameworks/ios-onnxruntime.xcframework`
- Modify: `ios/Package.swift`

**Steps：**
1. 从 GitHub k2-fsa/sherpa-onnx 下载最新 Release
2. 按官方文档编译 iOS 框架：`sherpa-onnx.xcframework` 和 `ios-onnxruntime.xcframework`
3. 在 Package.swift 中添加框架引用和音频处理依赖
4. 配置麦克风权限：在 Info.plist 添加 NSMicrophoneUsageDescription

**Verify：**
- `swift build` → 构建成功
- 框架正确链接，无符号缺失错误

**Commit：** `feat(ios): add Sherpa ONNX frameworks and audio dependencies`

### Task 2: 创建 ASR 核心模块

**目标：** 建立 iOS ASR 基础设施，定义与 Android 一致的状态管理接口

**Files：**
- Create: `ios/Sources/WishpoolCore/ASR/ASRState.swift`
- Create: `ios/Sources/WishpoolCore/ASR/ASRManager.swift`
- Create: `ios/Sources/WishpoolCore/ASR/AudioRecordManager.swift`

**Steps：**
1. 创建 ASRState.swift，定义与 Android 完全一致的状态枚举：`enum ASRState { case idle, permissionRequired, downloading(Float), recording(String), processing(String), result(String), error(String) }`
2. 创建 ASRManager.swift 协议，定义 `startRecording()`, `stopRecording()`, `reset()`, `warmUp()` 等方法，返回 `@Published var state: ASRState`
3. 创建 AudioRecordManager.swift，使用 AVAudioEngine 实现音频录制功能

**Verify：**
- `swift build` → 构建成功
- Swift 代码无编译错误，API 接口与 Android 保持对应关系

**Commit：** `feat(ios): create ASR core module with state management`

### Task 3: 实现 Sherpa ONNX 集成

**目标：** 实现完整的 Sherpa ONNX ASR 功能，使用与 Android 相同的模型

**Files：**
- Create: `ios/Sources/WishpoolCore/ASR/ModelManager.swift`
- Create: `ios/Sources/WishpoolCore/ASR/SherpaONNXBridge.swift`
- Modify: `ios/Sources/WishpoolCore/ASR/ASRManager.swift`

**Steps：**
1. 实现 ModelManager.swift：下载和管理 zipformer-zh-14M 模型（与 Android 使用相同模型）
2. 创建 SherpaONNXBridge.swift：封装 Sherpa ONNX C++ API 为 Swift 接口
3. 在 ASRManager 中实现完整的识别流程：模型初始化 → 音频流处理 → 实时转录 → 最终结果
4. 实现与 Android 一致的端点检测和自动停止逻辑
5. 添加错误处理（权限被拒、模型下载失败等）

**Verify：**
- 构建成功且应用启动正常
- 在 Xcode Console 中能看到模型加载成功的日志
- ASR 基础功能可通过简单测试验证（录音 → 识别 → 文本输出）

**Commit：** `feat(ios): implement complete ASR functionality with Sherpa ONNX`

### Task 4: 改造 CreateWishSheet 添加语音输入

**目标：** 在 CreateWishSheet 中添加语音输入功能，保持与 Android PublisherSheet 的 UX 一致性

**Files：**
- Modify: `ios/Sources/WishpoolApp/CreateWishSheet.swift`
- Modify: `ios/Sources/WishpoolApp/WishpoolAppModel.swift`

**Steps：**
1. 在 WishpoolAppModel 中注入 ASRManager 实例
2. 在 CreateWishSheet 中添加语音输入模式切换（文本输入 ↔ 语音输入）
3. 使用 `@StateObject` 监听 ASRManager 的状态变化
4. 根据 ASRState 更新 UI：Recording → 显示录音动画，Processing → 处理中动画，Result → 自动填入文本框
5. 添加麦克风权限申请 UI 流程
6. 保持与 Android PublisherSheet 一致的视觉反馈和交互逻辑

**Verify：**
- `swift build` → 构建成功
- 手动测试：打开应用 → 点击发愿 → 切换语音输入 → 授权麦克风 → 说话 → 能看到实时转录并自动填入
- 真实语音"我想去海边放松一下"能正确识别为文本并填入愿望输入框

**Commit：** `feat(ios): connect CreateWishSheet to ASR system with voice input mode`

### Task 5: 跨端一致性验证和优化

**目标：** 验证 iOS 与 Android ASR 功能一致性，优化性能和用户体验

**Files：**
- Modify: `ios/Sources/WishpoolCore/ASR/ASRManager.swift`
- Create: `docs/testing/asr-cross-platform-validation.md`

**Steps：**
1. 对比测试：相同语音在 iOS 和 Android 端的识别结果一致性
2. 性能优化：模型预加载、内存管理、低端设备适配
3. 边界情况处理：无网络提示、存储空间不足、权限被拒等
4. 建立跨端 ASR 功能验证标准文档
5. 添加错误恢复和用户引导逻辑

**Verify：**
- iOS 和 Android 端相同语音识别结果差异 < 5%
- 应用在不同 iOS 设备上流畅运行
- 错误场景有合适的用户提示和恢复机制

**Commit：** `feat(ios): optimize ASR performance and cross-platform consistency`

## 交付标准

- 所有 tasks 完成且能构建成功
- iOS 端语音识别功能与 Android 端体验一致
- 手动测试通过：语音录制 → 实时转录 → 文字填入愿望表单
- 跨端验证：相同语音在两端识别结果基本一致
- 最终输出可运行的 iOS 应用供验证

## 技术备注

**模型一致性**: 使用与 Android 完全相同的 zipformer-zh-14M 模型（24.5MB），确保识别结果一致
**集成方式**: Sherpa ONNX iOS 框架 + Swift API 封装（官方推荐）
**内存估算**: ~50MB（与 Android 端一致）
**最低支持**: iOS 13.0（符合 Sherpa ONNX 最低要求）
**构建要求**: Xcode 14.2+，支持 Swift 6

## 风险与缓解

**风险1**: Sherpa ONNX iOS 编译复杂
- 缓解：使用官方预编译 Release 包，避免源码编译

**风险2**: 应用体积增加显著
- 缓解：模型按需下载，不打包到应用内

**风险3**: iOS App Store 审核
- 缓解：端侧处理，无隐私风险；提供详细的麦克风使用说明