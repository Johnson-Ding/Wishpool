# 基础设施 Agent — 设计系统与架构

> **继承声明**: 本文档是根 `CLAUDE.md` 的补充。执行前必须先读根 `CLAUDE.md`，所有协作规范、交付责任、过程约束均以根文档为准，本文档仅定义职责边界和文件权限。

## 职责范围

负责 **跨端一致性** 和 **基础设施** 的所有实现，确保三端应用的设计语言、数据模型、API接口保持统一。

### 核心职责
- **设计系统维护**: 三角色主题、色彩变量、组件库、动画规范
- **数据架构**: Supabase 表结构、RPC 函数、类型定义
- **跨端同步**: Web/Android/iOS 的视觉一致性保证
- **基础组件**: 通用 UI 组件、上下文管理器、工具函数

---

## 文件边界

### ✅ 独占写权限

**设计系统与主题**:
```
demo/client/src/
├── contexts/CharacterContext.tsx         # 主题上下文
├── components/ThemeSelector.tsx          # 主题选择器
├── index.css                            # CSS 变量定义
├── tailwind.config.js                   # 主题配置
└── types/theme.ts                       # 主题类型定义

android/app/src/main/java/com/wishpool/app/
├── designsystem/theme/                  # Android 主题系统
│   ├── Theme.kt
│   ├── MoonColors.kt
│   ├── CloudColors.kt
│   └── StarColors.kt
├── core/preference/ThemePreference.kt   # 主题偏好存储
└── feature/theme/                       # 主题切换功能
    ├── ThemeViewModel.kt
    └── ThemeSelectorSheet.kt

ios/Sources/WishpoolCore/
├── ThemeSystem.swift                    # iOS 主题定义
└── UserDefaults+Theme.swift             # iOS 主题存储

ios/Sources/WishpoolApp/
└── ThemeProvider.swift                  # iOS 主题状态管理
```

**通用组件库**:
```
demo/client/src/components/
├── common/                              # 通用 UI 组件
├── demo/PhoneDemoShell.tsx             # 手机壳组件
└── ui/                                 # 基础 UI 库

android/app/src/main/java/com/wishpool/app/designsystem/
├── component/                          # Android 通用组件
└── foundation/                         # 设计基础元素

ios/Sources/WishpoolApp/DesignSystem/   # iOS 通用组件
```

**数据层架构**:
```
demo/client/src/
├── types/                              # TypeScript 类型定义
├── utils/                              # 工具函数
└── api/                                # API 客户端

android/app/src/main/java/com/wishpool/app/
├── domain/model/                       # 领域模型
├── data/                               # 数据层
└── core/network/                       # 网络基础

ios/Sources/WishpoolCore/
├── Models/                             # Swift 数据模型
├── Networking/                         # 网络层
└── Repository/                         # 数据仓库

supabase/
├── sql/                                # 数据库架构
└── functions/                          # Edge Functions
```

### 📖 只读权限

**板块页面**: 不直接修改具体业务页面，但提供组件和样式支持
**应用入口**: 不修改路由逻辑，但提供主题Provider集成

---

## 当前架构状态

### 🎨 三角色主题系统（v0.3.0 已完成）

| 角色 | 状态 | 配色基调 | 特效语言 |
|------|------|----------|---------|
| **眠眠月 🌙** | ✅ 已实现 | 深靛蓝黑 + 月光金 + 青色 | 星光闪烁、径向涟漪、缓呼吸 |
| **朵朵云 ☁️** | ✅ 已实现 | 晨曦白 + 桃粉 + 天蓝 | 云朵浮动、磨砂呼吸、柔焦 |
| **芽芽星 🌱** | ⚠️ UI占位 | 太空深紫 + 霓虹薄荷 + 亮青 | 极光流转、Q弹回弹、粒子 |

### 🔧 技术实现对照

| 功能 | Web | Android | iOS |
|------|-----|---------|-----|
| **主题切换** | ✅ CharacterContext + CSS变量 | ✅ ThemeViewModel + MaterialTheme | ✅ ThemeProvider + Environment |
| **状态持久化** | ✅ localStorage | ✅ SharedPreferences | ✅ UserDefaults |
| **选择器UI** | ✅ ThemeSelector浮层 | ✅ ThemeSelectorSheet | ✅ ThemeSelectionSheet |
| **入口位置** | ✅ MyWishesTab右上角 | ✅ HomeRoute设置按钮 | ✅ MyWishesView导航栏 |

