# Wishpool 前端技术骨架说明

> 更新日期：2026-03-31  
> 适用范围：`demo/client` 表达层骨架（历史说明，非正式 Web 主产品端）  
> 目的：解释 `demo` 这条演示栈为什么这样组织，以及它与正式 `web/` 主栈的边界。

> 说明：
> - 正式 Web 主栈请看 `web/CLAUDE.md`
> - 仓库级导航请看根 `CLAUDE.md`
> - 本文档不再代表“整个前端主基座”，而是 `demo` 演示层的历史/过渡骨架说明

---

## 1. 文档目的

本说明文档聚焦于当前 Wishpool 项目的**前端技术骨架**，回答以下问题：

- 当前项目的前端工程是如何组织的
- 目录为什么这样拆
- 哪些目录属于表达层，哪些目录属于能力层
- 当前业务状态模型和页面状态模型如何映射
- 后续继续开发时，应该往哪里加代码，而不是继续堆到单个页面里

本文件不替代产品 PRD，不描述接口字段细节，也不替代具体实现方案。它的作用是：

**帮助开发理解“这个项目接下来应该怎么长”。**

---

## 2. 当前项目技术定位

### 2.1 当前工程定位

当前这份文档描述的是 `demo` 这条演示栈的骨架。它仍然保留了一批可复用表达层资产，但已经不是正式 Web 主产品端。

也就是说，当前 `demo` 更准确的定位是一个：

- 保留现有 V1 / V2 / V2.1 PRD 表达层
- 同时开始按产品能力层组织代码
- 可继续作为正式 `web/` 主栈收口时的参考与过渡资产

### 2.2 当前不变的约束

以下内容在本轮重构中保持不变：

- 不改大的 PRD 框架
  - `docs/PRD-wishpool-buddy-v1.md`
  - `docs/PRD-wishpool-v2.md`
  - `docs/prd/PRD-v2.1-feed.md`
- 不推翻当前 Demo narrative
- 不把项目直接改造成完整线上产品

### 2.3 当前技术目标

当前 `demo` 演示栈服务于以下目标：

- 保留现有表达层演示能力
- 让演示栈结构仍可维护、可构建、可继续扩展
- 为正式 `web/` 主栈迁移提供参考，而不是继续承担正式产品主路径

---

## 3. 当前目录骨架

以下是当前 `demo/client/src` 的核心目录结构：

```text
client/src
├── App.tsx
├── main.tsx
├── index.css
├── const.ts
├── assets/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── Map.tsx
│   ├── ManusDialog.tsx
│   ├── demo/
│   │   └── PhoneDemoShell.tsx
│   └── ui/
├── contexts/
│   └── ThemeContext.tsx
├── domains/
│   └── wishflow/
│       └── types.ts
├── features/
│   └── demo-flow/
│       ├── data.ts
│       ├── motion.ts
│       ├── navigation.ts
│       ├── screens.ts
│       ├── shared.tsx
│       ├── types.ts
│       ├── useDemoFlow.ts
│       ├── __tests__/
│       │   └── navigation.test.ts
│       └── screens/
│           ├── _shared-imports.ts
│           ├── index.ts
│           ├── HomeScreen.tsx
│           ├── PaywallScreen.tsx
│           ├── ChatScreen.tsx
│           ├── AiPlanScreen.tsx
│           ├── RoundUpdateScreen.tsx
│           ├── DeepResearchScreen.tsx
│           ├── CollabPrepScreen.tsx
│           ├── FulfillmentScreen.tsx
│           └── FeedbackScreen.tsx
├── hooks/
├── lib/
└── pages/
    ├── Home.tsx
    ├── NotFound.tsx
    └── WishpoolDemo.tsx
```

---

## 4. 目录职责说明

## 4.1 `pages/`

### `pages/WishpoolDemo.tsx`

这是当前 Demo 的**主控制器**，职责已经被刻意收敛为：

- 控制当前主题角色
- 管理当前激活的 screen
- 管理 demo 导航方向
- 决定在某个 screen 下渲染哪个 screen 组件
- 将内容挂载到统一的 demo 壳层里

它**不应该再承担**：

- 具体 screen 的完整 UI 实现
- 漂流瓶数据定义
- 共享视觉组件定义
- 页面顺序与业务状态映射逻辑

一句话理解：

