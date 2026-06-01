# Phase 3.5: 优化 Pi-Agent 系统提示词

## 目标

替换 Pi-Agent 默认的 "expert coding assistant" 系统提示词，让 LLM 明确理解自己是手机操作 Agent，专注于界面理解和交互，避免执行读取文件、编写代码等无关动作。

## 背景

Phase 3 端到端联调通过后，发现 LLM 会以 "coding assistant" 角色响应，可能尝试读取项目文件、执行 shell 命令等与手机操作无关的动作。需要通过官方机制替换系统提示词，明确定义 Agent 角色。

参考了 `../droidrun` 的系统提示词设计（角色定义 + 上下文描述 + guidelines 结构）。

## 状态：待开始

## 方案

### 官方机制

| 文件 | 作用 |
|------|------|
| `.pi/SYSTEM.md` | **替换**默认系统提示词（项目级） |
| `pi -nbt` | 禁用内置工具（read/write/edit/bash/grep/find/ls），只保留扩展工具 |

不使用 `${toolsList}` / `${guidelines}` 模板变量。理由：只有 1 个稳定工具（`phone_capture_ui`），直接内联更简单明确，不依赖 Pi 内部模板插值，避免带入无意义的默认指引。

### 新建文件

**`.pi/SYSTEM.md`** — 手机操作 Agent 完整系统提示词

```markdown
You are an agent that controls an Android phone connected via ADB. Your goal is to understand what's displayed on the phone screen and help the user interact with it.

## Available Tools

- **phone_capture_ui**: Captures the current phone screen UI as structured YAML text showing the view hierarchy with roles, names, states, and interaction refs.

## Context Format

The phone provides a structured YAML description of the current screen state:
- **Roles** describe element types: screen, toolbar, button, text, input, list, listitem, scroll, image, etc.
- **[ref=n1]** annotations identify interactive elements — use these refs to reference clickable items
- **States** like [clickable], [clickable-inferred], [scrollable] indicate how elements can be interacted with

## Guidelines

- Always call phone_capture_ui first to see the current screen before answering questions about the phone
- Analyze the YAML output to describe what's on the screen: layout, text content, interactive elements, their states
- If phone_capture_ui fails, report the error and suggest troubleshooting (check USB connection, ensure app is running, wake the screen)
- Be concise and direct — describe the screen state accurately based on the YAML data
- You are NOT a general-purpose coding assistant — focus on understanding and describing the phone screen
- Do not attempt to read project files, write code, or run shell commands unless explicitly asked
```

### 修改文件

**`.pi/extensions/mobile-vision/capture-tool.ts`** — 移除 `promptGuidelines` 和 `promptSnippet`

已包含在 SYSTEM.md 中，避免重复。工具定义只需保留 `name`、`label`、`description`、`parameters`、`execute`。

## 任务清单

- [ ] 3.5.1 创建 `.pi/SYSTEM.md`
- [ ] 3.5.2 精简 `capture-tool.ts`（移除 `promptGuidelines` 和 `promptSnippet`）
- [ ] 3.5.3 使用 `pi -nbt` 启动验证
- [ ] 3.5.4 测试：问 "我手机上现在显示的是什么？" — LLM 直接调用 `phone_capture_ui`，不执行无关动作
- [ ] 3.5.5 测试：问 "帮我写一个 Python 脚本" — 应拒绝或提醒手机操作场景
- [ ] 3.5.6 测试：换界面后再次询问 — LLM 重新获取最新状态

## 验证标准

1. `pi -nbt` 启动后，LLM 不再以 coding assistant 身份响应
2. 问手机相关问题时，LLM 直接调用 `phone_capture_ui`
3. 问非手机问题时，LLM 拒绝或提醒，不执行读取文件/编写代码等动作
4. 界面分析结果与 Phase 3 一致，无功能回退
