import { Type } from "@sinclair/typebox";
import { swipe } from "./phone-client.ts";

export function createSwipeTool(pi) {
  return {
    name: "phone_swipe",
    label: "Swipe on Phone",
    description:
      "Swipes on the phone screen in the specified direction. Optionally target a specific element by ref. Use this to scroll lists or navigate.",
    parameters: Type.Object({
      direction: Type.Union([
        Type.Literal("up"),
        Type.Literal("down"),
        Type.Literal("left"),
        Type.Literal("right"),
      ]),
      ref: Type.Optional(Type.String({ description: "Optional ref to swipe within a specific element" })),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      const target = params.ref ? `element ${params.ref}` : "screen";
      onUpdate?.({
        content: [{ type: "text", text: `Swiping ${params.direction} on ${target}...` }],
      });

      try {
        const result = await swipe(pi.exec, signal, params.direction, params.ref);

        if (result.status === "error") {
          return {
            content: [{ type: "text", text: `Swipe failed: ${result.error}` }],
          };
        }

        return {
          content: [{ type: "text", text: `Swiped ${params.direction}. Call phone_capture_ui to see the updated screen.` }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `phone_swipe failed: ${err.message}` }],
        };
      }
    },
  };
}
