# Wishpool iOS 快速启动指南

## 一键运行

### 方法一：使用 Xcode Workspace（推荐）

1. **打开 Workspace**
   ```bash
   open ios/Wishpool.xcworkspace
   ```

2. **运行应用**
   - 选择目标设备（iPhone 16 Pro 模拟器或真机）
   - 点击运行按钮（Cmd+R）

当前 `Wishpool.xcodeproj` 已内置本地 Swift Package 引用，正常情况下 Xcode 会自动解析 `WishpoolCore` / `WishpoolApp`。
如果 package 状态异常，再执行 `File` → `Packages` → `Resolve Package Versions`。

### 方法二：使用 Xcode 项目

```bash
open ios/Sources/Wishpool/Wishpool.xcodeproj
```
然后直接运行；若本地 package 没有自动解析，再执行 `File` → `Packages` → `Resolve Package Versions`。

### 方法三：命令行编译验证

```bash
cd ios
swift build
```

⚠️ 如果在受限 CLI 沙箱中运行，`swift build` 可能因为 `sandbox-exec` / ModuleCache 权限失败。此时请改用本机终端或直接在 Xcode 中验证。

## 项目结构

```
ios/
├── Package.swift                    # SPM 包定义
├── Sources/
│   ├── WishpoolCore/               # 核心库（与 Android 对齐）
│   │   ├── NativeSpeechASRManager.swift    # iOS 原生 ASR
│   │   ├── AgentApi.swift                  # AI Plan API
│   │   ├── WishModels.swift                # 领域模型
│   │   └── ...
│   └── WishpoolApp/                # SwiftUI 应用层
│       ├── WishpoolApp.swift              # App 入口
│       ├── WishpoolAppRootView.swift      # 根视图
│       ├── AiPlanView.swift               # AI 方案页面
│       ├── CreateWishSheetWithASR.swift   # 语音发愿
│       └── ...
└── Sources/Wishpool/               # Xcode 项目包装器
    └── Wishpool.xcodeproj/
```

## 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 双 Tab 导航 | ✅ | Feed + 我的心愿 |
| 语音发愿 (ASR) | ✅ | 使用 iOS 原生 Speech 框架 |
| AI 方案生成 | ✅ | AgentApi + 本地模板降级 |
| 主题切换 | ✅ | 月/云/星三主题 |
| 愿望详情 | ✅ | 澄清/确认流程 |
| 评论系统 | ✅ | 广场评论功能 |

## 权限配置

项目已配置以下权限描述：
- `NSMicrophoneUsageDescription` - 麦克风使用说明
- `NSSpeechRecognitionUsageDescription` - 语音识别使用说明

## 已知限制

1. **ASR 在模拟器上**：模拟器不支持语音输入，请在真机上测试 ASR 功能
2. **AI Server**：默认连接 `localhost:3100`，如果未启动会使用本地模板
3. **iOS 版本**：最低支持 iOS 17.0

## 快速验证脚本

```bash
cd ios && ./quick-test.sh
```

自动编译验证并打开 Xcode Workspace。

## 故障排除

### 黑屏崩溃（Mach error -308）
**已修复**：使用 `SafeImage` 安全图片加载，防止资源缺失导致崩溃
- 所有主题图片资源已补全（moon/cloud/star）
- 使用安全开屏页面 `SafeSplashView`

### Build 成功但模拟器不显示
- 确保选择了正确的 Scheme（Wishpool）
- 尝试 Clean Build Folder（Cmd+Shift+K）后重新运行

### ASR 无法启动
- 确保在真机上测试（模拟器不支持语音输入）
- 检查权限弹窗是否被允许
- 查看控制台日志获取详细错误信息

### 找不到 WishpoolCore 模块
- 先执行 `File` → `Packages` → `Resolve Package Versions`
- 尝试重新打开 Xcode 项目

### `swift build` 报 sandbox / ModuleCache 权限错误
- 这通常不是工程代码错误，而是当前 CLI 运行环境限制了 SwiftPM 缓存或 sandbox
- 请改用本机终端执行 `cd ios && swift build`
- 或直接打开 `ios/Wishpool.xcworkspace` 在 Xcode 中构建

## 验收标准

运行成功后应看到：
- 🎬 **完整开屏动画**（2.6s）：背景图片 + 星空效果 + 脉冲光晕 + 浮动动画
- 📱 **双Tab导航**：心愿广场 + 我的愿望
- ➕ **中央发愿按钮**：点击直接语音输入，长按编辑模式
- 🌙 **主题切换系统**：默认月亮主题
