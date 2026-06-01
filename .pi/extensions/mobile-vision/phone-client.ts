import { DEFAULT_PORT, CAPTURE_TIMEOUT_MS } from "./config.ts";
import { ensureAdbForward } from "./adb-bridge.ts";

const BASE_URL = `http://localhost:${DEFAULT_PORT}`;

export async function captureUi(execFn, signal) {
  await ensureAdbForward(execFn, signal);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${BASE_URL}/capture`, { signal: controller.signal });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Capture failed (${response.status}): ${body}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function clickElement(execFn, signal, ref) {
  await ensureAdbForward(execFn, signal);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${BASE_URL}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Click failed (${response.status}): ${body}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function swipe(execFn, signal, direction, ref) {
  await ensureAdbForward(execFn, signal);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const body = ref ? { direction, ref } : { direction };
  try {
    const response = await fetch(`${BASE_URL}/swipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Swipe failed (${response.status}): ${text}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function ping() {
  const response = await fetch(`${BASE_URL}/ping`);
  if (!response.ok) {
    throw new Error(`Ping failed (${response.status})`);
  }
  return await response.json();
}
