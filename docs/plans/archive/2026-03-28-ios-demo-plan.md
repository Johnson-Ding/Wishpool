# Plan: iOS Demo 落地规划

> 日期：2026-03-28
> 关联需求：`REQ-008`
> 关联开发：`DEV-008`
> 当前状态：已确认方案，进入实现

## 目标

在 Wishpool 当前仓库中新增一个可运行的 iOS Demo 工程，采用原生 iOS 技术路线承接现有产品骨架，首版优先验证 `3-Tab + 发愿入口 + Feed + 我的心愿 + 愿望详情/推进` 的最小闭环，而不是机械照搬 Web Demo 的全部页面结构。

## 范围

### 本轮要做

1. **新增独立 iOS Demo 工程** — 在仓库内新增 `ios/`，不挤进现有 `demo/` 或 `android/` 目录
2. **采用原生 iOS 技术路线** — 以 `SwiftUI` 作为首版 Demo 的界面承接方式
3. **优先复用产品骨架** — 以现有 Wishpool 的产品能力模型、Tab 结构和核心状态流为参考，而不是一比一照搬 Web screen
4. **首版覆盖最小闭环** — 首批页面包括：
   - Feed / 心愿广场
   - 中央发愿入口
   - 我的心愿
   - 愿望详情或推进页
5. **保留数据回退能力** — 数据层采用 `Supabase SDK + PostgREST/RPC` 直连，允许本地开发阶段提供 mock 或回退
6. **接入 iOS 构建与模拟器验证** — 使用现有 iOS plugin 能力完成 build 和 simulator 检查

### 本轮不做

- 不把 Web `demo-flow/screens/*` 机械翻译成 iOS 同名页面
- 不要求首版覆盖 Web Demo 的全部长链路页面
- 不在本轮新起第二套服务端
- 不把 iOS Demo 写成正式上架版本
- 不在规划阶段提前改写需求/开发流水为“已实现”

## 当前判断

1. 当前仓库没有现成 iOS 工程，因此本次任务的本质是“新增一端”
2. 现有 Web Demo 已经提供了足够的产品表达素材，但不能直接作为 iOS 页面结构
3. 现有跨端文档已经给出原则：共享产品能力骨架，不共享 Web 表达层
4. 当前最稳妥的落地路径是：`先登记需求 → 再建工程 → 再做最小闭环 → 再验证`

## 文件结构

### 计划新增

| 文件 / 目录 | 职责 |
|------|------|
| `docs/plans/2026-03-28-ios-demo-plan.md` | 本次 iOS Demo 规划文档 |
| `ios/` | iOS Demo 工程根目录 |
| `ios/CLAUDE.md` | iOS 工程地图与查找表 |

### 计划修改

| 文件 | 改动 |
|------|------|
| `docs/progress/requirements.md` | 登记 iOS Demo 对应 ReqID |
| `docs/progress/development.md` | 登记 iOS Demo 对应 DEV 流水 |
| `docs/progress/index.md` | 在正式开工后更新当前任务与阻塞 |
| `CLAUDE.md` | 在新增 `ios/` 后补仓库级导航 |

### 当前不动

| 文件 / 目录 | 原因 |
|------|------|
| `demo/client/src/**` | 作为产品表达与状态参考，不作为 iOS 代码直接迁移目标 |
| `demo/server/**` | 已转为存档层，不作为 iOS 首版运行时依赖 |
| `android/**` | Android 已有独立路线，不与 iOS 规划混写 |

## Tasks

### Task 1：需求登记与进度闭环

**目标：** 在正式实现前，完成 iOS Demo 对应的 `ReqID` / `DEV` 记录，并让索引看板进入可追踪状态。

**Verify：**

- `docs/progress/requirements.md` 已新增 iOS Demo 条目
- `docs/progress/development.md` 已新增对应开发记录
- `docs/progress/index.md` 当前任务与阻塞已同步

**Commit：** `docs(ios): register demo execution plan`

### Task 2：iOS 工程骨架

**目标：** 新建 `ios/` 工程，形成可编译、可运行的 SwiftUI Demo 壳层。

**Verify：**

- `ios/` 工程可被 Xcode 打开
- 工程至少包含 App 入口、Tab 容器和基础主题
- 模拟器可成功构建并启动

**Commit：** `feat(ios): scaffold swiftui demo app`

### Task 3：首批页面与状态骨架

**目标：** 落地首版最小闭环页面，而不是铺开全部链路。

**Verify：**

- 存在 Feed / 发愿入口 / 我的心愿 / 愿望详情或推进页
- Tab 切换与基础导航可用
- 页面结构对应产品骨架而非 Web 页面名复制

**Commit：** `feat(ios): add core demo flow`

### Task 4：数据接入与回退策略

**目标：** 接入 `Supabase SDK + PostgREST/RPC`，并保留本地 mock 回退能力。

**Verify：**

- Supabase 可用时能读取或提交核心数据
- 接口不可用时 Demo 仍可运行
- 数据层边界清晰，不把远端 DTO 直接塞进页面层

**Commit：** `feat(ios): connect demo data layer`

### Task 5：构建验证与文档回写

**目标：** 完成构建、模拟器验证、文档回写与交付整理。

**Verify：**

- 模拟器构建与基础交互验证完成
- `CLAUDE.md` / progress 文档已更新
- 形成可提交的变更集合

**Commit：** `chore(ios): verify demo and sync docs`

## 风险

- 当前没有现成 iOS 工程，首轮会先消耗在工程初始化与目录边界上
- 若把 Web Demo 页面一页页照搬到 iOS，会快速形成第三套割裂逻辑
- 当前已切到三端直连 Supabase，iOS 首版需避免再次长出独立运行时中间层
- 若不先登记 `ReqID` / `DEV`，后续代码与文档会失去闭环

## 当前执行顺序

1. Task 1：需求登记与进度闭环
2. Task 2：iOS 工程骨架
3. Task 3：首批页面与状态骨架
4. Task 4：数据接入与回退策略
5. Task 5：构建验证与文档回写
