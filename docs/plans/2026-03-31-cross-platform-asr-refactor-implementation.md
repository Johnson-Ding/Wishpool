# Cross-Platform ASR Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 Android 与 iOS 的 ASR 子系统边界，Android 收口为 session controller + engine adapter，iOS 正式固定为 Apple Speech session controller，并完成构建与测试验证。

**Architecture:** Android 保留 Sherpa 主链路和系统 Speech 兜底，但统一由新的 session controller 管理；iOS 去掉旧 Sherpa 主链路概念，统一由 NativeSpeech session controller 对外提供状态和命令。UI 保持现有交互语义。

**Tech Stack:** Kotlin + Compose + Sherpa ONNX + Android SpeechRecognizer；Swift 6 + SwiftUI + SFSpeechRecognizer + AVAudioEngine

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
  - Run: `cd ios && swift test && swift build`
  - Result: 测试与构建均通过
  - Warning: `Sources/WishpoolApp/Info.plist` 仍是未声明 resource 的既有 warning

### 已知限制

- 真机语音识别、系统权限弹窗、音频中断恢复仍需设备侧人工验收
