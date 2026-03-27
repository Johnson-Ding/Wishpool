# 开发执行流（Development Progress）

> 更新于 2026-03-27
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
