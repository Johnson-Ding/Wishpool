# Web 端视觉优化计划

> **目标**: 优化现有 demo-flow 页面视觉设计，沿用移动端三角色系统（绵绵/月/那德），保持现有工程结构

**工程约束**:
- 保持 `demo/client/src/features/demo-flow/` 现有结构
- 组件放 `features/demo-flow/components/` 下，不新建顶层 `components/`
- 沿用 shadcn/ui + Tailwind，扩展三角色主题变量
- 设计先行：先用 Pencil 绘制关键页面设计稿

---

## Task 1: 设计先行 — Pencil 绘制关键页面

**Files:**
- Create: `docs/archive/design/2026-03-29-web-product-base-design.md`
- Create: `.pen` 设计稿（ChatScreen、AiPlanScreen、广场页）

**Steps:**

- [ ] **Step 1: 准备设计系统文档**
  - 整理移动端三角色色彩规范（绵绵粉、月蓝、那德紫）
  - 定义 Web 端适配的间距/字体规范
  - 输出到 `docs/archive/design/2026-03-29-web-product-base-design.md`

- [ ] **Step 2: Pencil 绘制 ChatScreen 设计稿**
  - AI 对话界面，绵绵/月/那德角色切换
  - 生产力工具风格，清晰的消息层级
  - 输入区域设计

- [ ] **Step 3: Pencil 绘制 AiPlanScreen 设计稿**
  - AI 生成计划展示页面
  - 计划卡片、步骤列表、确认操作

- [ ] **Step 4: Pencil 绘制广场/愿望列表设计稿**
  - 卡片式愿望列表
  - 三角色氛围背景

- [ ] **Step 5: 截图存档并获取你的确认**
  - 导出设计稿图片
  - 等你确认设计方向后再进入编码

**Verify:**
- 设计稿文件存在且可查看
- 获得你的设计确认

**Commit:** `docs(design): web product base design mockups`

---

## Task 2: 建立三角色主题系统

**Files:**
- Create: `demo/client/src/features/demo-flow/components/theme/character-theme.ts`
- Modify: `demo/client/src/contexts/theme/theme-context.tsx`
- Modify: `demo/client/tailwind.config.js`

**Steps:**

- [ ] **Step 1: 定义三角色色彩变量**

```ts
// character-theme.ts
export const characterColors = {
  mianmian: {
    primary: '#F4A6C3',    // 绵绵粉
    secondary: '#FCE4EC',  // 浅粉背景
    accent: '#E91E63',     // 强调色
  },
  yue: {
    primary: '#90CAF9',    // 月蓝
    secondary: '#E3F2FD',  // 浅蓝背景
    accent: '#2196F3',     // 强调色
  },
  nade: {
    primary: '#B39DDB',    // 那德紫
    secondary: '#EDE7F6',  // 浅紫背景
    accent: '#7E57C2',     // 强调色
  },
};
```

- [ ] **Step 2: 扩展 theme-context 支持角色切换**
  - 在现有 ThemeProvider 中增加 character 状态
  - 提供切换角色方法

- [ ] **Step 3: 配置 Tailwind 自定义颜色**
  - 将三角色色彩加入 tailwind.config.js 的 extend colors

- [ ] **Step 4: 创建 CharacterAvatar 组件**
  - 三角色头像组件，支持大小/状态变化

**Verify:**
- `pnpm --dir demo/client check` → PASS
- 角色切换后颜色变量正确更新

**Commit:** `feat(theme): add three-character theme system`

---

## Task 3: ChatScreen 视觉重构

**Files:**
- Create: `demo/client/src/features/demo-flow/components/chat/`
- Modify: `demo/client/src/features/demo-flow/screens/ChatScreen.tsx`

**Steps:**

- [ ] **Step 1: 拆分 ChatScreen 组件结构**
  - `ChatHeader.tsx` - 顶部角色切换栏
  - `ChatMessageList.tsx` - 消息列表
  - `ChatMessageItem.tsx` - 单条消息
  - `ChatInput.tsx` - 底部输入区
  - `CharacterSwitcher.tsx` - 三角色切换器

