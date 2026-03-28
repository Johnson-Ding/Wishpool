---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---
# 许愿池 Wishpool — 项目协作规范

## 项目定位

Wishpool 三端应用产品开发仓库。当前阶段：Web + Android + iOS 三端并行开发，目标为可发布的完整应用产品。
前端已按产品能力拆分为 domains → features → pages；Express 代码保留在 `demo/server/` 作为存档；Android 原生应用已在 `android/`；iOS 原生应用已在 `ios/`；数据层基于 Supabase PostgREST + RPC，正在推进 Auth/RLS 与生产环境配置闭环。

---

## 架构

```
┌────────────────────────────────────────────────────┐
│  第一层：文档与需求层 docs/                         │
│  → prd/            产品需求文档                    │
│  → features/       按需求点聚合的跨端映射文档      │
│  → tech/           技术骨架与演进说明              │
│  → progress/       需求/开发进度流水               │
├────────────────────────────────────────────────────┤
│  第二层：运行时应用层 demo/ + android/ + ios/     │
│  → server/         Node/Express 存档层            │
│  → client/src/     Web 前端应用层                 │
│  → android/app/    Android 原生应用骨架           │
├────────────────────────────────────────────────────┤
│  第三层：前端结构层 demo/client/src/              │
│  → domains/        业务核心类型                    │
│  → features/demo-flow/ Demo 叙事与状态流转         │
│  → pages/          页面组装与控制器                │
│  → components/     手机壳壳层 + 通用 UI            │
│  → contexts/       主题上下文                      │
├────────────────────────────────────────────────────┤
│  第四层：Android 结构层 android/app/src/main/     │
│  → app/            应用入口与根导航               │
│  → core/           环境/通用基础设施              │
│  → domain/         领域模型与业务语义             │
│  → data/           repository / remote / local    │
│  → feature/        Android 功能模块               │
├────────────────────────────────────────────────────┤
│  第四层-B：iOS 结构层 ios/Sources/                │
│  → WishpoolCore/   领域模型 + 数据层 + Repository │
│  → WishpoolApp/    SwiftUI 应用层                │
├────────────────────────────────────────────────────┤
│  第五层：数据建模层 supabase/sql/                  │
│  → 001_core_schema.sql      主链路表结构           │
│  → 002_seed_drift_bottles.sql 漂流瓶种子数据        │
└────────────────────────────────────────────────────┘
```

---

## 核心概念

- 根级 `CLAUDE.md` 只保留仓库级导航，不展开模块内部细节
- `docs/prd/` 负责产品定义（总领 + 5 板块 PRD）；`docs/features/` 负责需求点到三端的映射；`docs/progress/` 负责执行流水
- 前端模块地图见 `docs/tech/frontend-skeleton.md`
- Android 模块地图见 `android/CLAUDE.md`
- iOS 模块地图见 `ios/CLAUDE.md`
- 数据模块地图见 `supabase/CLAUDE.md`
- 需求/进度闭环见 `docs/progress/index.md`、`requirements.md`、`development.md`

---

## 需求框架

**PRD 体系结构（总领 + 5 板块）**

```
docs/prd/
├── PRD-wishpool-v3.md          ← 总领 PRD（产品格局 / 板块索引 / 状态模型 / 分期）
├── PRD-plaza.md                ← 板块1：心愿广场（US-01~04）V1
├── PRD-wish-publish.md         ← 板块2：心愿发布与深夜交流（US-05~10）V1
├── PRD-wish-management.md      ← 板块3：个人心愿管理（US-11~13）V1
├── PRD-profile-settings.md     ← 板块4：个人设置（US-14~15）V1
├── PRD-notifications.md        ← 板块5：消息推送（US-16~19）V1
├── PRD-wishpool-buddy-v1.md    ← 归档（已整合至 V3.0）
├── PRD-wishpool-v2.md          ← 归档（已整合至 V3.0）
└── PRD-v2.1-feed.md            ← 归档（已整合至 V3.0）
```

**板块总览**

