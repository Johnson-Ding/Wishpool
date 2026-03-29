# Wishpool Android 后端承接性盘点

> 日期：2026-03-27
> 关联需求：REQ-005
> 关联开发：DEV-006
> 盘点对象：`demo/server`

## 结论

当前 `demo/server` 的更准确定位是：**历史 Express 后端实现与验证资产**。

它不是纯废稿，因为代码、路由、测试都仍然可运行；但它也**不再是 Android 当前运行时的正式后端起点**，因为三端已经切到 Supabase PostgREST + RPC 直连。

但它目前更准确的状态是：

- **已具备可直接复用的基础能力**
- **能作为接口与业务编排的历史参考**
- **尚不足以单独支撑完整的“按可上架标准推进”的 Android 版本**

一句话判断：

**可参考，但不应再把它当成 Android 当前主运行时依赖。**

## 本次盘点证据

### 已阅读代码

- `demo/server/app.ts`
- `demo/server/index.ts`
- `demo/server/config/env.ts`
- `demo/server/lib/http.ts`
- `demo/server/lib/supabase.ts`
- `demo/server/modules/wishes/routes.ts`
- `demo/server/modules/wishes/service.ts`
- `demo/server/modules/wishes/repository.ts`
- `demo/server/modules/feed/routes.ts`
- `demo/server/modules/feed/service.ts`
- `demo/server/modules/feed/repository.ts`
- `demo/server/modules/shared/schemas.ts`

### 已验证命令

- `cd demo && pnpm run check` → exit 0
- `cd demo && pnpm run test:run -- server/__tests__/wishes.test.ts server/__tests__/feed.test.ts server/__tests__/env.test.ts` → exit 0，13 tests 全绿

## 当前已具备能力

### 1. 服务端骨架完整

当前 `demo/server` 不是临时脚本，而是完整的 Express 应用骨架：

- `app.ts` 负责依赖装配和路由挂载
- `modules/*` 采用 `routes / service / repository` 分层
- `lib/http.ts` 统一了成功响应与错误响应格式
- `config/env.ts` 用 `zod` 约束环境变量

这意味着后续如果需要回看 Express 版本的接口组织方式，还有一份结构完整的参考实现。

### 2. 愿望主链路已有最小后端承接

当前 `wishes` 模块已暴露这些接口：

- `POST /api/wishes` — 创建愿望
- `GET /api/wishes/:id` — 获取单个愿望详情
- `PATCH /api/wishes/:id/clarify` — 补充澄清信息
- `POST /api/wishes/:id/plan/confirm` — 确认方案
- `GET /api/wishes/:id/rounds` — 获取轮次记录

服务层还维护了：

- 愿望状态流转
- 初版 `aiPlan` 占位结构
- `validation_rounds` 轮次记录
- `deviceId -> anonymous user` 的匿名用户映射

这对 Android 是非常关键的，因为它已经具备了“发愿 -> 补充约束 -> 确认方案 -> 看推进记录”的基础承接能力。

### 3. Feed 基础能力已可复用

当前 `feed` 模块已暴露这些接口：

- `GET /api/feed` — 获取内容流
- `POST /api/feed/:id/like` — 点赞
- `GET /api/feed/:id/comments` — 获取评论
- `POST /api/feed/:id/comments` — 创建评论

这说明 Android 首页如果承接当前漂流瓶 / feed 入口，不需要重新定义第一版内容流后端。

### 4. 已有匿名态前提

当前后端没有接入正式登录，但已有匿名用户承接方式：

- 请求可传 `deviceId`
- 后端会执行 `getOrCreateAnonymousUser(deviceId)`

这意味着 Android 早期版本可以沿用当前匿名路径启动，而不必等待正式账号体系落地后才能开发。

### 5. 当前接口已有自动化测试保护

现有后端并非“只在脑中成立”，而是已经有：

- `env.test.ts`
- `feed.test.ts`
- `wishes.test.ts`

本次复跑结果通过，说明当前骨架具备继续演进的可信度。

## 对 Android 可直接复用的部分

以下能力我判断为 **可直接迁移其设计思路**：

### 可直接迁移思路

- Feed 列表、点赞、评论三类基础交互
- 愿望创建、详情查询、澄清、确认方案、轮次查询
- 统一错误响应格式
- `deviceId` 驱动的匿名用户映射
- Supabase 作为后端数据源的总体方式

这些足够反向验证 Android 当前直连方案的字段和动作边界：

