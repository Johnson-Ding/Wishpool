# demo mock 数据规范

> **版本**：V4.0  
> **最后更新**：2026-04-06

---

## 目标

demo 阶段使用 mock 数据验证交互逻辑，不依赖真实后端和 AI。

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
- 使用 React Context 管理
- 页面刷新后从 localStorage 恢复

### 初始数据
- 广场：10 条 mock 卡片（愿望 + 碎碎念穿插）
- 我的愿望：3 条 mock 愿望（待开始 1 + 进行中 1 + 已完成 1）
- 群聊：5 条 mock 消息

---

## mock 规则

### 语音输入 mock
- 长按许愿条 → 随机生成一条愿望或碎碎念
- 判断规则：包含"想"、"希望"、"打算" → 愿望；否则 → 碎碎念

### 气泡选择 mock
- 点击气泡 → 直接生成对应愿望卡片
- 预设 4-6 个轻量方向

### todo 勾选 mock
- 勾选 todo → 实时更新进度
- 所有 todo 勾选 → 状态变为"已完成"

---

## 数据持久化

### localStorage key
- `wishpool_wishes`: 愿望列表
- `wishpool_moments`: 碎碎念列表
- `wishpool_chat_messages`: 聊天消息
- `wishpool_theme`: 当前主题

### 数据格式
- JSON 序列化
- 页面刷新后恢复
