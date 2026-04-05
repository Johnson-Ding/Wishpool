# 许愿池多 Agent 协作协议

## Agent 分工架构（战略收敛版）

```
┌─────────────────────────────────────────────────────┐
│  协调者 Agent（根CLAUDE.md + 路由）                   │
├─────────────────────────────────────────────────────┤
│  横向支撑层（4个技术 Agent）                         │
├─────────────────────────────────────────────────────┤
│  基础设施 Agent（设计系统 + 共享契约）                │
├─────────────────────────────────────────────────────┤
│  前端 Agent（demo+web 前端基础设施 + 跨端一致性）     │
├─────────────────────────────────────────────────────┤
│  后端 Agent（数据库 + RPC + Edge Functions）         │
├─────────────────────────────────────────────────────┤
│  算法 Agent（ai-server 算法实现）                    │
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

## 职责边界

### 协调者 Agent（根 CLAUDE.md）
- **职责**: 需求分析、Agent 路由、跨板块协调、最终集成验证
- **权限**: 只读所有文件，负责高层架构决策
- **触发**: 不涉及具体功能的需求分析、多板块协调需求

### 基础设施 Agent (`.claude/agents/foundation.md`)
- **职责**: 设计系统、主题切换、共享契约
- **权限**: 读写设计文档、组件库、shared/ 共享类型
- **触发**: 涉及设计规范、主题、API接口变更

### 前端 Agent (`.claude/agents/frontend.md`)
- **职责**: demo+web 前端基础设施、跨端一致性验证、前端工程基线
- **权限**: 读写 demo/web 的路由、状态管理、通用组件、构建配置
- **触发**: 涉及前端基础设施、demo↔web 一致性、前端工程质量

### 后端 Agent (`.claude/agents/backend.md`)
- **职责**: 数据库架构、RPC 函数、Edge Functions、服务稳定性
- **权限**: 读写 supabase/ 数据库表结构、RPC、Edge Functions
- **触发**: 涉及数据库架构变更、RPC 函数开发、Edge Functions、服务监控

### 算法 Agent (`.claude/agents/algorithm.md`)
- **职责**: ai-server 算法实现（多模型路由、提示词工程、降级链）
- **权限**: 读写 ai-server/ 算法实现
- **触发**: 涉及 AI 方案生成算法、多模型路由、提示词优化
- **边界**: 只负责算法实现，不负责需求拆解，接收明确技术需求

### 心愿发布 Agent (`.claude/agents/wish-publish.md`)
- **职责**: US-05~06（发愿入口 + AI 方案生成，需求拆解 + 端到端协调）
- **权限**: 读写 demo/web 发愿流程、协调后端/算法 Agent 完成集成
- **触发**: 涉及发愿入口、AI 方案生成的需求拆解和端到端交付
- **边界**: 负责需求拆解，协调后端/算法 Agent，不直接写算法实现

### 心愿管理 Agent (`.claude/agents/management.md`)
- **职责**: US-11~13（我的心愿列表、详情、归档、状态流转）
- **权限**: 读写 demo/web 心愿管理页面、Supabase 状态相关 RPC
- **触发**: 涉及心愿状态管理、列表展示、详情页面、进度跟踪

### 广场 Agent (`.claude/agents/plaza.md`)
- **职责**: US-01~04（广场 Feed、帮Ta实现、点赞评论、漂流瓶）
- **权限**: 读写 demo/web 广场页面、Supabase Feed 相关 RPC 和种子数据
- **触发**: 涉及广场内容流、互动、漂流瓶、Feed 聚合、社区功能

## 协作理念

**不设边界，主动推动。** 每个 Agent 的 scope 不是固定的围墙，而是当前的起点。鼓励每个 Agent：
- 发现其他板块的需求或改进点时，直接去做
- 跨板块协同时，谁有能力谁上，不需要请示
- Scope 的迁移是自然的——如果一个 Agent 持续在另一个领域产出价值，那个领域自然就成了它的一部分

**唯一的约束**：改动前先看有没有人正在改同一个文件，有的话先沟通。

## 矩阵协调机制

### 功能 Agent 如何调用技术 Agent

**方式 1: 直接调用（推荐）**
- 功能 Agent 可以直接在文档中说明需要技术 Agent 的支持
- 协调者 Agent 会自动路由到对应的技术 Agent
- 例如：心愿发布 Agent 说"需要算法 Agent 实现 AI 方案生成"

**方式 2: 通过协调者（复杂场景）**
- 当需要多个技术 Agent 协作时，通过协调者统筹
- 例如：需要前端 + 后端 + 算法三个 Agent 同时配合

### 技术 Agent 如何反馈给功能 Agent

**同步反馈**:
- 技术 Agent 完成任务后，在交接文档中说明
- 功能 Agent 可以直接看到技术 Agent 的产出

**异步通知**:
- 技术 Agent 发现问题时，通过协调者通知功能 Agent
- 例如：算法 Agent 发现 AI 方案生成失败率过高，通知心愿发布 Agent

### 冲突解决机制

**文件冲突**:
- 两个 Agent 同时修改同一文件 → 协调者仲裁，决定先后顺序
- 例如：前端 Agent 和心愿发布 Agent 都要修改 `WishComposePage.tsx`

**需求冲突**:
- 两个 Agent 的需求互相矛盾 → 协调者召集讨论，达成一致
- 例如：前端 Agent 要求统一路由，心愿发布 Agent 要求保留独立路由

**优先级冲突**:
- 两个 Agent 都认为自己的任务最紧急 → 协调者根据第一版 MVP 目标决定优先级

### 上下文变量机制

**共享上下文**:
- 当前用户（user_id）
- 当前心愿（wish_id）
- 当前阶段（发愿/澄清/方案/搭子/履约）

**使用方式**:
- 功能 Agent 在调用技术 Agent 时，传递上下文变量
- 技术 Agent 根据上下文变量提供针对性的支持
- 避免 Agent 间重复传递相同信息

**示例**:
```
心愿发布 Agent → 算法 Agent
上下文: { user_id: "123", wish_id: "456", stage: "clarify" }
需求: "生成澄清问题"
```

## 协作规则

### 1. 文件写权限管理

**基础设施专有（只有基础设施 Agent 可写）**:
- `shared/` — 跨端共享类型与访问契约
- 设计系统相关文档和配置

**前端专有（只有前端 Agent 可写）**:
- `demo/client/src/components/ui/` — 通用UI组件
- `demo/client/src/contexts/` — 全局上下文（demo）
- `demo/client/src/features/demo-flow/useDemoFlow.ts` — demo 路由系统
- `web/client/src/components/ui/` — Web UI组件库
- `web/client/src/contexts/theme/` — Web 主题系统
- `web/` 的路由、状态管理、构建配置

**后端专有（只有后端 Agent 可写）**:
- `supabase/sql/` — 数据库表结构、RPC 函数、种子数据
- `supabase/functions/` — Edge Functions

**算法专有（只有算法 Agent 可写）**:
- `ai-server/` — AI 算法实现（多模型路由、提示词工程）

**板块专有（demo+web+后端，对应 Agent 独占写权限）**:
- **广场 Agent**:
  - `demo/features/demo-flow/screens/HomeScreen.tsx`
  - `demo/features/demo-flow/useFeedData.ts`
  - `web/pages/PlazaPage.tsx`
  - `web/features/plaza/`
  - `supabase/sql/002_seed_drift_bottles.sql`
  
- **心愿发布 Agent**:
  - `demo/features/demo-flow/screens/AiPlanScreen.tsx`
  - `demo/features/demo-flow/screens/ChatScreen.tsx`（发愿入口相关）
  - `web/pages/WishComposePage.tsx`
  - `web/features/wish-create/`
  - 协调后端/算法 Agent 完成集成，不直接写 supabase/ 和 ai-server/
  
- **心愿管理 Agent**:
  - `demo/features/demo-flow/screens/MyWishesTab.tsx`
  - `web/pages/MyWishesPage.tsx`
  - `web/features/wish-management/`
  - `supabase/sql/003_rpc_functions.sql`（部分）

**耦合热点（需要协商）**:
- `demo/features/demo-flow/screens/MainTabScreen.tsx` — 影响多个Tab，需协调
- `web/components/product/ProductShell.tsx` — 全局壳层

### 2. 变更协调流程

**单板块变更** → 直接调用对应专门 Agent
**跨板块变更** → 协调者先分析 → 调用多个 Agent 协作
**基础设施变更** → 基础设施 Agent → 通知影响的板块 Agent

### 3. 交接标准

每个 Agent 完成工作后必须提供：
- **改动清单**: 修改了哪些文件，变更原因
- **测试验证**: 功能验证步骤和结果
- **影响评估**: 对其他板块的潜在影响
- **TODO遗留**: 未完成的工作和接续建议

## Agent 调用语法

```markdown
## 单板块任务
用户说："优化心愿列表的加载性能"
→ 路由到心愿管理 Agent

