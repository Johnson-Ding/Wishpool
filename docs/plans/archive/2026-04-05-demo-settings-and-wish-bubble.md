# 2026-04-05 — Demo 个人设置与发愿气泡交互实现

> 依据：PRD-profile-settings.md § US-14~15 / PRD-wish-publish.md § US-05 / 历史 plan: mutable-rolling-feather.md, velvety-hopping-otter.md

---

## 目标

在 demo 上实现**个人设置面板**（US-14~15）和**发愿气泡两态交互**（US-05 部分），让用户能从"我的愿望"进入设置、查看会员状态、切换主题，同时完善荧光条的单击/长按交互逻辑。

---

## 改动范围

### 个人设置板块（PRD-profile-settings.md）
- 新建设置面板组件
- 在"我的愿望"页右上角添加设置入口
- 展示会员状态（默认全员会员）
- 提供主题风格入口（跳转到主题选择）
- 提供 log 反馈入口（轻量反馈表单）
- 提供更新检查入口（展示版本号）

### 发愿气泡交互（PRD-wish-publish.md § US-05）
- 完善荧光条单击 → 唤起发愿气泡
- 实现两态逻辑：
  - 空状态：展示 4-6 个默认愿望气泡
  - 已引导状态：展示单个推荐气泡
- 荧光条长按 → 触发语音输入
- 气泡点击 → 进入愿望策划页（带入模板文案）

---

## 不改什么

- ❌ 不改 web 端（只改 demo）
- ❌ 不实现完整的愿望策划页（只做气泡 → 策划页的跳转）
- ❌ 不实现真实的会员购买/续费链路
- ❌ 不实现真实的 log 上传后端
- ❌ 不改 Android/iOS 原生端

---

## 文件结构

### 新建文件

**个人设置板块：**
- `demo/client/src/features/settings/SettingsPanel.tsx` — 设置面板主组件（从"我的愿望"右上角弹出）
- `demo/client/src/features/settings/components/MembershipStatus.tsx` — 会员状态展示组件
- `demo/client/src/features/settings/components/ThemeStyleEntry.tsx` — 主题风格入口（跳转到主题选择）
- `demo/client/src/features/settings/components/LogFeedback.tsx` — log 反馈表单组件
- `demo/client/src/features/settings/components/UpdateChecker.tsx` — 更新检查组件

**发愿气泡交互：**
- 复用已有的 `demo/client/src/features/wish-bubble/` 组件，扩展两态逻辑

### 修改文件

**个人设置板块：**
- `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx` — 在右上角添加设置入口按钮

**发愿气泡交互：**
- `demo/client/src/features/wish-bubble/WishBubbleContext.tsx` — 添加两态状态管理
- `demo/client/src/features/wish-bubble/WishBubble.tsx` — 实现两态渲染逻辑
- `demo/client/src/features/wish-bubble/wish-bubble-data.ts` — 补充默认愿望气泡数据
- `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx` — 完善荧光条单击/长按交互
- `demo/client/src/components/product/GlowCircle.tsx` — 添加长按事件支持（如果需要）

---

## Task 拆解

### Task 1: 新建个人设置面板组件

**目标：** 创建设置面板主组件，展示会员状态、主题风格入口、log反馈、更新检查

**Files：**
- Create: `demo/client/src/features/settings/SettingsPanel.tsx`
- Create: `demo/client/src/features/settings/components/MembershipStatus.tsx`
- Create: `demo/client/src/features/settings/components/ThemeStyleEntry.tsx`
- Create: `demo/client/src/features/settings/components/LogFeedback.tsx`
- Create: `demo/client/src/features/settings/components/UpdateChecker.tsx`

**Steps：**
1. 创建 `SettingsPanel.tsx`，实现弹窗式设置面板
   - 从底部滑出的半屏弹窗
   - 包含 4 个设置项：会员状态、主题风格、log反馈、更新检查
2. 创建 `MembershipStatus.tsx`，展示"默认已开通会员"
3. 创建 `ThemeStyleEntry.tsx`，点击后跳转到主题选择（复用已有的主题切换逻辑）
4. 创建 `LogFeedback.tsx`，轻量反馈表单（mock，不真实上传）
5. 创建 `UpdateChecker.tsx`，展示版本号和检查更新按钮（mock）

**Verify：**
- `pnpm --dir demo check` → 无 TS 错误
- 手动检查：设置面板能正常弹出，4 个设置项都能点击

**Commit：** `feat(demo): 新增个人设置面板（US-14~15）`

---

