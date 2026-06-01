import { Type } from "@sinclair/typebox";

const MOCK_YAML = `- screen:
  - toolbar "消息":
    - button "搜索" [ref=n1]
    - button "更多" [ref=n2]
  - list [scrollable] [ref=n3]:
    - listitem [clickable-inferred] [ref=n4]:
      - text "梁晓舟"
      - text "明天上班吗？"
      - text "10:30"
    - listitem [clickable-inferred] [ref=n5]:
      - text "张伟"
      - text "项目文档已发你邮箱"
      - text "09:15"
    - listitem [clickable-inferred] [ref=n6]:
      - text "李明"
      - text "好的，收到"
      - text "昨天"
  - button "新建消息" [ref=n7]`;

export const captureUiTool = {
  name: "phone_capture_ui",
  label: "Capture Phone UI",
  description:
    "Captures the current phone screen UI and returns it as structured YAML text showing the view hierarchy with roles, names, states, and interaction refs. Use this to understand what is currently displayed on the connected Android phone before performing any actions.",
  promptSnippet: "Capture the current phone screen UI as structured YAML text",
  promptGuidelines: [
    "Use phone_capture_ui to see what is currently displayed on the phone before planning actions.",
    "The YAML output uses roles like screen, toolbar, button, text, input, list, listitem, scroll, image, etc.",
    "Interactive elements have [ref=n1] annotations — use these refs to identify clickable items.",
    "States like [clickable], [clickable-inferred], [scrollable] indicate how elements can be interacted with.",
    "phone_capture_ui works with text-only models — no screenshots needed.",
    "Always call phone_capture_ui first when asked to interact with the phone, analyze the YAML, then decide on actions.",
  ],
  parameters: Type.Object({}),

  async execute(_toolCallId, _params, _signal, onUpdate, _ctx) {
    onUpdate?.({
      content: [{ type: "text", text: "Capturing phone UI..." }],
    });

    // Mock mode: return sample YAML from ui-perception output
    const activity = "com.hh.uiperception.baseline.message.MessageActivity";
    const nodeCount = 23;

    const output = `Phone UI captured (Activity: ${activity}, ${nodeCount} nodes):\n\n${MOCK_YAML}`;

    return {
      content: [{ type: "text", text: output }],
      details: { activity, nodeCount, mock: true },
    };
  },
};
