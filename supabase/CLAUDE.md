# Supabase 模块地图

## 模块定位

`supabase/` 用于承接 Wishpool 数据层草案。当前仓库内已落盘的是 SQL 结构与种子数据脚本，并由 `demo/server/` 中的后端接口层消费；这不代表 Supabase 项目、环境变量、权限策略或运行态配置已经闭环。

---

## 目录结构

```text
supabase/
└── sql/
    ├── 001_core_schema.sql
    └── 002_seed_drift_bottles.sql
```

---

## 文件职责

| 文件 | 作用 |
|------|------|
| `sql/001_core_schema.sql` | 定义匿名用户、愿望任务、轮次校验、协同锁定、履约、漂流瓶、漂流瓶评论等主链路表结构 |
| `sql/002_seed_drift_bottles.sql` | 初始化首页漂流瓶冷启动内容 |

---

## 当前边界

- 当前只确认 SQL 脚本与后端接口层已进入仓库
- 当前未确认 Supabase 项目连接、执行顺序、RLS/Auth 配置、环境变量
- 当前文档应把这里描述为“数据建模草案层”，不要描述成“后端已接通”

---

## 想改什么去哪里

| 想改什么 | 去哪里 |
|---------|--------|
| 愿望主链路表结构 / Feed 评论表结构 | `sql/001_core_schema.sql` |
| 漂流瓶 seed 内容 | `sql/002_seed_drift_bottles.sql` |
| Supabase 是否已实配 | 先查 `docs/progress/index.md` 与 `docs/progress/development.md` |
| 后端接口如何访问这些表 | `demo/server/modules/` |

---

## 约束

- 新增 SQL 文件时，文件名保持顺序化命名，避免后续迁移顺序混乱
- 未完成运行态配置前，不把 Supabase 写成“已接通”
- 若表结构或执行方式变更，需要同步回写根级 `CLAUDE.md`
