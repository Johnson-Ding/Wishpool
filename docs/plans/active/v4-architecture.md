# V4 架构总览

> **版本**：V4.0  
> **最后更新**：2026-04-06

---

## 核心变化

V4 的核心架构变化：
- **从独立策划页 → 对话流卡片**
- **从多页面跳转 → 单一群聊容器**
- **从跨端架构 → demo 单端验证**

---

## 技术栈

### demo 层
- React + TypeScript
- Vite 构建
- 本地状态管理（无需 Redux）
- mock 数据（无需真实后端）

### 未来 web 层（待承接）
- 从 demo 迁移核心能力
- 接入真实 Supabase 后端
- 接入真实 AI 服务

---

## 目录结构

```
demo/client/src/
├── features/
│   ├── demo-flow/          ← 7 个 screen 的主流程
│   │   ├── screens/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── MainTabScreen.tsx（广场 + 我的）
│   │   │   ├── ChatDetailScreen.tsx（群聊详情）
│   │   │   ├── RoleCardSheet.tsx（角色卡片）
│   │   │   └── MyWishesTab.tsx（我的愿望）
│   │   ├── types.ts
│   │   ├── navigation.ts
│   │   └── flow-state.ts
│   └── wish-bubble/        ← 发愿气泡
│       └── WishBubble.tsx
├── components/
│   ├── ThemeSelector.tsx   ← 主题切换
│   └── product/
│       └── GlowCircle.tsx  ← 荧光圈
└── pages/
    └── WishpoolDemo.tsx    ← 入口
```

---

## 数据流

### mock 数据原则
- 所有数据均为本地 mock
- 不依赖真实 AI
- 不依赖真实语音转写
- 不依赖真实后端

### 状态管理
- 使用 React Context
- 本地 localStorage 持久化
- 无需复杂状态库

---

## 下一步演进

1. **demo 验证完成** → 视觉 + 交互 + 流程
2. **web 端承接** → 从 demo 迁移核心能力
3. **后端接入** → Supabase RPC + Edge Functions
4. **AI 接入** → ai-server 多模型路由
