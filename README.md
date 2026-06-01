# Mobile Vision Pi

测试环境，验证大模型对手机端 SDK 抓取的界面数据的理解程度，结果用于优化界面抓取 SDK。

## 架构

```
[PC: Pi-Agent Extension (TypeScript)]
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

- **PC 端**：基于 [Pi-Agent](https://pi.dev) 的 Extension，注册 `phone_capture_ui`、`phone_click`、`phone_swipe` 工具，通过 YAML 文本描述界面（非视觉 LLM）
- **Android 端**：`perception-sdk` 模块，封装界面抓取管线并通过 HTTP 暴露，ContentProvider 自动初始化

## 快速开始

### 环境要求

- Node.js + [Pi-Agent CLI](https://pi.dev)
- Android 设备（USB 连接，开发者模式 + USB 调试）
- 目标 App 集成了 `perception-sdk` 模块

### 启动

```bash
# 1. 连接 Android 设备，启动目标 App
adb devices

# 2. 设置端口转发
adb forward tcp:9700 tcp:9700

# 3. 在本项目目录启动 Pi-Agent
pi -nbt
```

`-nbt` 禁用内置编码工具，只保留手机操作工具。

### 使用

对 Agent 说：

- "我手机上现在显示的是什么？" → Agent 调用 `phone_capture_ui` 获取界面 YAML 并描述
- "点击第一个按钮" → Agent 识别 ref 后调用 `phone_click`
- "向上滑动" → Agent 调用 `phone_swipe`

## 项目结构

```
.pi/
  SYSTEM.md                          # 手机操作 Agent 系统提示词
  extensions/mobile-vision/
    index.ts                          # Extension 入口，注册工具
    capture-tool.ts                   # phone_capture_ui 工具
    click-tool.ts                     # phone_click 工具
    swipe-tool.ts                     # phone_swipe 工具
    phone-client.ts                   # HTTP 客户端（调用手机端接口）
    adb-bridge.ts                     # ADB port forwarding 管理
    config.ts                         # 端口、超时等配置
.planning/
  overview.md                         # 项目总览和阶段进度
  phase1-pc-extension.md              # Phase 1 文档
  phase2-android-http-server.md       # Phase 2 文档
  phase3-integration.md               # Phase 3 文档
  phase3.5-system-prompt.md           # Phase 3.5 文档
  phase4-sdk-packaging.md             # Phase 4 文档
  phase5-operations.md                # Phase 5 文档
```

## 关联项目

| 项目 | 用途 |
|------|------|
| [ui-perception](../ui-perception/) | 界面抓取管线 + `perception-sdk` 模块 |

## 开发状态

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | PC 端 Pi-Agent Extension 最小验证（mock 数据） | 已完成 |
| Phase 2 | Android 端最小 HTTP Server | 已完成 |
| Phase 3 | PC + Android 端到端联调 | 已完成 |
| Phase 3.5 | 优化系统提示词，定义手机操作 Agent 角色 | 已完成 |
| Phase 4 | SDK 封装（独立模块 + ContentProvider 自动初始化） | 已完成 |
| Phase 5 | 操作能力（click/swipe） | 已完成 |
