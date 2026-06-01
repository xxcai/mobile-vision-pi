# Phase 2: Android 端 — 最小 HTTP Server

## 目标

在 ui-perception 的 app 模块中直接添加最小 HTTP Server（不新建 SDK 模块），快速提供 `/ping` 和 `/capture` 端点供 PC 端调用。

## 状态：代码完成，待真机验证 (2026-06-01)

## 设计方案

### HTTP Server 方案选型

参考 `../droidrun-portal/SocketServer.kt`，使用原始 `java.net.ServerSocket` 手动解析 HTTP。

- 场景仅需 2 个 GET 端点（`/ping`、`/capture`）
- 无需 POST body 解析、auth、二进制响应
- 预估 ~150 行 Java
- 不引入外部依赖

### 文件变更

**新建文件（在 ui-perception/app 模块中）：**

- `app/src/main/java/com/hh/uiperception/portal/PerceptionHttpServer.java`
  - ServerSocket + Executors.newFixedThreadPool(3)
  - accept 循环 + 路由分发
  - 手动解析 HTTP 请求行和 headers
  - 手动构建 HTTP 响应（状态行 + Content-Type + Content-Length + body）

- `app/src/main/java/com/hh/uiperception/portal/CaptureHandler.java`
  - 从 ForegroundActivityTracker 获取当前 Activity
  - 通过 `runOnUiThread` + `CountDownLatch`（5s 超时）在 UI 线程执行
  - 调用 PerceptionComposer 管线获取 YAML

**修改文件：**

- `app/src/main/java/com/hh/uiperception/App.java`
  - 在 `onCreate` 中启动 HTTP Server
  - 注册前台 Activity 追踪（onActivityResumed 记录，onActivityPaused 清除）

### HTTP API 设计

**端口**：9700

**GET /ping**
```json
{"status":"success","result":{"version":"1.0.0"}}
```

**GET /capture**
```json
{
  "status": "success",
  "result": {
    "activity": "com.hh.uiperception.baseline.NativeHomeActivity",
    "yaml": "- screen:\n  - toolbar ...",
    "nodeCount": 47,
    "timestamp": 1717000000000
  }
}
```

**错误响应**
```json
{"status":"error","error":"No foreground Activity"}
```

### 管线复用

直接复用 `PerceptionComposer.execute()` 完整管线（与 `CaptureFloatingButton` 相同调用模式）：

```java
PerceptionPlan plan = new PerceptionPlan(
    activity.getClass().getSimpleName(),
    Collections.singletonList(new NativePerceptionPlugin()),
    true  // transformEnabled
);
PerceptionRunResult runResult = PerceptionComposer.execute(activity, plan);
// 从 runResult.entries() 中提取 TransformResult 获取 YAML
```

复用的关键类：
- `PerceptionComposer` — `perception-core/.../PerceptionComposer.java`
- `PerceptionPlan` — `perception-core/.../PerceptionPlan.java`
- `NativePerceptionPlugin` — `native-plugin/.../NativePerceptionPlugin.java`

### 线程模型

```
HTTP 请求线程 (NanoHTTPD daemon)
  -> ForegroundActivityTracker.getForegroundActivity()
  -> activity.runOnUiThread(capture task)
  -> CountDownLatch.await(5, SECONDS)
  <- capture result / timeout
  -> 构建 JSON 响应返回
```

## 任务清单

- [ ] 2.1 实现 `PerceptionHttpServer.java`（ServerSocket + 线程池 + /ping）
- [ ] 2.2 实现 `CaptureHandler.java`（调用 PerceptionComposer + UI 线程同步）
- [ ] 2.3 修改 `App.java`（启动 Server + 前台 Activity 追踪）
- [ ] 2.4 验证：运行 app，`curl http://localhost:9700/ping` 返回 OK
- [ ] 2.5 验证：`curl http://localhost:9700/capture` 返回 YAML JSON

## 验证标准

1. app 启动后 logcat 显示 HTTP Server 启动日志
2. `adb forward tcp:9700 tcp:9700` 后 `curl http://localhost:9700/ping` 返回 `{"status":"success",...}`
3. 切换到 baseline 页面，`curl http://localhost:9700/capture` 返回包含 YAML 的 JSON
4. 在不同 Activity 间切换，capture 返回对应的正确 YAML

## 参考资料

- droidrun-portal SocketServer：`../droidrun-portal/app/src/main/java/com/droidrun/portal/service/SocketServer.kt`
- CaptureFloatingButton 调用模式：`../ui-perception/app/src/main/java/com/hh/uiperception/CaptureFloatingButton.java`
