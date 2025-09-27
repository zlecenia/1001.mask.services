#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import glob from 'glob';
import { execSync } from 'child_process';

class ModuleInitializer {
  constructor() {
    this.modulesDir = process.env.MODULES_DIR || './modules';
    this.configsDir = process.env.CONFIGS_DIR || './configs';
    this.errors = [];
    this.initialized = [];
    this.skipped = [];
  }

  async initAll() {
    console.log(chalk.blue('🚀 Initializing all modules...\n'));
    
    // Find all module directories
    const modules = await this.findModules();
    console.log(chalk.gray(`Found ${modules.length} modules\n`));
    
    if (modules.length === 0) {
      console.log(chalk.yellow('No modules found. Use "npm run module:init" to create your first module.'));
      return;
    }
    
    // Initialize each module
    for (const modulePath of modules) {
      await this.initModule(modulePath);
    }
    
    // Generate schemas and CRUD
    if (this.initialized.length > 0) {
      console.log(chalk.blue('\n📝 Generating schemas and CRUD rules...'));
      await this.generateConfigs();
    }
    
    // Summary
    this.printSummary();
  }

  async findModules() {
    return new Promise((resolve, reject) => {
      const pattern = path.join(this.modulesDir, '*').replace(/\\/g, '/');
      glob(pattern, (err, dirs) => {
        if (err) reject(err);
        resolve(dirs.filter(dir => {
          try {
            return fs.statSync(dir).isDirectory();
          } catch {
            return false;
          }
        }));
      });
    });
  }

  async initModule(modulePath) {
    const moduleName = path.basename(modulePath);
    console.log(chalk.yellow(`\n→ Initializing ${moduleName}...`));
    
    try {
      // Check for version directories
      const versions = await fs.readdir(modulePath);
      const validVersions = versions.filter(v => /^\d+\.\d+\.\d+$/.test(v));
      
      if (validVersions.length === 0) {
        throw new Error('No valid version directory found (expected format: x.y.z)');
      }
      
      // Get latest version
      const latestVersion = validVersions
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
      
      const versionPath = path.join(modulePath, latestVersion);
      
      // Check for config.json
      const configPath = path.join(versionPath, 'config.json');
      if (!await fs.pathExists(configPath)) {
        throw new Error('config.json not found');
      }
      
      // Check if already initialized
      if (await this.isAlreadyInitialized(moduleName, latestVersion)) {
        console.log(chalk.gray(`  Already initialized, skipping...`));
        this.skipped.push({ name: moduleName, version: latestVersion });
        return;
      }
      
      // Process config
      await this.processConfig(moduleName, latestVersion, configPath);
      
      console.log(chalk.green(`✓ ${moduleName} v${latestVersion} initialized`));
      this.initialized.push({ name: moduleName, version: latestVersion });
      
    } catch (error) {
      console.log(chalk.red(`✗ Failed: ${error.message}`));
      this.errors.push({ module: moduleName, error: error.message });
    }
  }

  async isAlreadyInitialized(moduleName, version) {
    // Check if config directories exist and have schemas
    const configDirs = await this.getModuleConfigDirs(moduleName);
    
    for (const configDir of configDirs) {
      const schemaPath = path.join(configDir, 'schema.json');
      const crudPath = path.join(configDir, 'crud.json');
      
      if (!await fs.pathExists(schemaPath) || !await fs.pathExists(crudPath)) {
        return false;
      }
    }
    
    return configDirs.length > 0;
  }

  async getModuleConfigDirs(moduleName) {
    if (!await fs.pathExists(this.configsDir)) {
      return [];
    }
    
    const dirs = await fs.readdir(this.configsDir);
    return dirs
      .filter(dir => dir.startsWith(`${moduleName}_`) && !dir.startsWith('_'))
      .map(dir => path.join(this.configsDir, dir))
      .filter(async dirPath => {
        try {
          return (await fs.stat(dirPath)).isDirectory();
        } catch {
          return false;
        }
      });
  }

  async processConfig(moduleName, version, configPath) {
    const config = await fs.readJson(configPath);
    
    // Create config directories for each section
    for (const [section, data] of Object.entries(config)) {
      if (section === 'component') continue; // Skip metadata
      
      const sectionDir = path.join(this.configsDir, `${moduleName}_${section}`);
      await fs.ensureDir(sectionDir);
      
      // Create data.json if doesn't exist
      const dataPath = path.join(sectionDir, 'data.json');
      if (!await fs.pathExists(dataPath)) {
        await fs.writeJson(dataPath, data, { spaces: 2 });
        console.log(chalk.gray(`  Created ${moduleName}_${section}/data.json`));
      } else {
        // Update existing data if needed
        const existingData = await fs.readJson(dataPath);
        const merged = this.mergeConfigs(existingData, data);
        if (JSON.stringify(merged) !== JSON.stringify(existingData)) {
          await fs.writeJson(dataPath, merged, { spaces: 2 });
          console.log(chalk.gray(`  Updated ${moduleName}_${section}/data.json`));
        }
      }
      
      // Mark for schema generation
      const markerPath = path.join(sectionDir, '.needs-generation');
      await fs.writeFile(markerPath, version);
    }
  }

