# 需求变更流（Requirements Progress）

> 更新于 2026-03-29
> 仅记录：需求定义、范围边界、优先级、验收标准。**不记录实现细节**。

---

## REQ-001｜进度文档分流机制（进行中）

- 状态：`in_progress`
- 来源：用户对“新增需求需要通读整份 progress”的痛点反馈
- 目标：建立“总览 + 需求/开发/测试三条流水”的检索结构
- 范围：仅文档结构与记录规则，不包含功能代码改造
- 验收标准：
  - [ ] `docs/progress.md` 仅保留索引看板
  - [ ] 建立 `requirements/development/testing` 三份流水文档
  - [ ] 后续需求可通过 `ReqID` 串联开发与测试记录
- 关联开发记录：`DEV-001`
- 关联测试记录：`TEST-001`

---

## REQ-002｜首页 Tab 化 + 我的愿望管理页（已实现，补录）

- 状态：`implemented`
- 来源：版本调整 — 从单一首页 feed 演进为"广场 + 我的愿望"双 Tab 结构
- 目标：用户可在首页底部切换"广场"与"我的愿望"，查看自己所有愿望的状态并做决策
- 范围：
  - 新增 `MainTabScreen`：包裹原 `HomeScreen`，增加底部 Tab 栏（广场 / 许愿按钮 / 我的）
  - 新增 `MyWishesTab`：我的愿望列表，按"待决策 / 进行中·已完成"分组，可展开操作
  - 中央许愿按钮：点击弹出录音面板 → 提交后进入 chat 流程
- 验收标准：
  - [x] 底部 Tab 栏可切换广场与我的愿望
  - [x] 我的愿望列表展示 mock 数据，卡片可展开/收起
  - [x] 中央许愿按钮弹出录音面板，转写后可提交
  - [ ] `pnpm run check` 通过（当前有 TS 编译错误待修）
  - [ ] `WishStatus` 类型应迁移至 `domains/wishflow/types.ts`
  - [ ] 硬编码色值应改为 CSS 变量
- 关联开发记录：`DEV-002`
- 关联测试记录：`TEST-002`（待建）

---

## REQ-003｜Supabase 后端主链路建模（已实现当前范围）

- 状态：`implemented`
- 来源：产品方向保持双路径并行，后端采用 Supabase 直连承载（方案 A）
- 目标：在 Supabase 数据底座之上补齐真实可用的后端接口层，优先打通发愿主链路，其次补齐 Feed 读取与互动能力
- 范围：
  - 建立核心表结构（匿名身份、愿望任务、轮次校验、协同锁定、履约、漂流瓶）
  - 新增 Node/Express API 层，承接 Supabase 数据访问与最小业务编排
  - 发愿主链路接口：创建愿望、补充澄清信息、查询详情、确认方案、查询轮次
  - Feed 接口：读取内容流、点赞、评论
  - `ai_plan` 采用结构化 JSON（决策：B）
  - 插入首页漂流瓶种子数据（决策：A）
- 非目标：
  - 本轮不接入 Supabase Auth（匿名流程先行）
  - 本轮不落 AI 中间调用明细日志表
  - 本轮不接入真实 AI 生成链路，只提供可运行的接口占位与状态推进
- 验收标准：
  - [x] 提供可直接在 Supabase MCP / SQL Editor 执行的建表脚本
  - [x] 提供可直接执行的种子数据脚本（含漂流瓶）
  - [x] 字段可覆盖当前 `WISH_SCENARIOS` 的结构化计划信息
  - [x] 提供可运行的服务端入口与环境变量模板
  - [x] 发愿主链路接口具备请求校验、错误处理、类型检查与自动化测试
  - [x] Feed 接口具备读取、点赞、评论能力，并覆盖自动化测试
  - [x] `ReqID` 已关联开发执行记录
- 关联开发记录：`DEV-003`

---

## REQ-004｜真实 Supabase 运行时接入（已实现）

- 状态：`implemented`
- 来源：后端接口层已落地（REQ-003），需要接通真实数据库并让前端消费真实 API
- 目标：前后端端到端打通 Supabase 实库，Feed 链路实现数据活化
- 范围：
  - 后端 `.env` + dotenv 加载 Supabase 连接
  - 前端 API 客户端 + useFeedData hook
  - Vite proxy 转发 `/api` 到后端
  - HomeScreen 从 API 拉取 feed，点赞/评论走真实接口
  - API 不可用时优雅降级到静态数据
