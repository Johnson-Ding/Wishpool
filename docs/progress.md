# 许愿池 Demo — 进度快照

> 更新于 2026-03-20｜避免重复读取文件，直接从这里恢复上下文

---

## 文件地图

| 文件 | 用途 | 行数 |
|------|------|------|
| `demo/client/src/pages/WishpoolDemo.tsx` | **主文件，所有屏幕都在这里** | ~1530 |
| `demo/client/src/index.css` | 三主题 CSS 变量 + 动画类 | — |
| `docs/PRD-wishpool-v2.md` | 产品需求文档 V2.0（US-01～07） | — |

**开发服务器**：`cd demo && npm run dev`，默认端口 5174

---

## 已实现屏幕（按 SCREEN_ORDER 顺序）

| Screen key | 组件名 | US | 起始行 | 状态 |
|---|---|---|---|---|
| `splash` | `SplashScreen` | — | 126 | ✅ 完成 |
| `home` | `HomeScreen` | US-03A | ~230 | ✅ 完成（已更新内容+点赞） |
| `paywall` | `PaywallScreen` | US-07 | ~395 | ✅ 完成 |
| `chat` | `ChatScreen` | US-03B | ~495 | ✅ 完成 |
| `ai-plan` | `AiPlanScreen` | US-01 | ~615 | ✅ 完成 |
| `round-update` | `RoundUpdateScreen` | US-02 | ~750 | ✅ 完成 |
| `deep-research` | `DeepResearchScreen` | US-04 | ~875 | ✅ 完成 |
| `collab-prep` | `CollabPrepScreen` | US-05 | ~967 | ✅ 完成 |
| `fulfillment` | `FulfillmentScreen` | US-06 | ~1125 | ✅ 完成 |
| `feedback` | `FeedbackScreen` | — | ~1245 | ✅ 完成 |
| 主组件 | `WishpoolDemo` | — | ~1360 | ✅ 完成 |

---

## 架构要点（不用读文件就能知道）

```
state: currentScreen: Screen
state: isMember: boolean（控制 paywall 是否弹出）
state: character: "moon" | "star" | "cloud"（主题切换）

导航方式：
  每屏 onNext / onBack 回调
  主组件用 SCREEN_ORDER 数组索引推进
  paywall 是插入在 home → chat 之间的条件页
```

**三主题 CSS 变量前缀**：`data-theme="moon|star|cloud"` 挂在根节点

**可复用动画类**（来自 index.css）：
- `.fade-in-up` `.float-anim` `.moon-pulse` `.recording-pulse`
- `.glass` `.glass-card`（毛玻璃）
- `.gold-text` `.teal-text`（渐变文字）

---

## HomeScreen 内容数据结构（DRIFT_BOTTLES）

类型系统：`type BottleType = "story" | "mumble" | "news" | "rec"`

| 类型 | 中文标签 | 内容定位 |
|------|---------|---------|
| news | 好消息 | 愿望完成喜报，正向激励 |
| story | 愿望故事 | 他人完整愿望旅程 |
| mumble | 碎碎念 | 社区真实感悟/动态 |
| rec | 探店推荐 | 吃喝玩乐本地化内容 |

共8条数据，覆盖4种类型。每条有 `likes` 字段支持点赞。

**点赞交互**：
- `likedIds: Set<number>` 本地状态
- 心形弹跳动画（scale: [1, 1.5, 1]）
- 计数 = `card.likes + (likedIds.has(id) ? 1 : 0)`

---

## 已知待办 / 可改进点

- [ ] ChatScreen 语音录入为静态 UI，未接真实逻辑
- [ ] 三个主题在 CollabPrepScreen 费用区块的颜色对比度待验证
- [ ] FeedbackScreen "分享漂流瓶"按钮点击后无回流首页逻辑

---

## 下次继续时的操作建议

1. **不要重读整个文件**，用行号直接定位：
   - `Read offset=X limit=100` 精准读取目标屏幕
2. 改某屏时，只读该屏起始行往后 ~150 行
3. 本文件随每次修改同步更新行号和状态

---

## Git 快照

```
branch: main
last commit: 54f0b404 "修改"
```