**`WishpoolDemo.tsx` 现在是 orchestration 层，而不是内容承载层。**

### `pages/Home.tsx` / `pages/NotFound.tsx`

当前属于模板或备用页面，不是当前核心 narrative 的主要承载页。

---

## 4.2 `components/`

### `components/demo/PhoneDemoShell.tsx`

这是当前 Demo 的**统一展示壳层**，负责：

- 手机壳外观
- 屏幕区域过渡动画
- 底部 screen 指示器
- 当前 screen 标签提示

这层的定位是：

**只负责“怎么呈现”，不负责“现在在哪个业务阶段”。**

### `components/ui/`

该目录是当前 UI 组件库存，主要承担通用样式与交互组件能力。当前项目中它更多是支撑层，而不是业务核心层。

### `components/ErrorBoundary.tsx`

负责页面渲染异常时的前端兜底，避免首屏白屏。

---

## 4.3 `domains/`

### `domains/wishflow/types.ts`

这是当前业务能力层开始落地的第一层：**领域模型层**。

它定义了当前项目最重要的业务抽象方向：

- `WishExecutionStatus`
- `WishTask`
- `CandidatePlan`
- `ValidationCheck`
- `LockDecision`
- `ExperienceRecord`

这部分代表的是：

**项目开始从“页面状态驱动”向“任务状态驱动”转型。**

当前这层还是骨架，但后续真实业务应该优先往这里继续长。

---

## 4.4 `features/demo-flow/`

这是当前 Demo 表达层与产品能力层之间的**桥接目录**。

它不是纯 UI，也不是完整业务层，而是：

**围绕现有 Demo 叙事组织的 feature 层。**

### `features/demo-flow/types.ts`

定义 Demo 维度下的基础类型：

- `CharacterType`
- `DemoScreen`
- `DEMO_SCREEN_ORDER`
- `DEMO_SCREEN_LABELS`
- `DEMO_SCREEN_STATUS_MAP`

作用：

- 描述 Demo 有哪些 screen
- 描述 screen 的可视标签
- 描述 demo screen 与业务状态的对应关系

### `features/demo-flow/navigation.ts`

负责 Demo screen 的导航和映射逻辑，例如：

- 下一个 screen 是什么
- 上一个 screen 是什么
- 当前 screen 对应的业务状态是什么

作用：

**把页面顺序逻辑抽出成独立工具，而不是写死在页面组件内部。**

### `features/demo-flow/useDemoFlow.ts`

这是当前 Demo 的导航 hook，负责：

- 保存当前 screen
- 保存页面切换方向
- 提供 `navigate / goNext / goBack`
- 暴露当前 `screenLabel`
- 暴露当前映射出的 `businessStatus`

作用：

**将 Demo 运行时状态管理从页面控制器中剥离。**

### `features/demo-flow/motion.ts`

负责 demo 页面的统一过渡动画配置。

作用：

**让动画配置脱离页面组件，避免视觉行为散落在业务控制器中。**

### `features/demo-flow/shared.tsx`

放置所有 screen 共享的表达层组件与上下文，例如：

- `CharacterContext`
- `MOON_BG`
- `MOON_AVATAR`
- `StatusBar`
- `NavBar`
- `StarField`
- `SplashScreen`

作用：

**承接表达层的共用视觉积木。**

### `features/demo-flow/data.ts`

放置 Demo 表达层所依赖的数据与内容结构，例如：

- 漂流瓶数据 `DRIFT_BOTTLES`
- 场景数据 `WISH_SCENARIOS`
- `DEFAULT_SCENARIO`
- 局部辅助类型和文本常量

作用：

**承接表达层的内容资产，而不污染控制器。**

### `features/demo-flow/screens/`

这是当前表达层细拆后的主要目录，每个 screen 一个文件。

职责是：

- 一个 screen 文件只实现一个 screen 的 UI 与局部交互
- 不承接应用级导航逻辑
- 不承接任务总状态控制
- 不承接全局配置

当前已拆分为：

- `HomeScreen.tsx`
- `PaywallScreen.tsx`
- `ChatScreen.tsx`
- `AiPlanScreen.tsx`
- `RoundUpdateScreen.tsx`
- `DeepResearchScreen.tsx`
- `CollabPrepScreen.tsx`
- `FulfillmentScreen.tsx`
- `FeedbackScreen.tsx`