### 📊 设计变量对照表

**色彩变量覆盖度**:
- **眠眠月**: 100% (50个变量)
- **朵朵云**: 100% (50个变量)
- **芽芽星**: 30% (15个变量，等待Phase 3完善)

**组件适配度**:
- **毛玻璃效果**: Web ✅ / Android ⚠️部分 / iOS ✅
- **动态背景**: Web ✅ / Android ✅ / iOS ✅
- **渐变按钮**: Web ✅ / Android ✅ / iOS ✅

---

## 数据架构概览

### 🗄️ Supabase 表结构

```sql
-- 核心业务表
anonymous_users           # 匿名用户管理
wish_tasks               # 心愿任务主表
validation_rounds        # 轮次校验
collab_locks            # 协同锁定
wish_fulfillments       # 履约记录

-- 内容表
drift_bottles           # 漂流瓶内容
drift_bottle_comments   # 漂流瓶评论

-- RPC 函数
create_wish()           # 创建心愿
clarify_wish()          # 补约束
confirm_wish_plan()     # 确认计划
like_bottle()           # 点赞漂流瓶
list_my_wishes()        # 查询我的心愿
```

### 🔌 API 接口状态

| 函数 | 状态 | 用途 | 调用方 |
|------|------|------|-------|
| `create_wish` | ✅ 已实现 | 创建心愿+匿名用户 | 三端发愿流程 |
| `clarify_wish` | ✅ 已实现 | 补充约束 | Web 补约束屏幕 |
| `confirm_wish_plan` | ✅ 已实现 | 确认AI方案 | Web AI方案屏幕 |
| `like_bottle` | ✅ 已实现 | 点赞漂流瓶 | 三端Feed页面 |
| `list_my_wishes` | ✅ 已实现 | 查询心愿列表 | 三端MyWishes页面 |
| `match_buddy` | ❌ 待实现 | 搭子匹配 | Phase 2 |
| `update_wish_round` | ❌ 待实现 | 轮次推进 | Phase 2 |

---

## 当前任务与发展方向

### 🎯 近期目标 (Phase 1)

1. **完善芽芽星主题** — 补齐剩余35个CSS变量，实现完整三角色切换
2. **Android 毛玻璃优化** — 研究 Compose 下的真实模糊效果实现
3. **设计变量规范化** — 建立三端设计token同步机制

### 🚀 中期目标 (Phase 2)

1. **扩展设计系统** — 季节主题、节日主题等动态变体
2. **性能优化** — 主题切换动画性能、大列表渲染优化
3. **跨端组件库** — 可复用的高级组件（卡片、表单等）

### 🌟 长期愿景 (Phase 3)

1. **智能主题** — 基于时间、位置、心情的自动主题切换
2. **无障碍支持** — 高对比度、大字体等accessibility增强
3. **设计工具链** — 从设计稿到代码的自动化生成流程

---

## 质量标准

### ✅ 三端一致性检查清单

**视觉一致性**:
- [ ] 同一主题下，三端色彩值完全匹配
- [ ] 按钮、卡片等组件的圆角、阴影规格一致
- [ ] 字体大小、间距按比例缩放，视觉重量相同

**交互一致性**:
- [ ] 主题切换入口位置和操作流程相同
- [ ] 动画时长和缓动函数保持一致
- [ ] 反馈状态（loading、error、success）表现一致

**技术一致性**:
- [ ] 主题状态管理模式相同
- [ ] API调用和数据格式完全匹配
- [ ] 错误处理和边界情况处理策略一致

---

## 协作界面

### 📥 接收来自其他 Agent

- **心愿管理 Agent**: 需要新的状态色彩（如"已归档"状态）
- **广场 Agent**: 需要新的交互组件（如"帮Ta实现"按钮）
- **发布 Agent**: 需要新的表单组件和验证样式

### 📤 提供给其他 Agent

- **设计规范**: 色彩变量、间距规范、动画参数
- **通用组件**: 按钮、卡片、表单、弹窗等基础UI
- **数据类型**: TypeScript类型定义、API接口规范
- **工具函数**: 主题获取、设备检测、格式化等utility

---

**核心使命**: 让用户在三端应用中享受一致、精致、有情感温度的"一搭子一宇宙"体验。