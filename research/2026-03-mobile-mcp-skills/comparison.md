# 原生 iOS / Android MCP 与 Skills 候选对比

> 日期：2026-03-28
> 说明：本表为当前初筛结果，不代表最终定稿

## 1. 对比维度

| 维度 | 含义 |
|------|------|
| 平台 | iOS / Android / 双端 |
| 角色 | 开发主链路 / 构建补强 / 自动化测试 / 辅助能力 |
| 当前判断 | 主推 / 继续观察 / 备选 / 排除 |

## 2. 候选项对比

| 名称 | 平台 | 角色 | 解决的问题 | 接入判断 | 当前判断 | 备注 |
|------|------|------|------|------|------|------|
| `Apple Xcode 26.3 + 官方 agentic coding / MCP` | iOS | 开发主链路 | 让代理参与 build、run、test、查 Apple 文档 | 需要进入 Apple 官方工作流 | 主推 | 官方基座，优先级高 |
| `XcodeBuildMCP` | iOS | 开发主链路 / 调试增强 | 构建、运行、调试、模拟器控制、UI 自动化 | 接入成本中等 | 主推 | 当前最值得复核的 iOS 第三方 MCP |
| `Android Studio AI agent + MCP support + Journeys` | Android | 开发主链路 | 在 Android Studio 内进行 agent 协作、设备验证与 Journey 测试 | 依赖 Android Studio 官方路线 | 主推 | 更像官方 IDE 内能力，而非独立 MCP server |
| `gradle-mcp-server` | Android | 构建补强 | 暴露 Gradle 任务、构建与测试能力给代理 | 接入成本中等 | 继续观察 | 更适合作为 Android 构建层补件 |
| `mobile-next/mobile-mcp` | 双端 | 自动化 / 交互层 | 设备、模拟器、应用交互与自动化 | 接入成本中等 | 继续观察 | 更适合作为移动自动化补充 |
| `appium/appium-mcp` | 双端 | 自动化测试 | 跨端 UI 自动化与回归验证 | 接入成本中等偏高 | 继续观察 | 更适合作为测试层，不是开发主基座 |
| `轻量 ADB MCP` | Android | 辅助能力 | 命令转发、设备基础控制 | 接入成本低 | 备选 | 适合补命令，不适合承担主链路 |
| `srmorete/adb-mcp` | Android | 辅助能力 | ADB 操作封装 | 不建议继续投入 | 排除 | 已出现安全通告 |

## 3. 当前推荐组合

### 3.1 iOS

1. `Apple Xcode 26.3 官方能力`
2. `XcodeBuildMCP`

### 3.2 Android

1. `Android Studio AI agent + MCP support + Journeys`
2. `gradle-mcp-server`

### 3.3 测试与自动化补充

1. `appium/appium-mcp`
2. `mobile-next/mobile-mcp`

## 4. 当前不做的判断

1. 暂不在本轮直接给出“唯一标准答案”
2. 暂不把跨端自动化工具当成原生开发主链路替代项
3. 暂不把轻量命令封装工具抬升为主推荐

## 5. 审核

1. 对比表已按平台、角色、判断拆开
2. 已显式区分主推、继续观察、备选、排除
3. 已保留“当前判断”语气，避免误写成最终选型结论
