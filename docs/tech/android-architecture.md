# Wishpool Android 原生架构方案

> 日期：2026-03-27
> 关联需求：REQ-005
> 关联开发：DEV-006
> 技术路线：原生 Android（Kotlin + Compose）

## 1. 文档目的

本文件用于回答下面几个问题：

- Wishpool 的 Android 原生版本应该如何承接现有产品骨架
- Android 工程应该如何分层，而不是继续把逻辑堆进页面
- 哪些能力可以直接复用现有后端，哪些必须补齐
- 首批 Android MVP 应该做到哪里，边界在哪里

本文件不是 PRD，也不展开接口字段。它的目标是：

**让后续 Android 工程能够按统一结构生长，而不是边写边猜。**

## 2. 当前前提

本次架构方案建立在以下前提之上：

1. Android 版本采用 **原生 Android + Kotlin + Compose**
2. 当前交付先落在 **APK**，但整体规划按未来可上架版本标准推进
3. Android 运行时采用 **Supabase PostgREST + RPC 直连**，不新起第二套服务端
4. 首批 Android MVP 采用 **扩展版范围**

扩展版 MVP 的确认范围为：

- Feed 浏览
- 点赞 / 评论
- 发愿创建
- 愿望补充澄清
- 方案确认
- 轮次进展查看
- **我的愿望列表**

其中需要显式说明：

- “我的愿望列表”已进入首批 Android MVP
- 但当前后端还缺该列表接口，因此它是 Android 首批规划中的正式依赖项，不是既成事实

## 3. 总体原则

### 3.1 Android 承接的是产品能力，不是 Web Demo 壳层

Android 不应照搬当前 Web Demo 的页面结构、手机壳外观或 narrative 组织方式。

Android 应承接的是：

- 愿望主链路状态模型
- 业务动作语义
- 与后端对接的数据协议
- 用户在正式产品中的关键任务路径

Android 不应承接的是：

- `PhoneDemoShell`
- 以演示为主的 screen 切页方式
- Web 特有动效组织

### 3.2 Android 工程按职责分层，不按页面堆叠

如果直接按 `HomeScreen / ChatScreen / AiPlanScreen` 这种 Web 页面名在 Android 上平移，结果会是：

- 页面边界跟着 Demo 历史包袱走
- ViewModel 和状态快速失控
- 同一项能力散落在多个 screen 中

因此 Android 必须按职责拆层。

### 3.3 Android 首批 MVP 不超出现有后端太多

当前已有 Supabase 数据能力可以支撑 Android 起步，但未覆盖完整产品闭环。

所以首批 Android MVP 的原则是：

- 优先接已有后端能力
- 将缺失能力单独列为“后端补齐任务”
- 架构按未来完整产品设计
- 首批功能范围按现实后端能力收敛

## 4. Android 工程目录建议

建议在仓库下新增独立 `android/` 工程，Android 代码不继续生长在 `demo/` 内。

推荐结构如下：

```text
android/
├── CLAUDE.md
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/wishpool/app/
        │   ├── app/
        │   ├── core/
        │   ├── domain/
        │   ├── data/
        │   ├── feature/
        │   └── designsystem/
        └── res/
```

### 4.1 `android/CLAUDE.md`

职责：

- 作为 Android 工程地图
- 告诉开发“改什么去哪里”
- 记录模块边界、环境位置、构建入口、导航入口

它不应承担：

- PRD 说明
- 详细接口文档
- 页面原型说明

## 5. 分层方案

Android 建议采用下面五层。

### 5.1 `app/`

职责：

- Application 入口
- 全局依赖装配
- 顶层导航容器
- 全局 session / app state 装配

这一层回答的是：

- App 如何启动
- 根导航图如何组织
- 全局依赖从哪里注入

### 5.2 `core/`

职责：

- 网络客户端
- 环境配置
- 错误模型
- 日志
- 时间、ID、序列化等通用基础设施

建议包含：

