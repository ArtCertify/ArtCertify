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
  // Configurazione per SPA routing  
  server: {
    // Fallback a index.html per tutte le rotte non trovate (sviluppo)
    // Vite gestisce automaticamente le SPA
  },
  build: {
    // Rollup options per il build di produzione
    rollupOptions: {
      // Nessuna configurazione speciale necessaria per il routing
      external: ['vm-browserify']
    },
    // Riduci i warning durante il build
    chunkSizeWarningLimit: 1000,
    // Riduci i warning di eval
    target: 'esnext',
    minify: 'esbuild'
  },
  // Riduci i warning in console
  logLevel: 'warn'
})
