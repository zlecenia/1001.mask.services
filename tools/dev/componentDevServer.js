#!/usr/bin/env node

/**
 * Development server for individual components
 * Allows testing components in isolation
 */

import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComponentDevServer {
  constructor(componentPath, options = {}) {
    this.componentPath = path.resolve(componentPath);
    this.componentName = path.basename(path.dirname(componentPath));
    this.version = path.basename(componentPath);
    this.port = options.port || 3001;
    this.app = express();
    this.configData = null;
  }

  async start() {
    console.log(chalk.blue(`🚀 Starting dev server for ${this.componentName}@${this.version}...`));
    
    try {
      // Validate component path
      if (!await this.validateComponent()) {
        throw new Error('Invalid component structure');
      }
      
      // Load component configuration
      await this.loadConfig();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Start server
      this.app.listen(this.port, () => {
        console.log(chalk.green(`✅ Dev server started for ${this.componentName}@${this.version}`));
        console.log(chalk.yellow(`📍 Component: ${this.componentPath}`));
        console.log(chalk.yellow(`🌐 URL: http://localhost:${this.port}`));
        console.log(chalk.yellow(`📊 Config API: http://localhost:${this.port}/api/config`));
        console.log(chalk.yellow(`🔧 Admin: http://localhost:${this.port}/admin`));
        console.log(chalk.blue(`\n🎯 Press Ctrl+C to stop`));
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start dev server:'), error.message);
      process.exit(1);
    }
  }

  async validateComponent() {
    const requiredFiles = [
      'index.js',
      path.join('config', 'config.json')
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.componentPath, file);
      if (!await fs.pathExists(filePath)) {
        console.error(chalk.red(`❌ Missing required file: ${file}`));
        return false;
      }
    }
    
    console.log(chalk.green(`✅ Component structure validated`));
    return true;
  }

  async loadConfig() {
    const configPath = path.join(this.componentPath, 'config', 'config.json');
    const dataPath = path.join(this.componentPath, 'config', 'data.json');
    
    try {
      // Load main config
      const config = await fs.readJson(configPath);
      
      // Load data config if exists
      let data = {};
      if (await fs.pathExists(dataPath)) {
        data = await fs.readJson(dataPath);
      }
      
      this.configData = { config, data };
      console.log(chalk.green(`✅ Configuration loaded`));
      
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
  }

  setupMiddleware() {
    // Request logging
    this.app.use((req, res, next) => {
      console.log(chalk.cyan(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`));
      next();
    });

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
    
    // JSON parsing
    this.app.use(express.json());
    
    // Custom MIME type handling for JavaScript modules
    this.app.use((req, res, next) => {
      if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        console.log(chalk.green(`🔧 [MIME] Setting JS content-type for: ${req.url}`));
      } else if (req.url.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        console.log(chalk.blue(`📋 [MIME] Setting JSON content-type for: ${req.url}`));
      }
      next();
    });
    
    // Static files from component directory
    this.app.use('/component', express.static(this.componentPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      }
    }));
    
    // Static files from project root (for shared assets)
    const projectRoot = path.resolve(this.componentPath, '../../../..');
    this.app.use('/assets', express.static(path.join(projectRoot, 'assets')));
    this.app.use('/js/shared', express.static(path.join(projectRoot, 'js/shared'), {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      }
    }));
    
    // Alias for shared files to support /shared/ paths from components
    this.app.use('/shared', express.static(path.join(projectRoot, 'js/shared'), {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      }
    }));
    
    // Alias for services to support /services/ paths from components
    this.app.use('/services', express.static(path.join(projectRoot, 'js/services'), {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      }
    }));
    
    // Alias for component config files to support /config/ paths  
    this.app.use('/config', express.static(path.join(this.componentPath, 'config'), {
      setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
      }
    }));
    
    console.log(chalk.green('✅ Middleware configured with proper MIME types'));
  }

  setupRoutes() {
    // Main component page
    this.app.get('/', (req, res) => {
      res.send(this.generateComponentHTML());
    });
    
    // Component demo page  
    this.app.get('/demo', (req, res) => {
      res.send(this.generateDemoHTML());
    });
    
    // Admin page for config editing
    this.app.get('/admin', (req, res) => {
      res.send(this.generateAdminHTML());
    });
    
    // API: Get component info
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: this.componentName,
        version: this.version,
        path: this.componentPath,
        url: `http://localhost:${this.port}`,
        endpoints: {
          component: '/',
          demo: '/demo',
          admin: '/admin',
          config: '/api/config',
          data: '/api/data'
        }
      });
    });
    
    // API: Get configuration
    this.app.get('/api/config', (req, res) => {
      res.json(this.configData.config);
    });
    
    // API: Get data configuration
    this.app.get('/api/data', (req, res) => {
      res.json(this.configData.data);
    });
    
    // API: Update data configuration
    this.app.post('/api/data', async (req, res) => {
      try {
        const newData = req.body;
        const dataPath = path.join(this.componentPath, 'config', 'data.json');
        
        // Backup current data
        const backup = { ...this.configData.data };
        
        // Update in memory and file
        this.configData.data = { ...this.configData.data, ...newData };
        await fs.writeJson(dataPath, this.configData.data, { spaces: 2 });
        
        res.json({ 
          success: true, 
          data: this.configData.data,
          backup: backup 
        });
        
        console.log(chalk.yellow(`📝 Data updated for ${this.componentName}`));
        
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });
    
    // API: Reset data to defaults
    this.app.post('/api/reset', async (req, res) => {
      try {
        const configPath = path.join(this.componentPath, 'config', 'config.json');
        const config = await fs.readJson(configPath);
        
        if (config.data) {
          const dataPath = path.join(this.componentPath, 'config', 'data.json');
          await fs.writeJson(dataPath, config.data, { spaces: 2 });
          this.configData.data = config.data;
          
          res.json({ success: true, data: config.data });
          console.log(chalk.yellow(`🔄 Data reset to defaults for ${this.componentName}`));
        } else {
          res.status(400).json({ success: false, error: 'No default data found' });
        }
        
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  generateComponentHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.componentName}@${this.version} - Component Dev Server</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5; 
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .component-wrapper { 
            background: white; padding: 20px; border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 400px;
        }
        .nav { margin: 20px 0; }
        .nav a { 
            display: inline-block; margin-right: 15px; padding: 8px 16px; 
            background: #007bff; color: white; text-decoration: none; border-radius: 4px;
        }
        .nav a:hover { background: #0056b3; }
        #component-container { border: 1px dashed #ddd; padding: 20px; min-height: 200px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    </style>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧩 ${this.componentName}@${this.version}</h1>
            <p>Component Development Server</p>
            <div class="nav">
                <a href="/">Component</a>
                <a href="/demo">Demo</a>
                <a href="/admin">Admin</a>
                <a href="/api/info">API Info</a>
            </div>
        </div>
        
        <div class="component-wrapper">
            <h2>Component Instance</h2>
            <div id="status"></div>
            <div id="component-container">
                <p>Loading component...</p>
            </div>
        </div>
    </div>

    <script type="module">
        import componentModule from '/component/index.js';
        
        async function loadComponent() {
            const statusEl = document.getElementById('status');
            const containerEl = document.getElementById('component-container');
            
            try {
                // Initialize component
                const result = await componentModule.init();
                
                if (result.success) {
                    statusEl.innerHTML = '<div class="status success">✅ Component initialized successfully</div>';
                    
                    // If component has a render method, use it
                    if (componentModule.render) {
                        containerEl.innerHTML = '';
                        componentModule.render(containerEl, {
                            systemInfo: { version: 'v3.0', environment: 'development' },
                            onAction: (action) => console.log('Component action:', action)
                        });
                    } else {
                        // Create Vue app with the component
                        const { createApp } = Vue;
                        
                        const app = createApp({
                            components: {
                                TestComponent: componentModule.component
                            },
                            template: '<TestComponent />'
                        });
                        
                        containerEl.innerHTML = '';
                        app.mount(containerEl);
                    }
                } else {
                    statusEl.innerHTML = '<div class="status error">❌ Component initialization failed</div>';
                }
                
            } catch (error) {
                console.error('Component loading error:', error);
                statusEl.innerHTML = \`<div class="status error">❌ Error: \${error.message}</div>\`;
            }
        }
        
        // Load component when page loads
        loadComponent();
    </script>
</body>
</html>`;
  }

  generateDemoHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.componentName} Demo</title>
    <style>
        body { margin: 0; font-family: system-ui, sans-serif; }
        .demo-container { padding: 20px; }
        .controls { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
        .control-group { margin: 10px 0; }
        label { display: inline-block; width: 120px; font-weight: 500; }
        input, select { padding: 5px 8px; margin-left: 10px; }
        button { 
            background: #007bff; color: white; border: none; padding: 8px 16px; 
            border-radius: 4px; cursor: pointer; margin: 5px;
        }
        button:hover { background: #0056b3; }
        .component-demo { border: 2px solid #dee2e6; border-radius: 8px; padding: 20px; }
        .back-nav { margin-bottom: 20px; }
        .back-nav a { color: #007bff; text-decoration: none; }
    </style>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div class="demo-container">
        <div class="back-nav">
            <a href="/">← Back to Component View</a>
        </div>
        
        <h1>🎮 ${this.componentName} Interactive Demo</h1>
        
        <div class="controls">
            <h3>Demo Controls</h3>
            <div class="control-group">
                <button onclick="refreshComponent()">🔄 Refresh</button>
                <button onclick="loadConfig()">📋 Load Config</button>
                <button onclick="resetData()">🔄 Reset Data</button>
            </div>
        </div>
        
        <div class="component-demo" id="demo-container">
            <p>Loading demo...</p>
        </div>
    </div>

    <script type="module">
        let componentInstance = null;
        
        async function loadComponent() {
            try {
                const componentModule = await import('/component/index.js');
                
                // Get current config
                const configResponse = await fetch('/api/data');
                const configData = await configResponse.json();
                
                // Initialize component
                await componentModule.init({ config: configData });
                componentInstance = componentModule;
                
                // Render in demo container
                const container = document.getElementById('demo-container');
                
                if (componentModule.render) {
                    container.innerHTML = '';
                    componentModule.render(container, {
                        ...configData,
                        onAction: (action) => {
                            console.log('Demo action:', action);
                            showNotification(\`Action: \${action.type || action}\`);
                        }
                    });
                } else if (componentModule.component) {
                    const { createApp } = Vue;
                    const app = createApp({
                        components: { DemoComponent: componentModule.component },
                        data() { return configData; },
                        template: '<DemoComponent v-bind="$data" />'
                    });
                    container.innerHTML = '';
                    app.mount(container);
                }
                
            } catch (error) {
                console.error('Demo error:', error);
                document.getElementById('demo-container').innerHTML = 
                    \`<div style="color: red;">❌ Demo Error: \${error.message}</div>\`;
            }
        }
        
        window.refreshComponent = loadComponent;
        
        window.loadConfig = async () => {
            try {
                const response = await fetch('/api/config');
                const config = await response.json();
                console.log('Full config:', config);
                showNotification('Config loaded - check console');
            } catch (error) {
                console.error('Config load error:', error);
            }
        };
        
        window.resetData = async () => {
            try {
                const response = await fetch('/api/reset', { method: 'POST' });
                const result = await response.json();
                if (result.success) {
                    showNotification('Data reset to defaults');
                    loadComponent();
                } else {
                    showNotification('Reset failed: ' + result.error);
                }
            } catch (error) {
                console.error('Reset error:', error);
            }
        };
        
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = 
                'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; ' +
                'padding: 10px 15px; border-radius: 4px; z-index: 1000; font-size: 14px;';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
        }
        
        // Load demo on page load
        loadComponent();
    </script>
</body>
</html>`;
  }

  generateAdminHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.componentName} Admin</title>
    <style>
        body { margin: 0; font-family: system-ui, sans-serif; background: #f8f9fa; }
        .admin-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .admin-header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .admin-section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .config-editor { font-family: 'Monaco', 'Menlo', monospace; font-size: 14px; }
        textarea { width: 100%; height: 300px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        button.danger { background: #dc3545; }
        button.danger:hover { background: #c82333; }
        button.success { background: #28a745; }
        button.success:hover { background: #218838; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <h1>⚙️ ${this.componentName}@${this.version} Admin</h1>
            <p>Configuration Management Interface</p>
            <a href="/" style="color: #007bff; text-decoration: none;">← Back to Component</a>
        </div>
        
        <div class="admin-section">
            <h2>📋 Current Data Configuration</h2>
            <div class="config-editor">
                <textarea id="config-editor" placeholder="Loading configuration..."></textarea>
                <div style="margin-top: 10px;">
                    <button onclick="saveConfig()" class="success">💾 Save Changes</button>
                    <button onclick="loadConfig()">🔄 Reload</button>
                    <button onclick="resetConfig()" class="danger">🔄 Reset to Defaults</button>
                    <button onclick="validateConfig()">✅ Validate JSON</button>
                </div>
                <div id="config-status"></div>
            </div>
        </div>
        
        <div class="admin-section">
            <h2>🔍 Component Information</h2>
            <div id="component-info">Loading...</div>
        </div>
        
        <div class="admin-section">
            <h2>🎛️ Quick Actions</h2>
            <button onclick="testComponent()">🧪 Test Component</button>
            <button onclick="exportConfig()">📤 Export Config</button>
            <button onclick="viewLogs()">📋 View Logs</button>
        </div>
    </div>

    <script>
        let currentConfig = {};
        
        async function loadConfig() {
            try {
                const response = await fetch('/api/data');
                currentConfig = await response.json();
                document.getElementById('config-editor').value = JSON.stringify(currentConfig, null, 2);
                showStatus('Config loaded successfully', 'success');
            } catch (error) {
                showStatus('Failed to load config: ' + error.message, 'error');
            }
        }
        
        async function saveConfig() {
            try {
                const editorValue = document.getElementById('config-editor').value;
                const newConfig = JSON.parse(editorValue);
                
                const response = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newConfig)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentConfig = result.data;
                    showStatus('Configuration saved successfully! 🎉', 'success');
                } else {
                    showStatus('Save failed: ' + result.error, 'error');
                }
            } catch (error) {
                showStatus('Save error: ' + error.message, 'error');
            }
        }
        
        async function resetConfig() {
            if (confirm('Reset configuration to defaults? This will overwrite current changes.')) {
                try {
                    const response = await fetch('/api/reset', { method: 'POST' });
                    const result = await response.json();
                    
                    if (result.success) {
                        currentConfig = result.data;
                        document.getElementById('config-editor').value = JSON.stringify(currentConfig, null, 2);
                        showStatus('Configuration reset to defaults', 'success');
                    } else {
                        showStatus('Reset failed: ' + result.error, 'error');
                    }
                } catch (error) {
                    showStatus('Reset error: ' + error.message, 'error');
                }
            }
        }
        
        function validateConfig() {
            try {
                const editorValue = document.getElementById('config-editor').value;
                JSON.parse(editorValue);
                showStatus('✅ JSON is valid', 'success');
            } catch (error) {
                showStatus('❌ Invalid JSON: ' + error.message, 'error');
            }
        }
        
        async function loadComponentInfo() {
            try {
                const response = await fetch('/api/info');
                const info = await response.json();
                
                document.getElementById('component-info').innerHTML = \`
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">\${info.name}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Version:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">\${info.version}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Path:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 12px;">\${info.path}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>URL:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="\${info.url}" target="_blank">\${info.url}</a></td></tr>
                    </table>
                \`;
            } catch (error) {
                document.getElementById('component-info').innerHTML = 'Failed to load component info';
            }
        }
        
        function testComponent() {
            window.open('/demo', '_blank');
        }
        
        function exportConfig() {
            const configStr = JSON.stringify(currentConfig, null, 2);
            const blob = new Blob([configStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '${this.componentName}-config-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showStatus('Configuration exported', 'info');
        }
        
        function viewLogs() {
            console.log('Component Config:', currentConfig);
            showStatus('Logs displayed in browser console', 'info');
        }
        
        function showStatus(message, type) {
            const statusEl = document.getElementById('config-status');
            statusEl.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => statusEl.innerHTML = '', 5000);
        }
        
        // Load initial data
        loadConfig();
        loadComponentInfo();
    </script>
</body>
</html>`;
  }
}

// CLI handling
if (process.argv.length >= 3) {
  const componentPath = process.argv[2];
  const port = process.argv[3] ? parseInt(process.argv[3]) : 3001;
  
  const server = new ComponentDevServer(componentPath, { port });
  server.start().catch(console.error);
} else {
  console.log(chalk.red('❌ Usage: node componentDevServer.js <component-path> [port]'));
  console.log(chalk.yellow('Example: node componentDevServer.js js/features/appFooter/0.1.0 3001'));
  process.exit(1);
}

export default ComponentDevServer;
