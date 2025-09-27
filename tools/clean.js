#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';
import inquirer from 'inquirer';

class ProjectCleaner {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.modulesDir = options.modulesDir || './modules';
    this.backupDir = options.backupDir || './configs/_backups';
    this.force = options.force || false;
    this.dryRun = options.dryRun || false;
  }

  async clean() {
    console.log(chalk.blue('🧹 Project Cleanup Tool\n'));
    
    if (this.dryRun) {
      console.log(chalk.yellow('DRY RUN MODE - No files will be deleted\n'));
    }
    
    const cleanupTasks = [
      {
        name: 'Generated schemas',
        description: 'Remove auto-generated schema.json files',
        action: () => this.cleanGeneratedSchemas()
      },
      {
        name: 'Generated CRUD',
        description: 'Remove auto-generated crud.json files',
        action: () => this.cleanGeneratedCrud()
      },
      {
        name: 'Generation markers',
        description: 'Remove .needs-generation marker files',
        action: () => this.cleanGenerationMarkers()
      },
      {
        name: 'Old backups',
        description: 'Remove backup files older than 30 days',
        action: () => this.cleanOldBackups()
      },
      {
        name: 'Empty config directories',
        description: 'Remove empty configuration directories',
        action: () => this.cleanEmptyConfigDirs()
      },
      {
        name: 'Orphaned configs',
        description: 'Remove configs for non-existent modules',
        action: () => this.cleanOrphanedConfigs()
      }
    ];
    
    let selectedTasks;
    
    if (this.force) {
      selectedTasks = cleanupTasks;
    } else {
      const { tasks } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'tasks',
        message: 'Select cleanup tasks:',
        choices: cleanupTasks.map(task => ({
          name: `${task.name} - ${task.description}`,
          value: task,
          checked: false
        }))
      }]);
      selectedTasks = tasks;
    }
    
    if (selectedTasks.length === 0) {
      console.log(chalk.yellow('No cleanup tasks selected.'));
      return;
    }
    
    console.log(chalk.blue('\nExecuting cleanup tasks...\n'));
    
    let totalCleaned = 0;
    
    for (const task of selectedTasks) {
      console.log(chalk.yellow(`→ ${task.name}...`));
      try {
        const cleaned = await task.action();
        totalCleaned += cleaned;
        console.log(chalk.green(`✓ ${task.name}: ${cleaned} items cleaned`));
      } catch (error) {
        console.log(chalk.red(`✗ ${task.name}: ${error.message}`));
      }
    }
    
    console.log(chalk.blue(`\n✓ Cleanup completed: ${totalCleaned} items processed`));
    
    if (this.dryRun) {
      console.log(chalk.yellow('Run without --dry-run to actually delete files.'));
    }
  }

  async cleanGeneratedSchemas() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.configsDir)) {
      return cleaned;
    }
    
    const dirs = await fs.readdir(this.configsDir);
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const schemaPath = path.join(this.configsDir, dir, 'schema.json');
      
      if (await fs.pathExists(schemaPath)) {
        const schema = await fs.readJson(schemaPath);
        
        // Only remove auto-generated schemas (not manual ones)
        if (schema._generated && !schema._manual) {
          console.log(chalk.gray(`  Removing ${dir}/schema.json`));
          
          if (!this.dryRun) {
            await fs.remove(schemaPath);
          }
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  async cleanGeneratedCrud() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.configsDir)) {
      return cleaned;
    }
    
    const dirs = await fs.readdir(this.configsDir);
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const crudPath = path.join(this.configsDir, dir, 'crud.json');
      
      if (await fs.pathExists(crudPath)) {
        const crud = await fs.readJson(crudPath);
        
        // Only remove auto-generated CRUD (not manual ones)
        if (crud._generated && !crud._manual) {
          console.log(chalk.gray(`  Removing ${dir}/crud.json`));
          
          if (!this.dryRun) {
            await fs.remove(crudPath);
          }
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  async cleanGenerationMarkers() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.configsDir)) {
      return cleaned;
    }
    
    const dirs = await fs.readdir(this.configsDir);
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const markerPath = path.join(this.configsDir, dir, '.needs-generation');
      
      if (await fs.pathExists(markerPath)) {
        console.log(chalk.gray(`  Removing ${dir}/.needs-generation`));
        
        if (!this.dryRun) {
          await fs.remove(markerPath);
        }
        cleaned++;
      }
    }
    
    return cleaned;
  }

  async cleanOldBackups() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.backupDir)) {
      return cleaned;
    }
    
    const files = await fs.readdir(this.backupDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && stat.mtime.getTime() < thirtyDaysAgo) {
        console.log(chalk.gray(`  Removing old backup: ${file}`));
        
        if (!this.dryRun) {
          await fs.remove(filePath);
        }
        cleaned++;
      }
    }
    
    return cleaned;
  }

  async cleanEmptyConfigDirs() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.configsDir)) {
      return cleaned;
    }
    
    const dirs = await fs.readdir(this.configsDir);
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        const contents = await fs.readdir(dirPath);
        const nonHiddenContents = contents.filter(item => !item.startsWith('.'));
        
        if (nonHiddenContents.length === 0) {
          console.log(chalk.gray(`  Removing empty directory: ${dir}`));
          
          if (!this.dryRun) {
            await fs.remove(dirPath);
          }
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  async cleanOrphanedConfigs() {
    let cleaned = 0;
    
    if (!await fs.pathExists(this.configsDir) || !await fs.pathExists(this.modulesDir)) {
      return cleaned;
    }
    
    // Get list of existing modules
    const moduleDirs = await fs.readdir(this.modulesDir);
    const existingModules = new Set();
    
    for (const dir of moduleDirs) {
      const modulePath = path.join(this.modulesDir, dir);
      const stat = await fs.stat(modulePath);
      
      if (stat.isDirectory()) {
        existingModules.add(dir);
      }
    }
    
    // Check config directories
    const configDirs = await fs.readdir(this.configsDir);
    
    for (const dir of configDirs) {
      if (dir.startsWith('_')) continue;
      
      // Extract module name from config directory name (format: moduleName_section)
      const parts = dir.split('_');
      if (parts.length >= 2) {
        const moduleName = parts[0];
        
        if (!existingModules.has(moduleName)) {
          console.log(chalk.gray(`  Removing orphaned config: ${dir}`));
          
          if (!this.dryRun) {
            const dirPath = path.join(this.configsDir, dir);
            await fs.remove(dirPath);
          }
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  async analyzeProject() {
    console.log(chalk.blue('📊 Project Analysis\n'));
    
    const analysis = {
      modules: 0,
      configDirs: 0,
      generatedSchemas: 0,
      generatedCrud: 0,
      manualSchemas: 0,
      manualCrud: 0,
      backupFiles: 0,
      orphanedConfigs: 0,
      emptyDirs: 0,
      generationMarkers: 0
    };
    
    // Analyze modules
    if (await fs.pathExists(this.modulesDir)) {
      const moduleDirs = await fs.readdir(this.modulesDir);
      analysis.modules = moduleDirs.filter(async dir => {
        const stat = await fs.stat(path.join(this.modulesDir, dir));
        return stat.isDirectory();
      }).length;
    }
    
    // Analyze configs
    if (await fs.pathExists(this.configsDir)) {
      const configDirs = await fs.readdir(this.configsDir);
      
      for (const dir of configDirs) {
        if (dir.startsWith('_')) continue;
        
        const dirPath = path.join(this.configsDir, dir);
        const stat = await fs.stat(dirPath);
        
        if (stat.isDirectory()) {
          analysis.configDirs++;
          
          // Check for schemas
          const schemaPath = path.join(dirPath, 'schema.json');
          if (await fs.pathExists(schemaPath)) {
            const schema = await fs.readJson(schemaPath);
            if (schema._manual) {
              analysis.manualSchemas++;
            } else if (schema._generated) {
              analysis.generatedSchemas++;
            }
          }
          
          // Check for CRUD
          const crudPath = path.join(dirPath, 'crud.json');
          if (await fs.pathExists(crudPath)) {
            const crud = await fs.readJson(crudPath);
            if (crud._manual) {
              analysis.manualCrud++;
            } else if (crud._generated) {
              analysis.generatedCrud++;
            }
          }
          
          // Check for generation markers
          if (await fs.pathExists(path.join(dirPath, '.needs-generation'))) {
            analysis.generationMarkers++;
          }
          
          // Check if empty
          const contents = await fs.readdir(dirPath);
          const nonHiddenContents = contents.filter(item => !item.startsWith('.'));
          if (nonHiddenContents.length === 0) {
            analysis.emptyDirs++;
          }
        }
      }
    }
    
    // Analyze backups
    if (await fs.pathExists(this.backupDir)) {
      const backupFiles = await fs.readdir(this.backupDir);
      analysis.backupFiles = backupFiles.length;
    }
    
    // Print analysis
    console.log(chalk.cyan('Project Structure:'));
    console.log(chalk.gray(`  Modules: ${analysis.modules}`));
    console.log(chalk.gray(`  Config directories: ${analysis.configDirs}`));
    console.log('');
    
    console.log(chalk.cyan('Generated Files:'));
    console.log(chalk.gray(`  Generated schemas: ${analysis.generatedSchemas}`));
    console.log(chalk.gray(`  Generated CRUD: ${analysis.generatedCrud}`));
    console.log(chalk.gray(`  Generation markers: ${analysis.generationMarkers}`));
    console.log('');
    
    console.log(chalk.cyan('Manual Files:'));
    console.log(chalk.gray(`  Manual schemas: ${analysis.manualSchemas}`));
    console.log(chalk.gray(`  Manual CRUD: ${analysis.manualCrud}`));
    console.log('');
    
    console.log(chalk.cyan('Cleanup Candidates:'));
    console.log(chalk.gray(`  Backup files: ${analysis.backupFiles}`));
    console.log(chalk.gray(`  Empty directories: ${analysis.emptyDirs}`));
    console.log(chalk.gray(`  Orphaned configs: ${analysis.orphanedConfigs}`));
    console.log('');
    
    return analysis;
  }
}

// CLI
program
  .name('clean')
  .description('Clean up generated files and directories')
  .option('-f, --force', 'Skip confirmation prompts')
  .option('-d, --dry-run', 'Show what would be cleaned without making changes')
  .option('-a, --analyze', 'Analyze project structure without cleaning')
  .option('--configs-dir <path>', 'Configs directory', './configs')
  .option('--modules-dir <path>', 'Modules directory', './modules')
  .option('--backup-dir <path>', 'Backup directory', './configs/_backups')
  .action(async (options) => {
    const cleaner = new ProjectCleaner({
      configsDir: options.configsDir,
      modulesDir: options.modulesDir,
      backupDir: options.backupDir,
      force: options.force,
      dryRun: options.dryRun
    });
    
    try {
      if (options.analyze) {
        await cleaner.analyzeProject();
      } else {
        await cleaner.clean();
      }
    } catch (error) {
      console.error(chalk.red('Cleanup failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default ProjectCleaner;
