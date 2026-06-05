import { createCaptureTool } from "./capture-tool.ts";
import { createClickTool } from "./click-tool.ts";
import { createSwipeTool } from "./swipe-tool.ts";
import { createTypeTextTool } from "./type-text-tool.ts";
import { createLongPressTool } from "./long-press-tool.ts";
import { createCheckTool } from "./check-tool.ts";
import { createUncheckTool } from "./uncheck-tool.ts";
import { createSelectOptionTool } from "./select-option-tool.ts";
import { createPressKeyTool } from "./press-key-tool.ts";
import { resetForwardingState } from "./adb-bridge.ts";
import { setupHistoryLogger } from "./history-logger.ts";

export default function (pi) {
  pi.registerTool(createCaptureTool(pi));
  pi.registerTool(createClickTool(pi));
  pi.registerTool(createSwipeTool(pi));
  pi.registerTool(createTypeTextTool(pi));
  pi.registerTool(createLongPressTool(pi));
  pi.registerTool(createCheckTool(pi));
  pi.registerTool(createUncheckTool(pi));
  pi.registerTool(createSelectOptionTool(pi));
  pi.registerTool(createPressKeyTool(pi));

  pi.on("session_start", () => {
    resetForwardingState();
  });

  setupHistoryLogger(pi);
}
