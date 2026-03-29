# Android ASR 集成计划

**日期**: 2026-03-29
**需求**: Android 端集成 Sherpa ONNX ASR 系统，使用 zipformer-zh-14M 模型（24.5MB）替换当前 PublisherSheet.kt 中的 mock ASR 实现

## 目标和边界

**一句话目标**：在 Android 端集成 Sherpa ONNX ASR 系统，使用 zipformer-zh-14M 模型（24.5MB）实现纯端侧中文语音识别，替换 PublisherSheet.kt 中的 mock ASR

**改动范围**：
- Android 端的语音识别基础设施（新建 core/asr 模块）
- PublisherSheet.kt 的 ASR 状态机（mock → 真实）
- 权限申请（RECORD_AUDIO）
- Gradle 依赖配置

**不改什么**：
- PublisherSheet.kt 的 UI 结构和视觉样式保持不变
- 其他端（Web/iOS）暂不涉及
- 后端接口和数据模型不变
- 用户交互流程不变（按住说话 → 松开处理 → 文本显示）

## 文件结构

**新建：**
- `android/app/src/main/java/com/wishpool/app/core/asr/` — ASR 基础设施模块
  - `AsrManager.kt` — Sherpa ONNX 封装，负责模型管理、录音、识别
  - `AsrState.kt` — ASR 状态数据类（录音中、识别中、完成、错误）
  - `AudioRecordManager.kt` — AudioRecord 录音管理
  - `ModelManager.kt` — 模型下载、缓存、初始化
- `android/app/src/main/assets/` — 模型文件存放目录（如果选择打包）
- `android/app/src/main/jniLibs/arm64-v8a/` — Sherpa ONNX .so 文件

**修改：**
- `android/app/src/main/AndroidManifest.xml` — 添加 RECORD_AUDIO 权限
- `android/app/build.gradle.kts` — 添加 Sherpa ONNX 相关依赖配置
- `android/app/src/main/java/com/wishpool/app/feature/home/PublisherSheet.kt` — 移除 mock，接入真实 ASR

**不动：**
- `designsystem/` 相关文件 — UI 样式保持现有设计
- `domain/` 和 `data/` — 业务模型和数据层不受影响

## Task 执行清单

### Task 1: 添加 ASR 权限和依赖

**目标：** 添加语音录制权限和 Sherpa ONNX 依赖配置，为 ASR 集成做基础准备

**Files：**
- Modify: `android/app/src/main/AndroidManifest.xml`
- Modify: `android/app/build.gradle.kts`

**Steps：**
1. 在 AndroidManifest.xml 添加 `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
2. 在 build.gradle.kts 依赖中添加文件操作和协程支持
3. 创建 jniLibs 目录结构准备放置 .so 文件

**Verify：**
- `./gradlew app:assembleDebug` → 构建成功
- 权限在 Manifest 中正确声明

**Commit：** `feat(android): add ASR permissions and dependencies`

### Task 2: 创建 ASR 核心模块

**目标：** 建立 ASR 基础设施模块，定义状态和接口但不包含 Sherpa ONNX 具体实现

**Files：**
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/AsrState.kt`
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/AsrManager.kt`
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/AudioRecordManager.kt`

**Steps：**
1. 创建 AsrState.kt 定义状态密封类：`sealed class AsrState { object Idle, object Recording, data class Processing, data class Result(text: String), data class Error }`
2. 创建 AsrManager.kt 接口，定义 `startRecording()`, `stopRecording()`, `getStateFlow()` 等方法
3. 创建 AudioRecordManager.kt，实现基础的 AudioRecord 录音功能

**Verify：**
- `./gradlew app:assembleDebug` → 构建成功
- Kotlin 代码无编译错误，API 接口清晰

**Commit：** `feat(android): create ASR core module with state management`

### Task 3: 集成 Sherpa ONNX 和模型管理

**目标：** 下载 Sherpa ONNX 预编译文件，实现模型下载和管理功能

