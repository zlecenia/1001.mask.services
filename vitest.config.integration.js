import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './js'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  test: {
    name: 'integration',
    include: ['tests/integration/**/*.test.js'],
    environment: 'happy-dom',
    setupFiles: ['tests/setup/integration-setup.js'],
    globals: true,
    testTimeout: 30000, // Longer timeout for integration tests
    hookTimeout: 10000,
    teardownTimeout: 5000,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['js/features/**/*.js'],
      exclude: [
        'tests/**',
        '**/*.test.js',
        '**/*.spec.js',
        'node_modules/**'
      ]
    }
  }
});
