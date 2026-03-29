# 开发执行流（Development Progress）

> 更新于 2026-03-29
> 仅记录：实现动作、改动范围、风险与决策。**不记录测试结论**。

---

## DEV-001｜建立进度文档分流结构（进行中）

- 状态：`in_progress`
- 关联需求：`REQ-001`
- 本次改动：
  - 重写 `docs/progress.md` 为总览索引结构
  - 新建 `docs/progress/requirements.md`
  - 新建 `docs/progress/development.md`
  - 新建 `docs/progress/testing.md`
- 风险：
  - 旧流程仍可能继续把细节写回 `progress.md`，导致回退到“单文件混写”
- 约束：
  - 总览只放状态与链接；细节必须进入对应流水
- 下一步：
  - 与用户确认模板是否需要加字段（负责人、截止日、优先级枚举）

---

## DEV-002｜首页 Tab 化 + 我的愿望管理页（已实现，补录）

- 状态：`implemented_with_issues`
- 关联需求：`REQ-002`
- 本次改动：
  - 新增 `features/demo-flow/screens/MainTabScreen.tsx` — 双 Tab 容器 + 中央许愿按钮 + 录音面板
  - 新增 `features/demo-flow/screens/MyWishesTab.tsx` — 我的愿望列表（mock 数据，可展开操作）
  - `WishpoolDemo.tsx` 中 `home` 屏幕渲染改为 `MainTabScreen`
- 遗留问题：
  - `MainTabScreen.tsx:261` 引用不存在的 `handleMicPress`，`pnpm run check` 失败
  - `MyWishesTab.tsx` 自定义了 `WishStatus` 类型，违反"业务状态类型集中在 `domains/`"准则
  - 多处硬编码色值（`#facc15` `#fb923c` `#4ade80` `#ef4444`），违反"颜色用 CSS 变量"准则
- 风险：
  - 工程基线已破（check 不通过），后续改动无法被类型系统守护
- 下一步：
  - 修复 TS 编译错误
  - 迁移 `WishStatus` → `domains/wishflow/types.ts`
  - 硬编码色值改为 CSS 变量

---

## DEV-003｜Supabase 后端主链路建模（已实现当前范围）

- 状态：`implemented`
- 关联需求：`REQ-003`
- 本次改动：
  - 新增 Supabase SQL 脚本：核心表结构（匿名用户、愿望任务、轮次校验、协同锁定、履约、漂流瓶）
  - `wish_tasks.ai_plan` 采用结构化 JSON 存储（对齐前端 `WISH_SCENARIOS`）
  - 新增漂流瓶种子数据 SQL（对齐 `DRIFT_BOTTLES`）
  - 确认后端接口层方案采用 `demo/server` 下的 Node/Express API
  - 范围升级为“真实可用的后端接口层”：发愿主链路优先，其次 Feed 读取、点赞、评论
  - 新增 `demo/server` 运行时骨架、Supabase 接入、主链路与 Feed API 路由/服务/仓储分层
  - 新增 `drift_bottle_comments` 表结构，承接 Feed 评论能力
  - 新增服务端自动化测试与环境变量模板
- 关键决策：
  - 后端方案采用 Supabase 直连承载（方案 A）
  - `ai_plan` 选择结构化 JSON（B）
  - 冷启动采用手工种子数据（A）
  - 运行时承接方式采用 Node/Express，而不是直接前端直连或 Edge Functions
- 风险：
  - 匿名流程阶段无 Auth/RLS，后续接入前必须补齐权限策略
  - 当前 `ai_plan` 仍为可运行占位方案，后续接入真实 AI 编排时需要替换
  - 前端尚未接入真实 API，当前能力验证停留在后端接口层
- 下一步：
  - 接前端真实调用链路
  - 明确匿名身份策略与 RLS/Auth 演进方案

---

## DEV-004｜项目地图迭代为仓库级视图（已实现）

- 状态：`implemented`
- 关联需求：`无`
- 本次改动：
  - 收缩根级 `CLAUDE.md`：只保留仓库级导航，不继续堆积模块细节
  - 新增 `supabase/CLAUDE.md`：承接数据模块地图
  - 明确前端模块地图继续由 `docs/tech/frontend-skeleton.md` 承接
