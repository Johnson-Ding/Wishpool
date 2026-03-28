# Feature 映射索引

> 目的：按“需求点”聚合 PRD、Web Demo、Android、iOS、Supabase 的落点，解决跨端需求在仓库中分散的问题。

---

## 这份文档和 PRD / progress 的区别

| 文档 | 回答什么问题 | 不负责什么 |
|------|--------------|------------|
| `docs/prd/*.md` | 这个需求为什么做、用户要什么、验收口径是什么 | 不负责写三端文件落点 |
| `docs/features/*.md` | 这个需求在当前仓库里落到哪里、三端怎么映射、当前是否对齐 | 不替代 PRD，不记录逐日开发流水 |
| `docs/progress/*.md` | 当前做到哪一步、阻塞在哪里、这轮改了什么 | 不替代需求定义，不承担跨端总映射 |

---

## 什么时候需要新增 feature 映射文档

满足以下任一条件，就应该在这里新建一份文档：

1. 一个需求会同时影响 `PRD + 至少一端实现`
2. 一个需求会同时影响 `Web / Android / iOS` 中的两端及以上
3. 一个需求依赖 `Supabase` 能力，并且需要和端侧实现一起对齐
4. 一个需求需要长期跟踪“各端是否对齐”，而不是只记录一次性开发动作

---

## 文件命名规则

```text
docs/features/REQ-xxx-<feature-slug>.md
```

示例：

- `docs/features/REQ-009-cross-platform-feature-mapping.md`
- `docs/features/REQ-010-wish-create-and-clarify-flow.md`

要求：

- 一个 `ReqID` 对应一份主映射文档
- 文件名中的 `feature-slug` 只用于帮助识别，不替代 `ReqID`

---

## 推荐结构

每份 feature 映射文档建议固定包含以下章节：

1. `目标`
2. `范围 / 非目标`
3. `PRD 对应`
4. `跨端映射表`
5. `执行顺序与优先级`
6. `验收口径`
7. `当前状态`
8. `关联流水`

其中“跨端映射表”建议固定为这 5 列：

| 维度 | 对应内容 |
|------|----------|
| PRD | 章节 / 用户故事 / 验收标准 |
| Web Demo | 页面 / 状态流 / 文件落点 |
| Android | feature / route / ViewModel / 文件落点 |
| iOS | SwiftUI 入口 / 页面 / Repository / 文件落点 |
| Supabase | 表 / RPC / 数据依赖 |

---

## 工作方式

一条跨端需求建议按这个顺序推进：

1. 先更新 `docs/prd/`，明确产品定义
2. 在 `docs/progress/requirements.md` 登记 `ReqID`
3. 新建 `docs/features/REQ-xxx-*.md`，把 PRD 与三端落点映射清楚
4. 在 `docs/progress/development.md` 记录本轮执行与决策
5. 改对应端代码与 Supabase
6. 回写 `docs/features/REQ-xxx-*.md` 的对齐状态
7. 最后只在 `docs/progress/index.md` 更新当前任务与阻塞

---

## 当前状态

- 当前仓库已具备 `PRD / progress / 三端代码目录` 三层结构
- 当前仓库缺少“按需求点聚合”的中间层
- 本目录用于补上这层结构
- 首个真实映射文档已创建：`REQ-010-wish-create-and-clarify-flow.md`
