# Phase 3: PC + Android 端到端联调

## 目标

将 Phase 1 的 mock Extension 升级为真实 HTTP 调用，与 Phase 2 的 Android HTTP Server 联调，验证完整的端到端流程。

## 状态：待开始

## 设计方案

### 新增文件

- `adb-bridge.ts`：管理 ADB port forwarding
- `phone-client.ts`：从 mock 改为真实 HTTP 调用

### ADB Bridge 设计

```typescript
// adb-bridge.ts
- ensureAdbForward(pi: ExtensionAPI, signal?: AbortSignal): Promise<void>
  - 检查 adb 可用（adb devices）
  - 执行 adb forward tcp:9700 tcp:9700
  - 懒加载：首次工具调用时触发
- resetForwardingState(): void
  - session 开始时重置
```

### Phone Client 设计

```typescript
// phone-client.ts
- captureUi(pi: ExtensionAPI, signal?: AbortSignal): Promise<CaptureResponse>
  - GET http://localhost:9700/capture
  - 超时 10 秒
- ping(signal?: AbortSignal): Promise<PingResponse>
  - GET http://localhost:9700/ping
```

### capture-tool.ts 变更

- 移除 mock 数据
- 改为调用 `captureUi(pi, signal)` 获取真实数据
- 增加错误处理（ADB 不可用、连接失败等）

## 任务清单

- [ ] 3.1 实现 `adb-bridge.ts`
- [ ] 3.2 改造 `phone-client.ts` 为真实 HTTP 调用
- [ ] 3.3 改造 `capture-tool.ts` 移除 mock
- [ ] 3.4 更新 `index.ts` 添加 session_start 事件处理（重置 forwarding state）
- [ ] 3.5 端到端验证：PC Agent 调用真实手机 capture
- [ ] 3.6 边界场景验证

## 验证标准

1. USB 连接设备，运行 app
2. `adb forward tcp:9700 tcp:9700`
3. 在 `mobile-vision-pi/` 启动 `pi`
4. 对 Agent 说 "我手机上现在显示的是什么？"
5. LLM 调用 `phone_capture_ui`，获取真实 YAML，正确描述界面

### 边界场景

- 设备断连：工具报错 "ADB not found" 或连接失败
- 无前台 Activity：服务端返回 500，工具报告错误
- 捕获超时：5s 超时，返回明确错误信息