- [ ] **Step 2: 实现新视觉布局**
  - 按 Pencil 设计稿实现消息气泡样式
  - 角色头像、名称、消息内容层次分明
  - 输入区域固定在底部，支持多行

- [ ] **Step 3: 集成角色主题**
  - 当前角色影响整体色调
  - 消息气泡颜色随角色变化

**Verify:**
- `pnpm --dir demo/client check` → PASS
- 页面视觉符合设计稿
- 角色切换正常

**Commit:** `feat(chat): redesign ChatScreen with character theme`

---

## Task 4: AiPlanScreen 视觉重构

**Files:**
- Create: `demo/client/src/features/demo-flow/components/plan/`
- Modify: `demo/client/src/features/demo-flow/screens/AiPlanScreen.tsx`

**Steps:**

- [ ] **Step 1: 拆分 AiPlanScreen 组件**
  - `PlanHeader.tsx` - 计划头部信息
  - `PlanStepCard.tsx` - 单步骤卡片
  - `PlanActionBar.tsx` - 确认/修改操作栏

- [ ] **Step 2: 实现计划展示视觉**
  - 步骤卡片式布局
  - 序号、标题、描述清晰展示
  - 预算/时间等元信息标签化

- [ ] **Step 3: 添加交互动效**
  - 步骤卡片入场动画
  - 确认操作反馈

**Verify:**
- `pnpm --dir demo/client check` → PASS
- 视觉层次清晰，信息易读

**Commit:** `feat(plan): redesign AiPlanScreen with card layout`

---

## Task 5: 广场与愿望列表视觉优化

**Files:**
- Create: `demo/client/src/features/demo-flow/components/plaza/`
- Modify: `demo/client/src/features/demo-flow/screens/HomeScreen.tsx`
- Modify: `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx`

**Steps:**

- [ ] **Step 1: 创建 WishCard 组件**
  - 卡片式愿望展示
  - 标题、意图、状态标签
  - 悬停/点击效果

- [ ] **Step 2: 优化列表布局**
  - 网格/列表切换（根据设计稿）
  - 间距、排版统一

- [ ] **Step 3: 添加三角色氛围**
  - 背景色/渐变根据当前角色变化
  - 空状态插画

**Verify:**
- `pnpm --dir demo/client check` → PASS
- 列表视觉统一，无丑陋布局

**Commit:** `feat(plaza): redesign wish list with card layout`

---

## Task 6: 整合验证与文档

**Files:**
- Modify: `docs/progress/development.md`
- Modify: `CLAUDE.md`

**Steps:**

- [ ] **Step 1: 运行类型检查**

```bash
cd demo/client && pnpm check
```
Expected: PASS

- [ ] **Step 2: 运行构建**

```bash
cd demo/client && pnpm build
```
Expected: PASS，无新增 warning

- [ ] **Step 3: 运行 lint**

```bash
cd demo/client && pnpm lint
```
Expected: PASS

- [ ] **Step 4: 更新进度文档**
  - `docs/progress/development.md` 记录本次优化
  - 更新 Web 端状态

- [ ] **Step 5: 提交收尾**

```bash
git add demo/client/src/features/demo-flow docs/
git commit -m "feat(web): redesign demo-flow screens with three-character theme"
```

---

## 并行机会分析

**可以并行的 tasks:**
- Task 3 (ChatScreen) 和 Task 4 (AiPlanScreen) 文件无交叉，可并行
- Task 2 (主题系统) 必须先完成，作为后续 task 依赖

**建议执行顺序:**
1. Task 1 设计先行（阻塞所有编码 task）
2. Task 2 主题系统（阻塞 3/4/5）
3. Task 3/4/5 并行（页面重构）
4. Task 6 整合验证

---

**等你确认 design-first 的 plan 后，我先开始 Task 1 的设计工作。**
