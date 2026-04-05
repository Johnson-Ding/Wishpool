---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---
# 许愿池 Wishpool — 协调者 Agent

## 项目定位

许愿池产品架构总地图。**第一版目标**：产品需求完整（demo 做出来）+ Web端可发布（前端+后端+算法完整链路）

**当前阶段标签**: demo 基本完整，Web 正式承接核心功能，后端+算法基础就绪。Android / iOS 由独立专门 Agent 负责，不在本架构体系内。

---

## 多 Agent 架构（战略收敛版）

**第一版目标**：产品需求完整（demo）+ Web端可发布（前端+后端+算法完整链路）

```
┌─────────────────────────────────────────────────────┐
│  协调者 Agent（当前文档）                            │
│  负责：需求分析 + Agent路由 + 架构决策               │
├─────────────────────────────────────────────────────┤
│  横向支撑层（4个技术 Agent）                         │
├─────────────────────────────────────────────────────┤
│  基础设施 Agent                                     │
│  负责：设计系统 + 共享契约                          │
│  文档：.claude/agents/foundation.md                 │
├─────────────────────────────────────────────────────┤
│  前端 Agent                                         │
│  负责：demo+web 前端基础设施 + 跨端一致性验证        │
│  文档：.claude/agents/frontend.md                   │
├─────────────────────────────────────────────────────┤
│  后端 Agent                                         │
│  负责：数据库 + RPC + Edge Functions + 服务稳定     │
│  文档：.claude/agents/backend.md                    │
├─────────────────────────────────────────────────────┤
│  算法 Agent                                         │
│  负责：ai-server 算法实现（不负责需求拆解）          │
│  文档：.claude/agents/algorithm.md                  │
├─────────────────────────────────────────────────────┤
│  纵向功能层（3个功能 Agent）                         │
├───────┬──────────┬──────────┬─────────────────────┤
│ 广场   │ 心愿发布  │ 心愿管理  │ 原生端（独立）        │
│US01~4 │ US05~06  │US11~13   │ Android/iOS         │
│demo+  │ demo+    │ demo+    │ 独立Agent负责        │
│web+   │ web+     │ web+     │ 不归当前体系        │
│plaza  │ publish  │ mgmt     │                    │
└───────┴──────────┴──────────┴─────────────────────┘
```

**Agent 路由规则**:
- 🎨 **设计系统/共享契约** → 基础设施 Agent
- 💻 **demo+web 前端基础设施/跨端一致性验证** → 前端 Agent
- 🛠️ **数据库架构/RPC函数/Edge Functions** → 后端 Agent
- 🤖 **AI 算法实现（ai-server 多模型路由/提示词工程）** → 算法 Agent
- 🔧 **服务监控/性能优化/故障处理** → 后端 Agent
- 🏛️ **广场 Feed（demo+web）** → 广场 Agent
- 🎙️ **发愿→AI方案（US-05~06，需求拆解+端到端协调）** → 心愿发布 Agent
- 📋 **我的愿望（demo+web）** → 心愿管理 Agent
- 🌍 **架构决策/Agent协调** → 协调者 Agent (当前)
- 📱 **Android/iOS 原生端** → 独立专门 Agent（不在此体系）

**职责边界说明**:
- **心愿发布 Agent**：负责需求拆解（US-05~06），协调基础设施/后端/算法 Agent 完成端到端交付
- **算法 Agent**：只负责算法实现（ai-server），接收明确的技术需求，不负责产品需求拆解
- **搭子→履约链路（US-07~10）**：延后到 Phase 2，暂时无 owner

---

## 需求框架概览

### 📊 板块实现状态（第一版目标）

| 板块 | 用户故事 | 负责 Agent | demo | web | 后端 Agent | 算法 Agent |
|------|---------|-----------|------|-----|----------|-----------|
| **心愿广场** | **US-01~04** | **✅ plaza** | **⚠️ Feed+UI** | **✅ PlazaPage** | **✅ RPC+种子** | **—** |
| **心愿发布** | **US-05~10** | **✅ wish-publish** | **⚠️ 6/9 screen** | **⚠️ 3/9功能** | **⚠️ 基础RPC** | **✅ ai-server** |
| **心愿管理** | **US-11~13** | **✅ management** | **⚠️ 仅列表UI** | **✅ MyWishesPage** | **✅ list RPC** | **—** |
| 主题切换 | US-20~22 | ✅ foundation | ✅ moon/cloud | ✅ ThemeContext | — | — |
| 个人设置 | US-14~15 | 📍 Phase 2 | ❌ | 🟡 Placeholder | ❌ | — |
| 消息推送 | US-16~19 | 📍 Phase 2 | ❌ | 🟡 Placeholder | ❌ | — |