| 板块 | 用户故事 | 分期 | 三端实现状态 |
|------|---------|------|-------------|
| 心愿广场 | US-01~04（内容流/帮Ta/互动/漂流瓶） | MVP 简化 + Phase 2 完整 | Web ✅ / Android ✅ / iOS ✅ |
| 心愿发布与深夜交流 | US-05~10（发愿/AI方案/轮次/调研/搭子/协同） | MVP | Web ✅ / Android ⚠️ / iOS ⚠️ |
| 个人心愿管理 | US-11~13（列表/详情/归档） | MVP + Phase 3 | Web ✅ / Android ✅ / iOS ✅ |
| 个人设置 | US-14~15（会员/匿名身份） | MVP | ❌ 未实现 |
| 消息推送 | US-16~19（轮次/搭子/社区/系统） | Phase 2 | ❌ 未实现 |

---

## 需求-代码映射

**产品视角 → 代码落点**

| 需求（产品语言） | PRD 故事 | Web | Android | iOS | Supabase |
|-----------------|---------|-----|---------|-----|----------|
| 心愿广场内容流 | US-01 | `HomeScreen.tsx` + `useFeedData.ts` | `HomeRoute.kt` FeedTab | `FeedView.swift` | `drift_bottles` 表 |
| 帮Ta实现 | US-02 | `HomeScreen.tsx` 快捷选项 | FeedCard "我也想做" | FeedCard | ❌ 后端未接 |
| 点赞/评论 | US-03 | `useFeedData.ts` | `FeedViewModel.kt` | `FeedView.swift` | `like_bottle` RPC |
| 漂流瓶 | US-04 | `data.ts` DRIFT_BOTTLES | `FeedRepository.kt` | `MockWishpoolRepository.swift` | `drift_bottles` + `drift_bottle_comments` |
| 语音发愿 | US-05 | `MainTabScreen.tsx` 发布器 | `PublisherSheet.kt` FAB | `CreateWishSheet.swift` | ❌ 语音 API 未接 |
| AI 出方案 | US-06 | `AiPlanScreen.tsx` | `AiPlanRoute.kt` | ⚠️ 模型有 | `wish_tasks.ai_plan` |
| 轮次推进 | US-07 | `RoundUpdateScreen.tsx` | ⚠️ UI 框架 | ⚠️ | `validation_rounds` 表 |
| 深度调研 | US-08 | `DeepResearchScreen.tsx` | ⚠️ | ⚠️ | ❌ |
| 搭子匹配 | US-09 | `CollabPrepScreen.tsx` | ⚠️ | ⚠️ | ❌ `match_buddy` 未定义 |
| 协同筹备 | US-10 | `CollabPrepScreen.tsx` | ⚠️ | ⚠️ | `collab_locks` 表 |
| 愿望列表 | US-11 | `MyWishesTab.tsx` | `MyWishesPresentation.kt` | `MyWishesView.swift` | `list_my_wishes` RPC |
| 愿望详情 | US-12 | ⚠️ 框架 | `WishDetailRoute.kt` | `WishDetailView.swift` | `wish_tasks` |
| 历史归档 | US-13 | ❌ | ❌ | ❌ | ❌ Phase 3 |
| 会员体系 | US-14 | ❌ | ❌ | ❌ | ❌ |
| 匿名身份 | US-15 | ❌ | ❌ | ❌ | `anonymous_users` 表 |
| 消息推送 | US-16~19 | ❌ | ❌ | ❌ | ❌ Phase 2 |

**一致性缺口**

| 类型 | 说明 |
|------|------|
| PRD 有 / 代码无 | US-09 搭子匹配算法、US-14 会员支付、US-16~19 消息推送 |
| 代码有 / PRD 薄 | `MyWishesTab` 三状态分组逻辑（US-11 仅一句话定义） |
| 跨端未对齐 | US-06~10 发愿后半链路：Web 完整实现，Android/iOS 仅 UI 框架 |
| 数据层缺口 | `match_buddy`、`update_wish_round`、`lock_collab` RPC 未定义 |

---

## 函数 map

**Web（demo/client/src/features/demo-flow/）**

