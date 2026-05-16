import { apiUrl } from "./apiBase";

const AUTH_EVENT = "academy-auth-changed";

function emitAuthChanged() {
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    // ignore
  }
}

export function onAuthChanged(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}

function extractApiFailureMessage(data, res) {
  const parts = [data?.error, data?.message, data?.details]
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter(Boolean);
  if (parts.length) return parts.join(" — ");
  const st = res.statusText ? String(res.statusText).trim() : "";
  if (res.status && st) return `Server returned ${res.status} ${st}. Check API logs and /health (database).`;
  if (res.status) return `Server returned HTTP ${res.status}. Check API logs and /health (database).`;
  return "Request failed.";
}

async function apiFetch(pathname, options) {
  const res = await fetch(apiUrl(pathname), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {}),
    },
  });
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const snippet = text.replace(/\s+/g, " ").trim().slice(0, 180);
      data = { error: snippet ? `Non-JSON response: ${snippet}` : "" };
    }
  }
  if (!res.ok) {
    throw new Error(extractApiFailureMessage(data, res));
  }
  if (!data.ok) {
    throw new Error(extractApiFailureMessage(data, res));
  }
  return data;
}

export async function getCurrentUser() {
  const data = await apiFetch("/auth/me", { method: "GET" });
  return data.user;
}

export async function logout() {
  await apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({}) });
  emitAuthChanged();
}

export async function signup({ name, email, mobile, password }) {
  const data = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, mobile, password }),
  });
  emitAuthChanged();
  return data.user;
}

export async function loginWithEmailPassword({ email, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  emitAuthChanged();
  return data.user;
}

export async function requestPasswordReset({ email }) {
  const data = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data;
}

export async function resetPasswordWithToken({ token, newPassword }) {
  const data = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  return data;
}

