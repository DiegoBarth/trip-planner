import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
   plugins: [react()],
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