| 状态/方法 | 说明 |
|-----------|------|
| `useDemoFlow` | 核心 hook：持有 currentScreen + scenarioId + wishInput，暴露导航方法 |
| `flow-state.ts` | 纯函数状态机：advance / retreat / navigate / startScenario |
| `navigation.ts` | 屏幕顺序查询：getNext / getPrevious / getLabel / getStatus |
| `scenario-matcher.ts` | 用户输入文字 → 匹配预设场景 ID |
| `useFeedData.ts` | Feed 数据管理 Hook：点赞、评论、评论列表 |
| `MainTabScreen` | 3-Tab 容器：tab 切换 + 发布器面板（录音+实时转写） |
| `MyWishesTab` | 右 Tab：待决策 / 进行中+已完成 愿望列表 |

**Android（android/app/src/main/java/com/wishpool/app/）**

| 状态/方法 | 说明 |
|-----------|------|
| `HomeRoute` | 首页容器：2-Tab（Feed + MyWishes）+ 中央麦克风 FAB |
| `FeedViewModel` | Feed 状态管理：加载、点赞、评论 |
| `MyWishesViewModel` | 我的心愿状态管理 + `buildWishSections()` 分组 |
| `PublisherSheet` | 发布器面板：录音 + 长按文字输入 |
| `WishCreateRoute` | 发愿屏：文本输入 + 确认 |
| `AiPlanRoute` | AI 方案屏：步骤逐个显示动画 |

**iOS（ios/Sources/）**

| 状态/方法 | 说明 |
|-----------|------|
| `WishpoolAppRootView` | 根视图：2-Tab（Feed + MyWishes） |
| `FeedView` | 心愿广场：左右滑动卡片 + 点赞评论 |
| `MyWishesView` | 我的心愿列表 + `WishSectionBuilder` 分组 |
| `WishDetailView` | 愿望详情：状态标签 + 方案摘要 |
| `CreateWishSheet` | 发愿 Sheet |

**Supabase RPC**

| 函数 | 说明 | 状态 |
|------|------|------|
| `create_wish` | 创建愿望 + 自动建匿名用户 | ✅ |
| `clarify_wish` | 补约束 + 状态流转 | ✅ |
| `confirm_wish_plan` | 确认计划 planning→ready | ✅ |
| `like_bottle` | 漂流瓶点赞原子操作 | ✅ |
| `list_my_wishes` | 按 device_id 查询我的愿望 | ✅ |
| `match_buddy` | 搭子匹配 | ❌ 未定义 |
| `update_wish_round` | 轮次更新 | ❌ 未定义 |
| `lock_collab` | 协同锁定 | ❌ 未定义 |

---

## 找到你想改的东西（双视角）

**产品视角（从需求出发）**

| 想改什么（产品语言） | PRD 故事 | 去哪里改 |
|-------------------|---------|---------|
| 心愿广场的内容类型和浏览体验 | US-01 `PRD-plaza.md` | Web: `HomeScreen.tsx` / Android: `HomeRoute.kt` FeedTab / iOS: `FeedView.swift` |
| 帮Ta实现的任务流程 | US-02 `PRD-plaza.md` | Web: `HomeScreen.tsx` 快捷选项 / 后端待建 |
| 点赞评论互动 | US-03 `PRD-plaza.md` | Web: `useFeedData.ts` / Android: `FeedViewModel.kt` / Supabase: `like_bottle` RPC |
| 漂流瓶功能 | US-04 `PRD-plaza.md` | 数据: `data.ts` + `drift_bottles` 表 |
| 语音发愿和转写 | US-05 `PRD-wish-publish.md` | Web: `MainTabScreen.tsx` 发布器 / Android: `PublisherSheet.kt` |
| AI 方案生成与展示 | US-06 `PRD-wish-publish.md` | Web: `AiPlanScreen.tsx` / Android: `AiPlanRoute.kt` |
| 搭子匹配逻辑 | US-09 `PRD-wish-publish.md` | 待实现（Supabase `match_buddy` RPC 未定义） |
| 我的心愿列表和状态管理 | US-11 `PRD-wish-management.md` | Web: `MyWishesTab.tsx` / Android: `MyWishesPresentation.kt` / iOS: `MyWishesView.swift` |
| 会员与支付 | US-14 `PRD-profile-settings.md` | 待实现 |
| 消息推送 | US-16~19 `PRD-notifications.md` | 待实现 |

