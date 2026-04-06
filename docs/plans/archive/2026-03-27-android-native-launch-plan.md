# Plan: Android 原生版本上线规划

> 日期：2026-03-27
> 关联需求：REQ-005
> 关联开发：DEV-006

## 目标

以现有 Wishpool 产品方案为基础，启动一个可持续演进的 Android 原生版本，技术路线采用 `Kotlin + Compose`，当前交付先落在可安装测试的 `APK`，但整体规划按未来可上架版本标准推进。

## 范围

### 做什么

1. **确定 Android 正式前提** — 不做 WebView 包壳，不机械翻译当前 Web Demo 页面，正式采用 Android 原生工程承接 Wishpool 产品能力
2. **复用现有后端** — 以 `demo/server` 作为 Android 版本的正式后端承接对象，不新起第二套服务端
3. **盘点后端可承接性** — 先确认现有接口、环境配置、匿名态与数据能力能否支撑 Android MVP，再决定 Android 端工程边界
4. **输出 Android 架构方案** — 明确 `app / feature / domain / data / core` 的分层、导航、状态与数据流
5. **新增 Android 工程骨架** — 在仓库中新增独立 `android/` 工程，并沉淀 `android/CLAUDE.md`
6. **按可上架标准规划** — 包括环境、构建、包结构、应用资源、权限与 release 准备项

### 不做什么

- 不直接开始把 `demo/client` 改成 Android 代码
- 不在本轮重写后端框架
- 不为了 Android 单独设计第二套产品主链路
- 不把当前 APK 交付误写成“已经可直接上架应用商店”

## 当前判断

1. 当前仓库是 `Web 前端基座 + Express 接口层 + Supabase SQL 草案`，不是已完成的 Android 工程
2. Android 可以复用现有后端，但还需要先盘清接口覆盖度、身份策略与环境能力
3. 当前正确路径是：`先规划和盘点 → 再建 Android 工程 → 再实现 Android MVP → 最后输出 APK`

## 文件结构

### 新增

| 文件 / 目录 | 职责 |
|------|------|
| `docs/plans/2026-03-27-android-native-launch-plan.md` | 本次 Android 原生版本规划文档 |
| `docs/tech/android-backend-readiness.md` | 盘点现有后端对 Android 的可承接能力 |
| `docs/tech/android-architecture.md` | Android 原生工程架构与分层说明 |
| `android/` | Android 原生工程根目录 |
| `android/CLAUDE.md` | Android 工程地图与查找表 |

### 修改

| 文件 | 改动 |
|------|------|
| `docs/progress/requirements.md` | 新增 REQ-005 |
| `docs/progress/development.md` | 新增 DEV-006 |
| `docs/progress/index.md` | 更新当前任务和阻塞 |
| `docs/tech/cross-platform-evolution.md` | 追加 Android 正式承接策略 |
| `CLAUDE.md` | 新增 Android 工程导航入口 |

### 不动

| 文件 / 目录 | 原因 |
|------|------|
| `demo/client/src/**` | 保留现有 Web 基座，作为产品表达参考，不作为 Android 代码直接迁移目标 |
| `demo/server/**` | 作为 Android 正式后端承接对象，不在本计划第一步重构框架 |
| `supabase/sql/**` | 当前先盘能力与约束，除非后续明确出现 Android 倒逼的数据模型变更 |

## Tasks

### Task 1: 规划文档与变更登记

**目标：** 将 Android 原生版本的目标、边界、交付标准与正式前提落盘，并完成仓库级进度登记。

**Verify：**
- `docs/plans/2026-03-27-android-native-launch-plan.md` 存在且能独立说明本次方向
- `requirements.md` / `development.md` / `index.md` 三处已形成闭环登记

**Commit：** `docs(android): add native launch plan`

### Task 2: 后端可承接性盘点

**目标：** 判断现有 `demo/server` 能否承接 Android MVP，明确已具备能力、缺口与风险。

**Verify：**
- 输出 `docs/tech/android-backend-readiness.md`
- 文档中明确区分“可直接复用 / 需补齐 / 暂不做”

**Commit：** `docs(android): assess backend readiness`

### Task 3: Android 架构方案

**目标：** 明确 Android 工程分层、模块边界、导航和数据流。

**Verify：**
- 输出 `docs/tech/android-architecture.md`
- 文档能回答“要改某项产品能力去哪里改”

**Commit：** `docs(android): define native architecture`

### Task 4: Android 工程骨架

**目标：** 新建正式 Android 工程与 `android/CLAUDE.md`。

**Verify：**
- `android/` 工程可被 Android Studio 打开
- `./gradlew :app:assembleDebug` 成功

**Commit：** `feat(android): scaffold native app project`

### Task 5: Android 基础设施层

**目标：** 建立 `core / data / domain` 的正式基础能力。

**Verify：**
- 工程可编译
- ViewModel → Repository → DataSource 的最小链路可跑通

**Commit：** `feat(android): add app foundation`

### Task 6: Android MVP 主链路

**目标：** 实现首批正式 Android 主路径，而不是照搬 Web Demo 页面。

**Verify：**
- 真机或模拟器可完成一条核心链路
- 导航、回退、异常态可用

**Commit：** `feat(android): implement mvp flow`

### Task 7: API 对接与 APK 交付

**目标：** 接现有后端，输出可安装 APK，并按未来上架标准准备 release 项。

**Verify：**
- Debug APK 可生成并安装
- 与现有后端的真实请求可跑通
- release 准备项有书面 checklist

**Commit：** `chore(android): prepare release-grade apk delivery`

## 风险

- 现有后端的接口语义可能仍偏向 Web Demo，需要盘点后才能确认 Android MVP 的真实边界
- 当前无 Auth / RLS 闭环，后续若 Android 进入正式外测，会放大权限与数据安全风险
- “当前先交付 APK” 不代表可以跳过环境、包结构和 release 规划；否则后续会返工

## 当前执行顺序

1. Task 1：规划文档与变更登记
2. Task 2：后端可承接性盘点
3. Task 3：Android 架构方案
4. Task 4：Android 工程骨架
5. Task 5：Android 基础设施层
6. Task 6：Android MVP 主链路
7. Task 7：API 对接与 APK 交付
