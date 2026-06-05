import { Type } from "@sinclair/typebox";
import { check } from "./phone-client.ts";

export function createCheckTool(pi) {
  return {
    name: "phone_check",
    label: "Check Phone Checkbox",
    description:
      "Checks a checkbox element identified by ref. " +
      "If the checkbox is already checked, this is a no-op. " +
      "For toggling checkbox state, you can also use phone_click.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref of the checkbox element" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Checking ${params.ref}...` }],
      });

      try {
        const result = await check(pi.exec, signal, params.ref);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Check failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Checked ${params.ref}. Call phone_capture_ui to verify.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_check failed: ${err.message}` }] };
      }
    },
  };
}
