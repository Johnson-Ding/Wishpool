# REQ-010｜发愿入口与首轮澄清链路

> 状态：`in_progress`
> 关联 PRD：`docs/prd/PRD-wishpool-v3.md`
> 关联需求流水：`REQ-010`
> 关联开发流水：`DEV-011`

---

## 1. 目标

把“发愿入口 → 首轮澄清 → 进入方案/详情”的核心链路映射到当前仓库中的 `PRD / Web Demo / Android / iOS / Supabase`，让后续三端执行有统一基线。

## 2. 范围 / 非目标

### 范围

- 发愿入口：用户从主界面进入发愿动作的入口形态
- 首轮澄清：用户第一次补充意图、城市、预算、时间窗口等约束的承接方式
- 方案承接：澄清后进入 AI 方案或愿望详情的落点
- 状态衔接：`create_wish` 与 `clarify_wish` 对应的状态变化

### 非目标

- 不覆盖搭子匹配、协同筹备、履约反馈
- 不覆盖 Feed 点赞、评论、漂流瓶互动
- 不要求本轮把三端交互细节完全改到一致

## 3. PRD 对应

- 对应文档：`docs/prd/PRD-wishpool-v3.md`
- 主对应章节：`模块二：发愿（中间按钮 → 全链路）`
- 主对应用户故事：
  - `US-05｜语音发愿 + 实时转写`
  - `US-06｜AI 直出方案 + 用户确认关键细节`
- 关联用户故事：
  - `US-11｜愿望列表与状态管理`
  - `US-12｜愿望详情与进度跟踪`

## 4. 跨端映射表

| 维度 | 落点 | 当前状态 |
|------|------|----------|
| PRD | `PRD-wishpool-v3.md` 中 `US-05 / US-06` 定义了发愿与首轮澄清主链路，`US-11 / US-12` 承接“进入我的愿望 / 愿望详情”后的持续管理 | `已定义` |
| Web Demo | `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx` 负责中央发愿按钮、录音面板、`createWish(...)` 与场景分支；`ChatScreen.tsx` 承接半屏 AI 澄清；`AiPlanScreen.tsx` 承接方案展示与确认 | `已落地，作为当前表达基线` |
| Android | `android/app/src/main/java/com/wishpool/app/feature/home/PublisherSheet.kt` 负责录音转写表达；`feature/create/WishCreateRoute.kt` 承接创建表单；`feature/detail/WishDetailRoute.kt` 承接澄清与确认；`feature/aiplan/AiPlanRoute.kt` 承接方案页 | `已具备对应页面，入口节奏待与 Web Demo 对齐` |
| iOS | `ios/Sources/WishpoolApp/CreateWishSheet.swift` 负责发愿入口；`WishpoolAppModel.swift` 调用 `createWish / clarifyWish / confirmWishPlan`；`WishDetailView.swift` 承接澄清与方案确认 | `已具备最小闭环，方案页与详情页当前合并承接` |
| Supabase | `supabase/sql/003_rpc_functions.sql` 中 `create_wish` 负责创建并进入 `clarifying`；`clarify_wish` 负责补充约束并进入 `planning`；`confirm_wish_plan` 负责从 `planning` 进入 `ready` | `已落地` |

## 5. 执行顺序与优先级

1. 以 Web Demo 为交互基线，先锁定“入口、首轮澄清、方案确认”三段式口径。
2. Android 对齐 Web Demo 的入口节奏，重点处理 `PublisherSheet / WishCreateRoute / WishDetailRoute / AiPlanRoute` 之间的职责边界。
3. iOS 在现有最小闭环上确认是否继续采用“详情页承接澄清与确认”，还是拆出独立方案页。
4. 若端侧口径与 PRD 冲突，先回到本文件定位差异，再决定是否需要改 PRD 或改实现。

## 6. 验收口径

- 能从一份文档中直接找到该链路在 `PRD / Web / Android / iOS / Supabase` 的实际落点。
- 能明确区分“发愿入口”“首轮澄清”“方案确认”“进入我的愿望/详情”四个节点，不再混成一个模糊功能点。
- 能明确当前差异：
  - Web Demo 用半屏 AI 澄清 sheet 承接首轮澄清。
  - Android 已有对应页面，但链路节奏不完全等同于 Web Demo。
  - iOS 目前由 `CreateWishSheet + WishDetailView` 合并承接澄清与确认。
- 后续任何涉及这条链路的改动，都应先回写本文件，再分发到对应端侧实现。

## 7. 当前状态

- `PRD`：`US-05 / US-06` 已明确为主定义口径，当前无须再把工程实现写回 PRD。
- `Web Demo`：当前是最完整的表达基线，已把入口、录音转写、半屏澄清、方案页串成一条连续体验。
- `Android`：当前已有创建、详情、方案、仓储调用四段能力，但与 Web Demo 相比，入口与澄清承接仍是分散页组合，不是同一节奏。
- `iOS`：当前已有最小闭环；发愿后直接进入详情，澄清与确认在 `WishDetailView` 完成，尚未拆独立 AI 方案页。
- `Supabase`：当前 RPC 已能承接这条链路的状态变化，后续更多问题主要在端侧体验对齐，不在数据层缺口。

## 8. 关联流水

- 需求：`docs/progress/requirements.md` 中 `REQ-009`、`REQ-010`
- 开发：`docs/progress/development.md` 中 `DEV-009`、`DEV-011`
- 基准需求：`docs/prd/PRD-wishpool-v3.md`
