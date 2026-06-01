import { Type } from "@sinclair/typebox";
import { captureUi } from "./phone-client.ts";

export function createCaptureTool(pi) {
  return {
    name: "phone_capture_ui",
    label: "Capture Phone UI",
    description:
      "Captures the current phone screen UI and returns it as structured YAML text showing the view hierarchy with roles, names, states, and interaction refs.",
    parameters: Type.Object({}),

    async execute(_toolCallId, _params, signal, onUpdate, _ctx) {
      onUpdate?.({
        content: [{ type: "text", text: "Capturing phone UI..." }],
      });

      try {
        const result = await captureUi(pi.exec, signal);

        if (result.status === "error") {
          return {
            content: [{ type: "text", text: `Capture failed: ${result.error}` }],
            details: { error: result.error },
          };
        }

        const yaml = result.result?.yaml ?? "No YAML content";
        const activity = result.result?.activity ?? "unknown";
        const output = `Phone UI captured (Activity: ${activity}):\n\n${yaml}`;

        return {
          content: [{ type: "text", text: output }],
          details: { activity, timestamp: result.result?.timestamp },
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `phone_capture_ui failed: ${err.message}` }],
          details: { error: err.message },
        };
      }
    },
  };
}