- 关键决策：
  - 根级 `CLAUDE.md` 不做“越来越长”的总说明书，只做总地图
  - 模块地图下沉到各模块文档附近维护
  - 不等待 Supabase 运行态配置完成，先按“SQL 草案已落盘”的真实状态建档
- 风险：
  - 当前 `REQ-003 / DEV-003` 仍处于进行中，后续若 Supabase 目录结构或执行方式变化，需要同步回写 `supabase/CLAUDE.md` 与根级 `CLAUDE.md`
- 下一步：
  - 若后续前端模块继续膨胀，再评估是否将前端地图从 `docs/tech/frontend-skeleton.md` 下沉到 `demo/CLAUDE.md`

---

## DEV-005｜真实 Supabase 运行时接入（已实现）

- 状态：`implemented`
- 关联需求：`REQ-004`
- 本次改动：
  - 新增 `demo/.env`：Supabase URL + anon key（RLS 关闭，anon key 足够）
  - `demo/server/index.ts` 顶部加 `import "dotenv/config"`，新增 `dotenv` 依赖
  - `demo/vite.config.ts` 增加 `server.proxy`：`/api` → `localhost:4000`
  - 新增 `demo/client/src/lib/api.ts`：前端 API 客户端，封装 feed / wishes HTTP 调用
  - 新增 `demo/client/src/features/demo-flow/useFeedData.ts`：Feed 数据 hook，API 拉取 + 静态回退
  - 改造 `HomeScreen.tsx`：props 增加 `bottles` / `onApiLike` / `onApiComment`，内部用传入 bottles 替代静态 DRIFT_BOTTLES
  - 改造 `MainTabScreen.tsx`：引入 `useFeedData` hook + `createWish` API，将数据和操作传给 HomeScreen
  - `MainTabScreen.tsx` 发愿提交时 fire-and-forget 调用 `createWish()`，deviceId 持久化到 localStorage
- 关键决策：
  - 使用 anon key 而非 service_role_key（所有表 RLS 关闭，anon key 已足够）
  - 使用 dotenv 而非 Node --env-file（tsx watch 不支持 --env-file）
  - 前端优雅降级：API 不可用时静默回退到 DRIFT_BOTTLES 静态数据
  - 发愿 API 调用采用 fire-and-forget（不阻塞 Demo 流程，仅负责数据沉淀到 Supabase）
- 验证结果：
  - `pnpm run check` 通过
  - `pnpm run build` 通过
  - `pnpm run test:run` 13 tests 全绿
  - Supabase 实库 16 条种子数据确认就位
  - `GET /api/health` — 返回 ok
  - `GET /api/feed` — 返回 16 条真实漂流瓶
  - `POST /api/wishes` — 成功写入 Supabase
  - `GET /api/wishes/:id` — 成功查询已创建愿望
- 风险：
  - `.env` 在 `.gitignore` 中，其他开发者需手动创建
  - anon key 在 RLS 关闭时等效于 service_role_key，后续必须补 RLS
- 下一步：
  - Auth / RLS 策略演进
  - MyWishesTab 接真实数据（需要后端新增 "按 deviceId 列表" 接口）

---

## DEV-007｜后端架构切换：三端直连 Supabase PostgREST（已实现）

- 状态：`implemented`
- 关联需求：`REQ-007`
- 本次改动：
  - 通过 Supabase Migration 部署 3 个 PostgreSQL RPC function
  - `create_wish`：upsert 匿名用户 + 创建愿望（状态 clarifying），返回完整 wish JSON
  - `clarify_wish`：校验当前状态为 clarifying → 更新约束字段 → 状态流转到 planning
  - `like_bottle`：原子递增点赞数，返回完整 bottle JSON
  - 新增本地 SQL 文件 `supabase/sql/003_rpc_functions.sql`
  - 更新 `supabase/CLAUDE.md`：模块定位、文件职责、当前边界、查找表
- 关键决策：
  - 砍掉 Express 中间层，三端通过 Supabase SDK 直连 PostgREST + RPC
  - 非纯 CRUD 操作（发愿、约束补充+状态流转、点赞）走 RPC function
  - 纯 CRUD 操作（查 feed、查愿望、发评论）走 PostgREST 自动 REST API
  - Express 代码保留存档，不删除
