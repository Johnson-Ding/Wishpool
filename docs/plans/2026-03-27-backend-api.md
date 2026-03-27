# Wishpool 后端接口层执行计划

> 日期：2026-03-27
> 关联需求：`REQ-003`
> 方案选择：`方案 A`（Node/Express API + Supabase 数据访问层）

## 目标

- 在现有 Supabase SQL 草案之上，补齐真实可用的后端接口层
- 第一优先级打通发愿主链路
- 第二优先级补齐 Feed 读取与互动能力（点赞、评论）

## 边界

### 本轮要做

- 服务端运行时骨架
- Supabase 服务端接入
- 发愿主链路 API
- Feed API
- 自动化测试、类型检查、构建验证

### 本轮不做

- Supabase Auth / RLS
- 真实 AI 生成链路
- 前端接入真实 API

## 文件结构

### 新建

- `demo/server/index.ts` — 服务端启动入口
- `demo/server/app.ts` — Express app 组装
- `demo/server/config/env.ts` — 环境变量读取与校验
- `demo/server/lib/supabase.ts` — Supabase server client
- `demo/server/lib/http.ts` — HTTP 错误与响应工具
- `demo/server/modules/shared/schemas.ts` — 公共 zod schema
- `demo/server/modules/wishes/routes.ts` — 发愿路由
- `demo/server/modules/wishes/service.ts` — 发愿业务编排
- `demo/server/modules/wishes/repository.ts` — 发愿数据访问
- `demo/server/modules/feed/routes.ts` — Feed 路由
- `demo/server/modules/feed/service.ts` — Feed 业务逻辑
- `demo/server/modules/feed/repository.ts` — Feed 数据访问
- `demo/server/__tests__/` — 自动化测试
- `demo/.env.example` — 环境变量模板

### 修改

- `demo/package.json` — 服务端脚本与依赖
- `demo/tsconfig.json` — 服务端源码纳入类型检查
- `supabase/sql/001_core_schema.sql` — 如接口层需要补字段/表结构
- `docs/progress/requirements.md`
- `docs/progress/development.md`
- `docs/progress/index.md`

## Tasks

### Task 1：服务端运行时骨架

**目标：** 服务端可启动、可检查、可构建。

**Verify：**

- `pnpm --dir demo run check` → exit 0
- `pnpm --dir demo run build` → 构建成功

### Task 2：Supabase 接入层

**目标：** 服务端能读取环境变量并创建 Supabase client。

**Verify：**

- 环境变量校验测试通过
- `pnpm --dir demo run check` → exit 0

### Task 3：发愿主链路 API

**目标：** 打通发愿最小闭环。

**接口：**

- `POST /api/wishes`
- `GET /api/wishes/:id`
- `PATCH /api/wishes/:id/clarify`
- `POST /api/wishes/:id/plan/confirm`
- `GET /api/wishes/:id/rounds`

**Verify：**

- 路由/服务测试先失败后通过
- `pnpm --dir demo exec vitest run ...` → 通过
- `pnpm --dir demo run check` → exit 0

### Task 4：Feed API

**目标：** 打通 Feed 读取与互动最小闭环。

**接口：**

- `GET /api/feed`
- `POST /api/feed/:id/like`
- `POST /api/feed/:id/comments`
- `GET /api/feed/:id/comments`

**Verify：**

- 路由/服务测试先失败后通过
- `pnpm --dir demo exec vitest run ...` → 通过
- `pnpm --dir demo run check` → exit 0

### Task 5：文档与进度回写

**目标：** 需求、开发、索引与地图保持一致。

**Verify：**

- `REQ-003 / DEV-003 / index` 三处信息一致
