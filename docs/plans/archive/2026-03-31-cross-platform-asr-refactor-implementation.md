# Cross-Platform ASR Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 Android 与 iOS 的 ASR 子系统边界，Android 收口为 session controller + engine adapter，iOS 正式固定为 Apple Speech session controller，并完成构建与测试验证。

**Architecture:** Android 保留 Sherpa 主链路和系统 Speech 兜底，但统一由新的 session controller 管理；iOS 去掉旧 Sherpa 主链路概念，统一由 NativeSpeech session controller 对外提供状态和命令。UI 保持现有交互语义。

**Tech Stack:** Kotlin + Compose + Sherpa ONNX + Android SpeechRecognizer；Swift 6 + SwiftUI + SFSpeechRecognizer + AVAudioEngine

**2026-04-01 补充原则:** session controller 只负责会话编排；平台线程亲和性、音频会话、系统识别器生命周期等运行时约束必须由 engine adapter 自行吸收。

**2026-04-01 追加执行事实:**
- Android release 额外暴露出一个构建产物问题：Sherpa JNI 依赖 `com.k2fsa.sherpa.onnx` 配置类字段名，release 混淆必须显式 keep，否则会出现 `Failed to get field ID for decodingMethod`。
- Android 真机 fallback 受设备当前 `voice_recognition_service` 影响，因此“先保住 Sherpa 主链路”比“继续扩大系统 fallback 覆盖面”更优先。
- iOS 本轮活性与错误态 UX 已补齐，但权限声明、IPA 导出环境和 on-device 能力边界仍需要作为人工验收项保留。

---

## 文件结构

**Android 新建：**

- `android/app/src/main/java/com/wishpool/app/core/asr/AsrEngine.kt`
- `android/app/src/main/java/com/wishpool/app/core/asr/AsrSessionController.kt`
- `android/app/src/test/java/com/wishpool/app/core/asr/AsrSessionControllerTest.kt`

**Android 修改：**

- `android/app/src/main/java/com/wishpool/app/core/asr/SherpaAsrManager.kt`
- `android/app/src/main/java/com/wishpool/app/core/asr/AndroidAsrManager.kt`
- `android/app/src/main/java/com/wishpool/app/app/AppContainer.kt`

**iOS 新建：**

- `ios/Sources/WishpoolCore/SpeechRecognitionEngine.swift`
- `ios/Tests/WishpoolCoreTests/NativeSpeechASRManagerTests.swift`

**iOS 修改：**

- `ios/Sources/WishpoolCore/ASRManager.swift`
- `ios/Sources/WishpoolCore/NativeSpeechASRManager.swift`
- `ios/Sources/WishpoolApp/CreateWishSheetWithASR.swift`
- `ios/Sources/WishpoolApp/CreateWishDirectSheet.swift`
- `ios/Package.swift`

---

## 执行编排

### Wave 1（并行）

| Agent | Task | 文件边界 |
|---|---|---|
| Agent-Android | Android ASR session/controller 重构 | `android/app/src/main/java/com/wishpool/app/core/asr/**`, `android/app/src/test/java/com/wishpool/app/core/asr/**`, `android/app/src/main/java/com/wishpool/app/app/AppContainer.kt` |
| Agent-iOS | iOS Apple Speech session/controller 重构 | `ios/Sources/WishpoolCore/**`, `ios/Sources/WishpoolApp/CreateWish*`, `ios/Tests/WishpoolCoreTests/**`, `ios/Package.swift` |

### Wave 2（主线程串行）

| Agent | Task | 依赖 |
|---|---|---|
| 主线程 | 集成审查、跨端文档回填、统一验证 | Wave 1 全部完成 |

---

## Chunk 1: Android Refactor

### Task 1: 引入 Android ASR engine 契约与 session controller

