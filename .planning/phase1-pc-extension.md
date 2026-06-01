# Phase 1: PC 端 — Pi-Agent Extension 最小验证

## 目标

验证 Pi-Agent 工具注册、LLM 调用、系统 prompt 注入是否可行。先用 mock 数据测试，不依赖手机端。

## 状态：已完成 (2026-06-01)

### 验证结果

- Extension 在 Pi-Agent v0.78.0 上正确加载
- `phone_capture_ui` 工具出现在可用工具列表
- LLM（Google Gemini）自动调用工具并正确解读 mock YAML
- promptGuidelines 正确注入 system prompt
- 注意：jiti 不支持复杂 TypeScript 类型注解（如 `Static<typeof Type.Object({})>`），需要简化为无类型参数

## 设计方案

### 目录结构

```
mobile-vision-pi/
  .pi/
    extensions/
      mobile-vision/
        index.ts          -- Extension 入口，注册所有工具
        config.ts         -- 端口、超时等常量
        phone-client.ts   -- HTTP 客户端（Phase 1 先用 mock）
        capture-tool.ts   -- phone_capture_ui 工具定义
```

### Pi-Agent Extension 开发要点

- Extension 入口文件 `index.ts` 导出一个函数 `(pi: ExtensionAPI) => void`
- 通过 `pi.registerTool()` 注册自定义工具
- 工具的 `promptSnippet` 和 `promptGuidelines` 会自动注入到 system prompt
- 工具的 `execute()` 返回 `{ content: [{ type: "text", text: "..." }], details: {} }`

### phone_capture_ui 工具设计

- **工具名**：`phone_capture_ui`
- **参数**：无（自动捕获当前界面）
- **返回**：YAML 文本描述界面结构
- **promptSnippet**：`Capture the current phone screen UI as structured YAML text`
- **promptGuidelines**：
  - 使用 phone_capture_ui 查看手机当前显示内容
  - YAML 中的 role（screen/button/text/list 等）描述元素类型
  - `[ref=n1]` 标识可交互元素
  - `[clickable]`/`[scrollable]` 等状态标记描述交互能力
  - 在操作手机前应先调用此工具了解当前界面

### Mock 数据

使用 ui-perception 的真实 YAML 输出样例（从 capture 文件中提取）：

```yaml
- screen:
  - toolbar "消息":
    - button "搜索" [ref=n1]
  - list [scrollable] [ref=n2]:
    - listitem [clickable-inferred] [ref=n3]:
      - text "梁晓舟"
      - text "明天上班"
```

### System Prompt 策略

- 通过工具的 `promptGuidelines` 注入指引（Pi-Agent 自动将此加入 system prompt）
- 引导 LLM：接到手机操作指令时，先 capture 再分析再决策
- YAML 格式天然适合纯文本 LLM 理解，无需视觉能力

## 任务清单

- [ ] 1.1 创建 `.pi/extensions/mobile-vision/` 目录结构
- [ ] 1.2 实现 `config.ts`（端口、超时常量）
- [ ] 1.3 实现 `capture-tool.ts`（mock 版本，返回样例 YAML）
- [ ] 1.4 实现 `index.ts`（Extension 入口，注册工具）
- [ ] 1.5 验证：`pi` 启动后 Extension 正确加载
- [ ] 1.6 验证：`phone_capture_ui` 工具出现在可用工具列表
- [ ] 1.7 验证：LLM 自动调用工具并正确解读 YAML
- [ ] 1.8 验证：`promptGuidelines` 正确注入 system prompt

## 验证标准

1. 在 `mobile-vision-pi/` 目录执行 `pi` 正常启动
2. Extension 加载无报错
3. 对 Agent 说 "我手机上现在显示的是什么？"，LLM 调用 `phone_capture_ui`
4. LLM 正确描述 mock YAML 中的界面元素
5. LLM 能基于 YAML 内容回答关于界面的问题（如"有几个可点击的按钮"）

## 参考资料

- Pi-Agent Extension 文档：https://pi.dev/docs/latest/extensions
- Pi-Agent SDK 文档：https://pi.dev/docs/latest/sdk
