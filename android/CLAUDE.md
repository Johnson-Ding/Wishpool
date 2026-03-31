# Wishpool Android 工程地图

## 当前定位

`android/` 是 Wishpool 的正式 Android 原生工程，技术路线采用 `Kotlin + Compose`。

当前阶段目标是：

- 建立可持续演进的 Android 工程骨架
- 承接当前 Supabase 直连的数据能力
- 为后续 MVP 主链路实现、APK 交付和上架准备留好边界

## 目录职责

```text
android/
├── app/
│   └── src/main/java/com/wishpool/app/
│       ├── app/           应用入口、根导航
│       ├── core/          环境、网络、错误、通用基础设施
│       ├── domain/        领域模型与业务语义
│       ├── data/          repository、remote、local、mapping
│       ├── feature/       按产品能力组织的 Compose 功能模块
│       └── designsystem/  Android 端视觉与主题基线
```

## 找到你想改的东西

| 想改什么 | 去哪里 |
|---|---|
| App 启动入口 | `app/MainActivity.kt` |
| 根导航容器 | `app/WishpoolApp.kt` |
| 环境与 API 基础配置 | `core/config/` |
| 领域模型 | `domain/` |
| 数据获取与 repository | `data/` |
| Android 首页或功能页 | `feature/` |
| 主题与颜色 | `designsystem/theme/` |
| Gradle 与构建 | `android/build.gradle.kts`、`android/app/build.gradle.kts` |

## 当前约束

- 不按 Web `screen` 名一比一翻 Android 页面
- ViewModel 或 feature 不直接持有 DTO
- 页面不直接调用远端 API
- Android 运行时走 `Supabase PostgREST + RPC` 直连，不再依赖 `demo/server`
- `demo/server` 仅保留为历史 Express 实现与验证资产

## 发版流程

**唯一发版入口**（在仓库根目录执行）：

```bash
./scripts/android/release.sh
```

### 脚本做的事
1. 从 `android/app/build.gradle.kts` 读取 `versionName`
2. 检查 git 工作区干净 + tag 未存在
3. 检查 `origin` 仓库、`gh` CLI 和登录状态
4. 检查 `release.keystore` / `keystore.properties` 存在
5. 本地执行 `./gradlew :app:assembleRelease`
6. 将产物复制为 `wishpool-{version}-android.apk`
7. 创建并 push tag `v{versionName}`
8. 直接执行 `gh release create`
9. 直接执行 `gh release upload` 上传 APK

### 发版前唯一需要做的事
在 `android/app/build.gradle.kts` 改 `versionName`，commit，然后跑脚本。

### 构建规则
- 构建类型：`assembleRelease`
- 包名：`com.wishpool.app`（无 suffix，可覆盖安装）
- APK 命名：`wishpool-{version}-android.apk`
- Release 创建方式：本地脚本直接创建 GitHub Release 并上传 APK

### keystore 说明
- 本地保留：`android/app/release.keystore` + `android/app/keystore.properties`（已加入 .gitignore）
- CI 从 GitHub Secrets 读取：`KEYSTORE_BASE64` / `KEYSTORE_PASSWORD` / `KEY_ALIAS` / `KEY_PASSWORD`
- **不要重新生成 keystore**，签名必须与已安装包一致，自动更新才能成功

## 当前缺口

- Android 工程尚未接真实 API
- “我的愿望列表”所需后端接口尚未存在
- Auth / RLS / 会员与支付仍是后续阶段任务