- 首页 feed
- 发愿输入
- 方案确认
- 进度查看

## 当前存在的关键缺口

以下内容目前 **没有在代码中看到完整承接**，如果 Android 要按“可上架标准规划”，这些都需要纳入后续任务。

### 1. 没有正式 Auth / Session / RLS 闭环

当前服务端环境依赖：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

并且 `createSupabaseClient()` 直接使用 `service role key`。

这意味着：

- 当前服务端是强权限模式
- 代码中未看到面向正式客户端的用户身份闭环
- 文档也明确写了当前 `Auth / RLS` 尚未完成

对 Android 的影响：

- 内测或开发期可以先接
- 但只要进入更正式的外部使用，这会成为高优先级风险

### 2. 缺少“我的愿望列表”接口

当前 `wishes` 只支持：

- 创建
- 单条详情
- 澄清
- 确认
- 查轮次

**没有看到**：

- 按 `deviceId` 或用户身份查询愿望列表的接口

这会直接影响 Android 的“我的愿望”页承接。

### 3. 缺少支付 / 会员 / 付费墙后端能力

PRD 中有会员解锁与付费墙语义，但当前服务端代码里 **没有看到**：

- 会员状态查询
- 订单 / 支付
- 权益校验

所以如果 Android 首版要严格承接付费墙，就需要单列后端任务；否则只能暂时将其放在非首批 MVP 范围。

### 4. 缺少更完整的执行期能力

从当前代码看，`wishes` 已有轮次记录，但 **没有看到明确接口** 覆盖：

- 深度调研候选搭子
- 协同筹备
- 履约过程管理
- 活动反馈沉淀

这说明当前后端离“完整产品主链路”还有明显距离。

### 5. Feed 能力仍偏基础

当前 feed 仅支持：

- 列表
- 点赞
- 评论

未看到：

- 分页 cursor / next page 语义
- 推荐排序策略
- 详情页接口
- 举报 / 审核 / 屏蔽类治理接口

这不妨碍 Android 首版开发，但距离正式上架标准还有运营与治理层面的缺口。

### 6. 现有匿名态策略依赖 `deviceId`

这是一个可用起点，但需要注意：

- 代码中只看到 `deviceId` 作为匿名身份输入
- 未看到设备迁移、账号绑定、登录后合并身份等机制

这意味着 Android 端如果继续沿用这一路径，应先把它视为 **MVP 身份方案**，而不是长期最终方案。

## 对 Android MVP 的承接判断

基于当前代码，我把 Android MVP 拆成两层：

### 当前后端已足以承接的 MVP 子集

- 首页内容流浏览
- 点赞 / 评论
- 发愿创建
- 补充澄清信息
- 确认初版方案
- 查看轮次推进记录

### 当前后端尚不足以完整承接的部分

- 我的愿望列表
- 正式登录 / 身份体系
- 会员 / 支付 / 权益
- 更完整的执行期链路
- 更完整的运营治理能力

## 规划建议

### 建议 1：Android 首批工程应明确“先接已存在的后端能力”

不要在 Android 工程创建前先发散需求。当前最稳妥的做法是：

1. 以现有后端可承接的能力定义 Android 首批 MVP
2. 将缺失能力单独列为“后端补齐任务”
3. Android 架构按未来可上架标准设计，但首批功能不要超出现有后端太多

### 建议 2：把“后端缺口”显式并入 Android 规划，而不是假装它已经完成

最需要显式挂进后续任务的是：

- 愿望列表接口
- 身份 / Auth / RLS 演进
- 支付 / 权益能力
- 执行期补充接口

### 建议 3：Android 架构文档应以“后端已具备能力”来反推模块切分

也就是说，Android 不应该先按 Web screen 拆 feature，而应该围绕这些后端能力切：

- `feed`
- `wish-create`
- `wish-detail`
- `wish-progress`
- 以及后续待补的 `membership` / `account`

## 最终判断

**`demo/server` 仍有参考价值，但不再是 Android 原生版本的正式运行时后端。**

但更准确地说，它是：

- **可复用**
- **可扩展**
- **可支撑首批 Android MVP**
- **尚未完成面向正式上架版本的全部后端闭环**

因此下一步不应是“重写后端”，而应是：

1. 基于本盘点写 `docs/tech/android-architecture.md`
2. 在 Android 规划中明确首批 MVP 只承接已存在后端能力
3. 将缺失的后端能力列为后续独立任务