**代码视角（从实现出发）**

| 想改什么（技术语言） | 去哪里 |
|-------------------|--------|
| 仓库整体结构/模块导航 | `CLAUDE.md` |
| 产品需求文档（总领） | `docs/prd/PRD-wishpool-v3.md` |
| 某个板块的需求定义 | `docs/prd/PRD-{板块名}.md` |
| 某个需求点映射到三端 | `docs/features/REQ-xxx-*.md` |
| 前端技术骨架 | `docs/tech/frontend-skeleton.md` |
| 进度索引与记录规则 | `docs/progress/*.md` |
| Web 屏幕 UI / 导航 / 状态流转 | `demo/client/src/features/demo-flow/` |
| Android 功能模块 | `android/app/src/main/.../feature/` |
| Android 设计系统组件 | `android/app/src/main/.../designsystem/` |
| iOS 应用层 | `ios/Sources/WishpoolApp/` |
| iOS 领域模型与数据层 | `ios/Sources/WishpoolCore/` |
| Supabase 表结构 | `supabase/sql/001_core_schema.sql` |
| Supabase 模块地图 | `supabase/CLAUDE.md` |

---

## 关键文档位置

```
docs/prd/
├── PRD-wishpool-v3.md                   ← V3.0 总领 PRD（产品格局 + 板块索引）
├── PRD-plaza.md                         ← 板块1：心愿广场（US-01~04）V1
├── PRD-wish-publish.md                  ← 板块2：心愿发布与深夜交流（US-05~10）V1
├── PRD-wish-management.md               ← 板块3：个人心愿管理（US-11~13）V1
├── PRD-profile-settings.md              ← 板块4：个人设置（US-14~15）V1
├── PRD-notifications.md                 ← 板块5：消息推送（US-16~19）V1
├── PRD-wishpool-buddy-v1.md             ← 归档（已整合至 V3.0）
├── PRD-wishpool-v2.md                   ← 归档（已整合至 V3.0）
└── PRD-v2.1-feed.md                     ← 归档（已整合至 V3.0）

docs/features/
├── index.md                             ← 跨端需求映射索引与规则
└── TEMPLATE.md                          ← 单个需求点的映射模板

docs/design/
└── three-characters.md                  ← 三角色 UI/Branding 视觉体系

docs/tech/
├── cross-platform-evolution.md          ← Web 到 Android 跨端演进方案
├── frontend-skeleton.md                 ← 前端技术骨架说明
├── android-backend-readiness.md         ← Android 对现有后端承接性盘点
└── android-architecture.md              ← Android 原生工程架构方案

docs/archive/
└── business-analysis-summary.md         ← 早期商业分析归档（5 篇合并）

docs/progress/
├── index.md                             ← 进度索引看板
├── requirements.md                      ← 需求变更流（ReqID 登记）
└── development.md                       ← 开发执行流（关联 ReqID）

demo/server/
├── index.ts                             ← Express 服务端入口（已存档）
├── app.ts                               ← Express app 组装（已存档）
└── modules/                             ← 旧 API 分层实现（已存档）

android/
├── CLAUDE.md                            ← Android 工程地图
├── gradlew                              ← Gradle Wrapper 入口
├── build.gradle.kts                     ← Android 根构建配置
└── app/                                 ← Android application module

ios/
├── CLAUDE.md                            ← iOS 工程地图
├── Package.swift                        ← Swift Package 入口
├── Sources/WishpoolCore/                ← 领域模型 / Supabase 直连 / mock
├── Sources/WishpoolApp/                 ← SwiftUI App 壳层
└── Verification/main.swift              ← 命令行校验入口

supabase/sql/
├── 001_core_schema.sql                  ← 主链路表结构（匿名用户、愿望任务、轮次校验、协同锁定、履约、漂流瓶）
└── 002_seed_drift_bottles.sql           ← 漂流瓶冷启动种子数据

supabase/CLAUDE.md
└── 数据模块地图：SQL 文件职责、当前边界、后续回写点
```

