#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class ProjectBackup {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.modulesDir = options.modulesDir || './modules';
    this.backupDir = options.backupDir || './configs/_backups';
    this.includeModules = options.includeModules || false;
    this.compress = options.compress || false;
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);
    
    console.log(chalk.blue('💾 Creating project backup...\n'));
    console.log(chalk.gray(`Backup location: ${backupPath}\n`));
    
    await fs.ensureDir(backupPath);
    
    let totalFiles = 0;
    let totalSize = 0;
    
    // Backup configurations
    if (await fs.pathExists(this.configsDir)) {
      console.log(chalk.yellow('→ Backing up configurations...'));
      const { files, size } = await this.backupDirectory(
        this.configsDir, 
        path.join(backupPath, 'configs'),
        ['_backups'] // Exclude existing backups
      );
      totalFiles += files;
      totalSize += size;
      console.log(chalk.green(`✓ Configurations: ${files} files, ${this.formatSize(size)}`));
    }
    
    // Backup modules if requested
    if (this.includeModules && await fs.pathExists(this.modulesDir)) {
      console.log(chalk.yellow('→ Backing up modules...'));
      const { files, size } = await this.backupDirectory(
        this.modulesDir,
        path.join(backupPath, 'modules')
      );
      totalFiles += files;
      totalSize += size;
      console.log(chalk.green(`✓ Modules: ${files} files, ${this.formatSize(size)}`));
    }
    
    // Create backup metadata
    const metadata = {
      created: new Date().toISOString(),
      version: await this.getProjectVersion(),
      files: totalFiles,
      size: totalSize,
      includesModules: this.includeModules,
      directories: {
        configs: await fs.pathExists(this.configsDir),
        modules: this.includeModules && await fs.pathExists(this.modulesDir)
      }
    };
    
    await fs.writeJson(path.join(backupPath, 'metadata.json'), metadata, { spaces: 2 });
    
    console.log(chalk.blue(`\n✓ Backup completed: ${totalFiles} files, ${this.formatSize(totalSize)}`));
    console.log(chalk.gray(`Backup saved to: ${backupPath}\n`));
    
    return {
      path: backupPath,
      files: totalFiles,
      size: totalSize,
      metadata
    };
  }

  async backupDirectory(sourceDir, targetDir, excludeDirs = []) {
    let files = 0;
    let size = 0;
    
    await fs.ensureDir(targetDir);
    
    const entries = await fs.readdir(sourceDir);
    
    for (const entry of entries) {
      if (excludeDirs.includes(entry)) {
        continue;
      }
      
      const sourcePath = path.join(sourceDir, entry);
      const targetPath = path.join(targetDir, entry);
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        const result = await this.backupDirectory(sourcePath, targetPath, excludeDirs);
        files += result.files;
        size += result.size;
      } else {
        await fs.copy(sourcePath, targetPath);
        files++;
        size += stat.size;
      }
    }
    
    return { files, size };
  }

  async listBackups() {
    console.log(chalk.blue('📋 Available Backups\n'));
    
    if (!await fs.pathExists(this.backupDir)) {
      console.log(chalk.yellow('No backups directory found.'));
      return [];
    }
    
    const entries = await fs.readdir(this.backupDir);
    const backups = [];
    
    for (const entry of entries) {
      const entryPath = path.join(this.backupDir, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory() && entry.startsWith('backup-')) {
        const metadataPath = path.join(entryPath, 'metadata.json');
        let metadata = null;
        
        if (await fs.pathExists(metadataPath)) {
          metadata = await fs.readJson(metadataPath);
        }
        
        backups.push({
          name: entry,
          path: entryPath,
          created: metadata?.created || stat.ctime.toISOString(),
          files: metadata?.files || 0,
          size: metadata?.size || 0,
          includesModules: metadata?.includesModules || false,
          metadata
        });
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    if (backups.length === 0) {
      console.log(chalk.yellow('No backups found.'));
      return [];
    }
    
    backups.forEach((backup, index) => {
      const date = new Date(backup.created).toLocaleString();
      const modules = backup.includesModules ? ' + modules' : '';
      
      console.log(chalk.cyan(`${index + 1}. ${backup.name}`));
      console.log(chalk.gray(`   Created: ${date}`));
      console.log(chalk.gray(`   Files: ${backup.files}, Size: ${this.formatSize(backup.size)}${modules}`));
      console.log('');
    });
    
    return backups;
  }

  async restoreBackup(backupName) {
    const backupPath = path.join(this.backupDir, backupName);
    
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }
    
    console.log(chalk.blue(`🔄 Restoring backup: ${backupName}\n`));
    
    // Load metadata
    const metadataPath = path.join(backupPath, 'metadata.json');
    let metadata = null;
    
    if (await fs.pathExists(metadataPath)) {
      metadata = await fs.readJson(metadataPath);
      console.log(chalk.gray(`Backup created: ${new Date(metadata.created).toLocaleString()}`));
      console.log(chalk.gray(`Files: ${metadata.files}, Size: ${this.formatSize(metadata.size)}\n`));
    }
    
    // Create current backup before restore
    console.log(chalk.yellow('→ Creating backup of current state...'));
    const currentBackup = await this.createBackup();
    console.log(chalk.green(`✓ Current state backed up to: ${path.basename(currentBackup.path)}\n`));
    
    let restoredFiles = 0;
    
    // Restore configurations
    const configsBackupPath = path.join(backupPath, 'configs');
    if (await fs.pathExists(configsBackupPath)) {
      console.log(chalk.yellow('→ Restoring configurations...'));
      
      // Remove current configs (except backups)
      if (await fs.pathExists(this.configsDir)) {
        const entries = await fs.readdir(this.configsDir);
        for (const entry of entries) {
          if (entry !== '_backups') {
            await fs.remove(path.join(this.configsDir, entry));
          }
        }
      }
      
      // Restore from backup
      const { files } = await this.restoreDirectory(configsBackupPath, this.configsDir);
      restoredFiles += files;
      console.log(chalk.green(`✓ Configurations restored: ${files} files`));
    }
    
    // Restore modules if included
    const modulesBackupPath = path.join(backupPath, 'modules');
    if (await fs.pathExists(modulesBackupPath)) {
      console.log(chalk.yellow('→ Restoring modules...'));
      
      // Remove current modules
      if (await fs.pathExists(this.modulesDir)) {
        await fs.remove(this.modulesDir);
      }
      
      // Restore from backup
      const { files } = await this.restoreDirectory(modulesBackupPath, this.modulesDir);
      restoredFiles += files;
      console.log(chalk.green(`✓ Modules restored: ${files} files`));
    }
    
    console.log(chalk.blue(`\n✓ Restore completed: ${restoredFiles} files restored`));
    console.log(chalk.gray(`Previous state backed up as: ${path.basename(currentBackup.path)}\n`));
    
    return {
      restoredFiles,
      previousBackup: currentBackup.path
    };
  }

  async restoreDirectory(sourceDir, targetDir) {
    let files = 0;
    
    await fs.ensureDir(targetDir);
    
    const entries = await fs.readdir(sourceDir);
    
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry);
      const targetPath = path.join(targetDir, entry);
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        const result = await this.restoreDirectory(sourcePath, targetPath);
        files += result.files;
      } else {
        await fs.copy(sourcePath, targetPath);
        files++;
      }
    }
    
    return { files };
  }

  async cleanOldBackups(keepCount = 10) {
    console.log(chalk.blue(`🧹 Cleaning old backups (keeping ${keepCount} most recent)...\n`));
    
    const backups = await this.listBackups();
    
    if (backups.length <= keepCount) {
      console.log(chalk.green(`✓ No cleanup needed (${backups.length} backups, keeping ${keepCount})`));
      return 0;
    }
    
    const toDelete = backups.slice(keepCount);
    let deletedCount = 0;
    let freedSpace = 0;
    
    for (const backup of toDelete) {
      console.log(chalk.yellow(`→ Removing ${backup.name}...`));
      await fs.remove(backup.path);
      deletedCount++;
      freedSpace += backup.size;
    }
    
    console.log(chalk.green(`✓ Cleaned ${deletedCount} old backups, freed ${this.formatSize(freedSpace)}`));
    
    return deletedCount;
  }

  async getProjectVersion() {
    try {
      const packagePath = './package.json';
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        return packageJson.version || '0.0.0';
      }
    } catch (error) {
      // Ignore errors
    }
    return '0.0.0';
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// CLI
program
  .name('backup')
  .description('Backup and restore project configurations')
  .option('-m, --include-modules', 'Include modules in backup')
  .option('-l, --list', 'List available backups')
  .option('-r, --restore <name>', 'Restore from backup')
  .option('-c, --clean [count]', 'Clean old backups (default: keep 10)', '10')
  .option('--configs-dir <path>', 'Configs directory', './configs')
  .option('--modules-dir <path>', 'Modules directory', './modules')
  .option('--backup-dir <path>', 'Backup directory', './configs/_backups')
  .action(async (options) => {
    const backup = new ProjectBackup({
      configsDir: options.configsDir,
      modulesDir: options.modulesDir,
      backupDir: options.backupDir,
      includeModules: options.includeModules
    });
    
    try {
      if (options.list) {
        await backup.listBackups();
      } else if (options.restore) {
        await backup.restoreBackup(options.restore);
      } else if (options.clean !== undefined) {
        const keepCount = parseInt(options.clean) || 10;
        await backup.cleanOldBackups(keepCount);
      } else {
        await backup.createBackup();
      }
    } catch (error) {
      console.error(chalk.red('Backup operation failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default ProjectBackup;
