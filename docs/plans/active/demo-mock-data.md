# demo mock 数据规范

> **版本**：V4.0  
> **最后更新**：2026-04-08

---

## 目标

demo 阶段使用 mock 数据验证交互逻辑，不依赖真实后端和 AI。
当前重点是验证聊天入口、对话流卡片、荧光条三态与语音输入链路。

---

## mock 数据类型

### 1. 愿望卡片

```typescript
interface WishCard {
  id: string
  title: string
  summary: string
  todos: Array<{
    id: string
    text: string
    completed: boolean
  }>
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
}
```

### 2. 碎碎念卡片

```typescript
interface MomentCard {
  id: string
  title: string
  content: string
  tags: string[]
  shared: boolean
  createdAt: string
}
```

### 3. 聊天消息

```typescript
interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'wish_card' | 'moment_card'
  content: string
  role?: 'moon' | 'cloud' | 'star'
  timestamp: string
}
```

---

## mock 数据存储

### 本地状态
- 以 React 本地状态为主
- 角色选择通过 Context 向下传递
- 当前不把聊天消息、愿望列表、碎碎念列表做成完整持久化

### 初始数据
- 广场：10 条 mock 卡片（愿望 + 碎碎念穿插）
- 我的愿望：3 条 mock 愿望（待开始 1 + 进行中 1 + 已完成 1）
- 群聊：初始 AI / 用户 / 愿望 / 碎碎念混排消息
- 语音输入：从固定 mock 文案池中随机取样

---

## mock 规则

### 语音输入 mock
- 首页长按荧光圈 → 先开语音，完成后进入聊天页并插入卡片
- 聊天页长按许愿条 → 直接开语音并插入卡片
- 当前根据文案是否包含“想”来决定更偏愿望还是碎碎念

### 气泡选择 mock
- 点击气泡 → 直接生成对应愿望卡片
- 预设 4-6 个轻量方向

### AI 引导 mock
- 群聊默认消息加载后，3 秒内插入一条 AI 引导文案
- AI 引导会把荧光条切到目标状态
- 用户点击后生成卡片，再恢复到 A 态“流动”

### todo 勾选 mock
- 勾选 todo → 实时更新进度
- 所有 todo 勾选 → 状态变为“已完成”

---

## 数据持久化

### localStorage key
- `wishpool_character`: 当前角色选择

### 当前说明
- 只有角色选择会在刷新后恢复
- 愿望列表、碎碎念、聊天消息当前仍以 demo 会话态为主
- 文档不再继续声明尚未落地的持久化 key