### Task 2: 在"我的愿望"页添加设置入口

**目标：** 在 MyWishesTab 右上角添加设置按钮，点击后打开设置面板

**Files：**
- Modify: `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx`

**Steps：**
1. 在 `MyWishesTab.tsx` 右上角添加设置图标按钮（⚙️ 或类似）
2. 引入 `SettingsPanel` 组件
3. 添加状态控制设置面板的显示/隐藏
4. 点击设置按钮 → 打开设置面板

**Verify：**
- `pnpm --dir demo check` → 无 TS 错误
- 手动检查：点击"我的愿望"页右上角设置按钮，设置面板弹出

**Commit：** `feat(demo): 在"我的愿望"页添加设置入口`

---

### Task 3: 完善发愿气泡两态逻辑

**目标：** 实现荧光条单击 → 唤起发愿气泡，支持空状态（4-6个默认气泡）和已引导状态（单个推荐气泡）

**Files：**
- Modify: `demo/client/src/features/wish-bubble/WishBubbleContext.tsx`
- Modify: `demo/client/src/features/wish-bubble/WishBubble.tsx`
- Modify: `demo/client/src/features/wish-bubble/wish-bubble-data.ts`

**Steps：**
1. 在 `WishBubbleContext.tsx` 中添加两态状态管理
   - `isEmptyState: boolean` — 是否为空状态
   - `recommendation: WishRecommendation | null` — AI 推荐的愿望草稿
2. 在 `wish-bubble-data.ts` 中补充 4-6 个默认愿望气泡数据
3. 在 `WishBubble.tsx` 中实现两态渲染逻辑
   - 空状态：展示 4-6 个默认气泡（横向排列）
   - 已引导状态：只展示单个推荐气泡
4. 气泡点击后 → 进入愿望策划页（带入模板文案）

**Verify：**
- `pnpm --dir demo check` → 无 TS 错误
- 手动检查：单击荧光条，空状态时看到多个默认气泡，已引导状态时只看到单个推荐

**Commit：** `feat(demo): 实现发愿气泡两态逻辑（US-05）`

---

### Task 4: 完善荧光条单击/长按交互

**目标：** 荧光条单击 → 唤起气泡，长按 → 触发语音输入

**Files：**
- Modify: `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx`
- Modify: `demo/client/src/components/product/GlowCircle.tsx`（如果需要）

**Steps：**
1. 在 `MainTabScreen.tsx` 中完善荧光条交互
   - 单击 → 调用 `showBubble()` 唤起气泡
   - 长按 → 触发语音输入（mock，显示语音录制 UI）
2. 如果 `GlowCircle.tsx` 不支持长按，添加 `onLongPress` 事件支持
3. 长按时显示语音录制 mock UI（参考历史 plan 的设计）

**Verify：**
- `pnpm --dir demo check` → 无 TS 错误
- 手动检查：单击荧光条 → 气泡弹出，长按荧光条 → 语音 UI 出现

**Commit：** `feat(demo): 完善荧光条单击/长按交互`

---

### Task 5: 集成验证与样式调整

**目标：** 验证两个板块的完整交互流程，调整样式确保视觉一致性

**Files：**
- Modify: `demo/client/src/index.css`（如果需要）

**Steps：**
1. 运行 `pnpm --dir demo dev`，手动测试完整流程
   - 进入"我的愿望"页 → 点击设置 → 查看会员状态、主题风格、log反馈、更新检查
   - 进入许愿 Tab → 单击荧光条 → 查看气泡（空状态/已引导状态）
   - 长按荧光条 → 查看语音 UI
2. 调整样式确保视觉一致性（气泡动画、设置面板过渡效果）
3. 运行 `pnpm --dir demo test:run` 确保测试通过

**Verify：**
- `pnpm --dir demo check` → 无 TS 错误
- `pnpm --dir demo test:run` → 所有测试通过
- 手动检查：完整流程无视觉或交互问题

**Commit：** `chore(demo): 集成验证与样式调整`

---

## 验收总览

- [ ] 个人设置面板能从"我的愿望"页右上角打开
- [ ] 设置面板展示会员状态、主题风格入口、log反馈、更新检查
- [ ] 荧光条单击 → 唤起发愿气泡
- [ ] 空状态展示 4-6 个默认气泡，已引导状态展示单个推荐
- [ ] 荧光条长按 → 触发语音输入 mock UI
- [ ] 气泡点击 → 进入愿望策划页（带入模板文案）
- [ ] `pnpm --dir demo check` 通过
- [ ] `pnpm --dir demo test:run` 通过
