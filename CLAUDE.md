---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---
# 许愿池 Wishpool — 协调者 Agent

## 项目定位

Wishpool 三端应用产品开发仓库。当前阶段：Web + Android + iOS 三端并行开发，目标为可发布的完整应用产品。

**当前版本**: v0.3.0 — 三端主题切换系统 + Android 自动更新

---

## 多 Agent 架构

```
┌─────────────────────────────────────────┐
│  协调者 Agent（当前文档）                │
│  负责：需求分析 + Agent路由 + 架构决策    │
├─────────────────────────────────────────┤
│  基础设施 Agent                         │
│  负责：设计系统 + 主题 + 数据层 + 跨端   │
│  文档：.claude/agents/foundation.md     │
├──────┬──────┬──────┬──────┬─────────────┤
│ 广场  │ 发布  │ 管理  │ 设置  │ 推送(预留) │
│US01~4│US05~10│US11~13│US14~15│ US16~19   │
│ 待拆  │✅已拆 │ ✅已拆 │ 待拆  │ Phase 2   │
│      │publish│ mgmt  │      │           │
└──────┴──────┴──────┴──────┴─────────────┘
```

**Agent 路由规则**:
- 🎨 **设计/主题/组件** → 基础设施 Agent
- 🎙️ **心愿发布** (US-05~10) → 心愿发布 Agent
- 📋 **心愿管理** (US-11~13) → 心愿管理 Agent
- 🌍 **跨板块/架构** → 协调者 Agent (当前)

---

## 需求框架概览

### 📊 板块实现状态

| 板块 | 用户故事 | 负责 Agent | 状态 |
|------|---------|-----------|------|
| 心愿广场 | US-01~04 | 📍 待拆分 | Web✅/Android✅/iOS✅ |
| **心愿发布** | **US-05~10** | **✅ wish-publish** | **Web⚠️/Android⚠️/iOS⚠️** |
| **心愿管理** | **US-11~13** | **✅ management** | **Web✅/Android✅/iOS✅** |
| 个人设置 | US-14~15 | 📍 待拆分 | ❌ 未实现 |
| 消息推送 | US-16~19 | 📍 Phase 2 | ❌ 未实现 |
| **主题切换** | **US-20~22** | **✅ foundation** | **Web✅/Android✅/iOS✅** |
| **AI 智能助手** | **US-23~29** | **✅ foundation** | **Web⚠️/Android⚠️/iOS⚠️** |

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

---

## 架构层级

```
┌────────────────────────────────────────────────────┐
│  文档层 docs/                                      │
│  → prd/          产品需求定义                      │
│  → features/     需求点映射                       │
│  → progress/     执行流水                         │
├────────────────────────────────────────────────────┤
│  应用层 web/ + demo/ + android/ + ios/           │
│  → web/          正式 Web 主产品端                │
│  → demo/         Mock 数据流程演示场              │
│  → Android原生 + iOS原生                          │
├────────────────────────────────────────────────────┤
│  共享层 shared/                                    │
│  → wishpool-access/  跨端共享类型与访问层          │
├────────────────────────────────────────────────────┤
│  数据层 supabase/                                 │
│  → sql/          表结构 + RPC + AI Agent 数据     │
│  → functions/    Edge Functions（agent, ai-plan）  │
│  → PostgREST + RPC + Edge Functions + Auth/RLS   │
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
- 三端开发（Web/Android/iOS）
- 前后端分离任务
- 独立模块的同类改动

**必须串行场景**:
- 产出有依赖关系
- 修改相同文件
- 架构决策未定

---

## 关键文档速查

### 📖 专门 Agent 文档
- `.claude/agents/foundation.md` — 基础设施 Agent
- `.claude/agents/management.md` — 心愿管理 Agent
- `.claude/agents/shared-protocol.md` — 协作协议

### 🗂️ 技术文档
- `android/CLAUDE.md` — Android 工程地图
- `ios/CLAUDE.md` — iOS 工程地图
- `supabase/CLAUDE.md` — 数据模块地图
- `demo/README.md` — Demo 边界说明（仅 mock 数据 + 流程演示）
- `docs/tech/api-suppliers-ecosystem-2026.md` — API 供应商生态调研（AI Agent L1 执行能力基础）

### 📊 需求文档
- `docs/progress/index.md` — 进度看板
- `docs/progress/requirements.md` — 需求登记
- `docs/progress/development.md` — 开发流水

---

## 当前任务

### 🎯 Phase 1 试点目标
- ✅ 多 Agent 架构建立
- ✅ 心愿管理板块独立运作
- ✅ 基础设施抽象完成
- ⏳ 验证协作流程效果

### 🚀 下一步规划
1. **产品主栈收口**: `web/android/ios/supabase/ai-server` 继续按正式产品标准推进
2. **Demo 定位收口**: `demo` 仅承载 mock 数据、状态演示、流程叙事，不再承担正式实现
3. **协作规范固化**: 继续完善多 Agent 生态和协作规范

---

**核心使命**: 协调多个专门 Agent 高效协作，确保许愿池产品的一致性体验和高质量交付。
