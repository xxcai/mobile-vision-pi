# Phase 5: 操作能力（低优先级，延后）

## 目标

添加点击和滑动操作能力，使 Agent 不仅能感知界面，还能执行操作。

## 状态：待开始

## 设计方案

### Android 端新增端点

**POST /click**
- 请求体：`{"ref": "n1"}`
- 实现：捕获时建立 ref -> View 映射，通过映射找到 View，调用 `view.performClick()`

**POST /swipe**
- 请求体：`{"direction": "up", "bounds": "[x1,y1][x2,y2]"}`
- 实现：通过 `MotionEvent.obtain()` 模拟滑动手势

### PC 端新增工具

**phone_click**
- 参数：`ref: string`（从 YAML 中的 `[ref=n1]` 获取）
- 调用 `POST /click`

**phone_swipe**
- 参数：`direction: "up"|"down"|"left"|"right"`, bounds 可选
- 调用 `POST /swipe`

## 技术风险

1. ref -> View 映射需要在 capture 时维护，Activity 切换后映射失效
2. `performClick()` 只触发 click listener，不触发 RecyclerView item click
3. MotionEvent 模拟需要考虑 View 坐标系转换
4. 快速连续操作可能导致状态不一致

## 任务清单

- [ ] 5.1 Android 端：capture 时建立 ref -> View 映射
- [ ] 5.2 Android 端：实现 POST /click 端点
- [ ] 5.3 Android 端：实现 POST /swipe 端点
- [ ] 5.4 PC 端：实现 phone_click 工具
- [ ] 5.5 PC 端：实现 phone_swipe 工具
- [ ] 5.6 端到端验证：Agent 执行点击和滑动操作