- `core/network/`
- `core/config/`
- `core/error/`
- `core/common/`

这层不关心业务，只解决“基础能力怎么统一提供”。

### 5.3 `domain/`

职责：

- 领域模型
- 业务状态定义
- 业务动作接口

这层应与现有 Web 的 `domains/wishflow/types.ts` 对齐思路，但不能只停留在类型壳层。

建议逐步包含：

- `WishTask`
- `WishExecutionStatus`
- `ValidationRound`
- `FeedItem`
- `FeedComment`
- `MembershipState`（后续）
- `UserIdentity`（后续）

同时这里还应该逐步形成业务动作接口，例如：

- `CreateWishUseCase`
- `ClarifyWishUseCase`
- `ConfirmWishPlanUseCase`
- `GetWishRoundsUseCase`
- `GetMyWishesUseCase`
- `GetFeedUseCase`

### 5.4 `data/`

职责：

- 调后端 API
- Repository 实现
- DTO 与 domain model 映射
- 本地缓存与持久化

建议结构：

```text
data/
├── remote/
├── repository/
├── local/
└── mapper/
```

这里要特别强调：

- `data/remote/` 面向接口协议
- `domain/` 面向业务语义
- 页面和 ViewModel 不直接拿 DTO

### 5.5 `feature/`

职责：

- 按产品能力组织可见功能
- 负责 Compose UI、ViewModel 和 feature 内部状态

建议不要按 Web screen 名拆，而要按 Android 首批产品能力拆：

```text
feature/
├── feed/
├── wish-create/
├── wish-detail/
├── wish-progress/
├── my-wishes/
└── shared/
```

## 6. 首批 MVP 的 feature 切分

基于当前已确认的扩展版 MVP，建议 Android 首批这样拆。

### 6.1 `feature/feed`

承接能力：

- 漂流瓶内容流展示
- 点赞
- 评论

对应当前后端：

- `GET /api/feed`
- `POST /api/feed/:id/like`
- `GET /api/feed/:id/comments`
- `POST /api/feed/:id/comments`

### 6.2 `feature/wish-create`

承接能力：

- 发愿输入
- 首次创建愿望
- 必要澄清信息提交

对应当前后端：

- `POST /api/wishes`
- `PATCH /api/wishes/:id/clarify`

### 6.3 `feature/wish-detail`

承接能力：

- 单个愿望详情
- 初版方案展示
- 用户确认方案

对应当前后端：

- `GET /api/wishes/:id`
- `POST /api/wishes/:id/plan/confirm`

### 6.4 `feature/wish-progress`

承接能力：

- 展示轮次推进信息
- 呈现当前执行状态

对应当前后端：

- `GET /api/wishes/:id/rounds`

### 6.5 `feature/my-wishes`

承接能力：

- 我的愿望列表
- 按状态分组
- 进入待处理项或历史记录

对应后端状态：

- **当前没有现成接口**
- 需要新增“按 `deviceId` 或用户身份查询愿望列表”的能力

这是本轮 Android 扩展版 MVP 的关键新增依赖。

## 7. 导航方案

Android 不建议直接复刻 Web 的 3-Tab 叙事外壳，但可以承接其核心信息结构。

推荐的顶层导航：

```text
Root
├── Feed
├── CreateWish
├── MyWishes
└── WishDetail / WishProgress（从列表或创建流进入）
```

建议理解为：

- `Feed` 是公共入口
- `CreateWish` 是中心动作
- `MyWishes` 是个人任务视图
- `WishDetail / WishProgress` 是任务内页，而不是独立顶层 tab

这样做的好处是：

- 符合 Android 正式产品的导航习惯
- 不被 Web Demo 的 screen 顺序绑死
- 能自然承接“我的愿望列表”进入详情

## 8. 状态流与 ViewModel 边界

### 8.1 ViewModel 只管理 feature 内状态

每个 feature 应有自己的 ViewModel，不要建立一个全局大 ViewModel 去承载所有页面状态。

例如：

