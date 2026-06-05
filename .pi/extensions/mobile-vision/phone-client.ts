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

export async function typeText(execFn, signal, ref: string, text: string, clear = true) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/type_text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, text, clear }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Type text failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function longPress(execFn, signal, ref: string, duration = 500) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/long_press`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, duration }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Long press failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function check(execFn, signal, ref: string) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Check failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function uncheck(execFn, signal, ref: string) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/uncheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Uncheck failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function selectOption(execFn, signal, ref: string, value: string) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/select_option`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, value }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Select option failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function pressKey(execFn, signal, key: string) {
  await ensureAdbForward(execFn, signal);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const response = await fetch(`${BASE_URL}/press_key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Press key failed (${response.status}): ${await response.text()}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export async function ping() {
  const response = await fetch(`${BASE_URL}/ping`);
  if (!response.ok) {
    throw new Error(`Ping failed (${response.status})`);
  }
  return await response.json();
}
