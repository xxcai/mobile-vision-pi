import { createCaptureTool } from "./capture-tool.ts";
import { resetForwardingState } from "./adb-bridge.ts";

export default function (pi) {
  pi.registerTool(createCaptureTool(pi));

  pi.on("session_start", () => {
    resetForwardingState();
  });
}
