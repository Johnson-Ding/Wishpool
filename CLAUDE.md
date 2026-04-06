# 许愿池 Wishpool — V4.0 项目地图

> **版本**：V4.0  
> **最后更新**：2026-04-06  
> **当前阶段**：demo 单端验证

---

## 产品定位

**许愿池 Wishpool** —— 一个把"模糊愿望 / 随口碎碎念"收进对话流、再慢慢推成行动的陪伴式产品。

V4 核心变化：
- 从独立策划页 → 对话流卡片
- 从多页面跳转 → 单一群聊容器
- 从跨端架构 → demo 单端验证

---

## 文档体系

### 📋 PRD（产品需求）

```
docs/prd/
├── PRD-wishpool-v4.md          ← 总领 PRD
├── PRD-chat-system.md          ← 聊天系统
├── PRD-plaza-v2.md             ← 广场
├── PRD-wish-lifecycle.md       ← 愿望生命周期
└── PRD-theme-and-settings.md   ← 主题与设置
```

### 📊 Progress（当前状态）

```
docs/progress/
└── current.md                  ← 7 个 screen 实现状态 + 当前目标
```

### 🗂️ Plans（技术决策）

```
docs/plans/
├── active/
│   ├── v4-architecture.md      ← V4 架构总览
│   └── demo-mock-data.md       ← demo mock 数据规范
└── archive/                    ← 已完成的实施记录
```

### 📦 Archive（归档）

```
docs/archive/
├── prd/                        ← V3 PRD 文档
├── features/                   ← 废弃的跨端映射
├── plans/                      ← 已完成的实施记录
└── progress/                   ← 旧的流程文档
```

---

## 核心 Screen（V4）

| Screen | 说明 | 状态 |
|--------|------|------|
| SplashScreen | 启动页 | ✅ |
| MainTabScreen | 广场 Tab + 我的 Tab | ✅ |
| ChatDetailScreen | 默认三角色群聊 | ✅ |
| RoleCardSheet | 角色卡片浮层 | ✅ |
| WishBubble | 发愿气泡浮层 | ✅ |
| VoiceInput | 语音输入（底部半圆蒙层） | ✅ |
| MyWishesTab | 我的愿望（分组 + todo） | ✅ |

---

## 目录结构

```
wishpool-workspace/
├── demo/                       ← V4 demo 验证
│   └── client/src/
│       ├── features/demo-flow/ ← 7 个 screen 主流程
│       ├── features/wish-bubble/ ← 发愿气泡
│       └── components/         ← 主题切换、荧光圈
├── web/                        ← 未来 Web 端（待承接）
├── supabase/                   ← 数据库（暂未使用）
├── ai-server/                  ← AI 服务（暂未使用）
└── docs/                       ← 文档体系
    ├── prd/                    ← 5 个 V4 PRD
    ├── progress/               ← 当前状态
    ├── plans/                  ← 技术决策
    └── archive/                ← 归档
```

---

## 找到你想改的东西

| 想改什么 | 文件位置 |
|---------|---------|
| **启动页** | `demo/client/src/features/demo-flow/screens/SplashScreen.tsx` |
| **广场 Tab** | `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx` |
| **群聊详情页** | `demo/client/src/features/demo-flow/screens/ChatDetailScreen.tsx` |
| **角色卡片** | `demo/client/src/features/demo-flow/screens/RoleCardSheet.tsx` |
| **发愿气泡** | `demo/client/src/features/wish-bubble/WishBubble.tsx` |
| **语音输入** | `demo/client/src/features/demo-flow/screens/ChatDetailScreen.tsx` |
| **我的愿望** | `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx` |
| **主题切换** | `demo/client/src/components/ThemeSelector.tsx` |
| **荧光圈** | `demo/client/src/components/product/GlowCircle.tsx` |
| **导航逻辑** | `demo/client/src/features/demo-flow/navigation.ts` |
| **状态管理** | `demo/client/src/features/demo-flow/flow-state.ts` |
| **入口页面** | `demo/client/src/pages/WishpoolDemo.tsx` |

---

## 当前任务

查看 `docs/progress/current.md` 了解当前阶段目标和 7 个 screen 的实现状态。

---

## 已退出主流程（Phase 2）

以下功能已归档，不在 V4 主流程中：
- 会员购买页（PaywallScreen）
- 深度调研页（DeepResearchScreen）
- 协同筹备页（CollabPrepScreen）
- 履约页（FulfillmentScreen）
- 反馈故事卡（FeedbackScreen）

---

**核心使命**：验证 V4 的聊天入口 + 对话流卡片体验，为未来 Web 端承接打下基础。