### `features/demo-flow/screens/_shared-imports.ts`

这是 screen 细拆后的导入收口层。

作用：

- 统一承接 screen 间共用的 import
- 降低每个 screen 文件顶部导入重复度
- 保持拆分后的文件可以较快稳定落地

说明：

这是一层**工程性中间层**，后续如果继续精修表达层，可以再逐步弱化或替换。

### `features/demo-flow/screens/index.ts`

这是 screen 目录的 barrel export，用于统一导出各个 screen。

### `features/demo-flow/screens.ts`

这是对 `screens/index.ts` 的再导出入口，用于兼容上层引用方式，避免大范围改 import 路径。

---

## 4.5 `contexts/`

### `contexts/ThemeContext.tsx`

负责主题能力，当前主要服务三角色主题切换。

定位：

- 当前主要属于表达层基础设施
- 未来如果主题能力继续增强，可以保留为全局 UI 基础能力

---

## 4.6 `hooks/`

### 当前存在的 hooks

- `useComposition.ts`
- `useMobile.tsx`
- `usePersistFn.ts`

定位：

- 这层是通用行为逻辑层
- 应继续保持与业务领域模型解耦
- 后续如果出现“任务流特有 hook”，不应默认塞到这里，应先考虑放入对应 `features` 或 `domains` 下

---

## 4.7 `lib/`

### `lib/utils.ts`

当前承载通用工具能力，例如 className 合并。

定位：

- 保持为底层工具层
- 不承接业务语义

---

## 5. 当前技术分层理解

如果从职责角度理解，当前前端工程已经形成了下面这套技术分层：

### 第 1 层：应用壳层

- `main.tsx`
- `App.tsx`
- `components/demo/PhoneDemoShell.tsx`

负责：

- 应用挂载
- Provider 组装
- 全局错误兜底
- Demo 展示壳层

### 第 2 层：页面控制层

- `pages/WishpoolDemo.tsx`

负责：

- 当前 narrative 的主控制器
- screen 切换和 scenario 选择

### 第 3 层：feature 组织层

- `features/demo-flow/*`

负责：

- demo flow 的 screen、导航、标签、共享内容、表达层数据
- 是当前表达层的主要聚合区

### 第 4 层：领域骨架层

- `domains/wishflow/types.ts`

负责：

- 产品能力层核心对象
- 任务推进闭环的骨架抽象

### 第 5 层：基础能力层

- `components/ui/*`
- `hooks/*`
- `lib/*`
- `contexts/*`

负责：

- 支撑式基础能力
- 与具体业务叙事解耦

---

## 6. 当前状态模型说明

当前项目同时存在两套状态：

### 6.1 页面状态（Demo Screen）

由 `features/demo-flow/types.ts` 定义：

- `splash`
- `home`
- `paywall`
- `chat`
- `ai-plan`
- `round-update`
- `deep-research`
- `collab-prep`
- `fulfillment`
- `feedback`

这套状态用于：

- 控制 Demo 叙事展示
- 驱动当前 screen 切换

### 6.2 业务状态（WishExecutionStatus）

由 `domains/wishflow/types.ts` 定义：

- `draft`
- `clarifying`
- `planning`
- `validating`
- `locking`
- `ready`
- `in_progress`
- `completed`
- `failed`
- `cancelled`

这套状态用于：

- 描述未来真实产品中的任务推进阶段
- 承接 AI + 人工协同推进逻辑

### 6.3 当前两套状态之间的关系

当前项目已经通过 `DEMO_SCREEN_STATUS_MAP` 做了第一层映射：

- `chat -> clarifying`
- `ai-plan -> planning`
- `round-update / deep-research -> validating`
- `collab-prep -> locking`
- `fulfillment -> in_progress`
- `feedback -> completed`

这层映射的意义在于：

**当前 Demo 仍按页面展示，但底层已经开始对齐真实业务状态。**

---

## 7. 当前推荐的开发落点

后续新增代码时，不要默认继续往 `WishpoolDemo.tsx` 或任意一个 screen 里塞。建议按以下规则判断落点：

### 7.1 如果是“任务推进闭环”的核心对象

放到：

- `domains/wishflow/`

例如：

- 新的任务对象
- 校验对象
- 锁定对象
- 履约结果对象

