import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const HISTORY_DIR = "agent-history";

let logFilePath: string | null = null;

function appendEntry(type: string, data: Record<string, unknown>) {
  if (!logFilePath) return;
  const entry =
    JSON.stringify({ ts: new Date().toISOString(), type, data }) + "\n";
  appendFileSync(logFilePath, entry, "utf8");
}

function extractContentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => {
        if (c.type === "text") return c.text;
        if (c.type === "thinking") return `[thinking]\n${c.thinking}`;
        return null;
      })
      .filter(Boolean)
      .join("\n");
  }
  return JSON.stringify(content);
}

export function setupHistoryLogger(pi: any) {
  pi.on("session_start", (_event: any, ctx: any) => {
    const dir = join(ctx?.cwd ?? process.cwd(), ".pi", HISTORY_DIR);
    mkdirSync(dir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    logFilePath = join(dir, `${timestamp}.jsonl`);

    appendEntry("session_start", { reason: _event?.reason ?? "" });
  });

  pi.on("before_agent_start", (event: any, _ctx: any) => {
    appendEntry("agent_start", {
      prompt: event?.prompt ?? "",
    });
  });

  pi.on("tool_call", (event: any, _ctx: any) => {
    appendEntry("tool_call", {
      toolName: event.toolName,
      toolCallId: event.toolCallId,
      input: event.input,
    });
  });

  pi.on("tool_result", (event: any, _ctx: any) => {
    const contentText = extractContentText(event.content);
    appendEntry("tool_result", {
      toolName: event.toolName,
      toolCallId: event.toolCallId,
      content: contentText,
      isError: event.isError,
    });
  });

  pi.on("agent_end", (event: any, ctx: any) => {
    const interrupted = ctx?.signal?.aborted ?? false;
    const messages = event?.messages ?? [];
    for (const msg of messages) {
      if (msg.role === "assistant" && msg.content) {
        appendEntry("agent_response", {
          content: extractContentText(msg.content),
        });
      }
    }
    appendEntry("agent_end", { interrupted });
  });

  pi.on("session_shutdown", (_event: any, _ctx: any) => {
    appendEntry("session_shutdown", { reason: _event?.reason ?? "" });
    logFilePath = null;
  });
}
