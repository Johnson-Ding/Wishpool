# 心愿管理 Agent — 个人心愿管理板块

> **继承声明**: 本文档是根 `CLAUDE.md` 的补充。执行前必须先读根 `CLAUDE.md`，所有协作规范、交付责任、过程约束均以根文档为准。

## 需求主动权

- **主动调研**：定期分析本板块的竞品、用户痛点、技术趋势，产出调研摘要和 PRD 更新建议
- **不设边界**：发现其他板块有可以推动的需求时，直接去做，不需要等别人分配
- **月度报告**：每月主动产出板块规划报告，带着具体建议约用户决策，不是等用户来问

## 职责范围

负责 **US-11~13 个人心愿管理板块** 的 demo+web+后端 完整实现，让用户能够查看、管理、归档自己的所有心愿，跟踪实现进度。

### 核心职责（第一版目标）
- **心愿列表**: 按状态分组展示（demo mock + web 真实 + 后端 list_my_wishes RPC）
- **心愿详情**: 显示心愿信息和AI方案（demo 静态 + web 动态读取 + 后端状态机）
- **状态流转**: 心愿从草稿到完成的状态管理（后端 + web 同步）
- **历史归档**: 第一版暂不实现

---

## 产品需求对照

### 📋 US-11: 我的心愿列表
> 作为许愿池用户，我希望能看到自己所有心愿的列表，按照不同状态分组展示，以便了解当前的心愿实现情况。

**验收标准**:
- ✅ 按状态分组：待决策 / 进行中 / 已完成
- ✅ 显示心愿标题、创建时间、当前状态
- ✅ 支持点击进入详情页面
- ✅ 实时反映状态变更（如确认方案后进入"进行中"）

### 📖 US-12: 心愿详情页面
> 作为许愿池用户，我希望能查看单个心愿的详细信息，包括AI生成的实现方案、当前进度、相关记录。

**验收标准**:
- ✅ 完整心愿信息：标题、描述、创建时间、状态
- ✅ AI 方案展示：分解的实现步骤、预估时间
- ⚠️ 进度跟踪：当前在第几步，完成度百分比
- ❌ 历史记录：轮次更新、协同记录等

### 🗂️ US-13: 历史归档 (Phase 3)
> 作为许愿池用户，我希望能回顾已完成的心愿，看到自己的成长轨迹和实现历程。

**验收标准**:
- ❌ 归档列表：按完成时间排序的已完成心愿
- ❌ 成就统计：完成数量、总用时、分类统计
- ❌ 回顾功能：查看实现过程、感想记录

---

## 文件边界

### ✅ 独占写权限（第一版目标）

**demo 层**:
```
demo/client/src/features/demo-flow/screens/
├── MyWishesTab.tsx                     # 心愿列表主界面（mock数据）
├── WishDetailScreen.tsx                # 心愿详情页面（静态展示）
└── MainTabScreen.tsx                   # Tab导航（协商修改）
```

**web 层**:
```
web/client/src/pages/
├── MyWishesPage.tsx                    # 正式心愿管理页面

web/client/src/features/wish-management/
├── components/WishManagementPanel.tsx  # 管理面板组件
└── hooks/useMyWishes.ts               # 真实数据Hook（Supabase）
```

**后端层**:
```
supabase/sql/
├── 003_rpc_functions.sql              # list_my_wishes, deleteWish RPC
├── 004_agent_system.sql               # 心愿状态追踪表
└── 001_core_schema.sql                # wish_tasks 主表（协商修改）
```
│   ├── MyWishesView.swift             # 心愿列表视图
│   ├── WishDetailView.swift           # 心愿详情视图
│   └── WishSectionBuilder.swift       # 列表分组逻辑
└── Shared/WishStatus+Extensions.swift  # 状态扩展
```

### 📖 只读权限

**通用组件**: 使用基础设施 Agent 提供的设计组件
**数据类型**: 读取 `wish_tasks` 表结构和 RPC 函数
**主题样式**: 读取当前主题的色彩变量

---

## 当前实现状态

### 🎯 Web 端（完成度 90%）

**已实现功能**:
- ✅ **三状态分组**: `useDemoFlow` 中的愿望状态管理
- ✅ **列表渲染**: `MyWishesTab` 按状态展示心愿卡片
- ✅ **状态映射**: 根据 `scenario` 和 `planConfirmed` 计算显示状态
- ✅ **详情页面**: `WishDetailScreen` 显示完整心愿信息
- ✅ **导航集成**: 从列表点击跳转到详情页面

**代码架构**:
```typescript
// 状态分组逻辑 (MyWishesTab.tsx 第83-109行)
const groupedWishes = useMemo(() => {
  return {
    pending: wishes.filter(w => !w.planConfirmed),
    active: wishes.filter(w => w.planConfirmed && w.status !== "completed"),
    completed: wishes.filter(w => w.status === "completed")
  }
}, [wishes])

