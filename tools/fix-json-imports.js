#!/usr/bin/env node

/**
 * Automatic JSON Import Fixer for MASKSERVICE Components
 * Fixes ES6 import statements for config.json files across all components
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JsonImportFixer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.componentsDir = path.join(this.projectRoot, 'js/features');
    this.fixedComponents = [];
    this.errors = [];
  }

  async run() {
    console.log(chalk.blue('🔧 Starting JSON Import Fixer for MASKSERVICE Components'));
    console.log(chalk.yellow(`📁 Components directory: ${this.componentsDir}`));
    
    try {
      const components = await this.findComponents();
      console.log(chalk.green(`📦 Found ${components.length} components to check`));
      
      for (const component of components) {
        await this.fixComponent(component);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.red('❌ Fatal error:'), error);
      process.exit(1);
    }
  }

  async findComponents() {
    const components = [];
    const features = await fs.readdir(this.componentsDir);
    
    for (const feature of features) {
      const featurePath = path.join(this.componentsDir, feature);
      const stat = await fs.stat(featurePath);
      
      if (stat.isDirectory()) {
        const versions = await fs.readdir(featurePath);
        
        for (const version of versions) {
          const versionPath = path.join(featurePath, version);
          const indexPath = path.join(versionPath, 'index.js');
          
          if (await fs.pathExists(indexPath)) {
            components.push({
              name: feature,
              version: version,
              path: versionPath,
              indexPath: indexPath
            });
          }
        }
      }
    }
    
    return components;
  }

  async fixComponent(component) {
    console.log(chalk.cyan(`\n🔍 Checking ${component.name}@${component.version}...`));
    
    try {
      const indexContent = await fs.readFile(component.indexPath, 'utf8');
      
      // Check if component has problematic JSON import
      const hasJsonImport = /import\s+.*\s+from\s+['"]\.\/config\/config\.json['"];?/m.test(indexContent);
      
      if (!hasJsonImport) {
        console.log(chalk.gray(`  ⏭️  No JSON import found, skipping`));
        return;
      }
      
      console.log(chalk.yellow(`  🔧 Found JSON import, fixing...`));
      
      // Create backup
      const backupPath = component.indexPath + '.backup';
      await fs.copy(component.indexPath, backupPath);
      console.log(chalk.gray(`  💾 Backup created: ${path.basename(backupPath)}`));
      
      // Apply fixes
      let fixedContent = this.applyFixes(indexContent, component.name);
      
      // Write fixed content
      await fs.writeFile(component.indexPath, fixedContent, 'utf8');
      
      console.log(chalk.green(`  ✅ Fixed ${component.name}@${component.version}`));
      this.fixedComponents.push(component);
      
    } catch (error) {
      console.error(chalk.red(`  ❌ Error fixing ${component.name}:`, error.message));
      this.errors.push({ component: component.name, error: error.message });
    }
  }

  applyFixes(content, componentName) {
    console.log(chalk.gray(`    🔄 Applying fixes for ${componentName}...`));
    
    // Step 1: Remove JSON import line
    content = content.replace(/import\s+.*\s+from\s+['"]\.\/config\/config\.json['"];?\s*\n?/m, '');
    
    // Step 2: Add ConfigLoader import after the first import
    const firstImportMatch = content.match(/^import\s+.*$/m);
    if (firstImportMatch) {
      const firstImportLine = firstImportMatch[0];
      const configLoaderImport = `import { ConfigLoader } from '../../../shared/configLoader.js';`;
      
      // Check if ConfigLoader import already exists
      if (!content.includes('ConfigLoader')) {
        content = content.replace(firstImportLine, `${firstImportLine}\n${configLoaderImport}`);
        console.log(chalk.gray(`    ➕ Added ConfigLoader import`));
      }
    }
    
    // Step 3: Add config property to component object
    if (!content.includes('config: null')) {
      content = content.replace(
        /component:\s*\w+Component,/,
        `component: ${componentName}Component,\n  config: null,`
      );
      console.log(chalk.gray(`    ➕ Added config property`));
    }
    
    // Step 4: Add loadConfig method
    const loadConfigMethod = `
  async loadConfig() {
    const result = await ConfigLoader.loadConfig('./config/config.json', '${componentName}');
    this.config = result.config;
    return result;
  },`;
    
    if (!content.includes('async loadConfig()')) {
      // Find a good place to insert loadConfig method (after component property)
      content = content.replace(
        /(component:\s*\w+Component,\s*\n\s*config:\s*null,)/,
        `$1${loadConfigMethod}`
      );
      console.log(chalk.gray(`    ➕ Added loadConfig method`));
    }
    
    // Step 5: Update init method to use loadConfig
    if (content.includes('async init(')) {
      // Add loadConfig call to init method if not present
      if (!content.includes('await this.loadConfig()')) {
        content = content.replace(
          /(async init\(context = \{\}\) \{[^}]*)/,
          `$1
    
    try {
      // Load configuration
      await this.loadConfig();`
        );
        
        // Also ensure proper return in init method
        content = content.replace(
          /return \{ success: true \};/,
          `return { 
        success: true, 
        metadata: this.metadata,
        config: this.config 
      };`
        );
        
        console.log(chalk.gray(`    🔄 Updated init method`));
      }
    }
    
    return content;
  }

  printSummary() {
    console.log(chalk.blue('\n📊 JSON Import Fixer Summary'));
    console.log(chalk.green(`✅ Fixed components: ${this.fixedComponents.length}`));
    
    if (this.fixedComponents.length > 0) {
      console.log(chalk.gray('   Fixed:'));
      this.fixedComponents.forEach(comp => {
        console.log(chalk.gray(`   - ${comp.name}@${comp.version}`));
      });
    }
    
    if (this.errors.length > 0) {
      console.log(chalk.red(`❌ Errors: ${this.errors.length}`));
      this.errors.forEach(err => {
        console.log(chalk.red(`   - ${err.component}: ${err.error}`));
      });
    }
    
    console.log(chalk.blue('\n🎯 Next steps:'));
    console.log(chalk.yellow('1. Test fixed components with: npm run component:dev:<component-name>'));
    console.log(chalk.yellow('2. Check browser console for any remaining errors'));
    console.log(chalk.yellow('3. Restore from .backup files if needed'));
    
    if (this.fixedComponents.length > 0) {
      console.log(chalk.green('\n🎉 JSON import fixes completed successfully!'));
    }
  }
}

// CLI execution
if (process.argv[1] === __filename) {
  const fixer = new JsonImportFixer();
  fixer.run().catch(console.error);
}

export default JsonImportFixer;
