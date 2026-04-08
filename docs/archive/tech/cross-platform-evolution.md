# Wishpool Web → Android 跨端演进方案

> 更新日期：2026-03-21  
> 适用范围：Wishpool 当前 `demo` 前端工程  
> 目的：在不改动现有大 PRD 框架的前提下，为 Wishpool 从 Web 前端基座演进到 Android 版本提供清晰的技术路径与分层建议。

---

## 1. 这份文档回答什么问题

当团队开始考虑 Android 版本时，真正要回答的不是“安卓页面怎么做”，而是：

- 当前 Web 工程能否作为 Android 演进的起点
- 哪些部分可以跨端复用，哪些不能复用
- 现在还差哪些技术骨架，才能支撑 Android 版本
- 应该先做“跨端能力抽象”，还是直接开始写 Android 页面
- 应该如何理解 Web 和 Android 的关系，避免两边各长一套产品逻辑

本文件聚焦的是：

**Wishpool 如何从当前 Web 前端基座，稳妥演进到 Android 版本。**

---

## 2. 核心判断

## 2.1 当前项目已经比重构前更适合做安卓

原因不是因为当前 Web 页面已经“足够完整”，而是因为这轮重构后，项目已经开始具备安卓迁移最需要的三个前提：

- 表达层与主控制器开始分离
- 页面状态与业务状态开始分离
- 任务推进闭环开始有领域骨架

这意味着：

**当前项目已经可以作为 Android 版本的前置技术基座。**

但需要明确：

**现在还不是“直接开始翻译 Web 页面到 Android 页面”的状态。**

---

## 2.2 当前不能直接拿 Web 页面结构做安卓

原因很简单：

当前 Web 项目虽然已经完成了一轮重构，但依然有大量表达层逻辑服务于 Demo narrative。比如：

- `demo-flow` 本质上仍然偏向 Demo 表达组织
- screen 的拆分仍然主要围绕 Web 演示流程
- 业务能力虽然开始抽象，但还没有完整独立成跨端共享层

如果此时直接开始做 Android，最容易发生的事情是：

- Web 一套页面逻辑
- Android 再实现一套页面逻辑
- 产品逻辑在两边分叉
- 后续需求同步成本越来越高

所以更短路径不是：

- 先画安卓 UI
- 再把 Web 页面照着搬过去

而是：

- **先把产品能力层再往前抽一层**
- 然后再让 Web 和 Android 各自承接自己的表现层

---

## 3. 当前推荐的跨端思路

## 3.1 Wishpool 不应该被理解成“一个 Web 产品，再做一个 Android 客户端”

更合理的理解应该是：

- Wishpool 有一套共同的产品能力模型
- Web 和 Android 只是这套能力模型的不同表现层

也就是说，未来应该是：

- **共享产品能力定义**
- **共享任务状态定义**
- **共享服务层语义**
- **不同端各自实现表现层和交互细节**

一句话说：

**Wishpool 应该是“一个产品骨架，多种终端表现”，而不是“两个各自长逻辑的端”。**

---

## 3.2 当前最应该跨端共享的，不是 UI，而是产品能力

对于 Wishpool 来说，真正适合跨端共享的是下面这套东西：

- 意图进入
- 需求转译
- 候选方案生成
- 可行性校验
- 协同锁定
- 成行推进
- 体验完成
- 结果沉淀

换句话说：

- Web 和 Android **不应该共享页面结构**
- Web 和 Android **应该共享任务推进闭环的定义**

---

## 4. 当前项目对安卓版本有什么价值

## 4.1 已经可以直接复用的部分

### 1）产品能力分层思路

当前已完成的重构，已经把项目从“单一大页面 Demo”推进到了：

- `pages/WishpoolDemo.tsx` 作为主控制器
- `features/demo-flow/` 作为表达层组织
- `domains/wishflow/types.ts` 作为业务骨架起点

这套分层思想本身，可以直接成为 Android 版本的产品能力来源。

### 2）任务状态模型方向

当前已经有：

