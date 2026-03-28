---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---
# 许愿池 Wishpool — 项目协作规范

## 项目定位

Wishpool 仓库级协作文档。当前仓库处于"前端演示基座 + Node/Express 后端接口层 + Android 原生工程骨架 + Supabase SQL 建模草案 + 文档体系"并行演进阶段。
V1/V2 Demo 表达层保留，前端底层已按产品能力拆分为 domains → features → pages；后端接口层已落在 `demo/server/`；Android 原生工程骨架已落在 `android/`；数据层已落盘 Supabase SQL 脚本，但尚未形成 Auth/RLS 与真实环境配置闭环。

---

## 架构

```
┌────────────────────────────────────────────────────┐
│  第一层：文档与需求层 docs/                         │
│  → prd/            产品需求文档                    │
│  → tech/           技术骨架与演进说明              │
│  → progress/       需求/开发进度流水               │
├────────────────────────────────────────────────────┤
│  第二层：运行时应用层 demo/ + android/            │
│  → server/         Node/Express 后端接口层        │
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
│  第五层：数据建模层 supabase/sql/                  │
│  → 001_core_schema.sql      主链路表结构           │
│  → 002_seed_drift_bottles.sql 漂流瓶种子数据        │
└────────────────────────────────────────────────────┘
```

---

## 核心概念

- 根级 `CLAUDE.md` 只保留仓库级导航，不展开模块内部细节
- 前端模块地图见 `docs/tech/frontend-skeleton.md`
- Android 模块地图见 `android/CLAUDE.md`
- 数据模块地图见 `supabase/CLAUDE.md`
- 需求/进度闭环见 `docs/progress/index.md`、`requirements.md`、`development.md`

---

## 函数 map

| 状态/方法 | 说明 |
|-----------|------|
| `useDemoFlow` | 核心 hook：持有 currentScreen + scenarioId + wishInput，暴露导航方法 |
| `flow-state.ts` | 纯函数状态机：advance / retreat / navigate / startScenario |
| `navigation.ts` | 屏幕顺序查询：getNext / getPrevious / getLabel / getStatus |
| `scenario-matcher.ts` | 用户输入文字 → 匹配预设场景 ID |
| `matchScenarioByWishInput` | chat 页提交后调用，决定走哪个场景的数据 |
| `MainTabScreen` | 3-Tab 容器：tab 切换 + 发布器面板（录音+实时转写） |
| `MyWishesTab` | 右 Tab：待决策 / 进行中+已完成 愿望列表 |
| `openPublisher` | 点击中间按钮 → 弹出录音面板，自动开始转写 |

---

## 找到你想改的东西

| 想改什么 | 去哪里 |
|---------|--------|
| 仓库整体结构/模块导航 | `CLAUDE.md` |
| 产品需求文档 | `docs/prd/*.md` |
| 前端技术骨架/演进说明 | `docs/tech/*.md` |
| 进度索引与记录规则 | `docs/progress/*.md` |
| 前端模块地图 | `docs/tech/frontend-skeleton.md` |
| Android 原生工程地图 | `android/CLAUDE.md` |
| Android 构建与应用入口 | `android/` |
| 后端接口层 | `demo/server/` |
| 某个屏幕的 UI / 导航 / 状态流转 | `demo/client/src/` 及 `docs/tech/frontend-skeleton.md` |
| Supabase 表结构 | `supabase/sql/001_core_schema.sql` |
| 漂流瓶种子数据 | `supabase/sql/002_seed_drift_bottles.sql` |
| Supabase 模块地图 | `supabase/CLAUDE.md` |

---

## 关键文档位置

```
docs/prd/
├── PRD-wishpool-buddy-v1.md             ← V1 产品需求文档
├── PRD-wishpool-v2.md                   ← V2 产品需求文档（US-01 ~ US-07）
└── PRD-v2.1-feed.md                     ← V2.1 Feed 内容流 PRD（US-V21-01 ~ 07）

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
├── index.ts                             ← 服务端启动入口
├── app.ts                               ← Express app 组装
└── modules/                             ← 发愿主链路 / Feed API

android/
├── CLAUDE.md                            ← Android 工程地图
├── gradlew                              ← Gradle Wrapper 入口
├── build.gradle.kts                     ← Android 根构建配置
└── app/                                 ← Android application module

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
- Express + Supabase（服务端接口层已落盘，权限与运行态未闭环）
- Kotlin + Compose + Android Gradle Plugin（Android 原生工程骨架已创建）

---

## 约束

- `CLAUDE.md` 是仓库级地图，不再默认所有路径都相对于 `demo/client/src/`
- 模块内部地图应下沉到模块文档，不持续向根级 `CLAUDE.md` 追加细节
- Supabase 当前只记录 SQL 结构与种子数据草案；未完成配置前，不要把数据库运行态写成既成事实
- 不要引入新的状态管理库（Redux、Zustand 等）
- 不要改 CSS 变量名（会破坏主题系统）

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
| docs/progress/index.md | 索引看板中的当前任务/阻塞状态变化 |
| docs/progress/requirements.md | 功能新增或变更时（改之前） |
| docs/progress/development.md | 开始实现时 |
