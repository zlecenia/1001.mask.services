import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, 'public'),
  server: {
    port: 3001,
    open: '/standalone.html',
    fs: {
      strict: true,
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '..')
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes('-')
        }
      }
    })
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'standalone.html')
      }
    }
  }
});