**当前阶段标签**: demo 流程完整但缺数据流转，web 承接核心功能中，搭子匹配/协同筹备/履约反馈为主要缺口

### 📂 PRD 文档索引

```
docs/prd/
├── PRD-wishpool-v3.md          ← 总领 PRD
├── PRD-plaza.md                ← 板块1：心愿广场
├── PRD-wish-publish.md         ← 板块2：心愿发布
├── PRD-wish-management.md      ← 板块3：个人心愿管理
├── PRD-profile-settings.md     ← 板块4：个人设置
├── PRD-notifications.md        ← 板块5：消息推送
├── PRD-theme-switching.md      ← 板块6：主题切换（US-20~22）
└── PRD-ai-agent-system.md      ← 板块7：AI 智能助手（US-23~29）
```

### 🧭 Feature 映射层

- `docs/features/index.md` — 跨端需求映射入口
- `docs/features/REQ-010-wish-create-and-clarify-flow.md` — 发愿入口与首轮澄清链路的首个真实映射样板
- `docs/features/REQ-012-theme-switching-and-role-companion.md` — 主题切换与角色陪伴的跨端映射

### 📊 当前实现口径（仓库级）

- 心愿发布：`Web⚠️ / Android✅ / iOS✅`
- 心愿管理：`Web⚠️ / Android✅ / iOS✅`
- 语音发愿（ASR）：`Web⚠️ / Android✅ / iOS✅`
- 主题切换：`Web✅ / Android✅ / iOS✅`

注：`⚠️` 表示正式 Web 主栈尚未完全承接，当前仍有一部分能力主要在 `demo/` 中表达

---

## 架构层级（战略收敛版）

**第一版聚焦**：demo验证 + Web端发布就绪

```
┌────────────────────────────────────────────────────┐
│  文档层 docs/                                      │
│  → prd/          产品需求定义                      │
│  → features/     按需求点的 demo→web→后端→算法 映射│
│  → progress/     需求/开发进度流水                 │
│  → plans/tech/   设计决策、实施计划、技术专题       │
├────────────────────────────────────────────────────┤
│  产品表达层 demo/ + web/                          │
│  → demo/         流程演示 + Mock 数据验证          │
│  → web/          正式 Web 产品（收口中）           │
├────────────────────────────────────────────────────┤
│  服务层 ai-server/ + supabase/                    │
│  → ai-server/    AI方案生成（多模型+降级链）       │
│  → supabase/     数据库 + RPC + Edge Functions     │
├────────────────────────────────────────────────────┤
│  共享契约层 shared/                                │
│  → wishpool-access/  跨端共享类型与访问契约         │
├────────────────────────────────────────────────────┤
│  原生端（独立管理，不在本架构内）                   │
│  → android/      Android 原生端                   │
│  → ios/          iOS 原生端                       │
└────────────────────────────────────────────────────┘
```

---

## 协调者职责

### 🎯 需求分析与路由
- 接收用户需求，分析影响范围
- 路由到合适的专门 Agent
- 跨板块功能的协调和集成

### 🏗️ 架构决策
- 技术栈选型和演进
- 数据库架构变更
- 跨端一致性保证

### 📋 任务编排
- 多 Agent 任务的并行调度
- 依赖关系管理和集成验证
- 质量标准制定和审查

### 📈 进度管理
- 更新 `docs/progress/` 执行流水
- 协调各 Agent 的工作优先级
- 里程碑和发布节点管控

---

## 核心规则

### 💡 Agent 调用决策

**单一板块任务** → 直接调用专门 Agent
```
"优化心愿列表性能" → 心愿管理 Agent
"调整主题色彩" → 基础设施 Agent
```

**跨板块任务** → 协调者统筹
```
"在所有页面添加搜索功能" → 协调者 + 多个 Agent
"重构导航架构" → 协调者 + 基础设施 + 相关板块
```

### 📋 变更登记规则

1. **改之前**: `docs/progress/requirements.md` 生成 ReqID
2. **改的时候**: `docs/progress/development.md` 关联 DevID
3. **改完后**: 更新 `docs/progress/index.md` 状态看板

### 🔧 并行调度规则

**默认并行场景**:
- demo 和 web 端并行开发
- 前端和后端分离任务
- 独立模块的同类改动
- 各 Agent 在各自 scope 内的功能开发

**必须串行场景**:
- 产出有依赖关系
- 修改相同文件
- 架构决策未定
- demo→web 的能力迁移（需按优先级顺序进行）

---

## 关键文档速查

