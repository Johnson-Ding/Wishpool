# 基础设施 Agent — 设计系统与架构

> **继承声明**: 本文档是根 `CLAUDE.md` 的补充。执行前必须先读根 `CLAUDE.md`，所有协作规范、交付责任、过程约束均以根文档为准。

## 需求主动权

- **主动调研**：定期分析本板块的竞品、用户痛点、技术趋势，产出调研摘要和 PRD 更新建议
- **不设边界**：发现其他板块有可以推动的需求时，直接去做，不需要等别人分配
- **月度报告**：每月主动产出板块规划报告，带着具体建议约用户决策，不是等用户来问

## 职责范围（第一版目标）

负责 **设计系统**、**数据层**、**Web基础设施** 和 **共享契约** 的所有实现，确保 demo 和 web 的设计语言、数据模型、API接口保持统一。

### 核心职责
- **设计系统维护**: 三角色主题（moon/cloud/star）、色彩变量、组件库、动画规范
- **数据架构**: Supabase 表结构、RPC 函数、共享类型定义
- **Web基础设施**: 全局壳层、路由、通用 hooks、工具函数
- **共享契约**: shared/ 下的跨端类型、API 客户端

---

## 文件边界

### ✅ 独占写权限

**设计系统与主题**:
```
demo/client/src/
├── contexts/ThemeContext.tsx            # demo 主题上下文
├── components/ThemeSelector.tsx          # 主题选择器
├── index.css                            # CSS 变量定义
└── components/ui/                       # shadcn/ui 组件库

web/client/src/
├── contexts/theme/ThemeContext.tsx      # web 主题系统
├── components/ThemeSelector.tsx         # 主题切换器
├── components/ui/                       # shadcn/ui 组件库
├── index.css                            # 全局主题 tokens
└── components/product/                  # 产品级组件
    ├── ProductShell.tsx                 # 全局壳层
    └── ProductNav.tsx                   # 导航栏
```

**数据层架构**:
```
supabase/sql/
├── 001_core_schema.sql                  # 核心数据表结构
├── 002_seed_drift_bottles.sql           # 种子数据
├── 003_rpc_functions.sql                # RPC 函数定义
├── 004_agent_system.sql                 # AI Agent 执行表
└── 005_ai_plans.sql                     # AI 方案表

shared/
├── types/execution-plan.ts              # 执行计划类型
├── api.ts                               # API 共享类型
└── agent-api.ts                         # Agent API 客户端
```

**数据层架构**:
```
demo/client/src/
├── types/                              # TypeScript 类型定义
├── utils/                              # 工具函数
└── api/                                # API 客户端

android/app/src/main/java/com/wishpool/app/
├── domain/model/                       # 领域模型
├── data/                               # 数据层
└── core/network/                       # 网络基础

ios/Sources/WishpoolCore/
├── Models/                             # Swift 数据模型
├── Networking/                         # 网络层
└── Repository/                         # 数据仓库

supabase/
├── sql/                                # 数据库架构
└── functions/                          # Edge Functions
```

### 📖 只读权限

**板块页面**: 不直接修改具体业务页面，但提供组件和样式支持
**应用入口**: 不修改路由逻辑，但提供主题Provider集成

---

## 当前架构状态

### 🎨 三角色主题系统（v0.3.0 已完成）

| 角色 | 状态 | 配色基调 | 特效语言 |
|------|------|----------|---------|
| **眠眠月 🌙** | ✅ 已实现 | 深靛蓝黑 + 月光金 + 青色 | 星光闪烁、径向涟漪、缓呼吸 |
| **朵朵云 ☁️** | ✅ 已实现 | 晨曦白 + 桃粉 + 天蓝 | 云朵浮动、磨砂呼吸、柔焦 |
| **芽芽星 🌱** | ⚠️ UI占位 | 太空深紫 + 霓虹薄荷 + 亮青 | 极光流转、Q弹回弹、粒子 |

### 🔧 技术实现对照（第一版目标）

| 功能 | demo | web | 后端 | 算法 |
|------|-----|-----|------|------|
| **主题切换** | ✅ CharacterContext + CSS变量 | ✅ ThemeContext + CSS tokens | — | — |
| **状态持久化** | ✅ localStorage | ✅ localStorage | — | — |
| **选择器UI** | ✅ ThemeSelector浮层 | ✅ ThemeSelector组件 | — | — |
| **设计系统** | ✅ shadcn/ui | ✅ shadcn/ui + Tailwind v4 | — | — |
| **数据表结构** | — | — | ✅ Supabase SQL | — |
| **共享契约** | — | — | ✅ shared/ 类型定义 | — |

### 📊 设计变量对照表

**色彩变量覆盖度**:
- **眠眠月**: 100% (50个变量)
- **朵朵云**: 100% (50个变量)
- **芽芽星**: 30% (15个变量，等待Phase 3完善)

**组件适配度**:
- **毛玻璃效果**: demo ✅ / web ✅
- **动态背景**: demo ✅ StarField/CloudField / web ✅ 同样组件
- **渐变按钮**: demo ✅ / web ✅