- `WishExecutionStatus`
- `WishTask`
- `CandidatePlan`
- `ValidationCheck`
- `LockDecision`
- `ExperienceRecord`

虽然现在还偏骨架，但它们已经构成未来 Android 版本最重要的业务抽象起点。

### 3）产品主链路

当前已明确的通用产品主链路：

1. 意图进入
2. 需求转译
3. 候选方案生成
4. 可行性校验
5. 协同锁定
6. 成行推进
7. 体验完成
8. 结果沉淀

这条链路本身，应被视为跨端共享的产品骨架。

---

## 4.2 不能直接复用的部分

### 1）Web Demo 表达层

不能把这些直接理解为 Android 页面设计来源：

- `demo-flow/screens/*`
- `PhoneDemoShell`
- Web 特有动效组织方式
- 当前部分 narrative 驱动的 screen 切换方式

这些内容更多是：

- Demo 演示层
- Web 当前阶段的表达层
- 用来帮助展示产品，而不是安卓的最终交互标准

### 2）Web 特有壳层能力

例如：

- 手机壳容器
- Web 端页面切换动画实现
- Web 端 DOM 结构依赖

这些不能视为 Android 直接可复用内容。

### 3）当前 screen 粒度的表现组织

虽然 screen 已经拆成了单文件，但它仍然是：

- Web 表达层颗粒度
- 不是 Android 最佳页面颗粒度

Android 后续的 screen / page / fragment / compose screen 组织，不应被当前 Web screen 命名机械绑定。

---

## 5. 当前最推荐的技术路线

## 5.1 推荐路线：先抽跨端产品骨架，再做 Android

这是当前最稳妥、也最短的路线。

路径如下：

### 第一步：继续收敛 Web 工程中的“跨端共享层”

先把当前工程继续收成这些层：

- `domains`
- `use-cases`（建议新增）
- `services`（建议新增）
- `presentation/web`
- `presentation/demo-flow`

### 第二步：定义 Android 只承接哪些层

Android 侧应该优先承接：

- 领域模型
- 用例语义
- 状态流转逻辑
- 数据服务协议

Android 不应该优先承接：

- Web Demo 表达层
- 当前 Web 的壳层视觉结构

### 第三步：在 Android 上重新实现表现层

此时 Android 页面才应该开始围绕：

- 任务详情
- 推进状态
- 校验结果
- 锁定确认
- 履约结果

去重新组织，而不是照着 Web demo 一页一页搬。

---

## 5.2 不推荐路线：直接把 Web 页面翻译成 Android

这条路短期看省事，实际上会埋下很大问题：

- 页面结构直接绑定当前 Demo narrative
- Web 和 Android 的产品逻辑容易分叉
- 后续改需求时两边要分别维护
- Android 被迫继承当前 Web 的表达层历史包袱

所以不推荐。

---

## 5.3 中期是否要用跨端框架统一

这是一个后置问题，不应该在当前阶段最先决定。

当前更关键的问题不是：

- Kotlin / Flutter / React Native 到底选谁

而是：

- **产品能力层是否已经独立到足以跨端复用**

在这件事没做完之前，过早决定跨端框架，很可能只是把混杂结构换个平台再复制一遍。

所以当前判断顺序应该是：

1. 先做跨端共享层抽象
2. 再评估 Android 用原生还是跨端框架

---

## 6. 推荐的目标技术骨架

如果未来明确要支持 Android，建议把当前 Web 工程继续演进成下面这种结构。

## 6.1 推荐的 Web 侧骨架

```text
client/src
├── app/                    # 应用入口与全局壳层（后续可新增）
├── domains/                # 领域对象与状态模型
│   └── wishflow/
├── use-cases/              # 业务用例层（建议新增）
├── services/               # API / mock / analytics / auth（建议新增）
├── features/               # 面向场景的能力组合
│   └── demo-flow/
├── components/             # 通用 UI 与表达层壳组件
├── contexts/
├── hooks/
├── lib/
└── pages/
```

### 各层说明

#### `domains/`

职责：
- 核心业务对象
- 状态机模型
- 任务推进闭环抽象

这是未来 Web 和 Android 最应该对齐的一层。