### 7.2 如果是“当前 Demo 表达层”的 screen、导航、展示逻辑

放到：

- `features/demo-flow/`

例如：

- 新增一个 demo screen
- 新增某个 screen 的内部展示交互
- 新增 screen 与业务状态的映射规则

### 7.3 如果是“跨 screen 共用的视觉部件”

优先考虑：

- `features/demo-flow/shared.tsx`
- 或 `components/demo/`

### 7.4 如果是“真正通用、与业务无关”的基础能力

放到：

- `components/ui/`
- `hooks/`
- `lib/`

### 7.5 如果是“接口层 / mock service / 未来真实服务接入”

当前仓库还没有完整独立的 `services` 或 `api` 层。后续建议新增，例如：

```text
client/src/services/
  wishflow/
  analytics/
  auth/
```

而不是继续塞进 screen 或 `const.ts`。

---

## 8. 当前推荐的后续扩展方向

如果后续继续开发，不建议再优先做纯结构优化，而建议按以下顺序推进：

### 方向 1：补齐任务详情与推进状态层

目标：

- 让 `WishTask / CandidatePlan / ValidationCheck / LockDecision` 不再只是类型骨架
- 开始形成真实产品能力层

### 方向 2：抽真实接口层

目标：

- 将当前场景数据和未来真实数据源解耦
- 让 screen 不直接依赖全部静态数据

### 方向 3：按能力层继续细化表达层

目标：

- 不是再把页面拆得更碎
- 而是让 `screen` 更明确地承接某一段任务状态的表现

### 方向 4：做 code splitting / bundle 优化

目标：

- 解决当前构建已通过但 chunk 体积偏大的问题

---

## 9. 当前技术骨架的优点

### 9.1 已摆脱单文件控制全部逻辑

过去：
- 页面控制
- 内容数据
- 共享视觉
- screen 实现
- 业务状态
都混在一个大文件中

现在：
- 已经形成分层结构
- 控制器、表达层、能力层骨架开始清晰分离

### 9.2 保留了 PRD 表达层稳定性

这次重构没有破坏当前 narrative 的基本表达路径，便于继续演示和继续开发并行推进。

### 9.3 后续扩展路径已经明确

后续新增能力可以按目录职责落位，而不是继续靠经验堆代码。

---

## 10. 当前技术骨架的限制

### 10.1 `demo-flow` 仍是表达层中心

当前结构已经比以前好很多，但 `features/demo-flow/` 仍然承担了大量表达层职责。

这符合当前阶段目标，但也意味着：

- 后续如果要走向真实产品
- 仍需要继续把真实任务流能力从表达层中抽离出来

### 10.2 `screens/_shared-imports.ts` 是过渡层

这是当前为快速完成 screen 细拆引入的工程过渡层。

优点：
- 快速稳定
- 降低重复 import

限制：
- 长期看，它不应承载越来越多业务语义
- 后续精修时，可以逐步弱化

### 10.3 当前还没有独立服务层

当前结构已经具备服务层接入条件，但尚未正式引入 `api/services` 目录。

---

## 11. 结论

当前 Wishpool 前端工程已经完成了从：

- `单个大 Demo 文件`

向

- `主控制器 + 表达层模块 + 领域骨架 + 基础层`

的转型。

这意味着 `demo` 已经具备继续作为演示栈和迁移参考存在的条件，但正式产品前端主路径已经转移到 `web/`。

对后续开发来说，最重要的纪律不是“继续拆文件”，而是：

- 不再把页面当产品本体
- 不再把 narrative 顺序当业务状态
- 开始围绕任务推进闭环继续长能力

如果继续遵守当前这套骨架，项目后续演进会更稳。

---

## 12. 推荐阅读顺序

如果后续开发同学第一次接手该项目，建议按以下顺序阅读：

1. `docs/progress.md`
2. `docs/PRD-wishpool-v2.md`
3. `docs/prd/PRD-v2.1-feed.md`
4. `demo/client/src/pages/WishpoolDemo.tsx`
5. `demo/client/src/features/demo-flow/useDemoFlow.ts`
6. `demo/client/src/features/demo-flow/types.ts`
7. `demo/client/src/domains/wishflow/types.ts`
8. `demo/client/src/features/demo-flow/data.ts`
9. `demo/client/src/features/demo-flow/screens/`

这样最容易建立完整上下文。
