import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      vm: 'vm-browserify'
    }
  },
  optimizeDeps: {
    include: [
      'buffer',
      'crypto-browserify',
      'stream-browserify', 
      'util',
      'process',
      'vm-browserify'
    ],
    exclude: ['@algorandfoundation/algokit-utils']
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    rollupOptions: {
      external: ['vm-browserify']
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild'
  },
  logLevel: 'info'
})
