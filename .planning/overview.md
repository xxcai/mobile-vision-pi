# Mobile Vision Pi: 项目总览

## 项目目标

搭建测试环境，验证大模型对手机端 SDK 抓取的界面数据的理解程度，结果用于优化界面抓取 SDK。

## 整体架构

```
[PC: Pi-Agent Extension (TS)]
        |
        | fetch() via localhost:9700
        | (adb forward tcp:9700 tcp:9700)
        |
[Phone: perception-sdk HTTP Server (Java)]
        |
        | in-process: PerceptionComposer
        |   -> ViewHierarchyDumper (XML)
        |   -> NativeSemanticSnapshotGenerator (YAML)
        |
[Phone: 集成了 SDK 的 App]
```

## 关键约束

- 仅考虑集成 SDK 的 app 内部操作，不考虑跨 app
- 手机端：Java，minSdk 24，compileSdk 34，AGP 8.3.2
- PC 端：TypeScript，基于 Pi-Agent Extension
- 通信方式：ADB port forwarding + HTTP
- 优先界面捕获，操作能力（click/swipe）低优先级延后

## 实施阶段

| 阶段 | 文档 | 状态 | 说明 |
|------|------|------|------|
| Phase 1 | [phase1-pc-extension.md](phase1-pc-extension.md) | 已完成 | PC 端 Pi-Agent Extension 最小验证（mock 数据） |
| Phase 2 | [phase2-android-http-server.md](phase2-android-http-server.md) | 代码完成，待真机验证 | Android 端最小 HTTP Server（在 app 模块中直接添加） |
| Phase 3 | [phase3-integration.md](phase3-integration.md) | 已完成 | PC + Android 端到端联调 |
| Phase 3.5 | [phase3.5-system-prompt.md](phase3.5-system-prompt.md) | 待开始 | 优化 Pi-Agent 系统提示词，定义手机操作 Agent 角色 |
| Phase 4 | [phase4-sdk-packaging.md](phase4-sdk-packaging.md) | 待开始 | Android 端 SDK 封装（独立模块 + ContentProvider 自动初始化） |
| Phase 5 | [phase5-operations.md](phase5-operations.md) | 待开始 | 操作能力（click/swipe），低优先级 |

## 关键技术决策

1. **HTTP Server 方案**：使用原始 `java.net.ServerSocket`，参考 `../droidrun-portal/SocketServer.kt`，不引入外部库
2. **界面捕获管线**：直接复用 `PerceptionComposer.execute()` 完整管线，不分别调用底层类
3. **PC 端方案**：Pi-Agent Extension（非独立 SDK 应用），通过 `promptGuidelines` 注入 system prompt
4. **LLM 选择**：非视觉 LLM，利用 YAML 文本描述界面
5. **实施顺序**：先验证 PC 端 Pi-Agent 扩展可行性（风险最高），再逐步推进

## 关联项目

| 项目 | 路径 | 用途 |
|------|------|------|
| ui-perception | `../ui-perception/` | 界面抓取管线，Phase 2 的改造目标 |
| droidrun-portal | `../droidrun-portal/` | HTTP Server 实现参考 |
| Pi-Agent 文档 | https://pi.dev/docs/latest | Extension 开发参考 |