- `FeedViewModel`
- `WishCreateViewModel`
- `WishDetailViewModel`
- `WishProgressViewModel`
- `MyWishesViewModel`

### 8.2 状态要分成三类

建议每个 feature 至少区分：

- `UiState` — 页面渲染需要的数据
- `UiEvent` — 用户动作
- `UiEffect` — 一次性副作用，如跳转、toast、弹窗

这样可以避免：

- Compose 页面直接操作 repository
- 导航和数据状态缠在一起
- 屏幕重建时副作用重复触发

### 8.3 业务状态以 domain 为准

愿望状态应以领域模型为准，而不是在某个 screen 内自己再造一套状态枚举。

例如 Web 当前 `MyWishesTab.tsx` 里使用的是 `pending / in_progress / completed` 的 UI 视角分组，这在 Android 里应该被理解为：

- domain 中保留正式状态，如 `clarifying / planning / ready / in_progress / completed`
- UI 层再把正式状态映射成：
  - 待决策
  - 进行中
  - 已完成

这样才能保持后端、Android、未来 Web 都指向同一套业务含义。

## 9. 数据流方案

推荐的数据流如下：

```text
Compose Screen
  -> ViewModel
  -> UseCase
  -> Repository
  -> Remote DataSource / Local DataSource
  -> DTO Mapper
  -> Domain Model
  -> UiState
```

设计重点：

- Screen 不直接调 API
- ViewModel 不直接持有 DTO
- Repository 负责屏蔽远端与本地来源差异
- domain model 是业务语义的稳定层

## 10. 与现有后端的对接边界

### 10.1 当前可直接对接

Android 架构第一阶段可以直接对接：

- Feed 列表、点赞、评论
- 愿望创建
- 愿望详情
- 愿望澄清
- 方案确认
- 轮次查看

### 10.2 当前必须补齐

若 Android 按扩展版 MVP 推进，后端至少要新增：

- 我的愿望列表接口

若 Android 继续按未来上架标准推进，后端后续还需要规划：

- Auth / Session / RLS
- 会员 / 支付 / 权益
- 更完整执行期接口

### 10.3 Android 首批不要假装这些能力已存在

架构文档里必须显式区分：

- 已存在后端能力
- Android 必须补齐的后端能力
- 暂不进入首批 MVP 的能力

否则实现阶段会出现 scope 漂移。

## 11. 环境与发布策略

虽然当前先交付 APK，但 Android 工程一开始就应该有正式产品的环境意识。

建议至少区分：

- `dev`
- `staging`
- `prod`

配置内容至少包括：

- API base URL
- 日志开关
- 调试能力开关

当前不建议把这些配置散落在 Compose 页面里，应该统一放到 `core/config/`。

## 12. 首批不纳入 Android 架构第一阶段的内容

以下内容不应在 Android 工程刚起步时就混进主结构：

- 支付 SDK 细节
- 埋点平台具体接入
- 推送系统完整链路
- 后台审核治理系统

这些都重要，但不属于当前 Android 工程骨架的第一步。

## 13. 建议的执行顺序

基于当前架构，后续应按下面顺序推进：

1. 建立 Android 工程骨架与 `android/CLAUDE.md`
2. 搭建 `core / domain / data / feature` 基础结构
3. 先接现有后端已具备能力
4. 同步补“我的愿望列表”后端接口
5. 完成扩展版 MVP 主链路
6. 再处理 Auth / RLS / 会员等更正式能力

## 14. 最终结论

Wishpool 的 Android 原生版本，不应该被理解为“把 Web Demo 翻译成 Android 页面”，而应该被理解为：

**基于现有产品骨架与现有后端能力，新建一个正式的 Android 原生客户端。**

它的第一阶段目标是：

- 用清晰分层保证工程可持续演进
- 用扩展版 MVP 验证正式 Android 主链路
- 用最小后端补齐支撑“我的愿望列表”
- 为未来可上架版本预留环境、身份和 release 演进空间
