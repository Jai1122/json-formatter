import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  // Prevent Vite from pre-bundling Monaco — it's large and works better unbundled in dev
  optimizeDeps: {
    exclude: ['monaco-editor'],
  },

  // Use relative asset paths so index.html works when loaded from chrome-extension://
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main app page
        main: resolve(__dirname, 'index.html'),
        // Extension service worker (opens app on icon click)
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        // background.js must be at the root — manifest.json references it there
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
})
