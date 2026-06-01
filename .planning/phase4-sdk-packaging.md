# Phase 4: Android 端 SDK 封装

## 目标

将 app 模块中的临时代码重构为独立 `:perception-sdk` 模块，方便其他 app 集成。

**架构分层**：
- **核心层**：capture 能力，可被代码直接调用（移动端 Agent 场景）
- **传输层**：HTTP Server，可选（PC Agent 通过 ADB+HTTP 通信场景）

## 状态：待开始

## 架构设计

```
PerceptionSdk (公开 API)
  ├── capture()              → 直接调用，返回 CaptureResponse 对象
  ├── startHttpServer(port)  → 启动 HTTP 传输层（可选）
  └── stopHttpServer()

内部组件：
  ├── ForegroundActivityTracker  → 追踪前台 Activity
  ├── CaptureHandler             → 调用 PerceptionComposer 管线
  └── PerceptionHttpServer       → HTTP 传输层，调用 PerceptionSdk.capture()
```

## 模块结构

```
ui-perception/perception-sdk/
  build.gradle
  src/main/
    AndroidManifest.xml
    java/com/hh/uiperception/sdk/
      PerceptionSdk.java                  -- 公开 API 入口
      PerceptionSdkInitProvider.java      -- ContentProvider 自动初始化
      internal/
        CaptureHandler.java               -- capture 管线调用
        CaptureResponse.java              -- 结构化返回类型
        ForegroundActivityTracker.java    -- 前台 Activity 追踪
        PerceptionHttpServer.java         -- HTTP 传输层（可选）
```

## 任务清单

- [ ] 4.1 创建 `perception-sdk/` 模块骨架（build.gradle + AndroidManifest.xml）
- [ ] 4.2 更新 `settings.gradle` 添加 `:perception-sdk`
- [ ] 4.3 实现 `CaptureResponse.java`
- [ ] 4.4 实现 `ForegroundActivityTracker.java`（从 App.java 提取）
- [ ] 4.5 实现 `CaptureHandler.java`（迁移 + 用 ForegroundActivityTracker）
- [ ] 4.6 迁移 `PerceptionHttpServer.java`（改为调用 PerceptionSdk.capture()）
- [ ] 4.7 实现 `PerceptionSdk.java` 公开 API
- [ ] 4.8 实现 `PerceptionSdkInitProvider.java`
- [ ] 4.9 修改 `app/build.gradle` 添加 SDK 依赖
- [ ] 4.10 修改 `App.java`（移除 portal 代码，调用 PerceptionSdk.startHttpServer()）
- [ ] 4.11 删除 `app/portal/` 目录
- [ ] 4.12 更新 `AndroidManifest.xml`
- [ ] 4.13 验证：编译 + 端到端功能不变

## 验证标准

1. `./gradlew :perception-sdk:assembleDebug` 编译通过
2. `./gradlew :app:assembleDebug` 编译通过
3. 安装运行 app，`curl http://localhost:9700/ping` 返回 OK
4. `curl http://localhost:9700/capture` 返回 YAML JSON
5. PC 端 `pi -nbt` 联调功能不变
