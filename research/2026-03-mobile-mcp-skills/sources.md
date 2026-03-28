# 原生 iOS / Android MCP 与 Skills 调研来源

> 日期：2026-03-28
> 说明：优先记录官方来源、一手仓库和安全通告

## 1. 采信标准

1. 官方产品页
2. 官方技术文档
3. 官方视频 / 发布说明
4. 官方 GitHub 仓库
5. 官方安全通告

纯转载、无明确主体的清单页、缺少维护痕迹的二手文章不作为主要结论依据。

## 2. iOS 相关来源

### 2.1 Apple 官方

1. Apple Xcode 产品页
   - <https://developer.apple.com/xcode/>
2. Apple Tech Talk: Meet agentic coding in Xcode
   - <https://developer.apple.com/videos/play/tech-talks/111428/>

### 2.2 第三方 MCP

1. XcodeBuildMCP 官网
   - <https://www.xcodebuildmcp.com/>

## 3. Android 相关来源

### 3.1 Android 官方

1. Android Studio 运行与设备相关文档
   - <https://developer.android.com/studio/run>
2. Gemini features in Android Studio
   - <https://developer.android.com/studio/gemini/features>
3. Journeys for Android Studio
   - <https://developer.android.com/studio/gemini/journeys>

### 3.2 第三方 MCP

1. `gradle-mcp-server`
   - <https://github.com/IlyaGulya/gradle-mcp-server>

## 4. 双端与自动化相关来源

1. `mobile-next/mobile-mcp`
   - <https://github.com/mobile-next/mobile-mcp>
2. `appium/appium-mcp`
   - <https://github.com/appium/appium-mcp>

## 5. 风险与安全来源

1. GitHub Advisory: `srmorete/adb-mcp`
   - <https://github.com/advisories/GHSA-54j7-grvr-9xwg>

## 6. 本地 Skill 参考

以下不是“外网来源”，但与本轮判断高度相关，作为本地可直接使用的 workflow 参考保留：

1. `build-ios-apps:ios-debugger-agent`
2. `test-android-apps:android-emulator-qa`

## 7. 审核

1. 已将官方来源与第三方来源分开记录
2. 已单列安全通告来源
3. 已明确本地 Skills 不等同于外网公开来源
