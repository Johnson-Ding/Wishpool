---
# flowmd: 文档标识，勿手动修改。复制文件后如需发布为新文档，删除此行
flowmd: 9eLCbt14ay
---

# 许愿池 Wishpool — 项目协作规范

## 项目定位

这是一个 **产品概念 Demo**，目标是给投资人/团队演示 Wishpool V2.0 的完整用户旅程。
不是生产代码，优先考虑可演示性和视觉质量。

---

## Demo Maker 工作流（来自 demo-maker.skill）

每次改动必须先确认当前在哪个阶段：

| 阶段 | 内容 | 输出 |
|------|------|------|
| Phase 1 | Story Logic & 屏幕流 | 编号屏幕清单 + 跳转逻辑 |
| Phase 2 | 设计参考生成 | 配色/字体/图片资产 |
| Phase 3 | 前端实现 | 本地可运行 React Demo |
| Phase 4 | 离线打包 | 单文件 demo.html |

**当前阶段：Phase 3（前端实现）**

---

## 关键文件位置

```
demo/client/src/pages/WishpoolDemo.tsx   ← 主文件（所有屏幕在这里）
demo/client/src/index.css                ← 主题变量 + 动画类
docs/PRD-wishpool-v2.md                  ← 产品需求文档（US-01 ~ US-07）
docs/prd/PRD-v2.1-feed.md               ← V2.1 Feed 内容流 PRD（US-V21-01 ~ 07）
docs/progress.md                         ← 当前实现进度 + 行号索引
```

---

## 成本控制规则（防止 orientation loop）

1. **每次对话开始先读 `docs/progress.md`**，不要整文件读 WishpoolDemo.tsx
2. **只读目标屏幕的行号片段**：`Read offset=<行号> limit=150`
3. **每次只改一个屏幕**，改完立刻验证
4. **改完后立刻更新 `docs/progress.md` 的行号**
5. 不用 Glob/Grep 全文搜索大文件

---

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4（`index.css` 有自定义 CSS 变量）
- 三主题：`moon`（暗墨）/ `star`（极光）/ `cloud`（晨风）
- 手机壳尺寸：375×812px，border-radius: 44px
- 动画类：`.fade-in-up` `.float-anim` `.moon-pulse` `.recording-pulse`
- Dev server 端口：5173 或 5174

---

## 设计原则

- **手机优先**：所有屏幕在 375px 宽度内设计
- **单一事实源**：所有屏幕在 `WishpoolDemo.tsx` 一个文件里，不要拆分
- **主题感知**：颜色用 CSS 变量 `var(--primary)` 等，不要硬编码色值
- **动效克制**：过渡动画用已有 CSS 类，不要新增大量 JS 动画

---

## 屏幕流程（US 编号对应）

```
HomeScreen (US-03A)
  ↓ 点击"说出你的心愿"
PaywallScreen (US-07) ← 非会员触发
  ↓ 开通会员
WishDialogScreen (US-03B)
  ↓ 追问完成（≤3轮）
PlanScreen (US-01)
  ↓ 确认开始执行
ProgressScreen (US-02)
  ↓ 人群助力分支
ResearchScreen (US-04)
  ↓ 进入协同
CollabScreen (US-05)
  ↓ 支付锁定
ActivityScreen (US-06 上半)
  ↓ 活动结束
FeedbackScreen (US-06 下半)
  ↓ 分享漂流瓶
HomeScreen（闭环）
```

---

## 验收标准（Phase 3 完成条件）

- [x] 所有屏幕可点击导航，无断链
- [x] 三个主题切换正常（moon/star/cloud）
- [ ] 手机壳内容不溢出，不出现横向滚动条
- [x] HomeScreen 有 Framer Motion drag 手势（左滑/右滑）
- [x] PaywallScreen 在发愿入口触发
- [x] FeedbackScreen "分享漂流瓶"后回到 HomeScreen

---

## 禁止事项

- 不要把屏幕拆分成多文件
- 不要引入新的状态管理库（Redux、Zustand 等）
- 不要整文件读取 WishpoolDemo.tsx（>1500 行）
- 不要改 CSS 变量名（会破坏主题系统）
- 不要在 DRIFT_BOTTLES 字符串里用中文弯引号 `"` `"`（会导致 JS 编译报错）
