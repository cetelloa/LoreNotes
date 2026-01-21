import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: true // Allow ngrok and other tunnels
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core in its own chunk
          'react-vendor': ['react', 'react-dom'],
          // Router in its own chunk
          'router': ['react-router-dom'],
          // Animation library (large) in its own chunk
          'animation': ['framer-motion'],
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600
  }
})

