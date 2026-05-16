import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-table':    ['@tanstack/react-table'],
          'vendor-query':    ['@tanstack/react-query'],
          'vendor-charts':   ['recharts'],
          'vendor-ui':       ['lucide-react', 'clsx', 'react-hot-toast'],
          'vendor-utils':    ['axios', 'date-fns', 'zustand'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