用户说："修复语音转写问题"
→ 路由到心愿发布 Agent（需求拆解）→ 协调后端/算法 Agent

用户说："优化 AI 方案生成的提示词"
→ 路由到算法 Agent

用户说："添加 AI 方案生成的降级链"
→ 路由到算法 Agent

用户说："广场 Feed 加载太慢"
→ 路由到广场 Agent

## 基础设施任务
用户说："添加一套新的主题色彩"
→ 路由到基础设施 Agent

## 跨板块任务
用户说："在广场和管理页面都加一个搜索功能"
→ 协调者分析 → 调用广场 + 管理 Agent 协作

## 架构重构任务
用户说："重构整个导航结构"
→ 协调者统筹 → 基础设施 + 多个板块 Agent
```

## 迁移策略

### Phase 1: 基础设施 + 心愿管理（当前）
- 验证多 Agent 协作模式
- 根 CLAUDE.md 从 800+ 行瘦身到 ~150 行
- 心愿管理板块完全独立运作

### Phase 2: 技术 Agent 补全 + 职责收敛（当前）
- ✅ 拆分心愿发布流程 (US-05~06，职责收敛)
- ✅ 拆分心愿广场 (US-01~04)
- ✅ 补全算法 Agent (ai-server 算法实现)
- ✅ 明确第一版 MVP 目标（发愿→AI方案→我的愿望）
- 根 CLAUDE.md 进一步瘦身到 ~100 行

### Phase 3: 完整多 Agent 模式
- 所有板块独立运作
- 预留消息推送等 Phase 2 功能板块

## 汇报协调规则

### 每个 Agent 的汇报义务
- **规划报告**：每月 1 份，聚焦下月目标与待决策事项
- **迭代报告**：每 2 周 1 份，聚焦已完成工作与阻塞
- **模板统一**：必须使用 `docs/reports/agent-report-template.md`

### 协调者的汇报管理
- **汇总四个 Agent 的迭代报告**，在收到后 2 个工作日内更新 `docs/progress/index.md`
- **识别冲突**：若两个 Agent 的规划在同一时间修改共享文件或接口，协调者优先安排串行评审
- **评审排期**：协调者负责替用户把 3 个 Agent 的评审请求合并或排期，避免用户被连续约时间轰炸

### 周期报告触发流程（自动化执行）
```
定时触发（每日9:00 SG随机时间）
    ↓