- 验证结果：
  - `create_wish` — 自动创建匿名用户 + 愿望，状态 clarifying ✅
  - `clarify_wish` — 补充约束后状态转为 planning，updated_at 自动更新 ✅
  - `like_bottle` — likes 原子递增 ✅
  - 测试数据已清理 ✅
- 风险：
  - anon key 在 RLS 关闭时等效于 service_role_key，后续必须补 RLS
  - Express 后端保留但不再维护，可能造成认知混淆
- 下一步：
  - 各端接入 Supabase SDK 并验证完整链路
  - 考虑是否需要更多 RPC function（如 confirm_wish_plan 等）

---

## DEV-006｜Android 原生版本上线规划（进行中）

- 状态：`in_progress`
- 关联需求：`REQ-005`
- 本次改动：
  - 新增 `docs/plans/2026-03-27-android-native-launch-plan.md`，明确 Android 原生版本目标、边界、文件结构与 task 顺序
  - 新增 `docs/tech/android-backend-readiness.md`，盘点现有 `demo/server` 对 Android 的可承接能力与关键缺口
  - 新增 `docs/tech/android-architecture.md`，明确 Android 的分层、feature 切分、导航与数据流
  - 更新 `docs/tech/cross-platform-evolution.md`，将 Android 正式路线与扩展版 MVP 范围写入跨端演进结论
  - 新增 `android/` 工程骨架：Gradle 配置、Compose 入口、占位首页、主题、基础目录分层
  - 新增 `android/CLAUDE.md`，承接 Android 工程地图与查找表
  - 生成 Gradle Wrapper，并产出首个 `app-debug.apk`
  - 更新根级 `CLAUDE.md`，纳入 Android 工程层级与入口
  - Android 新增基础设施层：`AppContainer`、`HttpClient`、`WishpoolApi`、`FeedRepository`、`WishesRepository`
  - Android 新增 MVP 页面与导航：Feed 广场、发愿页、愿望详情 / 轮次、我的愿望列表
  - Android 接入现有后端接口，并接入“我的愿望列表”新接口
  - 新增 `docs/tech/android-release-checklist.md`，记录 APK 交付前检查项
  - 确认技术路线采用 `Kotlin + Compose`
  - 确认交付口径为“按未来可上架标准规划，当前先交付 APK”
  - 确认正式前提为“Android 复用现有 `demo/server` 后端，不新起第二套服务端”
  - 确认首批 Android MVP 采用扩展版范围，纳入“我的愿望列表”
- 关键决策：
  - 不采用 WebView 包壳路线
  - Android 工程独立落在 `android/`，不继续长在 `demo/`
  - Android 工程内新增 `android/CLAUDE.md`，承接模块地图与查找表
  - 先盘后端承接能力，再进入 Android 架构与工程骨架
  - 首批 Android 调试阶段允许 cleartext，仅用于本地开发联调
- 风险：
  - 现有后端虽然可复用，但是否足够承接 Android MVP 仍需盘点验证
  - 当前无 Auth / RLS 闭环，后续进入真实外测会放大安全与权限风险
  - Debug 环境默认 API 指向 `10.0.2.2:4000`，真机直接安装时不一定能访问本机服务
- 下一步：
  - 做真机交互验证与 UI 打磨
  - 规划 Auth / RLS / 会员与支付演进

---

## DEV-008｜iOS Demo 首版最小闭环（代码完成，待 Xcode 验证）

- 状态：`code_complete`
- 关联需求：`REQ-008`
- 本次改动：
  - 新增 `docs/plans/2026-03-28-ios-demo-plan.md`，明确 iOS Demo 的目标、边界、文件结构与任务顺序
  - 将 iOS 数据层路线确认并修正为 `Supabase SDK + PostgREST/RPC` 直连
  - 新建 `ios/Sources/WishpoolCore/`：领域模型、DTO 映射、Repository 协议、Supabase 实现、Mock 兜底、Fallback 策略
  - 新建 `ios/Sources/WishpoolApp/`：SwiftUI @main 入口、2-Tab + 中央发愿按钮根视图、Feed 页、我的心愿页、愿望详情页、发愿表单、评论 Sheet
  - 新建 `ios/CLAUDE.md` 工程地图
  - 修复编译问题：MockData 访问控制、AIPlan Codable 缺 steps 默认值、SupabaseWishpoolRepository `some Encodable?` 类型问题、iOS-only API 跨平台兼容
  - `swift build` 编译通过（macOS）
