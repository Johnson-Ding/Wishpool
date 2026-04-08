# 许愿池 Wishpool — V4.0 项目地图

> **版本**：V4.0  
> **最后更新**：2026-04-08
> **当前阶段**：demo 单端验证 — 交互链路精修

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
├── PRD-chat-system.md          ← 聊天系统（含荧光条三态规则）
├── PRD-plaza-v2.md             ← 广场
├── PRD-wish-lifecycle.md       ← 愿望生命周期（含碎碎念生成路径）
└── PRD-theme-and-settings.md   ← 角色与设置（沿用历史文件名）
```

### 📊 Progress（当前状态）

```
docs/progress/
├── current.md                  ← 当前 V4 demo 主战场状态
└── 2026-04-06-demo-v4-recovery.md ← V4 恢复背景记录
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
├── prd/                        ← 旧 PRD 文档
├── design/                     ← 旧阶段设计推演
├── tech/                       ← 旧阶段技术推演
├── plans/                      ← 已完成的实施记录
└── business-analysis-summary.md ← 早期商业分析归档
```

---

## 核心 Screen（V4）

| Screen | 说明 | 状态 |
|--------|------|------|
| SplashScreen | 启动页 | ✅ |
| MainTabScreen | 广场 Tab + 我的 Tab | ✅（语音入口已提至该层） |
| ChatDetailScreen | 默认三角色群聊 | ✅（顶栏已简化为三头像并排） |
| RoleCardSheet | 角色卡片浮层 | ✅ |
| WishBubble | 发愿气泡浮层 | 🔄（蒙层/卡片背景已补，待最终验收） |
| VoiceInput | 语音输入（弧形荧光遮罩） | 🔄（正在对齐豆包交互风格） |
| MyWishesTab | 我的愿望（分组 + todo） | ✅（设置栏已收口为角色选择） |

**图例**：✅ 已实现可用 / 🔄 已实现但仍在精修 / ⚠️ 已知缺陷待修复

---

## 关键交互链路（当前已收敛）

### 链路 1：荧光条三态

| 状态 | 文案 | 触发条件 | 用户交互 | 结果 |
|------|------|---------|---------|------|
| A | 流动 | 默认态 | 单击 → 弹出双列气泡 | 左列选愿望 / 右列选碎碎念 |
| B | 许愿 | AI 明确引导 | 单击 → 直出愿望卡片 | 插入聊天流后恢复 A |
| C | 碎碎念 | AI 明确引导 | 单击 → 直出碎碎念卡片 | 插入聊天流后恢复 A |

- **状态切换完全由 AI 控制**，用户不能手动切换。
- 所有聊天流中的愿望/碎碎念卡片，**都必须由用户点击荧光条触发出现**。
- 单击/长按的入口统一为 GlowCircle（"许愿条"），不再分散。

### 链路 2：语音输入

```
首页长按荧光圈
  → 直接开启语音输入（VoiceInputOverlay 挂载于 MainTabScreen 层）
  → 完成语音/上滑取消
  → 完成后自动进入聊天页并插入对应卡片

聊天页长按许愿条
  → 直接开启语音输入
  → 完成语音/上滑取消
  → 直接在聊天页插入对应卡片
```

- **语音状态机已提至 MainTabScreen 层**，不再耦合在 ChatDetailScreen 内部。
- 语音结果通过 `glow-mode-action` 事件分发给 ChatDetailScreen 消费。

### 链路 3：浮层坐标系规范

- 所有浮层（设置面板、语音遮罩、气泡等）统一使用 **Portal 挂载到手机壳内层**（`#phone-demo-overlays`）。
- 定位策略：手机壳内 `absolute`，**禁止**全局 `fixed`（避免 web viewport 宽度偏移）。
- Z-Index 层级：设置面板 60/61，语音遮罩 70，挂载点 80。

---

## 目录结构

```
wishpool-workspace/
├── demo/                       ← V4 demo 验证
│   └── client/src/
│       ├── features/demo-flow/ ← 7 个 screen 主流程
│       ├── features/wish-bubble/ ← 发愿气泡
│       └── components/         ← 语音覆盖层、荧光圈、手机壳
├── web/                        ← 未来 Web 端（待承接）
├── supabase/                   ← 数据库（暂未使用）
├── ai-server/                  ← AI 服务（暂未使用）
└── docs/                       ← 文档体系
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
| **语音输入** | `demo/client/src/components/VoiceInputOverlay.tsx` |
| **我的愿望** | `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx` |
| **荧光圈/荧光条** | `demo/client/src/components/product/GlowCircle.tsx` |
| **设置栏/角色选择** | `demo/client/src/features/settings/SettingsPanel.tsx` |
| **导航逻辑** | `demo/client/src/features/demo-flow/navigation.ts` |
| **状态管理** | `demo/client/src/features/demo-flow/flow-state.ts` |
| **入口页面** | `demo/client/src/pages/WishpoolDemo.tsx` |

---

## 近期关键变更日志

### 2026-04-08
- **语音输入重构**：`VoiceInputOverlay` 从 `ChatDetailScreen` 提至 `MainTabScreen`，修复首页长按先进聊天页的逻辑倒置问题。
- **崩溃修复**：补上 `useDemoFlow.ts` 缺失的 `setGlowCircleMode` import，修复聊天页切态白屏。
- **浮层坐标系统一**：所有浮层改为 Portal + 手机壳内 `absolute` 定位，解决设置面板/气泡/语音遮罩的 web 视口偏移问题。
- **输入框发送**：新增动态发送按钮，修复输入框 mock 提交后卡死。
- **气泡 UI 补全**：增加卡片背景、投影和 padding，移除 IP 头像重叠。

---

## 已下架 / 已移除功能

- **独立主题切换入口**：不再作为当前 demo 的单独验收项，当前收口为角色选择与视觉联动。
- **Phase 2 功能**：PaywallScreen、DeepResearchScreen、CollabPrepScreen、FulfillmentScreen、FeedbackScreen 已归档，不在 V4 主流程。

---

## 当前待收尾验收项（漂移清单）

- [ ] VoiceInputOverlay 视觉对齐豆包风格（弧形遮罩透明度、光晕梯度、mock 文字反馈）
- [ ] 聊天页 mock timer 引导链路验证：3 秒后 AI 引导文案 + 许愿条切 B/C 态 + 点击生成卡片
- [ ] WishBubble 双列气泡在真机/Demo 壳内的最终定位验收
- [ ] 广场 Tab → ChatDetailScreen 的过渡动招生硬问题（可选优化）

---

**核心使命**：验证 V4 的聊天入口 + 对话流卡片体验，为未来 Web 端承接打下基础。
