import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Maths Map',
        short_name: 'Maths Map',
        description: 'See where your child stands in maths — and the next steps to grow. Parent-guided Victorian Curriculum F-10 (2.0) Mathematics check-ins, gap analysis and term tracking.',
        theme_color: '#0e7490',
        background_color: '#f7f5ef',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,woff2}']
      }
    })
  ],
  server: { fs: { allow: ['.'] } },
  build: { outDir: 'dist', sourcemap: false }
});
