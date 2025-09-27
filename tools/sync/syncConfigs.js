#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class ConfigSynchronizer {
  constructor(options = {}) {
    this.modulesDir = options.modulesDir || './modules';
    this.configsDir = options.configsDir || './configs';
    this.backupDir = options.backupDir || './configs/_backups';
    this.dryRun = options.dryRun || false;
    this.changes = [];
    this.conflicts = [];
  }

  async syncAll() {
    console.log(chalk.blue('🔄 Synchronizing configurations...\n'));
    
    if (this.dryRun) {
      console.log(chalk.yellow('DRY RUN MODE - No changes will be made\n'));
    }
    
    // Find all modules
    const modules = await this.findModules();
    console.log(chalk.gray(`Found ${modules.length} modules\n`));
    
    // Sync each module
    for (const modulePath of modules) {
      await this.syncModule(modulePath);
    }
    
    // Apply changes if not dry run
    if (!this.dryRun && this.changes.length > 0) {
      await this.applyChanges();
    }
    
    // Print summary
    this.printSummary();
    
    return {
      changes: this.changes.length,
      conflicts: this.conflicts.length,
      success: this.conflicts.length === 0
    };
  }

  async findModules() {
    if (!await fs.pathExists(this.modulesDir)) {
      return [];
    }
    
    const dirs = await fs.readdir(this.modulesDir);
    const modules = [];
    
    for (const dir of dirs) {
      const modulePath = path.join(this.modulesDir, dir);
      const stat = await fs.stat(modulePath);
      
      if (stat.isDirectory()) {
        modules.push(modulePath);
      }
    }
    
    return modules;
  }

  async syncModule(modulePath) {
    const moduleName = path.basename(modulePath);
    console.log(chalk.yellow(`→ Syncing ${moduleName}...`));
    
    try {
      // Find latest version
      const versions = await fs.readdir(modulePath);
      const latestVersion = versions
        .filter(v => /^\d+\.\d+\.\d+$/.test(v))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
      
      if (!latestVersion) {
        console.log(chalk.gray(`  No valid version found, skipping`));
        return;
      }
      
      const configPath = path.join(modulePath, latestVersion, 'config.json');
      if (!await fs.pathExists(configPath)) {
        console.log(chalk.gray(`  No config.json found, skipping`));
        return;
      }
      
      // Load module config
      const moduleConfig = await fs.readJson(configPath);
      
      // Sync each configuration section
      for (const [section, sectionData] of Object.entries(moduleConfig)) {
        if (section === 'component') continue; // Skip metadata
        
        await this.syncConfigSection(moduleName, section, sectionData, latestVersion);
      }
      
      console.log(chalk.green(`✓ ${moduleName} synced`));
      
    } catch (error) {
      console.log(chalk.red(`✗ Failed to sync ${moduleName}: ${error.message}`));
    }
  }

  async syncConfigSection(moduleName, section, moduleData, version) {
    const configDir = path.join(this.configsDir, `${moduleName}_${section}`);
    const dataPath = path.join(configDir, 'data.json');
    
    // Ensure config directory exists
    if (!await fs.pathExists(configDir)) {
      this.changes.push({
        type: 'create_dir',
        path: configDir,
        description: `Create config directory for ${moduleName}_${section}`
      });
      return;
    }
    
    // Check if data.json exists
    if (!await fs.pathExists(dataPath)) {
      this.changes.push({
        type: 'create_file',
        path: dataPath,
        data: moduleData,
        description: `Create data.json for ${moduleName}_${section}`
      });
      return;
    }
    
    // Load existing data
    const existingData = await fs.readJson(dataPath);
    
    // Check for manual modifications
    const hasManualChanges = await this.hasManualChanges(configDir);
    
    if (hasManualChanges) {
      // Merge configurations preserving manual changes
      const merged = this.mergeConfigs(existingData, moduleData);
      
      if (JSON.stringify(merged) !== JSON.stringify(existingData)) {
        this.changes.push({
          type: 'merge_file',
          path: dataPath,
          data: merged,
          original: existingData,
          description: `Merge changes for ${moduleName}_${section} (preserving manual edits)`
        });
      }
    } else {
      // No manual changes, safe to overwrite
      if (JSON.stringify(moduleData) !== JSON.stringify(existingData)) {
        this.changes.push({
          type: 'update_file',
          path: dataPath,
          data: moduleData,
          original: existingData,
          description: `Update data.json for ${moduleName}_${section}`
        });
      }
    }
  }

  async hasManualChanges(configDir) {
    // Check for manual markers in schema.json or crud.json
    const schemaPath = path.join(configDir, 'schema.json');
    const crudPath = path.join(configDir, 'crud.json');
    
    if (await fs.pathExists(schemaPath)) {
      const schema = await fs.readJson(schemaPath);
      if (schema._manual || schema._modified) {
        return true;
      }
    }
    
    if (await fs.pathExists(crudPath)) {
      const crud = await fs.readJson(crudPath);
      if (crud._manual || crud._modified) {
        return true;
      }
    }
    
    return false;
  }

  mergeConfigs(existing, moduleData) {
    const merged = { ...existing };
    
    // Add new properties from module config
    for (const [key, value] of Object.entries(moduleData)) {
      if (!(key in merged)) {
        merged[key] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively merge objects
        merged[key] = this.mergeConfigs(merged[key], value);
      }
      // Keep existing values for primitive types (preserve manual changes)
    }
    
    return merged;
  }

  async applyChanges() {
    console.log(chalk.blue('\n📝 Applying changes...\n'));
    
    for (const change of this.changes) {
      try {
        await this.applyChange(change);
        console.log(chalk.green(`✓ ${change.description}`));
      } catch (error) {
        console.log(chalk.red(`✗ Failed: ${change.description} - ${error.message}`));
      }
    }
  }

  async applyChange(change) {
    switch (change.type) {
      case 'create_dir':
        await fs.ensureDir(change.path);
        break;
        
      case 'create_file':
        await fs.ensureDir(path.dirname(change.path));
        await fs.writeJson(change.path, change.data, { spaces: 2 });
        break;
        
      case 'update_file':
        // Backup original
        await this.backupFile(change.path);
        await fs.writeJson(change.path, change.data, { spaces: 2 });
        break;
        
      case 'merge_file':
        // Backup original
        await this.backupFile(change.path);
        await fs.writeJson(change.path, change.data, { spaces: 2 });
        break;
        
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  async backupFile(filePath) {
    if (!await fs.pathExists(filePath)) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}`);
    
    await fs.ensureDir(this.backupDir);
    await fs.copy(filePath, backupPath);
  }

  printSummary() {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('CONFIGURATION SYNC SUMMARY'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    if (this.changes.length === 0) {
      console.log(chalk.green('✓ All configurations are in sync!'));
    } else {
      console.log(chalk.yellow(`Found ${this.changes.length} changes:\n`));
      
      const changeTypes = {
        create_dir: 'Directories to create',
        create_file: 'Files to create',
        update_file: 'Files to update',
        merge_file: 'Files to merge'
      };
      
      for (const [type, description] of Object.entries(changeTypes)) {
        const changesOfType = this.changes.filter(c => c.type === type);
        if (changesOfType.length > 0) {
          console.log(chalk.cyan(`${description} (${changesOfType.length}):`));
          changesOfType.forEach(change => {
            console.log(chalk.gray(`  - ${change.description}`));
          });
          console.log('');
        }
      }
      
      if (this.dryRun) {
        console.log(chalk.yellow('Run without --dry-run to apply these changes.'));
      }
    }
    
    if (this.conflicts.length > 0) {
      console.log(chalk.red(`\nConflicts detected (${this.conflicts.length}):`));
      this.conflicts.forEach(conflict => {
        console.log(chalk.gray(`  - ${conflict.description}`));
      });
      console.log(chalk.yellow('\nResolve conflicts manually before syncing.'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
  }

  async detectConflicts() {
    // Check for conflicting manual changes
    const configDirs = await fs.readdir(this.configsDir);
    
    for (const dir of configDirs) {
      if (dir.startsWith('_')) continue;
      
      const configDir = path.join(this.configsDir, dir);
      const stat = await fs.stat(configDir);
      
      if (stat.isDirectory()) {
        const dataPath = path.join(configDir, 'data.json');
        const schemaPath = path.join(configDir, 'schema.json');
        const crudPath = path.join(configDir, 'crud.json');
        
        // Check for inconsistencies
        if (await fs.pathExists(dataPath) && await fs.pathExists(schemaPath)) {
          try {
            const data = await fs.readJson(dataPath);
            const schema = await fs.readJson(schemaPath);
            
            // Validate data against schema
            // This would require AJV validation - simplified for now
            const dataKeys = Object.keys(data);
            const schemaKeys = Object.keys(schema.properties || {});
            
            const missingInSchema = dataKeys.filter(key => !schemaKeys.includes(key));
            const missingInData = schemaKeys.filter(key => !dataKeys.includes(key));
            
            if (missingInSchema.length > 0 || missingInData.length > 0) {
              this.conflicts.push({
                type: 'schema_data_mismatch',
                path: configDir,
                description: `Schema/data mismatch in ${dir}`,
                details: { missingInSchema, missingInData }
              });
            }
          } catch (error) {
            this.conflicts.push({
              type: 'validation_error',
              path: configDir,
              description: `Validation error in ${dir}: ${error.message}`
            });
          }
        }
      }
    }
  }
}

// CLI
program
  .name('sync-configs')
  .description('Synchronize module configurations')
  .option('-d, --dry-run', 'Show what would be changed without making changes')
  .option('--modules-dir <path>', 'Modules directory', './modules')
  .option('--configs-dir <path>', 'Configs directory', './configs')
  .action(async (options) => {
    const synchronizer = new ConfigSynchronizer({
      modulesDir: options.modulesDir,
      configsDir: options.configsDir,
      dryRun: options.dryRun
    });
    
    try {
      const result = await synchronizer.syncAll();
      
      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Sync failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default ConfigSynchronizer;