---

## 成本控制规则（防止 orientation loop）

1. **每次对话开始先读 `docs/progress/index.md`**
2. **只读目标屏幕的相关文件**，不要整文件读大文件
3. **每次只改一个屏幕**，改完立刻验证
4. **改完后更新 `docs/progress/index.md`**

---

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4（`index.css` 有自定义 CSS 变量）
- Supabase PostgREST + RPC（Express 保留存档，不再作为三端运行时主路径）
- Kotlin + Compose + Android Gradle Plugin（Android 原生工程骨架已创建）
- SwiftUI + Swift Package（iOS Demo 骨架已创建，待 Xcode 验证）

---

## 约束

- `CLAUDE.md` 是仓库级地图，不再默认所有路径都相对于 `demo/client/src/`
- 模块内部地图应下沉到模块文档，不持续向根级 `CLAUDE.md` 追加细节
- Supabase 当前只记录 SQL 结构与种子数据草案；未完成配置前，不要把数据库运行态写成既成事实
- 不要引入新的状态管理库（Redux、Zustand 等）
- 不要改 CSS 变量名（会破坏主题系统）

---

## 文档分工

| 文档层 | 负责什么 | 不负责什么 |
|--------|----------|------------|
| `docs/prd/*.md` | 定义产品目标、用户价值、范围与验收口径 | 不负责写三端代码落点 |
| `docs/features/*.md` | 把单个需求点映射到 `Web / Android / iOS / Supabase` | 不替代 PRD，不记录逐日流水 |
| `docs/progress/*.md` | 记录 `ReqID / DEV`、当前任务、阻塞与执行记录 | 不替代需求定义，不承担跨端总映射 |

当一个需求会同时影响 PRD 与两端及以上实现时，应该新增 `docs/features/REQ-xxx-*.md` 作为中间层，避免信息只散落在 PRD、代码目录和 progress 流水中。

---

## 变更登记规则（硬约束）

任何涉及功能新增或变更的改动，必须遵守以下闭环，否则不算完成：

1. **改之前**：在 `docs/progress/requirements.md` 新建条目，生成 `ReqID`（如 `REQ-003`）
2. **改的时候**：在 `docs/progress/development.md` 关联 `ReqID`，记录改动范围与决策
3. **改完后**：自主测试验证，更新 `docs/progress/index.md` 索引看板的"当前任务"与"当前阻塞"

不遵守此规则的代码变更视为未完成，不可提交。

---

## 收尾检查清单（任务完成时执行）

