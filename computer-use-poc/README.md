# Computer Use POC - Wishpool L1 自动执行

基于 Anthropic Computer Use API 的自动化执行概念验证。

## 架构设计

```
Computer Use POC
├── executor/           # 执行器核心
│   ├── computer-use.js # Computer Use API 调用
│   ├── sandbox.js      # 安全沙箱管理
│   └── validator.js    # 执行验证器
├── scenarios/          # 执行场景配置
│   ├── shopping.json   # 电商购物场景
│   ├── booking.json    # 预订场景
│   └── search.json     # 搜索场景
├── server.js          # HTTP API 服务
└── test/              # 测试脚本
```

## 当前实现状态

- [x] 基础架构设计
- [ ] Computer Use API 集成
- [ ] 安全沙箱环境
- [ ] 执行场景配置
- [ ] 与 AI Agent 系统集成

## API 接口

- `POST /execute` - 执行自动化任务
- `GET /screenshot` - 获取执行截图
- `POST /stop` - 停止执行

## 安全措施

- Docker 容器隔离
- 网络访问白名单
- 预算限制控制
- 敏感信息脱敏