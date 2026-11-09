import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 1999, allowedHosts: ['raspdashboard.orchestro.co.in'], strictPort: true, proxy: { '/api': 'http://localhost:1998' } },
  preview: { port: 1999, allowedHosts: ['raspdashboard.orchestro.co.in'], strictPort: true, proxy: { '/api': 'http://localhost:1998' } },
})
