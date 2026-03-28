# Wishpool iOS 工程地图

## 当前定位

`ios/` 是 Wishpool 的 iOS 原生工程，技术路线采用 `Swift 6 + SwiftUI + SPM`。

当前阶段目标是：

- 建立可编译、可运行的 iOS Demo 壳层
- 承接三端共享的 Supabase PostgREST + RPC 数据层
- Mock 回退策略确保无网络时 Demo 仍可运行

---

## 目录职责

```text
ios/
├── Package.swift                    SPM 工程定义
├── Sources/
│   ├── WishpoolCore/               核心库（领域模型 + 数据层 + Repository）
│   │   ├── WishModels.swift         领域模型（WishTask, FeedItem, FeedComment 等）
│   │   ├── WishSections.swift       WishSectionBuilder 分组逻辑
│   │   ├── SupabaseDTOs.swift       Supabase snake_case DTO 与 toDomain() 映射
│   │   ├── WishpoolRepository.swift 数据仓库协议 + SupabaseConfig
│   │   ├── SupabaseWishpoolRepository.swift  Supabase PostgREST/RPC 实现
│   │   ├── MockWishpoolRepository.swift      本地 Mock 兜底实现
│   │   └── Loadable.swift           通用加载状态枚举
│   └── WishpoolApp/                SwiftUI 应用层
│       ├── WishpoolApp.swift        @main 入口
│       ├── WishpoolAppModel.swift   全局 ViewModel（@Observable）
│       ├── WishpoolAppRootView.swift 根视图（2-Tab + 中央发愿按钮）
│       ├── WishpoolTheme.swift      调色板与卡片样式
│       ├── AppTab.swift             Tab/Sheet 枚举
│       ├── FeedView.swift           心愿广场 + 评论 Sheet
│       ├── MyWishesView.swift       我的心愿（分组展示）
│       ├── WishDetailView.swift     愿望详情 + 澄清/确认
│       └── CreateWishSheet.swift    发愿表单
└── Tests/
    └── WishpoolCoreTests/
        └── WishpoolCoreTests.swift  领域模型单元测试
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
| 发愿表单 | `Sources/WishpoolApp/CreateWishSheet.swift` |
| 领域模型定义 | `Sources/WishpoolCore/WishModels.swift` |
| DTO 映射 | `Sources/WishpoolCore/SupabaseDTOs.swift` |
| Supabase 数据层 | `Sources/WishpoolCore/SupabaseWishpoolRepository.swift` |
| Mock 数据 | `Sources/WishpoolCore/MockWishpoolRepository.swift` |

---

## 数据回退策略

`WishpoolBootstrap.makeRepository()` 按以下优先级选择数据源：

1. 若环境变量 `WISHPOOL_SUPABASE_URL` + `WISHPOOL_SUPABASE_ANON_KEY` 存在 → 走 `FallbackWishpoolRepository(primary: Supabase, fallback: Mock)`
2. 否则 → 直接走 `MockWishpoolRepository`

Supabase 请求失败时，`FallbackWishpoolRepository` 自动降级到 Mock 数据。

---

## 当前约束

- 需要 Xcode 才能在 iOS 模拟器上运行（当前环境仅有 Command Line Tools）
- 测试需要 Xcode（XCTest / Swift Testing 均依赖 Xcode SDK）
- Auth / RLS 尚未配置（Demo 阶段使用 device_id 匿名方案）
- `swift build` 可在 macOS 上验证编译（已通过）