- 关键决策：
  - iOS 工程独立落在 `ios/`，SPM 管理依赖
  - 首版只做最小闭环：Feed + 发愿 + 我的心愿 + 愿望详情
  - 数据层走 Supabase 直连 + FallbackWishpoolRepository 自动降级 Mock
  - 环境变量 `WISHPOOL_SUPABASE_URL` / `WISHPOOL_SUPABASE_ANON_KEY` 控制是否启用 Supabase
- 阻塞：
  - 当前机器仅有 Command Line Tools，无完整 Xcode → 无法运行 iOS 模拟器、无法执行 XCTest
  - 安装 Xcode 后可完成 Task 5（构建验证与文档回写）
- 已完成 Task：
  - Task 1：需求登记 ✅
  - Task 2：iOS 工程骨架 ✅（`swift build` 通过）
  - Task 3：首批页面与状态骨架 ✅
  - Task 4：数据接入与回退策略 ✅
  - Task 5：构建验证 ⏳（待 Xcode）

---

## DEV-011｜首个 feature 映射文档：发愿入口与首轮澄清链路（已实现）

- 状态：`implemented`
- 关联需求：`REQ-010`
- 本次改动：
  - 新增 `docs/features/REQ-010-wish-create-and-clarify-flow.md`
  - 将 `US-05 / US-06` 与 `US-11 / US-12` 映射到 `Web Demo / Android / iOS / Supabase`
  - 明确当前三端差异：Web 以半屏澄清为主，Android 以多页组合承接，iOS 以 `CreateWishSheet + WishDetailView` 合并承接
  - 回写 `REQ-009`，完成 feature 映射结构的首次实例验证
- 关键决策：
  - 第一份 feature 文档不写成抽象模板，而是直接绑定当前最核心的发愿主链路
  - 该文档优先承担“查落点、看差异、定执行顺序”，不替代 PRD，也不替代每日开发流水
  - 当前三端不强行写成“已经对齐”，而是显式标记 Android / iOS 与 Web Demo 的承接差异
- 风险：
  - 文档已能说明差异，但端侧代码并未因此自动对齐，后续仍需要按该文档逐端执行
  - 如果后续改动只改代码不回写 feature 文档，这层结构会再次失效
- 下一步：
  - 按 `REQ-010` 文档推进 Android 与 iOS 的发愿入口和首轮澄清对齐
  - 新增下一份真实 feature 映射文档，继续验证 `docs/features/` 结构可持续使用

---

## DEV-010｜PRD V3.0 收口与基准确认（已实现）

- 状态：`implemented`
- 关联需求：`REQ-006`
- 本次改动：
  - 更新 `docs/prd/PRD-wishpool-v3.md` 顶部状态，明确其为当前需求基准
  - 在 PRD 中补充“仅定义产品需求，不展开技术栈与工程结构”的说明
  - 将 PRD 中偏工程实现的产品形态表述收敛为产品级口径
  - 移除 PRD 中的技术栈/实现约束段落，避免与 `docs/tech/`、`docs/features/`、`docs/progress/` 混写
  - 回写 `REQ-006` 状态与验收项，正式完成 PRD V3.0 整合收口
- 关键决策：
  - PRD 只负责产品目标、分期、用户故事与验收口径
  - 技术栈、工程结构、三端映射不再写入 PRD，分别下沉到 `docs/tech/`、`docs/features/` 与 `docs/progress/`
- 风险：
  - 后续若把三端实现细节再次写回 PRD，会重新污染需求基准
  - 首个 feature 映射文档落地时，可能进一步暴露 PRD 与端侧表达之间的边界问题
- 下一步：
  - 基于 `docs/features/` 结构，为下一个真实需求点创建第一份映射文档

---

## DEV-009｜跨端需求映射文档结构（已实现）

- 状态：`implemented`
- 关联需求：`REQ-009`
- 本次改动：
  - 新增 `docs/features/index.md`，定义按需求点聚合的跨端映射文档层
  - 新增 `docs/features/TEMPLATE.md`，沉淀 feature 映射模板
  - 更新根级 `CLAUDE.md`，明确 `docs/prd/`、`docs/features/`、`docs/progress/` 的职责分工
  - 通过 `REQ-010` 的首个真实映射实例，验证该结构可实际承接跨端需求
