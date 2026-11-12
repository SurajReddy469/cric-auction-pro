import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
})

