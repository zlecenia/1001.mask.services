#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class ModuleLister {
  constructor(options = {}) {
    this.modulesDir = options.modulesDir || './modules';
    this.configsDir = options.configsDir || './configs';
    this.showDetails = options.showDetails || false;
    this.showConfigs = options.showConfigs || false;
  }

  async listAll() {
    console.log(chalk.blue('📋 Module Inventory\n'));
    
    if (!await fs.pathExists(this.modulesDir)) {
      console.log(chalk.yellow('No modules directory found.'));
      console.log(chalk.gray('Run "npm run module:init" to create your first module.\n'));
      return;
    }
    
    const modules = await this.findModules();
    
    if (modules.length === 0) {
      console.log(chalk.yellow('No modules found.'));
      console.log(chalk.gray('Run "npm run module:init" to create your first module.\n'));
      return;
    }
    
    console.log(chalk.gray(`Found ${modules.length} modules:\n`));
    
    for (const module of modules) {
      await this.displayModule(module);
    }
    
    this.printSummary(modules);
  }

  async findModules() {
    const dirs = await fs.readdir(this.modulesDir);
    const modules = [];
    
    for (const dir of dirs) {
      const modulePath = path.join(this.modulesDir, dir);
      const stat = await fs.stat(modulePath);
      
      if (stat.isDirectory()) {
        const moduleInfo = await this.getModuleInfo(dir, modulePath);
        if (moduleInfo) {
          modules.push(moduleInfo);
        }
      }
    }
    
    // Sort by name
    return modules.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getModuleInfo(name, modulePath) {
    try {
      // Find versions
      const versions = await fs.readdir(modulePath);
      const validVersions = versions
        .filter(v => /^\d+\.\d+\.\d+$/.test(v))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      
      if (validVersions.length === 0) {
        return null;
      }
      
      const latestVersion = validVersions[0];
      const versionPath = path.join(modulePath, latestVersion);
      
      // Load package.json and config.json
      const packagePath = path.join(versionPath, 'package.json');
      const configPath = path.join(versionPath, 'config.json');
      
      let packageInfo = null;
      let configInfo = null;
      
      if (await fs.pathExists(packagePath)) {
        packageInfo = await fs.readJson(packagePath);
      }
      
      if (await fs.pathExists(configPath)) {
        configInfo = await fs.readJson(configPath);
      }
      
      // Get config status
      const configStatus = await this.getConfigStatus(name);
      
      return {
        name,
        path: modulePath,
        versions: validVersions,
        latestVersion,
        package: packageInfo,
        config: configInfo,
        configStatus,
        files: await this.getModuleFiles(versionPath)
      };
      
    } catch (error) {
      return {
        name,
        path: modulePath,
        error: error.message
      };
    }
  }

  async getModuleFiles(versionPath) {
    const files = [];
    const entries = await fs.readdir(versionPath);
    
    for (const entry of entries) {
      const filePath = path.join(versionPath, entry);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        files.push({
          name: entry,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }
    
    return files;
  }

  async getConfigStatus(moduleName) {
    const status = {
      directories: [],
      hasSchemas: 0,
      hasCrud: 0,
      hasData: 0,
      total: 0
    };
    
    if (!await fs.pathExists(this.configsDir)) {
      return status;
    }
    
    const dirs = await fs.readdir(this.configsDir);
    const moduleConfigDirs = dirs.filter(dir => 
      dir.startsWith(`${moduleName}_`) && !dir.startsWith('_')
    );
    
    status.total = moduleConfigDirs.length;
    
    for (const dir of moduleConfigDirs) {
      const dirPath = path.join(this.configsDir, dir);
      const dirStatus = {
        name: dir,
        hasData: await fs.pathExists(path.join(dirPath, 'data.json')),
        hasSchema: await fs.pathExists(path.join(dirPath, 'schema.json')),
        hasCrud: await fs.pathExists(path.join(dirPath, 'crud.json'))
      };
      
      status.directories.push(dirStatus);
      
      if (dirStatus.hasData) status.hasData++;
      if (dirStatus.hasSchema) status.hasSchemas++;
      if (dirStatus.hasCrud) status.hasCrud++;
    }
    
    return status;
  }

  async displayModule(module) {
    if (module.error) {
      console.log(chalk.red(`✗ ${module.name}: ${module.error}`));
      return;
    }
    
    const component = module.config?.component;
    const displayName = component?.displayName || module.name;
    const type = component?.type || 'unknown';
    const category = component?.category || 'unknown';
    
    // Module header
    console.log(chalk.cyan(`📦 ${displayName} (${module.name})`));
    console.log(chalk.gray(`   Type: ${type} | Category: ${category} | Version: ${module.latestVersion}`));
    
    // Config status
    const status = module.configStatus;
    if (status.total > 0) {
      const completeness = Math.round(
        ((status.hasData + status.hasSchemas + status.hasCrud) / (status.total * 3)) * 100
      );
      console.log(chalk.gray(`   Configs: ${status.total} directories, ${completeness}% complete`));
      
      if (this.showConfigs) {
        status.directories.forEach(dir => {
          const indicators = [
            dir.hasData ? chalk.green('D') : chalk.red('D'),
            dir.hasSchema ? chalk.green('S') : chalk.red('S'),
            dir.hasCrud ? chalk.green('C') : chalk.red('C')
          ].join('');
          console.log(chalk.gray(`     ${indicators} ${dir.name}`));
        });
      }
    } else {
      console.log(chalk.gray(`   Configs: none`));
    }
    
    // Additional details
    if (this.showDetails) {
      if (module.versions.length > 1) {
        console.log(chalk.gray(`   Versions: ${module.versions.join(', ')}`));
      }
      
      if (module.files.length > 0) {
        const fileList = module.files
          .map(f => f.name)
          .filter(name => !name.startsWith('.'))
          .join(', ');
        console.log(chalk.gray(`   Files: ${fileList}`));
      }
      
      if (component?.dependencies?.length > 0) {
        console.log(chalk.gray(`   Dependencies: ${component.dependencies.join(', ')}`));
      }
    }
    
    console.log('');
  }

  printSummary(modules) {
    console.log(chalk.blue('='.repeat(50)));
    console.log(chalk.blue('SUMMARY'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    // Count by type and category
    const byType = {};
    const byCategory = {};
    let totalConfigs = 0;
    let completeConfigs = 0;
    
    modules.forEach(module => {
      if (module.error) return;
      
      const type = module.config?.component?.type || 'unknown';
      const category = module.config?.component?.category || 'unknown';
      
      byType[type] = (byType[type] || 0) + 1;
      byCategory[category] = (byCategory[category] || 0) + 1;
      
      const status = module.configStatus;
      totalConfigs += status.total;
      completeConfigs += Math.min(status.hasData, status.hasSchemas, status.hasCrud);
    });
    
    console.log(chalk.green(`Total modules: ${modules.length}`));
    
    if (Object.keys(byType).length > 0) {
      console.log(chalk.cyan('\nBy type:'));
      Object.entries(byType)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(chalk.gray(`  ${type}: ${count}`));
        });
    }
    
    if (Object.keys(byCategory).length > 0) {
      console.log(chalk.cyan('\nBy category:'));
      Object.entries(byCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(chalk.gray(`  ${category}: ${count}`));
        });
    }
    
    if (totalConfigs > 0) {
      const completeness = Math.round((completeConfigs / totalConfigs) * 100);
      console.log(chalk.cyan(`\nConfiguration completeness: ${completeness}% (${completeConfigs}/${totalConfigs})`));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
    
    // Recommendations
    const incompleteModules = modules.filter(m => 
      !m.error && m.configStatus.total > 0 && 
      Math.min(m.configStatus.hasData, m.configStatus.hasSchemas, m.configStatus.hasCrud) < m.configStatus.total
    );
    
    if (incompleteModules.length > 0) {
      console.log(chalk.yellow('\n⚠ Incomplete configurations:'));
      incompleteModules.forEach(module => {
        console.log(chalk.gray(`  - ${module.name}: run "npm run generate" to complete`));
      });
    }
    
    const modulesWithoutConfigs = modules.filter(m => !m.error && m.configStatus.total === 0);
    if (modulesWithoutConfigs.length > 0) {
      console.log(chalk.yellow('\n⚠ Modules without configurations:'));
      modulesWithoutConfigs.forEach(module => {
        console.log(chalk.gray(`  - ${module.name}: run "npm run config:sync" to initialize`));
      });
    }
    
    console.log('');
  }
}

// CLI
program
  .name('list-modules')
  .description('List all modules and their status')
  .option('-d, --details', 'Show detailed information')
  .option('-c, --configs', 'Show configuration status details')
  .option('--modules-dir <path>', 'Modules directory', './modules')
  .option('--configs-dir <path>', 'Configs directory', './configs')
  .action(async (options) => {
    const lister = new ModuleLister({
      modulesDir: options.modulesDir,
      configsDir: options.configsDir,
      showDetails: options.details,
      showConfigs: options.configs
    });
    
    try {
      await lister.listAll();
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default ModuleLister;