**Files:**
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/AsrEngine.kt`
- Create: `android/app/src/main/java/com/wishpool/app/core/asr/AsrSessionController.kt`
- Test: `android/app/src/test/java/com/wishpool/app/core/asr/AsrSessionControllerTest.kt`

- [ ] **Step 1: 写失败测试，定义 controller 的核心行为**

测试至少覆盖：
- primary 成功时透传结果
- primary 报错时切 fallback
- reset 后状态回到 idle

- [ ] **Step 2: 运行定向测试，确认失败原因正确**

Run: `cd android && ./gradlew testDebugUnitTest --tests 'com.wishpool.app.core.asr.AsrSessionControllerTest'`
Expected: FAIL，缺少 controller / 契约实现

- [ ] **Step 3: 新建 `AsrEngine.kt`**

定义 engine 契约，最少包含：
- `val state: StateFlow<AsrState>`
- `suspend fun startRecording()`
- `suspend fun stopRecording()`
- `suspend fun reset()`
- `fun warmUp()`

- [ ] **Step 4: 新建 `AsrSessionController.kt` 最小实现**

要求：
- 实现 `AsrManager`
- 接受 `primary` 与可选 `fallback`
- 统一暴露状态流
- 接管 fallback 触发与状态转发

- [ ] **Step 5: 跑定向测试，确认转绿**

Run: `cd android && ./gradlew testDebugUnitTest --tests 'com.wishpool.app.core.asr.AsrSessionControllerTest'`
Expected: PASS

### Task 2: 让现有 Android 引擎退回 adapter 层

**Files:**
- Modify: `android/app/src/main/java/com/wishpool/app/core/asr/SherpaAsrManager.kt`
- Modify: `android/app/src/main/java/com/wishpool/app/core/asr/AndroidAsrManager.kt`
- Modify: `android/app/src/main/java/com/wishpool/app/app/AppContainer.kt`

- [ ] **Step 1: 让 Sherpa / Android Speech 实现 engine 契约**
- [ ] **Step 2: 保持外部状态语义不变**
- [ ] **Step 3: 将 `AppContainer` 改为注入 `AsrSessionController`**
- [ ] **Step 4: 跑 ASR 核心单测**

Run: `cd android && ./gradlew testDebugUnitTest --tests 'com.wishpool.app.core.asr.*'`
Expected: PASS

- [ ] **Step 5: 跑 Android 全量单测与构建**

Run: `cd android && ./gradlew testDebugUnitTest assembleDebug`
Expected: PASS

---

## Chunk 2: iOS Refactor

### Task 3: 抽离 iOS Speech engine 契约

**Files:**
- Create: `ios/Sources/WishpoolCore/SpeechRecognitionEngine.swift`
- Modify: `ios/Sources/WishpoolCore/ASRManager.swift`
- Test: `ios/Tests/WishpoolCoreTests/NativeSpeechASRManagerTests.swift`

- [ ] **Step 1: 写失败测试，锁定 session controller 行为**

测试至少覆盖：
- engine 成功更新 partial/result 时，manager 同步输出状态
- reset 会清空状态
- permission / error 会原样暴露

- [ ] **Step 2: 运行定向测试，确认失败**

Run: `cd ios && swift test --filter NativeSpeechASRManagerTests`
Expected: FAIL，缺少新契约 / 新行为

- [ ] **Step 3: 在 `ASRManager.swift` 中只保留协议与共享类型边界**
- [ ] **Step 4: 新建 `SpeechRecognitionEngine.swift`**

### Task 4: 将 NativeSpeechASRManager 收口为 Apple Speech session controller

**Files:**
- Modify: `ios/Sources/WishpoolCore/NativeSpeechASRManager.swift`
- Modify: `ios/Sources/WishpoolApp/CreateWishSheetWithASR.swift`
- Modify: `ios/Sources/WishpoolApp/CreateWishDirectSheet.swift`
- Modify: `ios/Package.swift`

- [ ] **Step 1: 将 `NativeSpeechASRManager` 改为 controller + engine 组合**
- [ ] **Step 2: 明确 Apple Speech 为唯一正式引擎**
- [ ] **Step 3: 去掉旧 Sherpa 主链路概念对 UI 的影响**
- [ ] **Step 4: 保持现有 UI 状态语义**
- [ ] **Step 5: 跑 iOS 测试与构建**

Run: `cd ios && swift test`
Expected: PASS

Run: `cd ios && swift build`
Expected: PASS

---

## Chunk 3: 集成与文档回填

### Task 5: 统一验证与回填

**Files:**
- Modify: `docs/plans/2026-03-31-cross-platform-asr-refactor-design.md`
- Modify: `docs/plans/2026-03-31-cross-platform-asr-refactor-implementation.md`
- Modify: `docs/progress/development.md`

- [ ] **Step 1: 重新运行 Android 验证**

Run: `cd android && ./gradlew testDebugUnitTest assembleDebug`
Expected: PASS

- [ ] **Step 2: 重新运行 iOS 验证**

Run: `cd ios && swift test && swift build`
Expected: PASS

- [ ] **Step 3: 回填文档中的最终文件结构、验证结果、剩余风险**

- [ ] **Step 4: 记录一个已知限制**

`真机语音权限与端到端识别仍需要设备侧人工验收`

- [ ] **Step 5: 回填平台运行时约束**

明确记录：
- Android `SpeechRecognizer` create/start/stop/destroy 必须由 adapter 收口到 Main thread
- iOS Apple Speech adapter 必须自持 `AVAudioSession` / `AVAudioEngine` / timer / callback 生命周期

---

## 执行回填

### 已完成项

- [x] Android `AsrSessionController + AsrEngine` 重构完成
- [x] Android 注入链路从旧 fallback manager 切为新的 session controller
- [x] iOS `NativeSpeechASRManager + AppleSpeechRecognitionEngine` 重构完成
- [x] iOS 正式主链路固定为 Apple Speech
- [x] 两端文档落盘

### 最终验证

- Android：
  - Run: `cd android && ./gradlew testDebugUnitTest assembleDebug`
  - Result: `BUILD SUCCESSFUL`

- iOS：
  - 历史重构验收：文档原记录为 `swift test && swift build` 通过
  - 2026-04-01 当前环境复核：
  - Run: `cd ios && swift build`
  - Result: `Build complete!`
  - Run: `cd ios && swift test`
  - Result: 当前机器失败，报错 `no such module 'Testing'`
  - Environment: `xcode-select -p` 指向 `/Library/Developer/CommandLineTools`
  - Judgment: 这是当前本机 iOS 测试工具链问题，不是本轮 ASR 线程复核发现的新代码回归
  - Warning: `Sources/WishpoolApp/Info.plist` 仍是未声明 resource 的既有 warning

### 2026-04-01 追加复核结论

- Android 新增事实：`SpeechRecognizer` fallback 启动必须在 Main thread，已通过 `AndroidAsrManager` 封装修正。
- Android 新增事实：Sherpa release 还存在 JNI / 混淆耦合，已通过补充 `proguard keep` 规则处理。
- Android 新增事实：当前 Samsung 真机默认 `voice_recognition_service` 指向第三方服务，因此 fallback 结果不能当作本地主链路正确性的证据。
- iOS 当前未发现与 Android 同类的已确认 bug。
- iOS 架构上仍应显式坚持同一原则：`AppleSpeechRecognitionEngine` 自己负责 `AVAudioSession`、`AVAudioEngine`、定时器和 callback 线程/生命周期，不把这些约束向上泄漏。
- 如果后续要继续硬化，最小方向是为 iOS engine 增加 actor / 线程亲和性约束说明或测试，而不是把平台细节重新抬回 session controller。
- iOS 当前补充边界：`noProgressTimeout` 与 direct mode retry 已落地，但 `Info.plist` 权限、IPA 导出环境、on-device 设备支持范围仍需人工收口。

### 已知限制

- 真机语音识别、系统权限弹窗、音频中断恢复仍需设备侧人工验收
