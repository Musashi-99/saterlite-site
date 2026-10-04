import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: the SatQuery FastAPI backend runs on :8000 (uvicorn app:app).
// Everything the product needs from it is proxied so the browser sees one origin.
const API = process.env.VITE_API_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API,
      '/samples': API,
    },
  },
})
