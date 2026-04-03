import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API so the SPA can use same-origin `/api/*` (cookies work). Backend has no /api prefix.
const apiProxy = {
  '/api': {
    target: 'http://localhost:5002',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

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