- 非目标：
  - 本轮不接 Wishes 前端链路
  - 本轮不做 Auth / RLS
- 验收标准：
  - [x] `pnpm run check` 通过
  - [x] `pnpm run build` 通过
  - [x] `pnpm run test:run` 全绿
  - [x] Supabase 实库种子数据确认就位（16 条漂流瓶）
  - [x] 前端 HomeScreen 支持从 API 加载数据
  - [x] 点赞/评论操作可走真实 API
- 关联开发记录：`DEV-005`

---

## REQ-005｜Android 原生版本上线规划（进行中）

- 状态：`in_progress`
- 来源：用户确认正式 Android 版本采用 `Kotlin + Compose`，并要求按未来可上架标准规划，当前交付先为 APK
- 目标：在不新起第二套后端的前提下，规划 Wishpool 的 Android 原生版本落地路径，明确工程边界、后端承接能力与后续执行顺序
- 范围：
  - 明确 Android 正式技术路线：原生 Android + Compose
  - 以 `demo/server` 作为 Android 正式后端前提
  - 盘点现有后端对 Android MVP 的可承接性
  - 输出 Android 架构文档、工程骨架规划与交付顺序
- 非目标：
  - 本轮不直接开始 Android 代码实现
  - 本轮不重做后端框架
  - 本轮不把 APK 交付描述成已完成应用商店上架准备
- 验收标准：
  - [x] 形成 Android 原生版本的正式计划文档
  - [x] 输出 Android 后端承接性盘点文档
  - [x] 输出 Android 架构方案文档
  - [x] 明确 Android 工程目录与 `android/CLAUDE.md` 位置
  - [x] 明确后续任务顺序与验证标准
  - [x] Android 工程可生成 Debug APK
  - [x] Android 扩展版 MVP 页面落地
  - [x] Android 接入现有后端契约（含“我的愿望列表”）
  - [x] 输出 Android APK 交付检查清单
- 关联开发记录：`DEV-006`

---

## REQ-007｜后端架构切换：砍掉 Express，三端直连 Supabase PostgREST（已实现）

- 状态：`implemented`
- 来源：iOS / Android / Web 三端并行开发，Express 中间层增加部署与维护成本
- 目标：三端通过 Supabase SDK 直连 PostgREST + RPC，不再经过 Express 后端
- 范围：
  - 新增 3 个 PostgreSQL RPC function：`create_wish`、`clarify_wish`、`like_bottle`
  - 纯 CRUD 操作（查 feed、查愿望、发评论）走 PostgREST 自动 REST API
  - Express 代码保留不删，但不再作为三端运行时依赖
- 非目标：
  - 不接入 Auth/RLS（Demo 阶段继续用 device_id 匿名方案）
  - 不接入真实 AI 生成链路
  - 不删除 Express 代码（存档）
- 验收标准：
  - [x] 3 个 RPC function 已部署到 Supabase 并验证可调用
  - [x] 本地 SQL 文件 `003_rpc_functions.sql` 已落盘
  - [x] `supabase/CLAUDE.md` 已更新
  - [ ] 三端 SDK 接入验证（后续各端开发时逐步完成）
- 关联开发记录：`DEV-007`

---

## REQ-006｜PRD V3.0 需求整合（已实现）

- 状态：`implemented`
- 来源：V1/V2/V2.1 三份 PRD 存在编号冲突、需求重叠、关键功能缺失（心愿广场、我的心愿）等问题，需要统一整合
- 目标：产出一份自洽的 PRD V3.0，作为唯一的产品需求基准，覆盖完整产品愿景并标注分期
- 范围：
  - 整合 V1/V2/V2.1 散落的用户故事，解决编号冲突
  - 补齐"心愿广场"（Feed Tab）和"我的心愿"（右 Tab）的完整需求定义
  - 统一状态模型和交互流程
  - 明确搭子机制在 MVP/Phase 2 的边界
  - 将漂流瓶作为 Feed 特殊内容类型整合进来
- 非目标：
  - 不改变当前代码实现的核心架构
  - 不重新设计 Supabase 表结构
- 验收标准：
  - [x] 产出完整的 PRD V3.0 文档，包含 15 个用户故事
  - [x] 明确 MVP/Phase 2/Phase 3 分期，与当前实现状态对齐
  - [x] 统一状态模型，消除 V1/V2/progress 文档之间的矛盾
  - [x] V1/V2/V2.1 标记为归档状态
  - [x] 更新 `docs/progress/index.md` 中的需求基准引用
