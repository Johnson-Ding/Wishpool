# Cross-Platform ASR Refactor Design

**日期**: 2026-03-31
**范围**: `android/` + `ios/`
**目标**: 收口 Android 与 iOS 的 ASR 子系统边界，统一为“会话控制器 + 引擎适配层 + 文本策略”的架构；iOS 主链路明确固定为 Apple Speech，不再让 Sherpa 概念停留在运行主路径上。

---

## 问题定义

当前 ASR 功能在两端都能“工作”，但存在明显的架构脆弱点：

1. UI 直接驱动录音生命周期，状态切换和权限/降级逻辑容易分散。
2. 引擎装配细节没有硬边界，Android 的文件模式 / assets 模式、iOS 的 Speech / 旧 Sherpa 概念都容易泄露到业务层。
3. 运行时主链路与降级链路虽然存在，但没有统一的 session orchestration。
4. 文本合并、状态展示、引擎选择、权限请求混杂在不同文件中，改动一个点容易牵动整条链路。

---

## 设计目标

### 1. 会话控制统一

所有录音开始、停止、重置、失败降级都由单一 session controller 负责。

### 2. 引擎边界收紧

- Android：Sherpa / Android Speech 都退到 engine adapter 层。
- iOS：Apple Speech 成为唯一正式运行引擎；旧 Sherpa 相关实现退出主链路。

### 3. UI 只依赖抽象

UI 只感知状态和命令，不感知引擎初始化、权限内部细节或降级策略细节。

### 4. 测试可定位

测试要能分别验证：

- session controller 的状态流转
- engine adapter 的契约行为
- UI 文本策略的稳定性
- 跨端主路径的构建与单元验证

---

## 目标架构

```mermaid
flowchart TD
    UI["PublisherSheet / DirectPublishSheet / CreateWishSheetWithASR / CreateWishDirectSheet"] --> Session["ASR Session Controller"]
    Session --> Engine["ASR Engine Protocol"]
    Session --> Merge["Text Merge Policy / UI Model"]

    Engine --> Primary["Primary Engine Adapter"]
    Engine --> Fallback["Fallback Engine Adapter"]

    Primary --> AndroidSherpa["Android Sherpa Engine"]
    Fallback --> AndroidSpeech["Android SpeechRecognizer Engine"]

    Primary --> AppleSpeech["iOS Apple Speech Engine"]

    AndroidSherpa --> Model["Model Provider"]
    AndroidSherpa --> Audio["PCM Audio Source"]
    AndroidSherpa --> Sdk["Sherpa SDK Adapter"]
```

---

## 平台决策

### Android

保留本地 Sherpa 作为主链路，保留系统 SpeechRecognizer 作为降级链路，但将两者都放入 engine adapter 边界，由新的 session controller 统一协调。

**保留：**

- `AsrState`
- `ModelManager`
- `AudioRecordManager`
- `AsrTextManager`
- 现有 UI 交互样式

**新增：**

- `AsrEngine.kt`
- `AsrSessionController.kt`
- `SherpaAsrEngine.kt`
- `AndroidSpeechAsrEngine.kt`

**调整：**

- `AppContainer` 改为注入 `AsrSessionController`
- `PublisherSheet` / `DirectPublishSheet` 继续依赖 `AsrManager` 抽象，不直接碰 engine

### iOS

明确使用 Apple Speech 作为唯一正式引擎。将现有 `NativeSpeechASRManager` 从“既是 manager 又是 engine”改为“session controller + native engine”的分层。旧 `SherpaASRManager` 不再保留在正式主链路。

**保留：**

- `ASRState`
- 现有 `CreateWishSheetWithASR` / `CreateWishDirectSheet` 用户体验

**新增：**

- `SpeechRecognitionEngine.swift`
- `AppleSpeechRecognitionEngine.swift`
- 需要时补 `SpeechTextMergePolicy.swift`

**调整：**

- `NativeSpeechASRManager.swift` 收口为 session controller
- `ASRManager.swift` 只保留协议与共享契约
- `SherpaONNXBridge.swift` 退出主链路，必要时标注 legacy / placeholder

---

## 文件结构

### Android

