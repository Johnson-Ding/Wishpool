# Supabase 模块地图

## 模块定位

`supabase/` 承接 Wishpool 数据层。Supabase 项目已连接，表结构与种子数据已部署，RPC 函数已上线，Edge Functions 已落地。三端（Web / iOS / Android）通过 Supabase SDK 直连 PostgREST，不再经过 Express 中间层。Auth/RLS 尚未配置（Demo 阶段不需要）。

---

## 目录结构

```text
supabase/
├── sql/
│   ├── 001_core_schema.sql
│   ├── 002_seed_drift_bottles.sql
│   ├── 003_rpc_functions.sql
│   ├── 004_agent_system.sql
│   └── 005_ai_plans.sql
└── functions/
    ├── agent/
    └── ai-plan-generator/
```

---

## 文件职责

| 文件 | 作用 |
|------|------|
| `sql/001_core_schema.sql` | 定义匿名用户、愿望任务、轮次校验、协同锁定、履约、漂流瓶、漂流瓶评论等主链路表结构 |
| `sql/002_seed_drift_bottles.sql` | 初始化首页漂流瓶冷启动内容 |
| `sql/003_rpc_functions.sql` | 三端共享 RPC 函数（5 个）：`create_wish`（发愿+自动建匿名用户）、`clarify_wish`（补约束+状态流转）、`like_bottle`（原子点赞）、`list_my_wishes`（按 device_id 查我的愿望）、`confirm_wish_plan`（确认计划 planning→ready） |
| `sql/004_agent_system.sql` | AI Agent 系统表结构：agent 执行记录、委托记录、用户偏好等 |
| `sql/005_ai_plans.sql` | AI 计划生成相关表结构：计划模板、生成记录等 |
| `functions/agent/` | Edge Function：AI Agent 执行入口，处理意图理解与任务路由 |
| `functions/ai-plan-generator/` | Edge Function：AI 计划生成器，调用大模型生成执行方案 |

---

## 当前边界

- Supabase 项目已连接，表结构、种子数据、RPC 函数、Edge Functions 均已部署
- 三端通过 Supabase SDK 直连 PostgREST + RPC + Edge Functions，Express 后端层不再作为运行时依赖
- Auth/RLS 尚未配置（Demo 阶段使用 device_id 匿名方案）
- 纯 CRUD 操作（查 feed、查愿望、发评论）走 PostgREST 自动 REST API
- 非纯 CRUD 操作（发愿、约束补充+状态流转、点赞、我的愿望查询、确认计划）走 RPC function
- AI 相关计算（意图理解、计划生成）走 Edge Functions

---

## 想改什么去哪里

| 想改什么 | 去哪里 |
|---------|--------|
| 愿望主链路表结构 / Feed 评论表结构 | `sql/001_core_schema.sql` |
| 漂流瓶 seed 内容 | `sql/002_seed_drift_bottles.sql` |
| RPC 函数（发愿/约束/点赞/我的愿望/确认计划） | `sql/003_rpc_functions.sql` |
| AI Agent 系统表结构 | `sql/004_agent_system.sql` |
| AI 计划生成表结构 | `sql/005_ai_plans.sql` |
| AI Agent 执行逻辑（Edge Function） | `functions/agent/` |
| AI 计划生成逻辑（Edge Function） | `functions/ai-plan-generator/` |
| Supabase 是否已实配 | 先查 `docs/progress/index.md` 与 `docs/progress/development.md` |
| Express 后端（已停用，仅存档） | `demo/server/modules/` |

---

## 约束

- 新增 SQL 文件时，文件名保持顺序化命名，避免后续迁移顺序混乱
- RPC 函数变更需同步更新 `sql/003_rpc_functions.sql` 和本文档
- 若表结构或执行方式变更，需要同步回写根级 `CLAUDE.md`
