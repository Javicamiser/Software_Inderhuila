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
    // Configuración para que el servidor acepte conexiones externas
    host: true,
  },
  // Indicar que es una SPA para que Vite sirva index.html en rutas no encontradas
  appType: 'spa',
})