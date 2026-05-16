import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API so the SPA can use same-origin `/api/*` (cookies work). Backend has no /api prefix.
const apiProxy = {
  "/api": {
    target: "http://localhost:5002",
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, ""),
    configure: (proxy) => {
      proxy.on("error", (err, _req, res) => {
        const msg = err?.code === "ECONNREFUSED"
          ? "Cannot connect to API on http://localhost:5002. Start the server (e.g. from repo root: npm run dev, or npm start --prefix server)."
          : String(err?.message || err || "Proxy error");
        try {
          if (res && !res.headersSent && typeof res.writeHead === "function") {
            res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: msg, message: msg }));
          }
        } catch {
          // ignore
        }
      });
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: apiProxy,
  },
  // `vite preview` had no proxy before — `/api` calls failed with "Failed to fetch"
  preview: {
    port: 3000,
    proxy: apiProxy,
  },
})