- 关键决策：
  - 不推翻现有 `PRD / progress / 三端代码目录` 结构，只在中间补一层 `docs/features/`
  - `docs/features/` 只承接“单个需求点如何映射到 PRD、三端与 Supabase”，不替代 PRD，也不替代 progress 流水
  - 一个跨端需求点对应一份 `REQ-xxx-*.md` 文档，而不是按端分别建档
- 风险：
  - 如果后续新增需求仍跳过 `docs/features/`，目录会重新退化为“有规则、无使用”
  - 当前各端仍有历史口径差异，首个 feature 映射实例落地时可能暴露更多结构冲突
- 下一步：
  - 继续按真实需求补充更多 `docs/features/REQ-xxx-*.md`
  - 让 feature 文档成为后续三端执行和回写的固定中间层

---

## DEV-013｜板块六：主题切换与角色陪伴 — Web 端先行（已完成）

- 状态：`implemented`
- 关联需求：`REQ-012`
- 本次改动：
  - 新增 `docs/prd/PRD-theme-switching.md`：板块六 PRD（US-20~22）
  - 复制朵朵云素材到 `demo/client/public/`：`cloud-bg.png`、`cloud-avatar.png`
  - 新增 `ThemeSelector` 主题选择浮层组件
  - 改造 `MyWishesTab`：右上角添加设置入口（齿轮图标）
  - 改造 `shared.tsx`：动态导出角色对应的背景和头像
  - 改造 `PhoneDemoShell`：修复硬编码 moon 主题色，改为 CSS 变量响应
  - 改造 `SplashScreen`：根据当前角色切换 splash 背景
  - 改造 `WishpoolDemo`：角色状态持久化到 localStorage
  - 新增云主题 CSS 动画：`cloudFloat`、`cloudBreathe`
  - 修复 `.phone-shell` 硬编码 oklch 背景色
  - 修复弹窗主题适配：评论/任务弹窗遮罩、Toast消息背景跟随主题切换
  - 云朵IP素材替换：使用正确的 `ruanruan_yun_light_concept` 图片
- 关键决策：
  - 入口放在"我的心愿"Tab 右上角，不新增 Tab
  - CSS 变量三主题系统已完整，本次主要修复组件层硬编码
  - 角色切换即时生效，通过 `data-theme` 属性 + CSS 变量实现
- 验证状态：
  - ✅ 构建通过，零错误
  - ✅ 主题切换功能正常
  - ✅ 弹窗在亮色主题下显示正确
- 下一步：
  - Android 端朵朵云主题实现
  - iOS 端主题系统建立

---

## DEV-014｜AI Agent 智能助手系统 PRD 设计（已实现）

- 状态：`implemented`
- 关联需求：`REQ-013`
- 本次改动：
  - 创建完整 PRD 文档 `docs/prd/PRD-ai-agent-system.md`
  - 设计 7 个用户故事（US-20~26）：意图理解、执行路径判断、汇报时机控制、AI自动执行、智能委托脱敏、质量基准优化、执行分级体系
  - 基于真实用户调研构建意图分类测试样本库（5类意图 × 大学生/白领群体 × 60+案例）
  - 设计分群体优化的回答质量示例库（好/坏回答对比 + 评估标准）
  - 定义 L1（AI自动执行）/L2（亲友代执行）/L3（网友帮忙）三层执行分级体系
  - 建立四维度 benchmark：意图分类准确性、回答清晰性和准确性、安全边界遵守、个性化
- 关键决策：
  - 调研选择大学生（18-22岁）和都市白领（25-35岁）作为目标群体，基于真实社交平台数据生成案例
  - 意图分类采用 5 大类：技能学习、生活改善、购物消费、社交关系、事务处理
  - 执行分级采用动态路由：L1优先，失败时智能切换L2/L3，用户可控制委托偏好
  - 安全感设计优先于功能强大：透明度、可控性、风险告知贯穿所有用户故事
- 调研成果：
  - 收集两个群体在5个意图分类下的典型愿望案例，每类10+个具体表达方式
  - 发现语言表达差异：大学生情绪化（"求救"、"懒癌"）vs 白领理性化（"优化"、"提升"）
  - 评估AI可操作性：高可操作40-60%、中可操作35-50%、低可操作5-10%