- 关联开发记录：`DEV-010`

---

## REQ-008｜iOS Demo 首版最小闭环（进行中）

- 状态：`in_progress`
- 来源：用户确认在当前仓库内新增 iOS Demo，并先写好代码、后续再补 Xcode 构建验证
- 目标：新增一个原生 iOS Demo 工程，以 SwiftUI 承接 Wishpool 当前产品骨架，先验证 `3-Tab + 发愿入口 + Feed + 我的心愿 + 愿望详情/推进` 的最小闭环
- 范围：
  - 新增独立 `ios/` 工程目录，不挤入现有 `demo/` 或 `android/`
  - 数据层采用 Supabase SDK 直连 PostgREST + RPC
  - 保留本地 mock / fallback，避免在 Supabase 不可用时完全失效
  - 回写 iOS 工程地图与 progress 索引
- 非目标：
  - 本轮不要求覆盖 Web Demo 全部长链路页面
  - 本轮不新起第二套服务端
  - 本轮不补 Xcode / simulator 真机验证结论
- 验收标准：
  - [ ] `ios/` 工程骨架已落盘，具备 App 入口、Tab 容器和基础主题
  - [ ] 首版页面覆盖 Feed / 发愿入口 / 我的心愿 / 愿望详情或推进
  - [ ] 数据层直连 Supabase，并保留 mock 回退
  - [ ] `ios/CLAUDE.md`、根级 `CLAUDE.md`、`docs/progress/index.md` 已回写
  - [ ] 在未安装 Xcode 的前提下，明确记录当前无法完成的构建验证缺口
- 关联开发记录：`DEV-008`

---

## REQ-009｜跨端需求映射文档结构（已实现）

- 状态：`implemented`
- 来源：当前一个需求会同时影响 `PRD + Web Demo + Android + iOS + Supabase`，仅靠版本化 PRD 与 progress 流水难以承接跨端映射
- 目标：新增按需求点聚合的文档层，让单个需求可以清晰映射到 PRD、三端实现与数据层
- 范围：
  - 新增 `docs/features/` 目录
  - 定义 feature 映射文档与 `PRD / progress` 的分工
  - 在根级 `CLAUDE.md` 写清这层结构的职责
- 非目标：
  - 本轮不新写具体功能的 feature 映射实例
  - 本轮不改 PRD 内容本身
  - 本轮不调整三端代码目录结构
- 验收标准：
  - [x] `docs/features/index.md` 已定义用途、命名规则与工作方式
  - [x] `docs/features/TEMPLATE.md` 已提供标准模板
  - [x] 根级 `CLAUDE.md` 已明确 `PRD / features / progress` 三层分工
  - [x] 首个真实需求点映射文档已创建并验证可用
- 关联开发记录：`DEV-009`、`DEV-011`

---

## REQ-011｜PRD 体系拆分：总领 + 5 板块独立 PRD（已实现）

- 状态：`implemented`
- 来源：PRD V3.0 整合后仍为单文件，15个故事+4模块全部塞在一份文档里，后续任何板块变更都要动这个大文件，且缺少"个人设置"和"消息推送"两个板块
- 目标：将 PRD V3.0 拆分为"总领 PRD + 5 个板块 PRD"的体系结构，每个板块独立演进，总领负责产品格局和板块索引
- 范围：
  - 总领 PRD 瘦身：只保留产品定位、核心格局、板块索引、状态模型、分期规划、业务指标
  - 5 个板块 PRD 独立文件，各含完整用户故事和验收标准
  - 新增"消息推送"板块（US-16~19），补齐 V3.0 遗漏
  - 每个板块 PRD 有双向链接（指回总领，总领索引各板块）
  - 所有板块统一标记为 V1 版本
- 非目标：
  - 不改变用户故事内容本身
  - 不重新设计状态模型
  - 不调整分期规划
- 验收标准：
  - [x] 总领 PRD 瘦身完成，只含格局和索引
  - [x] 5 个板块 PRD 文件已创建，各含完整用户故事
  - [x] 新增消息推送板块（US-16~19）
  - [x] 双向链接已建立
  - [x] 进度文档已更新
- 关联开发记录：`DEV-012`

---

## REQ-010｜发愿入口与首轮澄清链路跨端映射（已实现）

