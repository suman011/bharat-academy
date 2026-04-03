/**
 * API helper.
 *
 * Prefer same-origin `/api/*` so Vite's proxy forwards requests to the backend
 * (avoids CORS). Only use a direct backend origin when you explicitly set
 * `VITE_API_BASE`.
 */
const configuredBase = String(import.meta.env.VITE_API_BASE || "")
  .trim()
  .replace(/\/$/, "");

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (configuredBase) return `${configuredBase}${p}`;
  // Default to backend directly so static `dist/` deployments work without relying on proxy.
  return `http://localhost:5002${p}`;
}
