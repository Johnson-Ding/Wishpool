# Plan: 真实 Supabase 运行时接入

> 日期：2026-03-27
> 关联需求：REQ-004
> 关联开发：DEV-005

## 目标

将 `demo/server` 和 `demo/client` 接通真实 Supabase 实库，完成端到端的数据链路验证。

## 范围

### 做什么

1. **后端真实连通** — `.env` 配置 Supabase URL + anon key，`dotenv/config` 在入口加载
2. **前端接入真实 API** — 新增 `lib/api.ts` 封装 HTTP 调用，`useFeedData` hook 管理 feed 状态
3. **Vite 代理** — `/api` 请求转发到 `localhost:4000`，开发时前后端分离运行
4. **HomeScreen 数据活化** — 从 API 拉取 feed 列表，点赞/评论走真实接口
5. **发愿写入 Supabase** — 发布器提交时 fire-and-forget 调用 `createWish()`，deviceId 持久化到 localStorage
6. **优雅降级** — API 不可用时自动回退到静态 `DRIFT_BOTTLES` 数据

### 不做什么

- 不动 SQL schema（表已在 Supabase 实库执行完毕）
- 不做 Auth / RLS（匿名流程先行）
- 不引入新状态管理库

## 文件变动

### 新增

| 文件 | 职责 |
|------|------|
| `demo/.env` | Supabase URL + anon key（已在 .gitignore） |
| `demo/client/src/lib/api.ts` | 前端 API 客户端（feed / wishes） |
| `demo/client/src/features/demo-flow/useFeedData.ts` | Feed 数据 hook，API 拉取 + 静态回退 |
| `docs/plans/2026-03-27-real-supabase-runtime.md` | 本文件 |

### 修改

| 文件 | 改动 |
|------|------|
| `demo/server/index.ts` | 顶部加 `import "dotenv/config"` |
| `demo/package.json` | 新增 `dotenv` 依赖 |
| `demo/vite.config.ts` | server.proxy 增加 `/api` → `localhost:4000` |
| `demo/client/src/features/demo-flow/screens/HomeScreen.tsx` | props 增加 `bottles` / `onApiLike` / `onApiComment`，内部用 `bottles` 替代 `DRIFT_BOTTLES` |
| `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx` | 引入 `useFeedData` + `createWish`，将数据和操作传给 HomeScreen，发愿时写入 Supabase |
| `docs/progress/requirements.md` | 新增 REQ-004 |
| `docs/progress/development.md` | 新增 DEV-005 |
| `docs/progress/index.md` | 更新当前任务 |

## 验证

- `pnpm run check` — 通过
- `pnpm run build` — 通过
- `pnpm run test:run` — 13 tests 全绿
- MCP `execute_sql` — Supabase 实库 16 条漂流瓶种子数据确认就位
- `GET /api/health` — `{"status":"ok"}`
- `GET /api/feed` — 返回 16 条真实漂流瓶数据
- `POST /api/wishes` — 成功创建愿望并写入 Supabase
- `GET /api/wishes/:id` — 成功查询到已创建的愿望

## 运行方式

```bash
# 终端 1：后端
cd demo && pnpm run dev:server

# 终端 2：前端
cd demo && pnpm run dev
```

前端 Vite 会把 `/api/*` 代理到后端 `localhost:4000`。
