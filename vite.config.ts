import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Dayvpn',
      short_name: 'Dayvpn',
      description: 'Dayvpn',
      theme_color: '#1C2541',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })
  ],
  // --- بخش پراکسی برای حل مشکل CORS ---
  server: {
    proxy: {
      '/api': {
        target: 'https://host.avalnetwork.top',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/bot/api/v1')
      }
    }
  }
})