import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
   plugins: [react()],
   base: '/trip-planner/',
   build: {
      outDir: 'docs'
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   }
})