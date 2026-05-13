import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['couptative-alta-unsecretive.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Seguir redirecciones automáticamente (ej: /vacunas → /vacunas/)
        // preservando todos los headers incluyendo Authorization
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Reenviar el header Authorization en redirecciones
            const auth = req.headers['authorization'];
            if (auth) proxyReq.setHeader('Authorization', auth);
          });
        },
      },
    },
  },
  appType: 'spa',
})