import { createCaptureTool } from "./capture-tool.ts";
import { createClickTool } from "./click-tool.ts";
import { createSwipeTool } from "./swipe-tool.ts";
import { resetForwardingState } from "./adb-bridge.ts";
import { setupHistoryLogger } from "./history-logger.ts";

export default function (pi) {
  pi.registerTool(createCaptureTool(pi));
  pi.registerTool(createClickTool(pi));
  pi.registerTool(createSwipeTool(pi));

  pi.on("session_start", () => {
    resetForwardingState();
  });

  setupHistoryLogger(pi);
}
