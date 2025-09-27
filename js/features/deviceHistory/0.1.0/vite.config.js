import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';

// Environment variables
const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3009;
const host = process.env.HOST || '0.0.0.0';

// https://vitejs.dev/config/
export default defineConfig({
  // Base public path when served in production
  base: isDev ? '/' : '/device-history/',
  
  // Development server configuration
  server: {
    port,
    host,
    open: true,
    cors: true,
    strictPort: true,
    fs: {
      // Allow serving files from the project root
      allow: ['..'],
    },
    proxy: {
      // Proxy API requests to the dev server
      '/api': {
        target: `http://${host}:${port}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // WebSocket proxy
      '/ws': {
        target: `ws://${host}:${port}`,
        ws: true,
        changeOrigin: true
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: isDev,
    minify: !isDev ? 'esbuild' : false,
    cssCodeSplit: true,
    lib: {
      entry: fileURLToPath(new URL('./deviceHistory.js', import.meta.url)),
      name: 'DeviceHistory',
      fileName: (format) => `device-history.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        globals: {
          vue: 'Vue'
        },
        // Configure how chunks are split
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['lodash', 'date-fns', 'axios']
        }
      }
    },
    // Enable/disable brotli compression
    brotliSize: !isDev,
    // Set to false to disable minification
    minify: !isDev ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: !isDev,
        drop_debugger: !isDev
      }
    }
  },
  
  // Plugins
  plugins: [
    vue({
      // Enable Vue 3 features
      reactivityTransform: true,
      // Enable template compilation
      template: {
        compilerOptions: {
          // Treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ],
  
  // Resolve configuration
  resolve: {
    alias: {
      // Create aliases for easier imports
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
      // For backward compatibility with CommonJS modules
      'path': 'path-browserify'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  
  // CSS configuration
  css: {
    // Enable CSS modules
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: isDev 
        ? '[name]__[local]___[hash:base64:5]' 
        : '[hash:base64:5]',
      hashPrefix: 'prefix',
      // Enable CSS modules for all files by default
      auto: true
    },
    // CSS preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      }
    },
    // PostCSS configuration
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-nested'),
        require('postcss-preset-env')({
          stage: 1,
          features: {
            'nesting-rules': true
          }
        })
      ]
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: [],
    // Force dependency pre-bundling in dev mode
    force: isDev
  },
  
  // Environment variables
  define: {
    'process.env': {},
    // Define global constants
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: isDev,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: isDev,
    // App version from package.json
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0')
  },
  
  // Development server logging
  logLevel: isDev ? 'info' : 'warn',
  clearScreen: true,
  
  // Global CSS (applied to all components)
  cssPreprocessOptions: {
    scss: {
      additionalData: `
        @import "@/styles/global.scss";
      `
    }
  },
  
  // Worker options
  worker: {
    format: 'es',
    plugins: []
  },
  
  // Dep optimization options
  json: {
    // Enable named exports for JSON modules
    namedExports: true,
    // Enable stringify for JSON modules
    stringify: false
  },
  
  // Esbuild options
  esbuild: {
    // Minify JS
    minify: !isDev,
    // Keep names for better debugging
    keepNames: isDev,
    // Define global constants
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
    },
    // JSX factory and fragment
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
