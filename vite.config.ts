import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // The app lives under /app/; the landing page at / must not be controlled by the service worker.
      scope: '/app/',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Parichay — Contact Exchange',
        short_name: 'Parichay',
        description: 'Share only what you choose, phone to phone, with no server in between.',
        theme_color: '#2e6f64',
        background_color: '#eef0ec',
        display: 'standalone',
        id: '/app/',
        scope: '/app/',
        start_url: '/app/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        globIgnores: ['index.html'],
        navigateFallback: '/app/index.html',
        navigateFallbackAllowlist: [/^\/app\//],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
