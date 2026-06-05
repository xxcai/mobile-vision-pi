import { Type } from "@sinclair/typebox";
import { longPress } from "./phone-client.ts";

export function createLongPressTool(pi) {
  return {
    name: "phone_long_press",
    label: "Long Press on Phone",
    description:
      "Long presses an element identified by ref. " +
      "Useful for triggering context menus, entering selection mode, or other long-press interactions. " +
      "Default duration is 500ms.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref of the element to long press" }),
      duration: Type.Optional(Type.Number({ description: "Press duration in ms (default: 500)", default: 500 })),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Long pressing ${params.ref} for ${params.duration ?? 500}ms...` }],
      });

      try {
        const result = await longPress(pi.exec, signal, params.ref, params.duration ?? 500);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Long press failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Long pressed ${params.ref}. Call phone_capture_ui to see the updated screen.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_long_press failed: ${err.message}` }] };
      }
    },
  };
}
