import { Type } from "@sinclair/typebox";
import { uncheck } from "./phone-client.ts";

export function createUncheckTool(pi) {
  return {
    name: "phone_uncheck",
    label: "Uncheck Phone Checkbox",
    description:
      "Unchecks a checkbox element identified by ref. " +
      "If the checkbox is already unchecked, this is a no-op. " +
      "For toggling checkbox state, you can also use phone_click.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref of the checkbox element" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Unchecking ${params.ref}...` }],
      });

      try {
        const result = await uncheck(pi.exec, signal, params.ref);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Uncheck failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Unchecked ${params.ref}. Call phone_capture_ui to verify.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_uncheck failed: ${err.message}` }] };
      }
    },
  };
}
