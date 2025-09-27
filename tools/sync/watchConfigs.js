#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { program } from 'commander';
import { execSync } from 'child_process';

class ConfigWatcher {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.modulesDir = options.modulesDir || './modules';
    this.autoGenerate = options.autoGenerate !== false;
    this.autoValidate = options.autoValidate !== false;
    this.debounceMs = options.debounceMs || 1000;
    
    this.watchers = [];
    this.pendingChanges = new Map();
    this.isProcessing = false;
  }

  async startWatching() {
    console.log(chalk.blue('👁️  Starting configuration file watcher...\n'));
    
    // Watch configs directory
    await this.watchConfigsDirectory();
    
    // Watch modules directory
    await this.watchModulesDirectory();
    
    console.log(chalk.green('✓ Watching for configuration changes...'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    // Keep the process alive
    process.on('SIGINT', () => {
      this.stopWatching();
      process.exit(0);
    });
    
    // Prevent the process from exiting
    setInterval(() => {}, 1000);
  }

  async watchConfigsDirectory() {
    if (!await fs.pathExists(this.configsDir)) {
      console.log(chalk.yellow(`Configs directory not found: ${this.configsDir}`));
      return;
    }
    
    const configWatcher = chokidar.watch(`${this.configsDir}/**/data.json`, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });
    
    configWatcher
      .on('change', (filePath) => this.handleConfigChange(filePath, 'modified'))
      .on('add', (filePath) => this.handleConfigChange(filePath, 'added'))
      .on('unlink', (filePath) => this.handleConfigChange(filePath, 'removed'));
    
    this.watchers.push(configWatcher);
    console.log(chalk.gray(`Watching configs: ${this.configsDir}/**/data.json`));
  }

  async watchModulesDirectory() {
    if (!await fs.pathExists(this.modulesDir)) {
      console.log(chalk.yellow(`Modules directory not found: ${this.modulesDir}`));
      return;
    }
    
    const moduleWatcher = chokidar.watch(`${this.modulesDir}/**/config.json`, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });
    
    moduleWatcher
      .on('change', (filePath) => this.handleModuleConfigChange(filePath, 'modified'))
      .on('add', (filePath) => this.handleModuleConfigChange(filePath, 'added'))
      .on('unlink', (filePath) => this.handleModuleConfigChange(filePath, 'removed'));
    
    this.watchers.push(moduleWatcher);
    console.log(chalk.gray(`Watching modules: ${this.modulesDir}/**/config.json`));
  }

  async handleConfigChange(filePath, changeType) {
    const timestamp = new Date().toISOString();
    const relativePath = path.relative(process.cwd(), filePath);
    const configName = path.basename(path.dirname(filePath));
    
    console.log(chalk.yellow(`[${timestamp.split('T')[1].split('.')[0]}] ${relativePath} ${changeType}`));
    
    // Debounce changes
    this.scheduleProcessing(filePath, changeType, 'config');
  }

  async handleModuleConfigChange(filePath, changeType) {
    const timestamp = new Date().toISOString();
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(chalk.cyan(`[${timestamp.split('T')[1].split('.')[0]}] ${relativePath} ${changeType}`));
    
    // Debounce changes
    this.scheduleProcessing(filePath, changeType, 'module');
  }

  scheduleProcessing(filePath, changeType, sourceType) {
    const key = `${filePath}:${changeType}:${sourceType}`;
    
    // Clear existing timeout
    if (this.pendingChanges.has(key)) {
      clearTimeout(this.pendingChanges.get(key).timeout);
    }
    
    // Schedule new processing
    const timeout = setTimeout(() => {
      this.processChange(filePath, changeType, sourceType);
      this.pendingChanges.delete(key);
    }, this.debounceMs);
    
    this.pendingChanges.set(key, {
      filePath,
      changeType,
      sourceType,
      timeout,
      scheduledAt: Date.now()
    });
  }

  async processChange(filePath, changeType, sourceType) {
    if (this.isProcessing) {
      // Re-schedule if already processing
      setTimeout(() => this.processChange(filePath, changeType, sourceType), 500);
      return;
    }
    
    this.isProcessing = true;
    
    try {
      if (sourceType === 'config') {
        await this.processConfigChange(filePath, changeType);
      } else if (sourceType === 'module') {
        await this.processModuleChange(filePath, changeType);
      }
    } catch (error) {
      console.log(chalk.red(`Error processing ${filePath}: ${error.message}`));
    } finally {
      this.isProcessing = false;
    }
  }

  async processConfigChange(filePath, changeType) {
    const configDir = path.dirname(filePath);
    const configName = path.basename(configDir);
    
    console.log(chalk.gray(`  Processing ${configName}...`));
    
    if (changeType === 'removed') {
      console.log(chalk.red(`  Config data removed: ${configName}`));
      return;
    }
    
    try {
      // Validate the JSON file
      await fs.readJson(filePath);
      console.log(chalk.green(`  ✓ Valid JSON`));
      
      // Auto-generate schema if enabled
      if (this.autoGenerate) {
        await this.generateSchema(configDir);
      }
      
      // Auto-validate if enabled
      if (this.autoValidate) {
        await this.validateConfig(configDir);
      }
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Invalid JSON: ${error.message}`));
    }
  }

  async processModuleChange(filePath, changeType) {
    const moduleDir = path.dirname(filePath);
    const versionDir = path.basename(moduleDir);
    const moduleName = path.basename(path.dirname(moduleDir));
    
    console.log(chalk.gray(`  Processing module ${moduleName} v${versionDir}...`));
    
    if (changeType === 'removed') {
      console.log(chalk.red(`  Module config removed: ${moduleName}`));
      return;
    }
    
    try {
      // Validate the JSON file
      const config = await fs.readJson(filePath);
      console.log(chalk.green(`  ✓ Valid JSON`));
      
      // Sync module configuration to configs directory
      await this.syncModuleConfig(moduleName, versionDir, config);
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Invalid JSON: ${error.message}`));
    }
  }

  async generateSchema(configDir) {
    try {
      console.log(chalk.gray(`  Generating schema...`));
      
      const schemaPath = path.join(configDir, 'schema.json');
      
      // Check if schema has manual changes
      if (await fs.pathExists(schemaPath)) {
        const schema = await fs.readJson(schemaPath);
        if (schema._manual) {
          console.log(chalk.yellow(`  ⚠ Schema has manual changes, skipping generation`));
          return;
        }
      }
      
      // Run schema generator
      execSync(`npm run schema:generate -- --dir="${configDir}"`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      console.log(chalk.green(`  ✓ Schema generated`));
      
      // Generate CRUD if schema was generated
      await this.generateCrud(configDir);
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Schema generation failed: ${error.message}`));
    }
  }

  async generateCrud(configDir) {
    try {
      console.log(chalk.gray(`  Generating CRUD rules...`));
      
      const crudPath = path.join(configDir, 'crud.json');
      
      // Check if CRUD has manual changes
      if (await fs.pathExists(crudPath)) {
        const crud = await fs.readJson(crudPath);
        if (crud._manual) {
          console.log(chalk.yellow(`  ⚠ CRUD has manual changes, skipping generation`));
          return;
        }
      }
      
      // Run CRUD generator
      execSync(`npm run crud:generate -- --dir="${configDir}"`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      console.log(chalk.green(`  ✓ CRUD rules generated`));
      
    } catch (error) {
      console.log(chalk.red(`  ✗ CRUD generation failed: ${error.message}`));
    }
  }

  async validateConfig(configDir) {
    try {
      console.log(chalk.gray(`  Validating configuration...`));
      
      // Run config validator
      execSync(`npm run config:validate -- --config="${path.basename(configDir)}"`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      console.log(chalk.green(`  ✓ Configuration valid`));
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Validation failed: ${error.message}`));
    }
  }

  async syncModuleConfig(moduleName, version, config) {
    console.log(chalk.gray(`  Syncing module configuration...`));
    
    try {
      // Process each configuration section
      for (const [section, data] of Object.entries(config)) {
        if (section === 'component') continue; // Skip metadata
        
        const configDir = path.join(this.configsDir, `${moduleName}_${section}`);
        const dataPath = path.join(configDir, 'data.json');
        
        // Ensure directory exists
        await fs.ensureDir(configDir);
        
        // Update or create data.json
        if (await fs.pathExists(dataPath)) {
          const existing = await fs.readJson(dataPath);
          const merged = this.mergeConfigs(existing, data);
          
          if (JSON.stringify(merged) !== JSON.stringify(existing)) {
            await fs.writeJson(dataPath, merged, { spaces: 2 });
            console.log(chalk.green(`  ✓ Updated ${moduleName}_${section}/data.json`));
            
            // Trigger processing for the updated file
            this.scheduleProcessing(dataPath, 'modified', 'config');
          }
        } else {
          await fs.writeJson(dataPath, data, { spaces: 2 });
          console.log(chalk.green(`  ✓ Created ${moduleName}_${section}/data.json`));
          
          // Trigger processing for the new file
          this.scheduleProcessing(dataPath, 'added', 'config');
        }
      }
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Sync failed: ${error.message}`));
    }
  }

  mergeConfigs(existing, newData) {
    const merged = { ...existing };
    
    for (const [key, value] of Object.entries(newData)) {
      if (!(key in merged)) {
        merged[key] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeConfigs(merged[key], value);
      }
    }
    
    return merged;
  }

  stopWatching() {
    console.log(chalk.yellow('\n🛑 Stopping file watcher...'));
    
    // Clear pending timeouts
    for (const [key, change] of this.pendingChanges) {
      clearTimeout(change.timeout);
    }
    this.pendingChanges.clear();
    
    // Close all watchers
    this.watchers.forEach(watcher => {
      watcher.close();
    });
    this.watchers = [];
    
    console.log(chalk.green('✓ File watcher stopped'));
  }

  printStatus() {
    console.log(chalk.blue('\n📊 Watcher Status:'));
    console.log(chalk.gray(`  Active watchers: ${this.watchers.length}`));
    console.log(chalk.gray(`  Pending changes: ${this.pendingChanges.size}`));
    console.log(chalk.gray(`  Auto-generate: ${this.autoGenerate ? 'enabled' : 'disabled'}`));
    console.log(chalk.gray(`  Auto-validate: ${this.autoValidate ? 'enabled' : 'disabled'}`));
    console.log(chalk.gray(`  Debounce: ${this.debounceMs}ms`));
    
    if (this.pendingChanges.size > 0) {
      console.log(chalk.yellow('\n  Pending changes:'));
      for (const [key, change] of this.pendingChanges) {
        const elapsed = Date.now() - change.scheduledAt;
        const remaining = Math.max(0, this.debounceMs - elapsed);
        console.log(chalk.gray(`    ${path.relative(process.cwd(), change.filePath)} (${remaining}ms)`));
      }
    }
    console.log('');
  }
}

// CLI
program
  .name('watch-configs')
  .description('Watch configuration files for changes')
  .option('--configs-dir <path>', 'Configs directory', './configs')
  .option('--modules-dir <path>', 'Modules directory', './modules')
  .option('--no-auto-generate', 'Disable automatic schema/CRUD generation')
  .option('--no-auto-validate', 'Disable automatic validation')
  .option('--debounce <ms>', 'Debounce delay in milliseconds', '1000')
  .action(async (options) => {
    const watcher = new ConfigWatcher({
      configsDir: options.configsDir,
      modulesDir: options.modulesDir,
      autoGenerate: options.autoGenerate,
      autoValidate: options.autoValidate,
      debounceMs: parseInt(options.debounce)
    });
    
    // Handle status requests
    process.on('SIGUSR1', () => {
      watcher.printStatus();
    });
    
    try {
      await watcher.startWatching();
    } catch (error) {
      console.error(chalk.red('Watcher failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default ConfigWatcher;
