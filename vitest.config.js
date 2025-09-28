import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    exclude: [
      'node_modules/',
      'js/test-setup.js',
      '**/*.d.ts',
      '**/*.config.*'
    ],
    reporter: ['default', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': '/js',
      '@features': '/js/features',
      '@config': '/config',
      '@css': '/css'
    }
  }
});
