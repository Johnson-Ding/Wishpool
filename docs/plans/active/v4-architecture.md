# V4 架构总览

> **版本**：V4.0  
> **最后更新**：2026-04-08

---

## 核心变化

V4 的核心架构变化：
- **从独立策划页 → 对话流卡片**
- **从多页面跳转 → 单一群聊容器**
- **从跨端架构 → demo 单端验证**

---

## 当前架构焦点

- V4 当前只把 `demo/` 作为主验证面，不把仓库其他端视为当前实现基线
- 交互重心集中在 `MainTabScreen -> ChatDetailScreen -> GlowCircle / WishBubble / VoiceInputOverlay`
- 所有浮层统一挂载到手机壳内层的 `#phone-demo-overlays`
- 当前数据仍以本地 mock 为主，重点验证链路与表达，不追求真实后端闭环

---

## 目录结构

```text
demo/client/src/
├── components/
│   ├── demo/PhoneDemoShell.tsx       ← 手机壳与 overlay 挂载点
│   ├── VoiceInputOverlay.tsx         ← 语音输入遮罩
│   └── product/GlowCircle.tsx        ← 荧光圈 / 荧光条
├── features/
│   ├── demo-flow/                    ← 7 个 screen 的主流程
│   │   ├── screens/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── MainTabScreen.tsx
│   │   │   ├── ChatDetailScreen.tsx
│   │   │   ├── RoleCardSheet.tsx
│   │   │   └── MyWishesTab.tsx
│   │   ├── navigation.ts
│   │   ├── flow-state.ts
│   │   └── useDemoFlow.ts
│   ├── settings/
│   │   └── SettingsPanel.tsx         ← 设置面板与角色选择
│   └── wish-bubble/
│       ├── WishBubble.tsx
│       └── wish-bubble-data.ts       ← 双列方向数据
└── pages/
    └── WishpoolDemo.tsx              ← 入口
```

---

## 状态与数据流

### 页面级协调

- `WishpoolDemo.tsx`
  - 持有 `character`
  - 初始化 `useDemoFlow`
  - 通过 `data-theme` 驱动角色视觉 token

- `MainTabScreen.tsx`
  - 负责广场 / 聊天 / 我的三段主容器切换
  - 持有 `voiceOpen` 与 `voiceFromHome`
  - 负责首页长按与聊天页长按的分流逻辑

- `ChatDetailScreen.tsx`
  - 持有聊天流 items
  - 监听 `wish-bubble-select` 与 `glow-mode-action`
  - 在对话流中插入愿望卡 / 碎碎念卡

- `PhoneDemoShell.tsx`
  - 提供手机壳容器
  - 提供 `#phone-demo-overlays` 挂载点
  - 约束所有浮层在手机壳内定位

### mock 边界

- 不依赖真实 AI
- 不依赖真实语音转写
- 不依赖真实后端
- 当前真正持久化的设置仅有 `wishpool_character`

---

## 当前约束

- 不再把旧的 Phase 2 页面当成主流程一部分
- 不再用全局 `fixed` 口径描述当前浮层
- 不把独立主题切换继续当作当前 V4 的主功能块
- 当前 demo 文档必须优先反映真实实现，而不是旧阶段推演

---

## 下一步演进

1. **demo 验证完成** → 视觉 + 交互 + 流程
2. **web 端承接** → 从 demo 迁移核心能力
3. **后端接入** → Supabase RPC + Edge Functions
4. **AI 接入** → ai-server 多模型路由