#### `use-cases/`（建议新增）

职责：
- 描述业务动作，而不是页面动作

例如：
- 创建意图任务
- 生成候选方案
- 触发可行性校验
- 提交锁定确认
- 完成体验并记录结果

这是未来最适合跨端共享语义的一层。

#### `services/`（建议新增）

职责：
- 承接 API、mock 数据源、埋点、认证、配置

例如：

```text
services/
├── wishflow/
├── analytics/
├── auth/
└── config/
```

这层的目标是：

**让页面和 feature 不直接依赖静态数据或散落的环境变量。**

#### `features/`

职责：
- 将若干领域能力组合成用户可见的场景能力

例如未来可以演进为：
- `features/intent-entry`
- `features/plan-candidate`
- `features/validation`
- `features/collaboration-lock`
- `features/fulfillment`

#### `presentation`（当前可理解为页面与表达层）

当前项目里还没有显式 `presentation/` 目录，但本质上已经存在：

- `pages/WishpoolDemo.tsx`
- `features/demo-flow/screens/*`
- `components/demo/*`

未来如果继续走跨端演进，建议逐步明确：

```text
presentation/
├── web/
└── demo-flow/
```

---

## 6.2 推荐的 Android 侧骨架

Android 端不应照抄 Web 的目录名，但建议遵循相同的职责边界。

如果是原生 Android（Kotlin / Compose），建议理解为：

```text
android/
├── ui/                     # Android 表现层
├── viewmodel/              # 状态组织与屏幕交互
├── domain/                 # 对齐 Wishflow 领域模型
├── usecase/                # 对齐业务用例层
├── data/                   # API / repository / local cache
└── mapper/                 # 领域对象到 UI 模型映射
```

### Android 各层与当前 Web 的对应关系

| Android 层 | 对应当前 Web 思路 | 说明 |
|---|---|---|
| `domain/` | `domains/wishflow/` | 核心业务对象与状态模型 |
| `usecase/` | 未来建议新增的 `use-cases/` | 跨端共享的业务动作语义 |
| `data/` | 未来建议新增的 `services/` | 对接接口、仓储、缓存 |
| `ui/` | `pages/ + features/demo-flow/screens/` | 各端独立实现，不共用 UI |
| `viewmodel/` | `useDemoFlow + page controller` 的思想升级版 | 端内状态组织 |

---

## 7. Android 版本应该如何理解页面与能力的关系

## 7.1 Android 不应该复用 Web screen 结构

例如当前 Web 有：

- `HomeScreen`
- `PaywallScreen`
- `ChatScreen`
- `AiPlanScreen`
- `RoundUpdateScreen`
- `DeepResearchScreen`
- `CollabPrepScreen`
- `FulfillmentScreen`
- `FeedbackScreen`

这些是当前 Demo 叙事友好的表现方式。

Android 版本不应该简单复制为完全相同的页面序列。

---

## 8. 当前确认后的落地结论（2026-03-27 更新）

结合本轮规划，Wishpool 当前已经完成以下方向确认：

- Android 正式路线采用 **原生 Android（Kotlin + Compose）**
- 当前交付先落在 **APK**
- 规划标准按未来 **可上架版本** 推进
- Android 运行时改为 **直连 Supabase PostgREST + RPC**，`demo/server` 仅保留为历史实现参考

同时，本轮也明确了首批 Android MVP 采用 **扩展版范围**：

- Feed 浏览
- 点赞 / 评论
- 发愿创建
- 愿望补充澄清
- 方案确认
- 轮次进展查看
- 我的愿望列表

这里需要特别说明：

- “我的愿望列表” 已被纳入首批 Android MVP
- 但当前后端尚无列表接口，因此它属于后续执行中的明确补齐项

这意味着当前最合适的推进方式不是“先翻页面”，而是：

1. 先按 Android 正式工程建立分层骨架
2. 先接现有后端已具备的能力
3. 同步补齐“我的愿望列表”所需后端接口
4. 后续再进入 Auth / RLS / 支付等更正式能力

原因是：

