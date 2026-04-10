/**
 * API helper.
 *
 * - **Vite dev (`npm run dev` in client / repo root):** same-origin `/api/...` so the dev-server proxy
 *   forwards to the backend (see `vite.config.js`). Avoids cross-origin cookie/CORS issues.
 * - **Production build on Express:** same-origin paths (e.g. `/auth/signup`) if `VITE_API_BASE` is unset.
 * - **Split hosting** (SPA on your domain, API on Render): set `VITE_API_BASE=https://….onrender.com`
 *   at **build** time (no trailing slash).
 */
const configuredBase = String(import.meta.env.VITE_API_BASE || "")
  .trim()
  .replace(/\/$/, "");

function isPublicHttpsSite() {
  if (typeof window === "undefined") return false;
  if (window.location.protocol !== "https:") return false;
  const h = window.location.hostname;
  return h !== "localhost" && h !== "127.0.0.1";
}

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const live = isPublicHttpsSite();

  if (configuredBase) {
    // Never use a localhost API base from a real HTTPS production site (misconfigured CI / .env).
    if (live && /localhost|127\.0\.0\.1/i.test(configuredBase)) {
      return p;
    }
    return `${configuredBase}${p}`;
  }

  // Real users on https://yourdomain.com must never hit localhost (broken deploy / old bundle logic).
  if (live) {
    return p;
  }

  if (import.meta.env.DEV) {
    return `/api${p}`;
  }

  if (import.meta.env.PROD) {
    return p;
  }

  return `http://localhost:5002${p}`;
}