---

## 数据架构概览

### 🗄️ Supabase 表结构

```sql
-- 核心业务表
anonymous_users           # 匿名用户管理
wish_tasks               # 心愿任务主表
validation_rounds        # 轮次校验
collab_locks            # 协同锁定
wish_fulfillments       # 履约记录

-- 内容表
drift_bottles           # 漂流瓶内容
drift_bottle_comments   # 漂流瓶评论

-- RPC 函数
create_wish()           # 创建心愿
clarify_wish()          # 补约束
confirm_wish_plan()     # 确认计划
like_bottle()           # 点赞漂流瓶
list_my_wishes()        # 查询我的心愿
```

### 🔌 API 接口状态

| 函数 | 状态 | 用途 | 调用方 |
|------|------|------|-------|
| `create_wish` | ✅ 已实现 | 创建心愿+匿名用户 | demo+web 发愿流程 |
| `clarify_wish` | ✅ 已实现 | 补充约束 | web WishComposePage |
| `confirm_wish_plan` | ✅ 已实现 | 确认AI方案 | web WishComposePage |
| `like_bottle` | ✅ 已实现 | 点赞漂流瓶 | demo+web Feed页面 |
| `list_my_wishes` | ✅ 已实现 | 查询心愿列表 | demo+web MyWishes页面 |
| `match_buddy` | ❌ 待实现 | 搭子匹配 | 第一版缺口 |
| `update_wish_round` | ❌ 待实现 | 轮次推进 | 第一版缺口 |

---

## 当前任务与发展方向

### 🎯 近期目标 (Phase 1)

1. **完善芽芽星主题** — 补齐剩余35个CSS变量，实现完整三角色切换
2. **Android 毛玻璃优化** — 研究 Compose 下的真实模糊效果实现
3. **设计变量规范化** — 建立三端设计token同步机制

### 🚀 中期目标 (Phase 2)

1. **扩展设计系统** — 季节主题、节日主题等动态变体
2. **性能优化** — 主题切换动画性能、大列表渲染优化
3. **跨端组件库** — 可复用的高级组件（卡片、表单等）

### 🌟 长期愿景 (Phase 3)

1. **智能主题** — 基于时间、位置、心情的自动主题切换
2. **无障碍支持** — 高对比度、大字体等accessibility增强
3. **设计工具链** — 从设计稿到代码的自动化生成流程

---

## 质量标准

### ✅ 三端一致性检查清单

**视觉一致性**:
- [ ] 同一主题下，三端色彩值完全匹配
- [ ] 按钮、卡片等组件的圆角、阴影规格一致
- [ ] 字体大小、间距按比例缩放，视觉重量相同

**交互一致性**:
- [ ] 主题切换入口位置和操作流程相同
- [ ] 动画时长和缓动函数保持一致
- [ ] 反馈状态（loading、error、success）表现一致

**技术一致性**:
- [ ] 主题状态管理模式相同
- [ ] API调用和数据格式完全匹配
- [ ] 错误处理和边界情况处理策略一致

---

## 协作界面

### 📥 接收来自其他 Agent

- **心愿管理 Agent**: 需要新的状态色彩（如"已归档"状态）
- **广场 Agent**: 需要新的交互组件（如"帮Ta实现"按钮）
- **发布 Agent**: 需要新的表单组件和验证样式

### 📤 提供给其他 Agent

- **设计规范**: 色彩变量、间距规范、动画参数
- **通用组件**: 按钮、卡片、表单、弹窗等基础UI
- **数据类型**: TypeScript类型定义、API接口规范
- **工具函数**: 主题获取、设备检测、格式化等utility

---

## 主动汇报机制

### 📅 固定汇报节奏
- **月度规划报告**：每月第 1 周，提交下月《规划报告》
- **双周迭代报告**：每两周结束后的第 1 个工作日，提交《迭代报告》
- **紧急触发**：遇到跨板块架构决策、数据模型变更、设计系统 Breaking Change 时，48 小时内追加专项报告

### 📋 报告内容
按 `docs/reports/agent-report-template.md` 模板输出：
1. **规划报告**：下阶段目标、关键决策点、跨板块影响预测、风险评估
2. **迭代报告**：交付清单、未完成原因、数据观察、问题与方案、下一步计划

### 🔔 约评审时间
报告产出后，Agent **必须主动发起对话**，向用户请求评审时间：
> "[foundation Agent] 本月度规划报告已生成，涉及主题系统下一步扩展和跨端 token 同步。请约一个 15 分钟时间做评审，需要您拍板 [决策点1] 和 [决策点2]。"

### 📝 报告存放
- 报告文件临时存于 `docs/reports/foundation-YYYY-MM-{planning|iteration}.md`
- 评审确认后，更新 `docs/progress/index.md` 中对应板块状态

---

**核心使命**: 让用户在三端应用中享受一致、精致、有情感温度的"一搭子一宇宙"体验。