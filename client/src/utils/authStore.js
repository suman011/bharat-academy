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

async function apiFetch(pathname, options) {
  const res = await fetch(apiUrl(pathname), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Request failed.");
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