**新建：**

- `android/app/src/main/java/com/wishpool/app/core/asr/AsrEngine.kt`
- `android/app/src/main/java/com/wishpool/app/core/asr/AsrSessionController.kt`
- `android/app/src/test/java/com/wishpool/app/core/asr/AsrSessionControllerTest.kt`

**修改：**

- `android/app/src/main/java/com/wishpool/app/core/asr/SherpaAsrManager.kt`
- `android/app/src/main/java/com/wishpool/app/core/asr/AndroidAsrManager.kt`
- `android/app/src/main/java/com/wishpool/app/app/AppContainer.kt`
- `android/app/src/test/java/com/wishpool/app/core/asr/FallbackAsrManagerTest.kt` 或替代为 controller 测试

**不动：**

- `android/app/src/main/java/com/wishpool/app/feature/home/PublisherSheet.kt`
- `android/app/src/main/java/com/wishpool/app/feature/home/DirectPublishSheet.kt`
- `android/app/src/main/java/com/wishpool/app/core/asr/AsrTextManager.kt`

### iOS

**新建：**

- `ios/Sources/WishpoolCore/SpeechRecognitionEngine.swift`
- `ios/Tests/WishpoolCoreTests/NativeSpeechASRManagerTests.swift`

**修改：**

- `ios/Sources/WishpoolCore/ASRManager.swift`
- `ios/Sources/WishpoolCore/NativeSpeechASRManager.swift`
- `ios/Sources/WishpoolApp/CreateWishSheetWithASR.swift`
- `ios/Sources/WishpoolApp/CreateWishDirectSheet.swift`
- `ios/Package.swift`（如需新增测试目标依赖或 Apple 框架说明）

**不动：**

- `ios/Sources/WishpoolApp/WishCreationFAB.swift`
- `ios/Sources/WishpoolApp/WishpoolAppRootView.swift`

---

## 风险与控制

### 风险 1: Android 重构后退化为“只有主链路能跑，降级失效”

控制：

- 先写 controller 测试，覆盖 primary success / primary error fallback / reset

### 风险 2: iOS 原生 Speech 状态流变化影响 UI

控制：

- 用 session controller 保持 `ASRState` 输出不变
- 保证 `CreateWishSheetWithASR` / `CreateWishDirectSheet` 不需要改交互语义

### 风险 3: 历史 Sherpa 代码在 iOS 留下混淆

控制：

- 从主链路删除 `SherpaASRManager` 角色
- 在文档中明确“iOS 正式 ASR = Apple Speech”

---

## 验收标准

### Android

- `./gradlew testDebugUnitTest` 通过
- `./gradlew assembleDebug` 通过
- `AppContainer` 主链路使用 session controller，不再直接注入旧 fallback manager

### iOS

- `swift test` 通过
- `swift build` 通过
- `CreateWishSheetWithASR` 与 `CreateWishDirectSheet` 明确使用原生 Speech session controller
- `ASRManager.swift` 中不再保留旧 Sherpa 主实现

### 文档

- 本设计文档落盘
- 实施计划文档落盘
- 最终回填执行与验证结果

---

## 执行结果

**状态**: 已完成当前轮重构与本地验证

### Android

- 已落地 `AsrSessionController + AsrEngine` 分层
- `AppContainer` 已切到新的 session controller 主注入链路
- 验证命令：
  - `cd android && ./gradlew testDebugUnitTest assembleDebug`
  - 结果：通过

### iOS

- 已落地 `NativeSpeechASRManager(session controller) + AppleSpeechRecognitionEngine`
- `CreateWishSheetWithASR` 与 `CreateWishDirectSheet` 已显式绑定 Apple Speech 主链路
- 旧 Sherpa 已退出正式运行主路径，只保留最小 legacy bridge 兼容
- 验证命令：
  - `cd ios && swift test && swift build`
  - 结果：通过
  - 备注：仍存在 `Sources/WishpoolApp/Info.plist` 未声明 resource 的 warning，非本次重构引入

### 剩余人工验收项

- Android 真机端到端语音识别与 fallback 行为
- iOS 真机权限弹窗、音频会话中断与真实识别体验
