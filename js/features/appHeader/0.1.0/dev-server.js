#!/usr/bin/env node
/**
 * Development server for appHeader component
 * Provides hot-reload and standalone preview
 * Usage: npm run serve or node dev-server.js
 */

import { createServer } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDevServer() {
  try {
    const server = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.js'),
      root: __dirname,
      server: {
        port: 3001,
        host: '0.0.0.0',
        open: '/standalone.html',
        cors: true
      },
      optimizeDeps: {
        include: ['vue']
      },
      define: {
        __COMPONENT_NAME__: JSON.stringify('appHeader'),
        __VERSION__: JSON.stringify('0.1.0')
      }
    });

    await server.listen();
    
    console.log('\n🚀 appHeader Dev Server Started');
    console.log('📱 Preview: http://localhost:3001/standalone.html');
    console.log('🔧 Component: appHeader v0.1.0');
    console.log('📦 Target: 7.9" LCD (1280x400px)');
    console.log('\n⚡ Ready for development...\n');
    
  } catch (error) {
    console.error('❌ Failed to start dev server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dev server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down dev server...');
  process.exit(0);
});

startDevServer();