- Android 的交互节奏不同
- Android 更适合“状态详情页 + 连续任务流”
- Web 当前 narrative 里的一些切页动作，在 Android 上可能更适合合并成单页的分阶段界面

---

## 7.2 Android 更应该围绕“任务闭环”组织界面

Android 更适合围绕下面这些能力做信息结构：

- 当前任务卡
- 方案候选区
- 可行性校验区
- 锁定确认区
- 当前推进状态
- 已完成体验记录

也就是说，Android 更适合：

**围绕任务详情与推进状态组织页面，而不是围绕演示章节组织页面。**

---

## 8. 当前项目还差什么，才能更适合做 Android

## 8.1 缺少独立的 `use-cases` 层

当前有领域骨架，但“业务动作”还没有被显式抽出来。

这会导致：

- Web 页面仍然承担部分业务流转语义
- Android 如果现在接入，会很难判断哪些逻辑该复用

所以这是当前最应该补的一层。

---

## 8.2 缺少独立的 `services` 层

当前 `demo-flow/data.ts` 仍承担很多静态内容角色。

如果未来要支持安卓，需要进一步把下面这些能力独立出来：

- 获取候选方案
- 获取任务详情
- 获取校验记录
- 获取场景样本
- 提交用户确认
- 提交体验反馈

否则 Android 仍会被迫直接依赖 Web 风格的数据组织方式。

---

## 8.3 缺少“跨端共享语义”的文档化定义

当前已经有：

- 产品能力层骨架
- 技术骨架文档

但如果真要做 Android，后续还需要继续沉淀：

- 哪些领域对象是稳定的
- 哪些状态值是稳定的
- 哪些业务动作是跨端一致的
- 哪些只是某个端的表现行为

---

## 9. 当前推荐的推进顺序

如果团队准备认真考虑 Android，我建议按这个顺序推进。

### 阶段 1：先稳定跨端共享层

优先做：

- 强化 `domains/wishflow`
- 新增 `use-cases/`
- 新增 `services/`
- 明确任务推进闭环的跨端语义

### 阶段 2：明确 Android 信息架构

优先做：

- Android 不再照搬 Web Demo narrative
- 而是围绕任务闭环重新组织页面结构

### 阶段 3：再进入 Android 实现

此时才真正开始：

- 定 Android 页面
- 定 Android 状态组织
- 决定原生 or 跨端框架

---

## 10. 技术选型建议（先给原则，不给结论）

当前阶段，我不建议现在就武断决定：

- 一定用原生 Android
- 一定用 Flutter
- 一定用 React Native

因为当前更关键的是：

**产品能力层是否足够独立。**

### 如果未来特点是：

- Android 要有很强的本地能力接入
- 交互节奏会与 Web 明显不同
- 长期会单独演化

那更偏向：
- 原生 Android

### 如果未来特点是：

- Web / Android 要追求较高 UI 复用
- 端间交互逻辑尽量统一
- 团队更偏前端能力

那再评估：
- React Native 或 Flutter

但无论哪条路，前提都一样：

**先抽共享能力层。**

---

## 11. 结论

当前 Wishpool 项目已经完成了“从 Demo 大页面到前端基座”的第一轮关键重构，这使它具备了继续演进到 Android 的基础条件。

但要注意：

- 当前适合“以它为起点”做 Android
- 不适合“直接把当前 Web 页面搬成 Android”

最合理的路径是：

1. 继续抽跨端共享的能力层
2. 再让 Android 基于共享能力层单独实现表现层
3. 避免 Web 与 Android 两边各自长产品逻辑

一句话总结：

**Wishpool 的 Android 版本，应该复用产品能力骨架，而不是复用 Web Demo 页面结构。**

---

## 12. 推荐下一步

如果团队后续真的要准备 Android，建议继续补两份文档：

1. **《Wishflow 领域模型与用例定义》**
   - 解决“跨端到底共享什么”

2. **《Android 信息架构草案》**
   - 解决“安卓不照搬 Web 页面时，该怎么组织”

这样 Web 与 Android 的边界会更清晰，实施成本也更可控。
