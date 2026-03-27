---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---
# 许愿池 Wishpool — 项目协作规范

## 项目定位

Wishpool 前端工程。当前处于从"演示稿代码"向"可持续演进的产品前端基座"的重构过程中。
V1/V2 Demo 表达层保留，底层已按产品能力拆分为 domains → features → pages 三层。

---

## 架构

```
┌──────────────────────────────────────────────────┐
│  第一层：领域层 domains/                           │
│  → wishflow/types.ts   业务核心类型               │
│    WishTask / CandidatePlan / ValidationCheck     │
│    WishExecutionStatus 状态枚举（10 态）           │
├──────────────────────────────────────────────────┤
│  第二层：能力层 features/demo-flow/                │
│  → types.ts          DemoScreen 枚举 + 屏幕顺序  │
│  → flow-state.ts     纯函数状态机（无副作用）      │
│  → navigation.ts     屏幕前进/后退/标签           │
│  → scenario-matcher.ts  用户输入 → 场景匹配       │
│  → useDemoFlow.ts    组合 hook（状态 + 导航）     │
│  → data.ts           场景 mock 数据               │
│  → screens/          各屏幕独立实现（11 个）       │
│    ├ MainTabScreen   3-Tab 主页容器               │
│    ├ HomeScreen      愿望广场（左 Tab 内容）       │
│    ├ MyWishesTab     我的愿望（右 Tab 内容）       │
│    └ 其余 8 个业务屏幕                             │
├──────────────────────────────────────────────────┤
│  第三层：页面层 pages/                             │
│  → WishpoolDemo.tsx  主控制器（组装屏幕 + 路由）  │
├──────────────────────────────────────────────────┤
│  第四层：基础设施                                  │
│  → components/demo/PhoneDemoShell.tsx  手机壳壳层 │
│  → components/ui/    shadcn 基础组件              │
│  → contexts/ThemeContext.tsx  三主题切换           │
│  → index.css         主题变量 + 动画类             │
└──────────────────────────────────────────────────┘
```

**所有路径相对于 `demo/client/src/`**

---

## 核心概念

### 屏幕流转

```
splash → home（3-Tab 主页）→ paywall → chat → ai-plan
  → round-update → deep-research → collab-prep
  → fulfillment → feedback → home（闭环）

home 内部结构（Tab 切换，非线性流转）：
┌─────────────────────────────────────┐
│  左 Tab：愿望广场（HomeScreen）      │
│  中 按钮：发布器（弹出录音面板）      │
│  右 Tab：我的愿望（MyWishesTab）     │
│  默认落点：愿望广场                   │
└─────────────────────────────────────┘
```

### DemoScreen ↔ WishExecutionStatus 映射

| DemoScreen | WishExecutionStatus |
|------------|---------------------|
| chat | clarifying |
| ai-plan | planning |
| round-update | validating |
| deep-research | validating |
| collab-prep | locking |
| fulfillment | in_progress |
| feedback | completed |

splash / home / paywall 无业务状态映射。

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
| 屏幕顺序 / 增删屏幕 | `features/demo-flow/types.ts` → `DEMO_SCREEN_ORDER` |
| 某个屏幕的 UI | `features/demo-flow/screens/XxxScreen.tsx` |
| 屏幕切换动画 | `features/demo-flow/motion.ts` |
| 场景 mock 数据 | `features/demo-flow/data.ts` |
| 用户输入→场景匹配逻辑 | `features/demo-flow/scenario-matcher.ts` |
| 业务状态类型 | `domains/wishflow/types.ts` |
| 主题色 / CSS 变量 | `index.css` |
| 手机壳外观 | `components/demo/PhoneDemoShell.tsx` |
| 全局 Provider | `App.tsx` |
| 3-Tab 导航 / 增删 Tab | `features/demo-flow/screens/MainTabScreen.tsx` |
| 发布器交互（录音+转写） | `MainTabScreen.tsx` → `openPublisher` / `startTranscribing` |
| 我的愿望列表 | `features/demo-flow/screens/MyWishesTab.tsx` |
| 图片资源（头像/背景） | `public/moon-avatar.png`、`public/moon-bg.png` |

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
└── frontend-skeleton.md                 ← 前端技术骨架说明

docs/archive/
└── business-analysis-summary.md         ← 早期商业分析归档（5 篇合并）

docs/progress/
├── index.md                             ← 进度索引看板
├── requirements.md                      ← 需求变更流（ReqID 登记）
└── development.md                       ← 开发执行流（关联 ReqID）
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
- 三主题：`moon`（暗墨）/ `star`（极光）/ `cloud`（晨风）
- 手机壳尺寸：375×812px，border-radius: 44px
- 动画类：`.fade-in-up` `.float-anim` `.moon-pulse` `.recording-pulse`
- Dev server 端口：3000

---

## 设计原则

- **手机优先**：所有屏幕在 375px 宽度内设计
- **屏幕独立**：每个屏幕在 `features/demo-flow/screens/` 下单独一个文件，新增屏幕遵循同样模式
- **主题感知**：颜色用 CSS 变量 `var(--primary)` 等，不要硬编码色值
- **动效克制**：过渡动画用已有 CSS 类，不要新增大量 JS 动画

---

## 约束

- 不要引入新的状态管理库（Redux、Zustand 等）
- 不要改 CSS 变量名（会破坏主题系统）
- 不要在 DRIFT_BOTTLES 字符串里用中文弯引号 `"` `"`（会导致 JS 编译报错）
- `WishpoolDemo.tsx` 是主控制器，只做屏幕组装和路由，不持有业务逻辑
- 业务状态类型定义在 `domains/wishflow/types.ts`，不散落在各屏幕文件
- 编辑 `shared.tsx` / `const.ts` 后，确认 IDE 中没有这些文件的旧版 tab 打开，否则 IDE 保存会覆盖改动
- 图片资源用本地路径（`/moon-bg.png`），不要用 CDN URL（CDN 加载慢且不稳定）

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
