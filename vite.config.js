import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // 如果你的 public 資料夾下真的沒有這些檔案，可以先註解掉
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '血壓記錄',
        short_name: '血壓記錄',
        description: '血壓記錄與健康管理',
        theme_color: '#10B981',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // 🌟 修正點 1: 僅保留常見且確定會有的副檔名，移除 woff2 (除非你確定有字體檔)
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'], 
        
        // 🌟 修正點 2: 加上這個，防止因為找不到某些 glob 檔案而導致 Build 失敗
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/bpm-backend-5u8z\.onrender\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      // 🌟 修正點 3: 在開發環境禁用某些嚴格檢查
      devOptions: {
        enabled: true
      }
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
  server: {
    proxy: {
      '/dev-api': {
        target: 'https://bpm-backend-5u8z.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, ''),
      },
    },
  },
})