生成报告触发文件 (.claude/triggers/)
    ↓
Claude 检测 → 以 Agent 身份生成报告 → 推送飞书
    ↓
协调者汇总各 Agent 报告 → 更新看板 → 约评审时间
```

**定时任务配置**:
- **触发时间**: 每天 SG 时间 9:00 生成随机偏移（0~9小时），在随机时间点触发
- **执行脚本**: `scripts/agent-reminder-wrapper.sh` + `scripts/agent-report-generator.sh`
- **推送渠道**: 飞书消息给 皮皮峥
- **触发文件**: `.claude/triggers/{agent}-{type}-{date}` 标记需要生成报告的 Agent

**协调者执行义务**:
1. **检测触发文件**: 当发现 `.claude/triggers/` 下有新的触发标记时，以对应 Agent 身份生成报告
2. **飞书推送**: 报告生成后立即通过 `lark-cli` 推送给用户
3. **主动约评审**: 消息中必须包含"请约 X 分钟时间评审"和具体决策点
4. **汇总更新**: 收到各 Agent 报告后 2 个工作日内更新 `docs/progress/index.md`

---

## 日迭代机制（新增）

### 目标
- 把“月度规划 / 双周迭代报告”补齐为**每天有计划、每天有汇总、每天有飞书提醒**的执行闭环
- 协调者不再用口头描述日任务，必须落盘到可追踪文件后再下发
- 未回写的 Agent 交付一律保留为“待回写”，禁止在看板上直接标记完成

### 自动化入口
- **晨间计划**：`scripts/agent-reminder-wrapper.sh` 调度 `scripts/daily-orchestrator.sh plan --send`
- **晚间汇总**：`scripts/agent-report-generator.sh` 调度 `scripts/daily-orchestrator.sh report --send`
- **人工验收/E2E**：`scripts/daily-orchestrator.sh run --date YYYY-MM-DD --send`

### 日迭代产物
- `docs/progress/daily/YYYY-MM-DD-plan.md`：当天计划板，来源于 `.claude/task-pool.md`
- `docs/progress/daily/YYYY-MM-DD-report.md`：当天汇总板，记录 trigger 和回写状态
- `docs/progress/daily/YYYY-MM-DD-coordinator-plan.md`：协调者晨报，给用户看的收敛版计划
- `docs/progress/daily/YYYY-MM-DD-coordinator-report.md`：协调者日报，给用户看的收敛版日报
- `.claude/triggers/{agent}-daily-plan-YYYY-MM-DD`：晨间任务下发标记
- `.claude/triggers/{agent}-daily-report-YYYY-MM-DD`：晚间汇总回写标记
- `docs/progress/index.md`：协调者维护的当日总看板入口

### 协调者执行义务（按天）
1. **晨间抽取任务**：从共享任务池抽取各 Agent 当天前 1~2 个焦点任务，生成计划文件
2. **晨间下发 trigger**：为四个 Agent 写入 `daily-plan` trigger，并通过飞书同步今日计划
3. **晚间生成汇总**：写入 `daily-report` trigger，生成当天汇总文件
4. **看板回写**：当天把 `docs/progress/index.md` 更新为日迭代看板格式，保留计划、汇总、阻塞和飞书验证状态

### 对用户的默认输出口径
- 用户默认只接收 **协调者晨报 / 协调者日报**，不再被要求同时管理四个 Agent 的明细
- 四个 Agent 的回写文件保留为内部留档，只有出现真实阻塞、冲突或需要拍板的事项时，协调者才在收敛日报里抬出来
- 晨报优先级默认先读取 `.claude/task-pool.md` 中的“本周P0优先级排序”，而不是机械采用每个 Agent 自己的前两个任务

### 飞书发送口径
- 只允许使用已验证过的命令：
  - `lark-cli im +messages-send --as bot --user-id <open_id> --text "<message>"`
- 已排除的错误写法：
  - 把 `--as` 挂在 `lark-cli im` 层级
  - 使用不存在的 `--receive-id` 参数
  - 省略 `--as bot`，导致命令退回 `user` 身份

---

## 质量保证

- **集成测试**: 每次多 Agent 协作后，必须进行端到端功能验证
- **文档同步**: Agent 间的接口变更必须同步更新协议文档
- **边界审查**: 定期检查 Agent 职责边界，防止重复建设或遗漏

---

**设计原则**: 高内聚低耦合，让每个 Agent 专注自己的领域，通过明确的协议协作。
