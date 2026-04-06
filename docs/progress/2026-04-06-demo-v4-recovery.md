# 2026-04-06 demo V4 恢复执行记录

## 背景
用户误操作回退了 demo 的 V4 升级。本次基于会话中已确认的交互与产品结构，重新恢复 demo 的 V4 主流程。

## 本次恢复范围
- 主流程从旧 `splash → home → paywall → ai-plan → ...` 收口为：
  - `splash`
  - `home`（广场）
  - `chat`（默认三角色群聊）
  - `wishes`（我的愿望）
- 旧 Phase 2 页面未删除，但已退出主链路，并由 `WishpoolDemo.tsx` fallback 回 `home`，避免黑屏。

## 关键实现
### 1. 主流程与导航
- 修改 `demo/client/src/features/demo-flow/types.ts`
- 修改 `demo/client/src/features/demo-flow/navigation.ts`
- 修改 `demo/client/src/features/demo-flow/flow-state.ts`
- 修改 `demo/client/src/pages/WishpoolDemo.tsx`
- 修改 `demo/client/src/features/demo-flow/screens/MainTabScreen.tsx`

### 2. 群聊详情页
- 新建 `demo/client/src/features/demo-flow/screens/ChatDetailScreen.tsx`
- 新建 `demo/client/src/features/demo-flow/screens/RoleCardSheet.tsx`
- 顶部改为三个真实头像的紧凑长条入口
- 底部结构改为：输入框一行 + 下方导航一行
- 单击许愿条弹出气泡；长按打开语音输入

### 3. 气泡与语音输入
- 修改 `demo/client/src/features/wish-bubble/WishBubble.tsx`
- 不再依赖 `wouter` 路由
- 改为通过 `wish-bubble-select` 事件回填群聊消息流
- 语音输入改为底部升起的半圆蒙层样式

### 4. 我的愿望 todo
- 重写 `demo/client/src/features/demo-flow/screens/MyWishesTab.tsx`
- 支持展开 todo、勾选完成、自动更新状态与进度
- “去处理”支持回到对应群聊场景

### 5. 头像统一
- 修改 `demo/client/src/features/demo-flow/shared.tsx`
- 修改 `demo/client/src/components/ThemeSelector.tsx`
- 新增 `demo/client/public/star-avatar.png`
- 新增 `web/client/public/star-avatar.png`
- moon/cloud 使用 public 头像；star 使用 yaya_xing 源图同步后的 public 资源

## 已知口径
- 群聊消息、愿望卡、碎碎念卡、语音识别结果均为 mock 数据
- 广场已有的碎碎念穿插能力沿用旧数据结构
- 设置弹框继续沿用 `SettingsPanel.tsx`

## 验证结果
- `cd demo && npm run build` 已通过
- 已验证构建层面无阻塞错误

## 建议下一步
- 本地运行 demo，按以下路径手测：
  1. Splash → 广场
  2. 广场单击/长按荧光圈
  3. 群聊页单击/长按许愿条
  4. 角色卡片左右滑切换
  5. 我的愿望 todo 勾选与回跳群聊
  6. 设置弹框位置与主题头像显示
