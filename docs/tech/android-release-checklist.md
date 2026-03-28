# Android APK 交付检查清单

> 日期：2026-03-28
> 适用范围：Wishpool Android 原生工程当前阶段

## 当前已完成

- Android 原生工程骨架已创建
- `./gradlew :app:assembleDebug` 可成功产出 APK
- `./gradlew :app:assembleRelease` 可成功完成 release 构建
- Debug APK 已可安装
- 首批 MVP 页面已具备：
  - Feed 广场
  - 发愿创建
  - 愿望详情 / 轮次进展
  - 我的愿望列表
- Android 已接入现有后端契约：
  - Feed 列表 / 点赞 / 评论
  - 愿望创建 / 查询 / 澄清 / 方案确认 / 轮次查询
  - 我的愿望列表

## 当前仍是交付前风险

### 1. API 地址仍是本地开发地址

当前 debug 环境默认指向：

- `http://10.0.2.2:4000/api/`

这适用于 Android 模拟器访问本机服务，不适用于真实手机直接访问你的电脑。

发布前必须明确：

- staging API 地址
- production API 地址
- 真机调试时的局域网地址策略

### 2. cleartext 仅用于当前开发调试

Manifest 当前开启了 `usesCleartextTraffic=true`，是为了让本地 `http` 开发环境可直接联通。

正式交付前应改为：

- 统一 HTTPS
- 仅在 debug / staging 保留必要的本地调试策略

### 3. 应用图标与品牌资源仍是占位

当前仍使用系统默认 icon，占位主题已可运行，但不是最终品牌交付。

发布前需要补：

- 正式 App icon
- 启动图 / 启动主题
- 品牌色与字体系统

### 4. release 签名策略仍未落最终值

当前 release 可构建，但正式发包前仍要确认：

- keystore 存放方式
- CI / 本地签名流程
- 版本号规则

### 5. Auth / RLS / 权限仍未闭环

当前后端已可承接 Android MVP，但正式扩大测试前需要继续处理：

- Auth / Session
- RLS
- 设备匿名身份与后续账号绑定策略

## 发布前最少核对项

1. `debug`、`staging`、`release` 三套环境地址是否明确
2. 真机是否能访问目标 API
3. 是否关闭不必要的 cleartext
4. 是否替换正式 icon / 名称 / 启动资源
5. 是否确认 release keystore 与签名流程
6. 是否确认 Auth / RLS 风险是否在本轮可接受
7. 是否完成关键链路真机验证：
   - Feed 浏览
   - 点赞 / 评论
   - 发愿创建
   - 方案确认
   - 我的愿望列表

## 当前 APK 路径

- Debug APK：`android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK：`android/app/build/outputs/apk/release/`