- 状态：`implemented`
- 来源：用户确认 `PRD` 与 `features` 分层后，要求先推动第一份真实 feature 文档，承接同一需求点对 `Web / Android / iOS / Supabase` 的统一映射
- 目标：将“发愿入口 → 首轮澄清 → 进入方案/详情”的核心链路，映射到当前 PRD、三端实现与 Supabase 能力，作为后续对齐执行基线
- 范围：
  - 建立 `docs/features/REQ-010-wish-create-and-clarify-flow.md`
  - 明确该链路对应的 PRD 用户故事与当前代码落点
  - 明确当前三端差异、执行顺序与验收口径
- 非目标：
  - 本轮不直接修改 Web / Android / iOS 产品代码
  - 本轮不重写 PRD 需求内容
  - 本轮不新增 Supabase 表或 RPC
- 验收标准：
  - [x] 映射文档已建立，并能回答该链路在 `PRD / Web / Android / iOS / Supabase` 的具体落点
  - [x] 已明确主对应用户故事为 `US-05 / US-06`，并关联 `US-11 / US-12`
  - [x] 已明确当前三端差异，不再把“默认应该对齐”停留在口头判断
  - [x] 已给出后续按 feature 推进的执行顺序
- 关联开发记录：`DEV-011`

---

## REQ-012｜板块六：主题切换与角色陪伴（进行中）

- 状态：`in_progress`
- 来源：用户反馈 Android 仅有深色主题太丑，希望基于朵朵云 IP 增加亮色主题，且三端同步支持主题切换
- 目标：在三端实现"眠眠月（深色）↔ 朵朵云（亮色）"主题切换，入口在"我的心愿"Tab 右上角，未来可扩展芽芽星等更多角色主题
- 范围：
  - 新增独立 PRD 文档 `docs/prd/PRD-theme-switching.md`（板块六：US-20~22）
  - Web 端：扩展 CharacterContext 持久化 + 创建 ThemeSelector 组件 + 修复硬编码 moon 主题色
  - Android 端：添加 CloudColorScheme + 主题切换 ViewModel + 设置 UI
  - iOS 端：建立完整主题系统（Theme enum + 环境值 + 主题 Provider）
  - 三端入口统一：我的心愿页面右上角设置按钮
- 非目标：
  - 不实现芽芽星主题（Phase 3）
  - 不改变 3-Tab 架构
  - 不修改后端 API 或数据结构
- 验收标准：
  - [ ] 板块六 PRD 已创建，含 US-20~22 用户故事
  - [ ] Web 端主题切换功能完整可用
  - [ ] Android 端朵朵云亮色主题落地
  - [ ] iOS 端主题系统建立
  - [ ] 三端主题切换视觉一致
  - [ ] 用户偏好持久化存储（localStorage / SharedPreferences / UserDefaults）
- 关联开发记录：`DEV-013`

---

## REQ-013｜AI Agent 智能助手系统 PRD 设计（已实现）

- 状态：`implemented`
- 来源：用户确认从"AI 生成方案"升级为"AI 全程陪伴执行"——设计整体算法系统，明确意图判断、执行路径、汇报时机、任务执行的产品边界和用户体验
- 目标：产出完整的 AI Agent 系统 PRD，作为 Wishpool 智能化升级的产品指导文档，明确从意图理解到自动执行的完整能力边界
- 范围：
  - 创建独立 PRD 文档 `docs/prd/PRD-ai-agent-system.md`（板块七：US-20~26）
  - 基于大学生和都市白领两个群体的真实愿望调研，建立意图分类测试样本库
  - 设计 L1（AI自动执行）/ L2（亲友代执行）/ L3（网友帮忙）三层执行分级体系
  - 建立四维度 benchmark（意图分类准确性、回答清晰性和准确性、安全边界遵守、个性化）
  - 明确产品边界、伦理约束、用户同意机制和与现有系统的关系
- 非目标：
  - 本轮不实现具体的 AI Agent 代码
  - 本轮不调研技术选型，专注产品设计
  - 本轮不修改现有后端架构或数据结构
- 验收标准：
  - [x] 完整 PRD 文档已创建，包含 7 个用户故事（US-20~26）
  - [x] 基于真实群体调研的意图分类测试样本库（5类意图 × 2个群体 × 10+案例）
  - [x] 分群体优化的回答质量示例库（好/坏回答对比 + 评估标准）
  - [x] 三层执行分级体系的用户感知设计和验收标准
  - [x] 与现有 5 个板块 PRD 的协作关系映射
  - [x] 下一步行动计划和风险缓解方案
- 关联开发记录：`DEV-014`

---

## REQ-014｜Web 端愿望详情页（US-12）（已实现）