// 导航逻辑 (第111行)
const handleWishClick = (wish: any) => {
  navigateToWishDetail(wish.id)
}
```

### 📱 Android 端（完成度 85%）

**已实现功能**:
- ✅ **分组展示**: `MyWishesViewModel.buildWishSections()` 构建三状态分组
- ✅ **状态计算**: 基于 `planConfirmed` 和 completion 状态分组
- ✅ **列表 UI**: `MyWishesPresentation` 展示分组列表
- ✅ **详情页面**: `WishDetailRoute` 显示心愿详情
- ⚠️ **状态同步**: 与后端数据同步需要优化

**代码架构**:
```kotlin
// 分组逻辑 (MyWishesViewModel.kt)
private fun buildWishSections(wishes: List<Wish>): List<WishSection> {
    return listOf(
        WishSection("待决策", wishes.filter { !it.planConfirmed }),
        WishSection("进行中", wishes.filter { it.planConfirmed && !it.isCompleted }),
        WishSection("已完成", wishes.filter { it.isCompleted })
    )
}
```

### 🍎 iOS 端（完成度 90%）

**已实现功能**:
- ✅ **分组视图**: `MyWishesView` 使用 `WishSectionBuilder` 构建分组
- ✅ **状态标签**: 不同状态的视觉标识和色彩
- ✅ **详情视图**: `WishDetailView` 完整的心愿信息展示
- ✅ **导航**: List → Detail 的 NavigationLink 集成

**代码架构**:
```swift
// 分组构建 (WishSectionBuilder.swift)
static func buildSections(from wishes: [Wish]) -> [WishSection] {
    return [
        WishSection(title: "待决策", wishes: wishes.filter { !$0.planConfirmed }),
        WishSection(title: "进行中", wishes: wishes.filter { $0.planConfirmed && !$0.isCompleted }),
        WishSection(title: "已完成", wishes: wishes.filter { $0.isCompleted })
    ]
}
```

---

## 数据流架构

### 🔄 状态管理模式

**Web**: `useDemoFlow` Hook → 本地状态 + 导航状态
**Android**: `MyWishesViewModel` → StateFlow + 依赖注入
**iOS**: `@StateObject WishRepository` → Published属性 + SwiftUI绑定

### 🗄️ 数据来源

**主要数据源**:
- `list_my_wishes(device_id)` RPC — 根据设备ID获取用户心愿
- `wish_tasks` 表 — 心愿主数据
- 本地状态 — UI交互状态和导航状态

**数据字段**:
```sql
-- wish_tasks 核心字段
id, device_id, title, description, scenario, ai_plan,
plan_confirmed, created_at, updated_at
```

### 📊 状态映射规则

| 数据库状态 | 业务状态 | 显示文本 | 色彩标识 |
|-----------|---------|---------|---------|
| `plan_confirmed = false` | pending | 待决策 | 橙色/桃粉 |
| `plan_confirmed = true, !completed` | active | 进行中 | 蓝色/天蓝 |
| `completed = true` | completed | 已完成 | 绿色 |

---

## 待开发功能

### 🔧 近期优化 (Phase 1)

1. **进度跟踪细化**
   - 显示当前在AI方案的第几步
   - 可视化的进度条或步骤指示器
   - 预估完成时间

2. **交互体验优化**
   - 下拉刷新心愿列表
   - 心愿状态变更的实时反馈
   - 长按操作（删除、归档等）

3. **数据同步优化**
   - 乐观更新策略（先更新UI，再同步服务器）
   - 离线数据缓存和同步策略
   - 错误处理和重试机制

### 🚀 中期规划 (Phase 2)

1. **轮次推进功能**
   - 基于 `validation_rounds` 表的轮次管理
   - 轮次更新的历史记录
   - 轮次相关的状态变更

2. **协同功能**
   - 基于 `collab_locks` 表的协同状态
   - 搭子协同的进度展示
   - 协同伙伴信息展示

3. **履约记录**
   - 基于 `wish_fulfillments` 表的履约追踪
   - 履约证明的上传和展示
   - 履约状态的实时更新

### 🌟 长期愿景 (Phase 3)

1. **智能归档** (US-13)
   - 自动归档机制
   - 成就统计和可视化
   - 个人成长轨迹展示

2. **个性化推荐**
   - 基于完成历史的相关心愿推荐
   - 实现难度和用户能力的匹配
   - 个性化的实现方案建议

---

## 质量标准

### ✅ 功能完整性检查

**基础功能**:
- [ ] 心愿列表正确按状态分组
- [ ] 点击心愿可正常跳转到详情页面
- [ ] 详情页面显示完整的心愿信息
- [ ] 状态变更后列表实时更新

**用户体验**:
- [ ] 列表加载性能良好（<500ms）
- [ ] 状态切换动画流畅
- [ ] 错误状态有合适的提示和恢复机制
- [ ] 空状态有引导性的占位内容

**跨端一致性**:
- [ ] 三端的状态分组逻辑完全一致
- [ ] 心愿卡片的信息展示格式相同
- [ ] 状态标签的色彩和文案统一

### 🔧 代码质量标准

**架构规范**:
- [ ] 状态管理模式符合各端的最佳实践
- [ ] 数据流清晰，避免不必要的重复请求
- [ ] 组件拆分合理，复用性良好

**性能要求**:
- [ ] 大列表（>100项）滚动流畅
- [ ] 状态切换无明显延迟
- [ ] 内存使用合理，无明显泄漏

---

## 协作界面

### 📥 依赖其他 Agent

**基础设施 Agent**:
- 心愿状态的色彩变量和UI组件
- 列表组件和卡片组件的设计规范
- 数据类型定义和API接口

**发布 Agent** (间接依赖):
- 心愿创建后的状态流转
- 方案确认后的状态更新

### 📤 提供给其他 Agent

**状态数据**:
- 用户当前的活跃心愿数量
- 心愿完成率等统计数据

**用户行为数据**:
- 用户对不同类型心愿的偏好
- 心愿完成的时间模式

---

## 主动汇报机制

### 📅 固定汇报节奏
- **月度规划报告**：每月第 1 周，提交下月《规划报告》
- **双周迭代报告**：每两周结束后的第 1 个工作日，提交《迭代报告》
- **紧急触发**：心愿状态机变更、列表性能出现明显退化、跨端数据同步不一致时，48 小时内追加专项报告

### 📋 报告内容
按 `docs/reports/agent-report-template.md` 模板输出：
1. **规划报告**：下阶段目标、关键决策点、跨板块影响预测、风险评估
2. **迭代报告**：交付清单、未完成原因、数据观察、问题与方案、下一步计划

### 🔔 约评审时间
报告产出后，Agent **必须主动发起对话**，向用户请求评审时间：
> "[management Agent] 本月度规划报告已生成，涉及心愿列表体验优化和归档功能设计。请约一个 15 分钟时间做评审，需要您拍板 [决策点1] 和 [决策点2]。"

### 📝 报告存放
- 报告文件临时存于 `docs/reports/management-YYYY-MM-{planning|iteration}.md`
- 评审确认后，更新 `docs/progress/index.md` 中对应板块状态

---

**核心使命**: 让用户清晰地了解自己的心愿实现进度，在管理个人目标的过程中获得成就感和持续动力。