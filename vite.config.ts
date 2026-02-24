import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import UnpluginFonts from 'unplugin-fonts/vite'

function deferCssPlugin() {
  return {
    name: 'defer-css',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html.replace(
        /<link(\s+[^>]*?href="([^"]+\.css)"[^>]*)>/gi,
        (_full, attrs, href) =>
          `<link${attrs} media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
      )
    },
  }
}

// Remove modulepreload de chunks que só são usados em rotas específicas (lazy)
function removeLazyModulePreload() {
  const LAZY_CHUNKS = ['dnd-kit', 'google-oauth', 'leaflet']
  return {
    name: 'remove-lazy-modulepreload',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="modulepreload" crossorigin href="([^"]+)">\n?/gi,
        (match, href: string) => {
          if (LAZY_CHUNKS.some(chunk => href.includes(`/${chunk}-`))) return ''
          return match
        }
      )
    },
  }
}

export default defineConfig({
  plugins: [
    UnpluginFonts({
      google: {
        families: [
          {
            name: 'Inter',
            styles: 'wght@400;500;600;700',
          },
          {
            name: 'Poppins',
            styles: 'wght@600;700',
          },
        ],
      },
    }),
    react(),
    deferCssPlugin(),
    removeLazyModulePreload(),
    VitePWA({
      registerType: 'prompt',
      scope: '/trip-planner/',
      manifest: {
        name: 'Trip Planner - Japan & Korea',
        short_name: 'Trip Planner',
        description: 'Plan your dream trip to Japan and South Korea',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/trip-planner/',
        scope: '/trip-planner/',
        icons: [
          { src: '/trip-planner/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/trip-planner/index.html',
      },
    })
  ],
  base: '/trip-planner/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor'
          if (id.includes('node_modules/@tanstack/react-query')) return 'react-query'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/@react-oauth/google')) return 'google-oauth'
          if (id.includes('src/GoogleLoginButton')) return 'google-login-button'
          if (id.includes('node_modules/lucide-react')) return 'ui-icons'
          if (id.includes('node_modules/date-fns')) return 'date-fns'
          if (id.includes('node_modules/zod')) return 'zod'
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})