- 状态：`implemented`
- 来源：用户反馈"我的心愿"卡片点击后无响应，产品闭环断裂
- 目标：Web 端 MyWishesTab 卡片点击后进入完整详情页，展示愿望全貌（AI 方案、轮次进展、资源状态、澄清表单）并支持操作，达到 Android/iOS 同等水平
- 范围：
  - 新增 `WishDetailScreen.tsx` 详情页组件
  - 在 DemoScreen 导航系统注册 `wish-detail` 屏幕
  - 打通 MyWishesTab → MainTabScreen → WishpoolDemo 导航链路
  - MockWish 数据关联 WishScenario（通过 scenarioId）
  - 详情页内容：愿望头部卡片、AI 执行方案、推进轮次（进度条+已完成+下一步）、资源状态、澄清表单（pending 可展开）、完成回顾（completed 显示）
  - 底部操作按钮根据状态变化：pending→确认方案/稍后、in_progress→查看推进/暂停、completed→查看故事卡
- 非目标：
  - 不改 Android/iOS 代码（已确认两端详情页功能完整）
  - 不接 Supabase 真实数据（继续用 mock）
  - 不改 flow-state.ts 状态机结构
- 验收标准：
  - [x] `npx tsc --noEmit` 零错误
  - [x] `npx vite build` 构建成功
  - [x] MyWishesTab 四种卡片均可点击进入详情页
  - [x] 详情页按状态展示不同内容和操作
  - [x] 详情页返回按钮可回到我的愿望列表
  - [x] 确认方案按钮可跳转到 AI 方案流程
- 关联开发记录：`DEV-015`

---

## REQ-015｜多 Agent 协作架构建立（已实现）

- 状态：`completed`
- 来源：用户认为项目复杂度达到临界点，单一 CLAUDE.md 难以维持
- 目标：建立板块专门化的多 Agent 协作架构，解决上下文过载问题
- 范围：架构重构 + Phase 1 试点（基础设施 + 心愿管理板块拆分）
- 验收标准：
  - [x] 创建 `.claude/agents/` 目录和协作协议
  - [x] 建立基础设施 Agent（设计系统/主题/数据层）
  - [x] 建立心愿管理 Agent（US-11~13 专门负责）
  - [x] 根 CLAUDE.md 从 800+ 行瘦身到 ~150 行
  - [x] 定义 Agent 职责边界和协作规则
  - [x] 建立渐进式迁移策略
- 关联开发记录：`DEV-017`
- 完成时间：2026-03-29
- 交付内容：
  - `.claude/agents/shared-protocol.md` — 协作协议
  - `.claude/agents/foundation.md` — 基础设施 Agent
  - `.claude/agents/management.md` — 心愿管理 Agent
  - 根 `CLAUDE.md` 重构为协调者 Agent

---

## REQ-016｜正式 Web 主产品端基座建立（已实现当前阶段）

- 状态：`implemented`
- 来源：用户确认“保留 demo，但不要继续把正式产品绑在 demo 上”，要求新增 `web/` 承接正式 Web 主产品端
- 目标：在保留 `demo/` 演示资产的前提下，新增 `web/` 作为正式 Web 主产品端，首版打通广场、发愿、我的愿望，并铺出通知/我的正式入口
- 范围：
  - 新增 `web/` 工程，复制并裁剪 `demo` 可复用前端资产
  - 重建 `web/` 入口，不再直接挂载 `WishpoolDemo`
  - 建立正式主导航：`广场 / 发愿 / 我的愿望 / 通知 / 我的`
  - 接入 `Supabase` 四端共享数据层，打通 `create_wish / clarify_wish / confirm_wish_plan / list_my_wishes`
  - 迁入广场 Feed、评论、点赞与发愿链路的最小可用版本
- 非目标：
  - 本轮不完成搭子匹配、协同筹备、履约反馈完整实现
  - 不废弃 `demo/`
  - 不重新引入 `demo/server` 作为 `web/` 运行时依赖
- 验收标准：
  - [x] 仓库新增 `web/`，边界明确为正式 Web 主产品端
  - [x] `web/` 入口不再依赖 `WishpoolDemo`
  - [x] `web/` 已建立正式主导航和页面骨架
  - [x] `web/` 已接入真实广场 Feed 与发愿主链路
  - [x] `web/` 已能查询“我的愿望”
  - [x] `pnpm --dir web check` 通过
  - [x] `pnpm --dir web build` 通过
- 关联开发记录：`DEV-017`
