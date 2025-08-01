import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/salary-calculator/' : '/',
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
 
    tsconfigPaths(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.svg', 
        'icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: '薪资计算器',
        short_name: '薪资计算',
        description: '智能薪资计算工具，支持加班费计算、历史记录管理和数据可视化',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: process.env.NODE_ENV === 'production' ? '/salary-calculator/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/salary-calculator/' : '/',
        lang: 'zh-CN',
        categories: ['productivity', 'finance', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: '薪资计算',
            short_name: '计算',
            description: '快速计算薪资',
            url: process.env.NODE_ENV === 'production' ? '/salary-calculator/?page=calculator' : '/?page=calculator',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: '历史记录',
            short_name: '历史',
            description: '查看薪资历史记录',
            url: process.env.NODE_ENV === 'production' ? '/salary-calculator/?page=history' : '/?page=history',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ],
        prefer_related_applications: false
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: process.env.NODE_ENV === 'production' ? '/salary-calculator/index.html' : '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api\//],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // 提高chunk大小警告限制
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手动分割代码块以优化加载性能
        manualChunks: {
          // 将React相关库分离到单独的chunk
          'react-vendor': ['react', 'react-dom'],
          // 将图表库分离
          'chart-vendor': ['recharts'],
          // 将图标库分离
          'icon-vendor': ['lucide-react'],
          // 将状态管理库分离
          'store-vendor': ['zustand']
        }
      }
    }
  }
})