**Files：**
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/ModelManager.kt`
- Create: `android/app/src/main/jniLibs/arm64-v8a/libsherpa-onnx-jni.so`
- Create: Sherpa ONNX Kotlin API 文件

**Steps：**
1. 从 GitHub Releases 下载 `sherpa-onnx-v1.x.x-android.tar.bz2`
2. 解压并复制 `.so` 文件到 `jniLibs/arm64-v8a/`
3. 复制 Kotlin API 源码到 `core/asr/sherpa/` 目录
4. 实现 ModelManager.kt：模型下载、解压、缓存逻辑
5. 加载原生库：`System.loadLibrary("sherpa-onnx-jni")`

**Verify：**
- `./gradlew app:assembleDebug` → 构建成功
- 应用启动时能成功加载 .so 文件（无 UnsatisfiedLinkError）

**Commit：** `feat(android): integrate Sherpa ONNX library and model management`

### Task 4: 实现完整 ASR 功能

**目标：** 在 AsrManager 中实现完整的 Sherpa ONNX ASR 流程

**Files：**
- Modify: `android/app/src/main/java/com/wishpool/app/core/asr/AsrManager.kt`

**Steps：**
1. 实现 zipformer-zh-14M 模型的初始化逻辑
2. 在 startRecording() 中启动 AudioRecord 和 OnlineRecognizer 流式识别
3. 在音频回调中喂入数据到 recognizer stream
4. 实现实时转录结果更新到 StateFlow
5. 在 stopRecording() 中完成识别并返回最终结果
6. 添加错误处理（权限被拒、模型加载失败等）

**Verify：**
- 构建成功且应用启动正常
- 在 logcat 中能看到模型加载成功的日志
- ASR 基础功能可独立测试（通过简单的测试 Activity 或单元测试）

**Commit：** `feat(android): implement complete ASR functionality with Sherpa ONNX`

### Task 5: 改造 PublisherSheet 接入真实 ASR

**目标：** 移除 mock ASR，接入真实的 AsrManager 实现

**Files：**
- Modify: `android/app/src/main/java/com/wishpool/app/feature/home/PublisherSheet.kt`

**Steps：**
1. 移除 mock transcription 的 LaunchedEffect 和硬编码文本
2. 注入 AsrManager 实例，监听权限状态
3. 在 Composable 中使用 `AsrManager.getStateFlow().collectAsState()` 监听识别状态
4. 根据 AsrState 更新 UI：Recording → 显示录音动画，Processing → 处理中，Result → 显示识别文本
5. 添加权限申请逻辑（使用已有的 accompanist-permissions）
6. 保持现有的 UI 样式和动画效果

**Verify：**
- `./gradlew app:assembleDebug` → 构建成功
- 手动测试：打开应用 → 点击发布 → 授权麦克风权限 → 说话 → 能看到实时转录文字
- 真实语音"我想去海边放松一下"能正确识别为文本

**Commit：** `feat(android): connect PublisherSheet to real ASR system`

### Task 6: 优化和测试

**目标：** ASR 性能优化和边界情况处理

**Files：**
- Modify: `android/app/src/main/java/com/wishpool/app/core/asr/AsrManager.kt`

**Steps：**
1. 添加模型预加载逻辑（应用启动时后台加载，首次使用时无延迟）
2. 优化内存管理（及时释放 recognizer 资源）
3. 处理边界情况：无网络时的提示、存储空间不足、低端设备性能问题
4. 添加断点续传的模型下载逻辑
5. 性能测试：验证在不同设备上的识别速度和准确率

**Verify：**
- 应用在低端设备（2GB RAM）上流畅运行
- 模型文件下载失败时有合适的提示和重试机制
- 长时间使用无内存泄漏

**Commit：** `feat(android): optimize ASR performance and edge case handling`

## 交付标准

- 所有 tasks 完成且能构建成功
- 手动测试通过：语音录制 → 实时转录 → 文字显示
- 最终输出 APK 文件供验证

## 技术备注

**模型选择**: zipformer-zh-14M 模型（24.5MB），纯中文，支持真流式识别
**集成方式**: 预编译 .so + Kotlin API 源码（官方推荐）
**内存估算**: ~50MB（相比 SenseVoice 的 300-400MB 大幅节省）
**最低支持**: Android API 28（项目当前配置，高于 Sherpa ONNX 的 API 21 要求）