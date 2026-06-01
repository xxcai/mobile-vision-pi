import { Type } from "@sinclair/typebox";
import { clickElement } from "./phone-client.ts";

export function createClickTool(pi) {
  return {
    name: "phone_click",
    label: "Click Phone Element",
    description:
      "Clicks an interactive element on the phone screen identified by its ref (e.g. 'n1'). The ref comes from the YAML output of phone_capture_ui.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref identifier from YAML, e.g. 'n1'" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Clicking element ${params.ref}...` }],
      });

      try {
        const result = await clickElement(pi.exec, signal, params.ref);

        if (result.status === "error") {
          return {
            content: [{ type: "text", text: `Click failed: ${result.error}` }],
          };
        }

        return {
          content: [{ type: "text", text: `Clicked element ${params.ref}. Call phone_capture_ui to see the updated screen.` }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `phone_click failed: ${err.message}` }],
        };
      }
    },
  };
}
