import { Type } from "@sinclair/typebox";
import { selectOption } from "./phone-client.ts";

export function createSelectOptionTool(pi) {
  return {
    name: "phone_select_option",
    label: "Select Dropdown Option on Phone",
    description:
      "Selects an option in a dropdown (combobox/listbox) element by value. " +
      "The value should match one of the option values visible in the element's name. " +
      "Only works for select/combobox elements.",
    parameters: Type.Object({
      ref: Type.String({ description: "The ref of the select/combobox element" }),
      value: Type.String({ description: "The option value to select" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Selecting "${params.value}" in ${params.ref}...` }],
      });

      try {
        const result = await selectOption(pi.exec, signal, params.ref, params.value);

        if (result.status === "error") {
          return { content: [{ type: "text", text: `Select option failed: ${result.error}` }] };
        }

        return {
          content: [{ type: "text", text: `Selected "${params.value}" in ${params.ref}. Call phone_capture_ui to verify.` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `phone_select_option failed: ${err.message}` }] };
      }
    },
  };
}
