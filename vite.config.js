import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// Dev-only plugin to forward browser console logs to the Vite terminal
function consoleForwardPlugin() {
  return {
    name: 'console-forward-plugin',
    apply: 'serve',
    configureServer(server) {
      // Minimal body parser for JSON
      server.middlewares.use('/__client-logs', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try {
            const payload = JSON.parse(data || '{}');
            const { level = 'log', args = [], userAgent = '', url = '' } = payload;
            const prefix = `client:${level}`;
            const line = `[${prefix}] ${url} ${userAgent}\n` + args.map((a) => {
              try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
            }).join(' ');
            // Print to server console with appropriate level
            const logger = (console[level] || console.log).bind(console);
            logger(line);
          } catch (e) {
            console.warn('[client:log] Failed to parse client log payload', e);
          }
          res.statusCode = 204;
          res.end();
        });
      });
    },
    transformIndexHtml(html) {
      // Inject a script to hook console methods and forward to /__client-logs
      const clientScript = `
        <script>
          (function(){
            if (window.__consoleForwardInstalled) return; 
            window.__consoleForwardInstalled = true;
            var orig = {
              log: console.log.bind(console),
              info: console.info.bind(console),
              warn: console.warn.bind(console),
              error: console.error.bind(console),
              debug: console.debug ? console.debug.bind(console) : console.log.bind(console)
            };
            function send(level, args){
              try {
                fetch('/__client-logs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  keepalive: true,
                  body: JSON.stringify({ level: level, args: Array.from(args), userAgent: navigator.userAgent, url: location.href })
                }).catch(function(){});
              } catch (e) {}
            }
            ['log','info','warn','error','debug'].forEach(function(level){
              console[level] = function(){
                try { send(level, arguments); } catch(e){}
                return orig[level].apply(console, arguments);
              };
            });
          })();
        </script>
      `;
      return html.replace('</head>', `${clientScript}\n</head>`);
    }
  };
}

export default defineConfig({
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': resolve(__dirname, './js')
    },
    extensions: ['.js', '.jsx', '.json', '.vue']
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Enable runtime compilation of templates
          isCustomElement: tag => tag.includes('-'),
          whitespace: 'preserve'
        }
      }
    }), 
    consoleForwardPlugin()
  ],
  server: {
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..']
    },
    proxy: {
      // Proxy API requests if needed
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      // Add aliases for commonly used modules
      '@': resolve(__dirname, 'js'),
      'vue': 'vue/dist/vue.esm-bundler.js',
      'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
      'vuex': 'vuex/dist/vuex.esm-browser.js'
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vuex', 'vue-i18n'],
  },
});
