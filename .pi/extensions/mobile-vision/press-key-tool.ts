import { Type } from "@sinclair/typebox";
import { pressKey } from "./phone-client.ts";

export function createPressKeyTool(pi) {
  return {
    name: "phone_press_key",
    label: "Press System Key on Phone",
    description:
      "Presses a system key. Available keys: 'back' (go back / dismiss keyboard / close dialog), 'enter', 'tab', 'home' (go to home screen), 'menu' (open menu). " +
      "Use 'back' to dismiss the on-screen keyboard after typing, or to close popups and go back to the previous screen.",
    parameters: Type.Object({
      key: Type.Union([
        Type.Literal("back"),
        Type.Literal("enter"),
        Type.Literal("tab"),
        Type.Literal("home"),
        Type.Literal("menu"),
      ], { description: "The key to press: 'back', 'enter', 'tab', 'home', or 'menu'" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Pressing ${params.key}...` }],
      });

      try {
        const result = await pressKey(pi.exec, signal, params.key);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Press key failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Pressed ${params.key}. Call phone_capture_ui to see the updated screen.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_press_key failed: ${err.message}` }] };
      }
    },
  };
}
