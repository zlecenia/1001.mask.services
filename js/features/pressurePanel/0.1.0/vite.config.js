import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  root: __dirname,
  server: { 
    port: 3001,
    host: '0.0.0.0',
    open: '/standalone.html'
  },
  build: {
    lib: {
      entry: './index.js',
      name: 'PressurePanel',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  define: {
    __COMPONENT_NAME__: JSON.stringify('pressurePanel'),
    __VERSION__: JSON.stringify('0.1.0')
  }
});
