import { DEFAULT_PORT } from "./config.ts";

let forwardingActive = false;

export async function ensureAdbForward(execFn, signal) {
  if (forwardingActive) return;

  const checkResult = await execFn("adb", ["devices"], { signal, timeout: 5000 });
  if (checkResult.code !== 0) {
    throw new Error("ADB not found. Install Android SDK platform-tools and ensure adb is in PATH.");
  }

  const forwardResult = await execFn(
    "adb",
    ["forward", `tcp:${DEFAULT_PORT}`, `tcp:${DEFAULT_PORT}`],
    { signal, timeout: 5000 }
  );
  if (forwardResult.code !== 0) {
    throw new Error(`ADB forward failed: ${forwardResult.stderr}`);
  }

  forwardingActive = true;
}

export function resetForwardingState() {
  forwardingActive = false;
}
