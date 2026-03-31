# Wishpool iOS 工程地图

## 当前定位

`ios/` 是 Wishpool 的 iOS 原生工程，技术路线采用 `Swift 6 + SwiftUI + SPM`。

**当前状态：功能已基本对齐 Android，工程配置已收口**

- ✅ Xcode 项目配置完成（含权限）
- ✅ ASR 语音发愿功能（iOS 原生 Speech）
- ✅ AI 方案生成（AgentApi + 本地模板）
- ✅ 双 Tab 导航 + 主题切换
- ✅ 当前会话已验证 `swift test`、`swift build`
- ✅ 当前会话已验证 `xcodebuild archive`、`xcodebuild -exportArchive`
- ⏳ ASR 真机口语验收仍需人工执行

---

## 快速运行

```bash
# 方式1：Xcode Workspace（推荐）
open ios/Wishpool.xcworkspace

# 方式2：Xcode 项目
open ios/Sources/Wishpool/Wishpool.xcodeproj

# 方式3：命令行编译验证
cd ios && swift build
```

当前会话已完成 CLI 验证：

```bash
cd ios && swift test && swift build
xcodebuild -workspace ios/Wishpool.xcworkspace -scheme Wishpool -configuration Release -destination 'generic/platform=iOS' -archivePath ios/build/Wishpool.xcarchive archive
xcodebuild -exportArchive -archivePath ios/build/Wishpool.xcarchive -exportPath ios/build/export -exportOptionsPlist ios/exportOptions.plist
```

当前 `Wishpool.xcodeproj` 已内置本地 `ios/Package.swift` 引用，正常情况下 Xcode 会自动解析 `WishpoolCore` / `WishpoolApp`。
若本地 package 解析异常，再执行 `File -> Packages -> Resolve Package Versions` 或重新打开 `ios/Wishpool.xcworkspace`。

---

## 目录职责

```text
ios/
├── Package.swift                    SPM 工程定义
├── Wishpool.xcworkspace             Xcode Workspace（推荐打开方式）
├── README.md                        快速启动指南
├── Sources/
│   ├── WishpoolCore/               核心库（与 Android 对齐）
│   │   ├── NativeSpeechASRManager.swift    # iOS 原生 ASR（对标 AndroidAsrManager）
│   │   ├── AgentApi.swift                  # AI Plan API（对标 AgentApi.kt）
│   │   ├── WishModels.swift                # 领域模型
│   │   ├── SupabaseDTOs.swift              # Supabase DTO 映射
│   │   ├── WishpoolRepository.swift        # 数据仓库协议
│   │   ├── SupabaseWishpoolRepository.swift # Supabase 实现
│   │   ├── MockWishpoolRepository.swift    # Mock 兜底实现
│   │   └── Loadable.swift                  # 加载状态枚举
│   ├── WishpoolApp/                # SwiftUI 应用层
│   │   ├── WishpoolApp.swift               # @main 入口
│   │   ├── WishpoolAppModel.swift          # 全局 ViewModel
│   │   ├── WishpoolAppRootView.swift       # 根视图（2-Tab + 中央 FAB）
│   │   ├── AiPlanView.swift                # AI 方案页面（对标 AiPlanRoute.kt）
│   │   ├── CreateWishSheetWithASR.swift    # 语音发愿（ASR 集成）
│   │   ├── CreateWishDirectSheet.swift     # 文字直接输入
│   │   ├── WishpoolTheme.swift             # 主题系统（月/云/星）
│   │   ├── FeedView.swift                  # 心愿广场
│   │   ├── MyWishesView.swift              # 我的心愿
│   │   ├── WishDetailView.swift            # 愿望详情
│   │   └── Resources/              # 图片资源
│   │       ├── moon-bg.png
│   │       ├── moon-avatar.png
│   │       ├── cloud-bg.png
│   │       └── cloud-avatar.png
│   └── Wishpool/                   # Xcode 项目包装器
│       └── Wishpool.xcodeproj/
│           └── ContentView.swift           # Xcode 项目入口（引用 SPM 包）
└── Tests/
    └── WishpoolCoreTests/
        └── WishpoolCoreTests.swift         # 单元测试
```

---

## 找到你想改的东西

| 想改什么 | 去哪里 |
|---|---|
| App 入口 | `Sources/WishpoolApp/WishpoolApp.swift` |
| Tab 结构与 Sheet 路由 | `Sources/WishpoolApp/AppTab.swift` |
| 全局状态与业务逻辑 | `Sources/WishpoolApp/WishpoolAppModel.swift` |
| 主题配色 | `Sources/WishpoolApp/WishpoolTheme.swift` |
| Feed 页面 | `Sources/WishpoolApp/FeedView.swift` |
| 我的心愿页面 | `Sources/WishpoolApp/MyWishesView.swift` |
| 愿望详情页面 | `Sources/WishpoolApp/WishDetailView.swift` |
| AI 方案页面 | `Sources/WishpoolApp/AiPlanView.swift` |
| 语音发愿 | `Sources/WishpoolApp/CreateWishSheetWithASR.swift` |
| ASR 实现 | `Sources/WishpoolCore/NativeSpeechASRManager.swift` |
| AI API 实现 | `Sources/WishpoolCore/AgentApi.swift` |
| 领域模型定义 | `Sources/WishpoolCore/WishModels.swift` |
| DTO 映射 | `Sources/WishpoolCore/SupabaseDTOs.swift` |
| Supabase 数据层 | `Sources/WishpoolCore/SupabaseWishpoolRepository.swift` |
| Mock 数据 | `Sources/WishpoolCore/MockWishpoolRepository.swift` |

---

## 核心功能实现

### ASR 语音输入

使用 iOS 原生 `SFSpeechRecognizer` + `AVAudioEngine` 实现实时语音转文字：

- **文件**：`NativeSpeechASRManager.swift`
- **对标 Android**：`AndroidAsrManager.kt`
- **特点**：
  - 支持部分结果实时反馈
  - 静音检测自动结束
  - 错误降级处理
  - 真机必需（模拟器不支持）

### AI 方案生成

- **文件**：`AgentApi.swift`
- **对标 Android**：`AgentApi.kt`
- **实现**：
  - 优先调用 AI Server（localhost:3100/plan）
  - 失败时降级到本地模板（海边/学习/运动/滑雪/通用）
  - 支持分步动画展示

---

## 数据回退策略

`WishpoolBootstrap.makeRepository()` 按以下优先级选择数据源：

1. 若环境变量 `WISHPOOL_SUPABASE_URL` + `WISHPOOL_SUPABASE_ANON_KEY` 存在 → 走 `FallbackWishpoolRepository(primary: Supabase, fallback: Mock)`
2. 否则 → 直接走 `MockWishpoolRepository`

Supabase 请求失败时，`FallbackWishpoolRepository` 自动降级到 Mock 数据。

---

## 权限配置

项目已配置以下权限（在 `project.pbxproj` 中）：

- `NSMicrophoneUsageDescription` - 麦克风使用说明
- `NSSpeechRecognitionUsageDescription` - 语音识别使用说明

---

## 当前约束

- **Xcode 版本**：需要 Xcode 16+（使用 Swift 6）
- **iOS 版本**：最低支持 iOS 17.0
- **ASR 测试**：必须在真机上测试（模拟器不支持语音输入）
- **AI Server**：默认连接 localhost:3100，未启动时会使用本地模板
- **当前产物**：IPA 可由 `ios/build/export/Wishpool.ipa` 导出
