import { Type } from "@sinclair/typebox";
import { typeText } from "./phone-client.ts";

export function createTypeTextTool(pi) {
  return {
    name: "phone_type_text",
    label: "Type Text on Phone",
    description:
      "Types text into an input field identified by ref. " +
      "By default clears existing text before typing (set clear=false to append). " +
      "After typing, the on-screen keyboard may appear — use phone_press_key with key='back' to dismiss it.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref of the input element, e.g. 'w3' or 'n1'" }),
      text: Type.String({ description: "The text to type" }),
      clear: Type.Optional(Type.Boolean({ description: "Clear existing text before typing (default: true)", default: true })),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Typing "${params.text}" into ${params.ref}...` }],
      });

      try {
        const result = await typeText(pi.exec, signal, params.ref, params.text, params.clear ?? true);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Type text failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Typed "${params.text}" into ${params.ref}. Call phone_capture_ui to see the updated screen.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_type_text failed: ${err.message}` }] };
      }
    },
  };
}
