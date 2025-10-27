import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'RECOOM POS',
        short_name: 'RECOOM POS',
        description: 'Sistema de Punto de Venta para Abarrotes Multi-Sucursal',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icon: 'public/logo.svg',
        start_url: '/',
        scope: '/'
      }
    })
  ],
})