| 文档 | 更新时机 |
|------|---------|
| CLAUDE.md | 模块增删、屏幕增删、架构层级变化 |
| docs/features/*.md | 新增跨端需求点，或需求点的三端映射发生变化 |
| docs/progress/index.md | 索引看板中的当前任务/阻塞状态变化 |
| docs/progress/requirements.md | 功能新增或变更时（改之前） |
| docs/progress/development.md | 开始实现时 |

---

## Design Context

### Users
许愿池面向有心愿/目标想要实现的用户。他们通常在夜晚独处时打开 App，说出心愿，等待 AI 方案生成与搭子匹配。用户需要的不是效率工具，而是一个有仪式感的"许愿空间"——从发愿到落地的沉浸体验。

### Brand Personality
**克制 · 沉浸 · 仪式感**

眠眠月（Moon）是当前主角色——深夜水墨·月光容器。像深夜独处时仰望月光的安静力量：不喧闹、不花哨，但每个细节都透着精致。金色是仪式的光，不是装饰。

### Aesthetic Direction

**视觉基调：** 深夜水墨 + 月光金 + 磨砂质感
- **气氛参考：** 小宇宙/冥想类 App 的沉浸感，Notion/Craft 的排版克制
- **反参考：** 不要小红书式的热闹繁杂，不要纯工具感的冰冷
- **核心效果：** 星空微闪背景、毛玻璃卡片（backdrop-blur）、金色渐变光泽、柔和径向光晕

**三角色机制（"一搭子一宇宙"）：**
用户切换角色时，字体、色彩、动效、呼吸感全部变化。当前只实现月主题，架构需预留切换扩展点。

| 角色 | 基调 | Primary | Accent | 字体 | 动效语言 |
|------|------|---------|--------|------|---------|
| 眠眠月 🌙 | 深靛蓝黑 `#0A0E1A` | 月光金 `#F5C842` | 月光青 `#4AADA0` | Noto Serif SC | 星光闪烁、径向涟漪、缓呼吸 |
| 芽芽星 🌱 | 太空深紫 `#1A0F2E` | 霓虹薄荷 `#4ADE80` | 亮青 `#22D3EE` | Outfit | 极光流转、Q弹回弹、粒子 |
| 软软云 ☁️ | 晨曦白 `#F0F9FF` | 浅桃粉 `#F97066` | 天蓝 `#60A5FA` | Fraunces | 云朵浮动、磨砂呼吸、柔焦 |

### Design Principles

1. **克制即高级** — 少即是多。每个元素都必须有存在的理由。不加装饰性元素，不用满屏动画。留白本身就是设计。
2. **质感优先于功能** — 毛玻璃的通透、金色的光泽、星光的闪烁——这些"无用"的质感细节决定了 App 的品位。宁可少一个功能，不可丢一层质感。
3. **仪式感贯穿始终** — 发愿是仪式、确认方案是仪式、搭子匹配是仪式。每个关键动作都应有"moment"——微延迟、光效、过渡动画让用户感受到重量。
4. **暗色是画布，光是主角** — 深色背景是水墨宣纸，金色/青色是落笔处的光。控制发光元素的数量和强度，让每一抹光都有意义。
5. **跨端一致性** — Android 实现必须在视觉质感上与 Web Demo 保持一致。同一套色值、同一套间距比例、同一种动效节奏。Compose 的实现不是"近似"，是"等价"。

### Web ↔ Android 视觉对照表

| Web 效果 | CSS 实现 | Android 等价 | 当前状态 |
|----------|---------|-------------|---------|
| 毛玻璃卡片 | `backdrop-filter: blur(20px)` + 半透明bg | `GlassCard` 半透明背景 (无真blur) | ⚠️ 缺 blur，靠透明度补偿 |
| 金色渐变文字 | `background-clip: text` + shimmer | 未实现 | ❌ 缺失 |
| 径向光晕 | `radial-gradient(circle, primary/8%, transparent)` | 未实现 | ❌ 缺失 |
| 页面转场 | `slideInRight 0.35s` spring动画 | 系统默认 | ❌ 缺失 |
| 按钮反馈 | hover/active 状态 + scale | 无 press 反馈 | ❌ 缺失 |
| moonPulse 光晕 | `box-shadow` 3s 呼吸动画 | 未实现 | ❌ 缺失 |
| 卡片揭示 | `cardReveal` opacity+translateY+scale | 无入场动画 | ❌ 缺失 |
| shimmer 加载 | 渐变滑动动画 | 纯文字"加载中" | ❌ 缺失 |
| 星空背景 | CSS `starTwinkle` keyframes | `StarField` Canvas 动画 | ✅ 已实现 |
| 标签色系 | `tagColor()` 5色 | `tagColor()` 5色 | ✅ 已实现 |

### Android 间距规范（统一 4dp 倍数）

| Token | 值 | 用途 |
|-------|------|------|
| `space-xs` | 4.dp | 图标与文字间距、badge 内边距 |
| `space-sm` | 8.dp | 紧凑元素间距、chip 间距 |
| `space-md` | 12.dp | 表单字段间距、段落间距 |
| `space-base` | 16.dp | 卡片内边距、列表项间距、页面水平边距 |
| `space-lg` | 24.dp | 区块间距、卡片间距 |
| `space-xl` | 32.dp | 页面顶部/底部留白 |
| `space-2xl` | 48.dp | 大段落分隔 |
