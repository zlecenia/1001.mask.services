#!/usr/bin/env node

// tools/screenshots/screenshotComponent.js
// Takes screenshot of a single component

import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class SingleComponentScreenshot {
  constructor() {
    this.featuresDir = path.resolve('./js/features');
    this.port = 4001;
  }

  async run() {
    console.log(chalk.blue('📸 Single Component Screenshot\n'));
    
    // Get component selection
    const component = await this.selectComponent();
    if (!component) return;
    
    // Create server
    const app = express();
    app.use(express.static(path.resolve('.')));
    
    const server = app.listen(this.port, async () => {
      console.log(chalk.gray(`Server on port ${this.port}`));
      
      try {
        // Launch browser
        const browser = await puppeteer.launch({
          headless: false, // Show browser for debugging
          defaultViewport: {
            width: 1280,
            height: 400
          }
        });
        
        // Create preview page
        const page = await browser.newPage();
        
        // Load component
        const url = `file://${component.path}/standalone.html`;
        console.log(chalk.gray(`Loading ${url}...`));
        
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(3000);
        
        // Ask for screenshot
        const { takeScreenshot } = await inquirer.prompt([{
          type: 'confirm',
          name: 'takeScreenshot',
          message: 'Take screenshot now?',
          default: true
        }]);
        
        if (takeScreenshot) {
          const screenshotPath = path.join(component.path, `${component.name}.png`);
          await page.screenshot({ path: screenshotPath });
          console.log(chalk.green(`✓ Screenshot saved: ${screenshotPath}`));
          
          // Update README
          await this.updateReadme(component);
        }
        
        // Keep browser open for inspection
        const { close } = await inquirer.prompt([{
          type: 'confirm',
          name: 'close',
          message: 'Close browser?',
          default: true
        }]);
        
        if (close) {
          await browser.close();
        }
        
      } catch (error) {
        console.error(chalk.red('Error:', error));
      } finally {
        server.close();
      }
    });
  }

  async selectComponent() {
    // Find all components
    const components = [];
    const componentDirs = await fs.readdir(this.featuresDir);
    
    for (const dir of componentDirs) {
      const componentPath = path.join(this.featuresDir, dir);
      const stat = await fs.stat(componentPath);
      
      if (stat.isDirectory()) {
        // Find version directories
        const versionDirs = await fs.readdir(componentPath);
        for (const version of versionDirs) {
          if (/^\d+\.\d+\.\d+$/.test(version)) {
            components.push({
              name: dir,
              version: version,
              path: path.join(componentPath, version),
              display: `${dir} v${version}`
            });
          }
        }
      }
    }
    
    if (components.length === 0) {
      console.log(chalk.red('No components found!'));
      return null;
    }
    
    // Select component
    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Select component:',
      choices: components.map(c => ({
        name: c.display,
        value: c
      }))
    }]);
    
    // Ensure standalone.html exists
    const standalonePath = path.join(selected.path, 'standalone.html');
    if (!fs.existsSync(standalonePath)) {
      console.log(chalk.yellow('Creating standalone.html...'));
      await this.createStandalone(selected);
    }
    
    return selected;
  }

  async createStandalone(component) {
    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1280, height=400">
    <title>${component.name} - Preview</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/vuex@4/dist/vuex.global.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1280px;
            height: 400px;
            background: #2c3e50;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #app { 
            width: 100%; 
            height: 100%;
        }
    </style>
    <link rel="stylesheet" href="../../../css/vue-app.css">
</head>
<body>
    <div id="app"></div>
    <script type="module">
        import Component from './index.js';
        
        const { createApp } = Vue;
        const { createStore } = Vuex;
        
        // Mock store
        const store = createStore({
          state: {
            auth: {
              currentUser: { name: 'Test User', role: 'OPERATOR' },
              isAuthenticated: true
            },
            system: {
              deviceStatus: 'ONLINE',
              language: 'pl'
            },
            sensors: {
              pressure1: { value: 5.2, status: 'normal' },
              pressure2: { value: 2.1, status: 'normal' },
              pressure3: { value: 450, status: 'normal' }
            }
          }
        });
        
        // Initialize and mount
        await Component.init({ store });
        
        const app = createApp({
            components: { 'component': Component.component },
            template: '<component />'
        });
        
        app.use(store);
        app.mount('#app');
    </script>
</body>
</html>`;
    
    await fs.writeFile(path.join(component.path, 'standalone.html'), html);
  }

  async updateReadme(component) {
    const readmePath = path.join(component.path, 'README.md');
    const screenshotLink = `![${component.name} Screenshot](./${component.name}.png)`;
    
    if (await fs.pathExists(readmePath)) {
      let content = await fs.readFile(readmePath, 'utf8');
      
      // Remove old screenshot link if exists
      content = content.replace(/!\[.*?\]\(.*?\.png\)\n*/g, '');
      
      // Add new screenshot link at the beginning
      content = `${screenshotLink}\n\n${content.trim()}`;
      
      await fs.writeFile(readmePath, content);
      console.log(chalk.green('✓ Updated README.md'));
    }
  }
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new SingleComponentScreenshot();
  app.run().catch(console.error);
}

export default SingleComponentScreenshot;

// ============================================
// Makefile additions for easy execution
// ============================================
const makefileAdditions = `
# Screenshots
screenshots:
\tnpm run screenshots

screenshot-component:
\tnode tools/screenshots/screenshotComponent.js

screenshots-all:
\tnode tools/screenshots/generateScreenshots.js
\tgit add js/features/**/*.png js/features/**/README.md
\tgit commit -m "Update component screenshots"

.PHONY: screenshots screenshot-component screenshots-all
`;

console.log(chalk.cyan('\n📝 Add to Makefile:'));
console.log(makefileAdditions);