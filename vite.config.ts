import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
  const LAZY_CHUNKS = ['recharts', 'dnd-kit', 'google-oauth', 'leaflet']
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
   plugins: [react(), deferCssPlugin(), removeLazyModulePreload()],
   base: '/trip-planner/',
   build: {
      outDir: 'docs',
      rollupOptions: {
         output: {
            manualChunks: (id) => {
               if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
               if (id.includes('node_modules/@tanstack/react-query')) return 'react-query'
               if (id.includes('node_modules/react-router')) return 'router'
               if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'leaflet'
               if (id.includes('node_modules/@dnd-kit')) return 'dnd-kit'
               if (id.includes('node_modules/@react-oauth/google')) return 'google-oauth'
               if (id.includes('node_modules/recharts')) return 'recharts'
               if (id.includes('node_modules/lucide-react')) return 'lucide'
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