  mergeConfigs(existing, newData) {
    // Simple merge strategy - preserve existing values, add new ones
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

  async generateConfigs() {
    try {
      console.log(chalk.gray('  Generating schemas...'));
      execSync('npm run schema:generate', { stdio: 'pipe' });
      
      console.log(chalk.gray('  Generating CRUD rules...'));
      execSync('npm run crud:generate', { stdio: 'pipe' });
      
      console.log(chalk.green('✓ Configuration generation completed'));
    } catch (error) {
      console.error(chalk.red('Failed to generate configs:', error.message));
      this.errors.push({ module: 'config-generation', error: error.message });
    }
  }

  printSummary() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('MODULE INITIALIZATION SUMMARY'));
    console.log(chalk.blue('='.repeat(60) + '\n'));
    
    // Initialized modules
    if (this.initialized.length > 0) {
      console.log(chalk.green(`✓ Successfully initialized ${this.initialized.length} modules:`));
      this.initialized.forEach(m => {
        console.log(chalk.gray(`  - ${m.name} v${m.version}`));
      });
    }
    
    // Skipped modules
    if (this.skipped.length > 0) {
      console.log(chalk.yellow(`\n⚠ Skipped ${this.skipped.length} already initialized modules:`));
      this.skipped.forEach(m => {
        console.log(chalk.gray(`  - ${m.name} v${m.version}`));
      });
    }
    
    // Failed modules
    if (this.errors.length > 0) {
      console.log(chalk.red(`\n✗ Failed to initialize ${this.errors.length} modules:`));
      this.errors.forEach(e => {
        console.log(chalk.gray(`  - ${e.module}: ${e.error}`));
      });
    }
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
    
    // Next steps
    if (this.initialized.length > 0 || this.skipped.length > 0) {
      console.log(chalk.cyan('\nNext steps:'));
      console.log(chalk.gray('1. Review generated schemas in ./configs/'));
      console.log(chalk.gray('2. Manually edit CRUD rules if needed'));
      console.log(chalk.gray('3. Run "npm run validate-all" to verify'));
      console.log(chalk.gray('4. Run "npm run sdk:generate" to create SDKs'));
      console.log(chalk.gray('5. Start implementing your modules\n'));
    } else if (this.errors.length > 0) {
      console.log(chalk.cyan('\nTroubleshooting:'));
      console.log(chalk.gray('1. Check module directory structure'));
      console.log(chalk.gray('2. Ensure config.json files are valid'));
      console.log(chalk.gray('3. Verify version directories follow x.y.z format'));
      console.log(chalk.gray('4. Run "npm run module:init" to create new modules\n'));
    } else {
      console.log(chalk.cyan('\nGetting started:'));
      console.log(chalk.gray('1. Run "npm run module:init" to create your first module'));
      console.log(chalk.gray('2. Follow the interactive prompts'));
      console.log(chalk.gray('3. Run "npm run init" again to initialize\n'));
    }
  }

  async validateEnvironment() {
    const issues = [];
    
    // Check if modules directory exists
    if (!await fs.pathExists(this.modulesDir)) {
      issues.push(`Modules directory not found: ${this.modulesDir}`);
    }
    
    // Check if configs directory exists
    if (!await fs.pathExists(this.configsDir)) {
      await fs.ensureDir(this.configsDir);
      console.log(chalk.gray(`Created configs directory: ${this.configsDir}`));
    }
    
    // Check for required npm scripts
    const packageJsonPath = './package.json';
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const requiredScripts = ['schema:generate', 'crud:generate'];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          issues.push(`Missing npm script: ${script}`);
        }
      }
    }
    
    if (issues.length > 0) {
      console.log(chalk.yellow('\n⚠ Environment issues detected:'));
      issues.forEach(issue => {
        console.log(chalk.gray(`  - ${issue}`));
      });
      console.log('');
    }
    
    return issues.length === 0;
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const initializer = new ModuleInitializer();
  
  initializer.validateEnvironment()
    .then(isValid => {
      if (isValid) {
        return initializer.initAll();
      } else {
        console.log(chalk.red('Environment validation failed. Please fix the issues above.'));
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red('Initialization failed:', error.message));
      process.exit(1);
    });
}

export default ModuleInitializer;
