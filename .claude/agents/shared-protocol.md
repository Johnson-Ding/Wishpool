# 许愿池多 Agent 协作协议

## Agent 分工架构

```
┌─────────────────────────────────────────┐
│  协调者 Agent（根CLAUDE.md + 路由）       │
├─────────────────────────────────────────┤
│  基础设施 Agent（设计系统/领域模型/数据层）│
├──────┬──────┬──────┬──────┬─────────────┤
│ 广场  │ 发布  │ 管理  │ 设置  │ 推送(预留) │
│US01~4│US05~10│US11~13│US14~15│ US16~19   │
└──────┴──────┴──────┴──────┴─────────────┘
```

## 职责边界

### 协调者 Agent（根 CLAUDE.md）
- **职责**: 需求分析、Agent 路由、跨板块协调、最终集成验证
- **权限**: 只读所有文件，负责高层架构决策
- **触发**: 不涉及具体功能的需求分析、多板块协调需求

### 基础设施 Agent (`.claude/agents/foundation.md`)
- **职责**: 设计系统、主题切换、领域模型、数据库架构、跨端一致性
- **权限**: 读写设计文档、组件库、数据层、三端共享代码
- **触发**: 涉及设计规范、主题、数据模型、API接口变更

### 心愿发布 Agent (`.claude/agents/wish-publish.md`)
- **职责**: US-05~10（语音发愿、AI方案、搭子匹配、协同履约）
- **权限**: 读写发愿流程、搭子系统、推进系统相关文件
- **触发**: 涉及发愿录音、AI方案生成、搭子匹配、执行推进

### 心愿管理 Agent (`.claude/agents/management.md`)
- **职责**: US-11~13（我的心愿列表、详情、归档）
- **权限**: 读写 `MyWishesTab`、`WishDetailScreen`、心愿相关组件
- **触发**: 涉及心愿状态管理、列表展示、详情页面

## 协作规则

### 1. 文件写权限管理

**共享组件（只有基础设施 Agent 可写）**:
- `demo/client/src/components/` — 通用UI组件
- `demo/client/src/contexts/` — 全局上下文
- `android/app/src/main/java/.../designsystem/` — Android 设计系统
- `ios/Sources/WishpoolCore/` — iOS 领域模型

**板块专有（对应 Agent 独占写权限）**:
- `demo/client/src/features/demo-flow/screens/AiPlanScreen.tsx` — 心愿发布 Agent
- `demo/client/src/features/demo-flow/scenario-matcher.ts` — 心愿发布 Agent
- `demo/client/src/features/wish-publish/` — 心愿发布 Agent（搭子系统）
- `demo/client/src/features/wish-progress/` — 心愿发布 Agent（推进系统）
- `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx` — 心愿管理 Agent
- `demo/client/src/features/demo-flow/screens/WishDetailScreen.tsx` — 心愿管理 Agent

**耦合热点（需要协商）**:
- `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx` — 影响多个Tab，需协调
- `android/app/src/main/java/.../feature/home/HomeRoute.kt` — 包含多个Tab

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
→ 路由到心愿发布 Agent

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

### Phase 2: 广场 + 发布拆分
- 拆分最复杂的发布流程 (US-05~10)
- 根 CLAUDE.md 进一步瘦身到 ~100 行

### Phase 3: 完整多 Agent 模式
- 所有板块独立运作
- 预留消息推送等 Phase 2 功能板块

## 质量保证

- **集成测试**: 每次多 Agent 协作后，必须进行端到端功能验证
- **文档同步**: Agent 间的接口变更必须同步更新协议文档
- **边界审查**: 定期检查 Agent 职责边界，防止重复建设或遗漏

---

**设计原则**: 高内聚低耦合，让每个 Agent 专注自己的领域，通过明确的协议协作。