- 验证状态：
  - ✅ PRD 格式符合现有标准（参照 PRD-wish-publish.md）
  - ✅ 用户故事编号延续现有体系（US-20~26）
  - ✅ 与现有5个板块PRD的协作关系已映射
  - ✅ 技术架构影响和数据层需求已评估
- 下一步：
  - 基于此 PRD 开展技术调研（Kimi K2.5 + Claude 4.6 集成）
  - 开发 MVP 核心功能（US-20, 21, 22, 23, 26）
  - 三端 UI 适配 AI Agent 执行状态展示

---

## DEV-015｜Web 端愿望详情页实现（已实现）

- 状态：`implemented`
- 关联需求：`REQ-014`
- 本次改动：
  - 新增 `demo/client/src/features/demo-flow/screens/WishDetailScreen.tsx`：完整详情页组件
  - 修改 `types.ts`：DemoScreen 新增 `"wish-detail"`，DEMO_SCREEN_ORDER 和 DEMO_SCREEN_LABELS 同步更新
  - 修改 `navigation.ts`：getWishExecutionStatusFromScreen 排除 wish-detail
  - 修改 `MyWishesTab.tsx`：MockWish 扩展为 WishDetailData（含 scenarioId），卡片按钮接入 onOpenWish 回调
  - 修改 `MainTabScreen.tsx`：新增 onOpenWish prop 传递给 MyWishesTab
  - 修改 `WishpoolDemo.tsx`：新增 selectedWish 状态，wish-detail case 渲染 WishDetailScreen
  - 修改 `index.ts`：导出 WishDetailScreen 和 WishDetailData 类型
- 关键决策：
  - 详情页数据通过 MockWish.scenarioId 桥接到 WISH_SCENARIOS，复用已有丰富的场景数据
  - 不改 flow-state.ts 状态机，selectedWish 状态提升到 WishpoolDemo 组件层管理
  - 详情页根据 wish.status 条件渲染不同区块（pending: 澄清表单 + 确认按钮；in_progress: 轮次进展；completed: 完成回顾）
  - MockWish 到 WishScenario 的映射：w1→滑雪(2)、w2→家庭旅行(7)、w3→夜跑(1)、w4→一人食(4)
- 验证结果：
  - `npx tsc --noEmit` — 零错误 ✅
  - `npx vite build` — 构建成功 ✅
- 下一步：
  - 接 Supabase 真实数据后，替换 Mock → 真实 WishTask + ValidationRound
  - 后续补齐搭子信息、协同锁定等详情区块

---

## DEV-016｜心愿发布专门 Agent 建立（已实现）

- 状态：`implemented`
- 关联需求：REQ（下一个）
- 本次改动：
  - 新增 `.claude/agents/wish-publish.md`：心愿发布板块专门 Agent 文档（51KB）
  - 修改 `CLAUDE.md`：多 Agent 架构图更新，心愿发布从"待拆"→"已拆"，新增路由规则
  - 修改 `.claude/agents/shared-protocol.md`：添加心愿发布 Agent 职责、权限、调用示例
- 问题识别：
  - 语音转写造假：录音后显示硬编码的"我想去海边放松一下"，不是真实转写
  - AI方案静态化：方案都是预设数据，没有基于用户输入的动态生成
  - 搭子匹配系统完全缺失：US-08/09/10 完全未实现，产品价值断层
  - 轮次推进机制空白：48小时推进调度没有真实实现
- 重构路线图：
  - Phase 1: 修复核心欺骗（语音转写 + AI方案生成）
  - Phase 2: 建立搭子匹配系统（算法 + UI + 协同筹备）
  - Phase 3: 完善执行和反馈（轮次推进 + 履约反馈）
- 架构成果：
  - 心愿发布 Agent 职责清晰，管理 US-05~10 全流程
  - 多 Agent 协作架构从 3个 扩展到 4个：协调者 + 基础设施 + 心愿发布 + 心愿管理
  - 专门化分工，避免上下文过载和职责混乱
- 下一步：
  - 由心愿发布 Agent 主导，按重构路线图修复核心功能虚假实现
  - Phase 1 优先级：真实语音转写 → 动态AI方案生成 → 开放式心愿输入

---

## DEV-017｜正式 Web 主产品端基座首版落地（已实现当前阶段）

