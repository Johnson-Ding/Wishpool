# Web 正式产品基座设计

> 日期：2026-03-29
> 状态：方向已落地当前阶段，后续继续收口中
> 相关模块：`demo/`、`web/`、`supabase/`

## 1. 目标

在保留 `demo/` 演示资产的前提下，新增 `web/` 作为 Wishpool 的正式 Web 主产品端。`web/` 的职责不是继续承接演示叙事，而是成为后续 Web 产品能力演进的主基座。

## 2. 核心判断

1. `demo/` 继续承担表达层和演示价值，但不再承接正式产品需求。
2. `web/` 复制 `demo/` 的可复用前端资产起步，但不继承 `WishpoolDemo` 的 narrative-driven 组织方式。
3. `Supabase` 已不只是三端数据层，而是 `Web / demo / iOS / Android` 四端共享数据层。
4. 发愿链路已经存在于当前仓库，应迁入 `web/`，而不是在 `web/` 里从零重写。

## 3. 工程边界

- `demo/`
  - 定位：演示资产
  - 约束：只做必要修补，不再作为正式产品主干

- `web/`
  - 定位：正式 Web 主产品端
  - 约束：后续 Web 功能默认落在这里

- `supabase/`
  - 定位：四端共享数据层
  - 约束：`web/` 直接走 `PostgREST + RPC`，不重新长出运行时中间层

- `demo/server/`
  - 定位：存档层
  - 约束：不作为 `web/` 的运行时主依赖

## 4. 首期产品结构

`web/` 首期一次性铺出正式主导航，而不是继续沿用 demo 屏幕顺序：

1. `广场`
   - 承接漂流瓶 / feed / 浏览入口
2. `发愿`
   - 承接发愿入口、首轮澄清、方案确认
3. `我的愿望`
   - 承接愿望列表、愿望详情、后续推进
4. `通知`
   - 首期先做正式页面骨架
5. `我的`
   - 承接设备身份、主题、偏好设置、后续账号升级入口

## 5. 首期真实能力策略

### 真打通

- 广场
- 发愿入口
- 首轮澄清
- 方案确认
- 我的愿望

### 真接数据

- `Supabase` 四端共享数据层
- `create_wish`
- `clarify_wish`
- `confirm_wish_plan`
- Feed / 点赞 / 评论能力

### 先占位

- 通知页
- 我的中的账号升级能力

### 暂不纳入 `web/` 首期主线

- 搭子匹配完整实现
- 协同筹备完整实现
- 履约反馈完整实现

## 6. 目录设计

建议 `web/` 在复制 `demo` 资产后，收敛为如下前端骨架：

```text
web/
├── client/src/
│   ├── app/
│   ├── pages/
│   ├── domains/
│   ├── features/
│   │   ├── plaza/
│   │   ├── wish-create/
│   │   ├── wish-clarify/
│   │   ├── wish-plan/
│   │   ├── wish-management/
│   │   ├── notifications/
│   │   └── profile/
│   ├── components/
│   │   ├── ui/
│   │   └── product/
│   ├── lib/
│   ├── hooks/
│   └── index.css
```

## 7. 迁移原则

### 直接复制

- `demo/client/src/components/ui/**`
- `demo/client/src/lib/supabase.ts`
- `demo/client/src/lib/api.ts`
- `demo/client/src/lib/utils.ts`
- `demo/client/src/index.css`
- 通用 hooks 和基础资产

### 参考迁移

- `demo/client/src/features/demo-flow/useFeedData.ts`
- `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx`
- `demo/client/src/features/demo-flow/screens/ChatScreen.tsx`
- `demo/client/src/features/demo-flow/screens/AiPlanScreen.tsx`
- `demo/client/src/features/demo-flow/screens/WishDetailScreen.tsx`

### 不继承

- `demo/client/src/pages/WishpoolDemo.tsx`
- `demo/client/src/features/demo-flow/navigation.ts`
- `demo/client/src/features/demo-flow/useDemoFlow.ts`
- 任何以 demo screen 顺序驱动业务状态的总控逻辑

## 8. 验收口径

1. 仓库新增 `web/`，且边界明确为正式 Web 主产品端。
2. `web/` 的入口不再依赖 `WishpoolDemo` 这种 demo 总控页。
3. `web/` 能以正式导航承接 `广场 / 发愿 / 我的愿望 / 通知 / 我的`。
4. 已存在的发愿链路被迁入 `web/`，而不是在讨论层面停留。
5. `web/` 的数据层对齐 `Supabase` 四端共享模型。
