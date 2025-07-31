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
      registerType: 'autoUpdate',
      includeAssets: [
        '/salary-calculator/favicon.svg',
        '/salary-calculator/apple-touch-icon.svg',
        '/salary-calculator/icon.svg',
        '/salary-calculator/pwa-192x192.png',
        '/salary-calculator/pwa-512x512.png'
      ],
      manifest: {
        name: '薪资计算器',
        short_name: '薪资计算',
        description: '智能薪资计算工具，支持加班费计算、历史记录管理和数据可视化',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/salary-calculator/',
        start_url: '/salary-calculator/',
        lang: 'zh-CN',
        categories: ['productivity', 'finance', 'utilities'],
        icons: [
          {
            src: '/salary-calculator/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/salary-calculator/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/salary-calculator/icon.svg',
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
            url: '/salary-calculator/?page=calculator',
            icons: [{ src: '/salary-calculator/pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: '历史记录',
            short_name: '历史',
            description: '查看薪资历史记录',
            url: '/salary-calculator/?page=history',
            icons: [{ src: '/salary-calculator/pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ],
        prefer_related_applications: false
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/salary-calculator/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/salary-calculator\/api\//],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
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
})
