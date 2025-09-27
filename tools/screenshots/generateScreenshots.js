#!/usr/bin/env node

// tools/screenshots/generateScreenshots.js
// Generates screenshots for all components and updates their README files

import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ComponentScreenshotGenerator {
  constructor(options = {}) {
    this.featuresDir = path.resolve(options.featuresDir || './js/features');
    this.port = options.port || 4000;
    this.browser = null;
    this.server = null;
    this.app = null;
    this.results = [];
  }

  async run() {
    console.log(chalk.blue('📸 Component Screenshot Generator\n'));
    
    try {
      // Start server
      await this.startServer();
      
      // Launch browser
      await this.launchBrowser();
      
      // Find all components
      const components = await this.findComponents();
      console.log(chalk.gray(`Found ${components.length} components\n`));
      
      // Process each component
      for (const component of components) {
        await this.processComponent(component);
      }
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error(chalk.red('Error:', error));
    } finally {
      await this.cleanup();
    }
  }

  async startServer() {
    console.log(chalk.gray('Starting preview server...'));
    
    this.app = express();
    
    // Serve static files
    this.app.use(express.static(path.resolve('.')));
    
    // Serve component preview pages
    this.app.get('/preview/:component/:version', async (req, res) => {
      const { component, version } = req.params;
      const html = await this.generatePreviewHTML(component, version);
      res.send(html);
    });
    
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(chalk.green(`✓ Server running on port ${this.port}\n`));
        resolve();
      });
    });
  }

  async launchBrowser() {
    console.log(chalk.gray('Launching browser...'));
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1280,
        height: 400, // 7.9" display height
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log(chalk.green('✓ Browser launched\n'));
  }

  async findComponents() {
    try {
      const dirs = await glob(`${this.featuresDir}/*/`);
      
      const components = [];
      for (const dir of dirs) {
        const componentName = path.basename(dir);
        // Find version directories
        const versionDirs = fs.readdirSync(dir)
          .filter(v => /^\d+\.\d+\.\d+$/.test(v));
        
        versionDirs.forEach(version => {
          components.push({
            name: componentName,
            version: version,
            path: path.join(dir, version)
          });
        });
      }
      
      return components;
    } catch (error) {
      throw error;
    }
  }

  async processComponent(component) {
    console.log(chalk.yellow(`\n📷 Processing ${component.name} v${component.version}...`));
    
    try {
      // Check if component has required files
      const indexPath = path.join(component.path, 'index.js');
      const componentPath = path.join(component.path, `${component.name}.js`);
      
      if (!fs.existsSync(indexPath) || !fs.existsSync(componentPath)) {
        console.log(chalk.gray('  ⚠ Missing required files, skipping...'));
        return;
      }
      
      // Generate standalone HTML if it doesn't exist
      const standalonePath = path.join(component.path, 'standalone.html');
      if (!fs.existsSync(standalonePath)) {
        await this.generateStandaloneHTML(component);
      }
      
      // Take screenshot
      const screenshotResult = await this.takeScreenshot(component);
      const screenshotPath = typeof screenshotResult === 'string' ? screenshotResult : screenshotResult.path;
      const warnings = screenshotResult.warnings || [];
      
      // Update README
      await this.updateReadme(component, screenshotPath);
      
      // Record result
      const result = {
        component: component.name,
        version: component.version,
        screenshot: screenshotPath,
        status: warnings.length > 0 ? 'warning' : 'success'
      };
      
      if (warnings.length > 0) {
        result.warnings = warnings;
      }
      
      this.results.push(result);
      
      if (warnings.length > 0) {
        console.log(chalk.yellow(`  ⚠ Screenshot saved with warnings: ${component.name}.png`));
      } else {
        console.log(chalk.green(`  ✓ Screenshot saved: ${component.name}.png`));
      }
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Failed: ${error.message}`));
      
      this.results.push({
        component: component.name,
        version: component.version,
        error: error.message,
        status: 'failed'
      });
    }
  }

  async generatePreviewHTML(componentName, version) {
    const componentPath = `/js/features/${componentName}/${version}`;
    
    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1280, height=400">
    <title>${componentName} - Preview</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/vuex@4/dist/vuex.global.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 1280px;
            height: 400px;
            background: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        
        #app {
            width: 100%;
            height: 100%;
            background: #2c3e50;
        }
        
        /* Component-specific styles */
        .app-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: 30px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 16px;
            font-size: 12px;
        }
        
        .app-header {
            position: fixed;
            top: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            font-size: 14px;
        }
        
        .main-menu {
            width: 180px;
            height: 100%;
            background: #34495e;
            color: white;
            padding: 10px;
        }
        
        .main-menu-item {
            padding: 10px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .main-menu-item:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .login-form {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        }
        
        .pressure-panel {
            width: 120px;
            height: 100%;
            background: #2c3e50;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .pressure-gauge {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .page-template {
            display: grid;
            grid-template-rows: 40px 1fr 30px;
            grid-template-columns: 180px 1fr 120px;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        const { createApp } = Vue;
        const { createStore } = Vuex;
        
        // Mock store
        const store = createStore({
          state: {
            auth: {
              isAuthenticated: true,
              currentUser: { name: 'Test User', role: 'OPERATOR' }
            },
            system: {
              deviceStatus: 'ONLINE',
              language: 'pl'
            },
            navigation: {
              currentRoute: '/dashboard'
            },
            sensors: {
              pressure1: { value: 5.2, status: 'normal' },
              pressure2: { value: 2.1, status: 'normal' },
              pressure3: { value: 450, status: 'normal' }
            }
          }
        });
        
        // Load component
        import('${componentPath}/index.js').then(async (module) => {
            const Component = module.default;
            
            // Initialize component
            if (Component.init) {
                await Component.init({ store });
            }
            
            // Create app
            const app = createApp({
                components: {
                    '${componentName}': Component.component
                },
                template: '<${componentName} />'
            });
            
            app.use(store);
            app.mount('#app');
        }).catch(error => {
            console.error('Failed to load component:', error);
            document.getElementById('app').innerHTML = 
                '<div style="color: red; padding: 20px;">Failed to load component: ' + error.message + '</div>';
        });
    </script>
</body>
</html>`;
  }

  async generateStandaloneHTML(component) {
    const html = await this.generatePreviewHTML(component.name, component.version);
    const standalonePath = path.join(component.path, 'standalone.html');
    await fs.writeFile(standalonePath, html);
    console.log(chalk.gray('  Generated standalone.html'));
  }

  async takeScreenshot(component) {
    const page = await this.browser.newPage();
    
    try {
      // Navigate to component preview
      const url = `http://localhost:${this.port}/preview/${component.name}/${component.version}`;
      
      // Enhanced error detection
      const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      // Listen for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Listen for page errors
      const pageErrors = [];
      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });
      
      // Wait for component to render
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 8000 });
      
      // Check for Vue app mount
      const hasVueApp = await page.evaluate(() => {
        return document.querySelector('#app') !== null;
      });
      
      if (!hasVueApp) {
        throw new Error('Vue app container not found');
      }
      
      // Wait for Vue to mount and render
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if component actually rendered
      const hasContent = await page.evaluate(() => {
        const app = document.querySelector('#app');
        return app && app.children.length > 0;
      });
      
      if (!hasContent) {
        console.log(chalk.yellow(`    ⚠ Component may not have rendered properly`));
        if (consoleErrors.length > 0) {
          console.log(chalk.red(`    Console errors: ${consoleErrors.join(', ')}`));
        }
        if (pageErrors.length > 0) {
          console.log(chalk.red(`    Page errors: ${pageErrors.join(', ')}`));
        }
      }
      
      // Take screenshot
      const screenshotPath = path.join(component.path, `${component.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 400 }
      });
      
      // Add error info to result if any
      if (consoleErrors.length > 0 || pageErrors.length > 0) {
        return { 
          path: screenshotPath, 
          warnings: [...consoleErrors, ...pageErrors] 
        };
      }
      
      return screenshotPath;
      
    } finally {
      await page.close();
    }
  }

  async updateReadme(component, screenshotPath) {
    const readmePath = path.join(component.path, 'README.md');
    
    // Generate screenshot link
    const screenshotLink = `![${component.name} Screenshot](./${component.name}.png)`;
    
    if (fs.existsSync(readmePath)) {
      // Read existing README
      let content = await fs.readFile(readmePath, 'utf8');
      
      // Check if screenshot link already exists
      if (content.includes('![') && content.includes('.png')) {
        // Update existing screenshot link
        content = content.replace(/!\[.*?\]\(.*?\.png\)/g, screenshotLink);
      } else {
        // Add screenshot link at the beginning
        const lines = content.split('\n');
        lines.splice(0, 0, screenshotLink, '');
        content = lines.join('\n');
      }
      
      await fs.writeFile(readmePath, content);
      
    } else {
      // Create new README with screenshot
      const content = `${screenshotLink}

# ${component.name}

Version: ${component.version}

## Overview
Component for MASKSERVICE C20 system.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
import ${component.name} from './${component.name}/index.js';
\`\`\`
`;
      
      await fs.writeFile(readmePath, content);
    }
    
    console.log(chalk.gray('  Updated README.md'));
  }

  async generateReport() {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('SCREENSHOT GENERATION REPORT'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    const successful = this.results.filter(r => r.status === 'success');
    const warnings = this.results.filter(r => r.status === 'warning');
    const failed = this.results.filter(r => r.status === 'failed');
    
    if (successful.length > 0) {
      console.log(chalk.green(`✓ Successfully generated ${successful.length} screenshots:`));
      successful.forEach(r => {
        console.log(chalk.gray(`  - ${r.component} v${r.version}`));
      });
    }
    
    if (warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠ Generated ${warnings.length} screenshots with warnings:`));
      warnings.forEach(r => {
        console.log(chalk.gray(`  - ${r.component} v${r.version}`));
        if (r.warnings) {
          r.warnings.forEach(w => {
            console.log(chalk.red(`    • ${w}`));
          });
        }
      });
    }
    
    if (failed.length > 0) {
      console.log(chalk.red(`\n✗ Failed to generate ${failed.length} screenshots:`));
      failed.forEach(r => {
        console.log(chalk.gray(`  - ${r.component} v${r.version}: ${r.error}`));
      });
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      successful: successful.length,
      failed: failed.length,
      results: this.results
    };
    
    await fs.writeJson('./screenshot-report.json', report, { spaces: 2 });
    console.log(chalk.cyan('\n📊 Report saved to screenshot-report.json'));
  }

  async cleanup() {
    console.log(chalk.gray('\nCleaning up...'));
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log(chalk.green('✓ Done!\n'));
  }
}

// Package.json additions
const packageJsonAdditions = {
  "scripts": {
    "screenshots": "node tools/screenshots/generateScreenshots.js",
    "screenshots:component": "node tools/screenshots/generateScreenshots.js --component",
    "screenshots:update": "npm run screenshots && git add js/features/**/*.png"
  },
  "devDependencies": {
    "puppeteer": "^21.0.0"
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ComponentScreenshotGenerator();
  generator.run().catch(console.error);
}

// Export for use in other scripts
export default ComponentScreenshotGenerator;

console.log(chalk.cyan('\n📝 Add these scripts to package.json:\n'));
console.log(JSON.stringify(packageJsonAdditions, null, 2));