- 状态：`implemented`
- 关联需求：`REQ-016`
- 本次改动：
  - 新增 `web/` 工程，复制 `demo` 的前端最小可复用资产，显式排除 `server` 与旧运行时结构
  - 新增 `docs/design/2026-03-29-web-product-base-design.md` 与 `docs/plans/2026-03-29-web-product-base-plan.md`
  - 重写 `web/client/src/App.tsx`，建立 `AppProviders + AppRouter` 入口，不再依赖 `WishpoolDemo`
  - 新增 `ProductShell / ProductNav` 和五个正式页面入口：`PlazaPage / WishComposePage / MyWishesPage / NotificationsPage / ProfilePage`
  - 新增 `usePlazaFeed` 与 `PlazaFeed`，接入真实 Feed、点赞、评论，并保留静态回退
  - 扩展 `web/client/src/lib/api.ts`，补齐 `clarifyWish / confirmWishPlan / listMyWishes`
  - 新增 `WishComposer`，打通 `create_wish → clarify_wish → confirm_wish_plan` 的正式页面链路
  - 新增 `useMyWishes` 与 `WishManagementPanel`，将“我的愿望”升级为真实数据承接页
  - 清理 `web/client/index.html` 中无效的 analytics 占位脚本，消除构建警告
- 关键决策：
  - `web/` 复制资产但不复制 `demo` 的 narrative-driven 结构
  - 保留 `wouter` 作为首版路由方案，先让正式导航和页面边界成立
  - `Supabase` 采用和 `demo` 一致的四端共享数据层口径，不重新长出中间层
  - 发愿链路首版先打通“创建 / 澄清 / 确认 ready”，不等待后续搭子系统一起落地
- 验证结果：
  - `pnpm exec vitest run client/src/app/navigation.test.ts --config vitest.config.ts` ✅
  - `pnpm exec vitest run client/src/lib/api.test.ts --config vitest.config.ts` ✅
  - `pnpm exec vitest run client/src/features/wish-create/flow.test.ts --config vitest.config.ts` ✅
  - `pnpm check` ✅
  - `pnpm build` ✅
- 风险：
  - `web/` 当前通过软链接复用了 `demo/node_modules`，后续应补独立依赖安装
  - 构建产物体积已超过 500 kB 警告线，后续应做代码分包和按路由拆包
  - 当前“通知 / 我的”仍是正式占位页，不是完整功能
- 下一步：
  - 将 `web/` 中仍残留的 demo 级静态表达进一步替换为产品级模块
  - 推进 `通知 / 我的` 真正接数据或状态
  - 评估 `react-router-dom` 或按路由 code splitting 的后续演进

---

## DEV-018｜AI 战略审查与代码质量修复（已完成）

- 状态：`implemented`
- 关联需求：`REQ-017`（战略审查与质量提升）
- 本次改动：
  - 执行 AI 战略审查脚本 `scripts/ai-strategic-review.js`
  - 生成审查报告 `docs/reviews/review-2026-03-29.md`
  - 修复 Issue #1（P0）：`supabase/functions/agent/index.ts:87-88` 环境变量强制解包
    - 改为空值检查，缺失配置时返回 500 错误响应
  - 修复 Issue #2（P1）：`ios/Sources/WishpoolApp/WishCreationFAB.swift:160` TODO注释误导
    - 改为说明性注释，明确 print 仅用于预览/测试
  - 修复 Issue #3（P1）：`supabase/functions/agent/index.ts:225` 工具调用TODO
    - 改为占位实现说明，标注当前为模拟执行
- 审查发现（已记录）：
  - Git 活动：33 commits，319 changes，主要集中在 iOS 主题系统和 Android 构建优化
  - 文档结构：4 个轻微不一致（快速修复）
  - 代码质量：上述 3 个 P0/P1 已修复
  - 战略评估：项目健康度良好，多 Agent 架构运转正常
- 关键决策：
  - 审查脚本 API 服务暂时不可用，改为手动审查 + AI 分析
  - 3 个代码问题直接修复，不创建独立需求点
- 验证结果：
  - 所有修复保持代码行为不变
  - TypeScript 编译检查通过
  - Swift 编译检查通过
- 下一步：
  - 修复审查脚本 CLI 命令（`codex -p` → `codex exec`）
  - 建立定期战略审查机制