### 📖 专门 Agent 文档
- `.claude/agents/foundation.md` — 基础设施 Agent
- `.claude/agents/backend.md` — 后端 Agent
- `.claude/agents/algorithm.md` — 算法 Agent
- `.claude/agents/plaza.md` — 广场 Agent
- `.claude/agents/wish-publish.md` — 心愿发布 Agent
- `.claude/agents/management.md` — 心愿管理 Agent
- `.claude/agents/shared-protocol.md` — 协作协议

### 🗂️ 技术文档
- `web/CLAUDE.md` — Web 工程地图
- `android/CLAUDE.md` — Android 工程地图
- `ios/CLAUDE.md` — iOS 工程地图
- `supabase/CLAUDE.md` — 数据模块地图
- `demo/README.md` — Demo 边界说明（仅 mock 数据 + 流程演示）
- `docs/plans/2026-03-31-cross-platform-asr-refactor-design.md` — 跨端 ASR 架构设计
- `docs/plans/2026-03-31-cross-platform-asr-refactor-implementation.md` — 跨端 ASR 实施记录
- `docs/tech/api-suppliers-ecosystem-2026.md` — API 供应商生态调研（AI Agent L1 执行能力基础）

### 📊 需求文档
- `docs/features/index.md` — 跨端需求映射入口
- `docs/features/REQ-010-wish-create-and-clarify-flow.md` — 发愿入口与首轮澄清映射
- `docs/features/REQ-012-theme-switching-and-role-companion.md` — 主题切换与角色陪伴映射
- `docs/progress/index.md` — 进度看板
- `docs/progress/requirements.md` — 需求登记
- `docs/progress/development.md` — 开发流水

---

## 找到你想改的东西（第一版目标）

| 想改什么 | demo层 | web层 | 后端层（后端Agent） | 算法层（算法Agent） |
|---------|--------|--------|------------------|------------------|
| **发愿入口+澄清链路** | `demo/features/demo-flow/screens/` | `web/pages/WishComposePage.tsx` | `supabase/sql/003_rpc_functions.sql` | `ai-server/server.js` |
| **广场Feed** | `demo/features/demo-flow/screens/HomeScreen.tsx` | `web/pages/PlazaPage.tsx` | `supabase/sql/002_seed_drift_bottles.sql` | — |
| **我的愿望管理** | `demo/features/demo-flow/screens/MyWishesTab.tsx` | `web/pages/MyWishesPage.tsx` | `supabase/sql/003_rpc_functions.sql` | — |
| **主题切换** | `demo/contexts/ThemeContext.tsx` | `web/contexts/theme/ThemeContext.tsx` | — | — |
| **搭子匹配（缺口）** | `demo/features/demo-flow/screens/` | ❌ 未实现 | ❌ 未实现 | ❌ 未实现 |
| **协同筹备（缺口）** | `demo/features/demo-flow/screens/CollabPrepScreen.tsx` | ❌ 未实现 | ❌ 未实现 | — |
| **履约跟踪（缺口）** | `demo/features/demo-flow/screens/FulfillmentScreen.tsx` | ❌ 未实现 | ❌ 未实现 | — |
| **AI方案生成** | `demo/features/demo-flow/screens/AiPlanScreen.tsx` | `web/lib/agent-api.ts` | `supabase/functions/agent/` | `ai-server/server.js` |
| **数据库架构优化** | — | — | `supabase/CLAUDE.md` | — |
| **多模型路由** | — | — | — | `ai-server/config/models.js` |
| **服务监控** | — | — | `supabase/monitoring/` | `ai-server/metrics/` |
| **全局架构决策** | `demo/CLAUDE.md` | `web/CLAUDE.md` | `supabase/CLAUDE.md` | `ai-server/README.md` |
| **当前阶段任务** | `docs/progress/index.md` | ← | ← | ← |

---

## 当前任务

### 🎯 Phase 1 试点目标
- ✅ 多 Agent 架构建立
- ✅ 基础设施与子模块地图建立
- ✅ `docs/features/` 映射层建立，并已有 `REQ-010 / REQ-012` 两份映射
- ✅ Android / iOS ASR 架构收口与打包链路验证
- ⏳ Android / iOS 真机 ASR 回归
- ⏳ 正式 Web 主栈继续从 demo 表达层收口

### 🚀 第一版交付清单
1. **demo 流程完善**: 补全 9 个 screen 的 mock 数据和交互细节
2. **web 端中段链路**: 从 demo 承接搭子匹配、协同筹备、履约跟踪、轮次推进等功能
3. **后端 + 算法串联**: AI 方案生成→执行状态跟踪→异常处理完整链路
4. **一致性验证**: demo 和 web 的用户体验保持一致

---

**核心使命**: 协调多个专门 Agent 高效协作，确保许愿池产品的一致性体验和高质量交付。
