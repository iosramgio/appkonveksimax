import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode']
  },
  assetsInclude: ['**/*.glb', '**/*.ico'],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        //target: 'http://localhost:5000',
        target: 'https://appkonveksimax.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
