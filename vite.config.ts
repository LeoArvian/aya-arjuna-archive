import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['AJA.png', 'vite.svg'],

      workbox: {
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // Naikkan limit jadi 25MB
      },
      
      manifest: {
        name: 'Aya & Arjuna Fan Archive',
        short_name: 'AyaArjuna',
        description: 'Official Fan Archive for Aya Aulya & Arjuna Arkana',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'AJA.png', // Pastikan file ini ada di folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'AJA.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  }
})