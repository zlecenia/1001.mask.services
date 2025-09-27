#!/usr/bin/env node

/**
 * Migrate component structure to new unified format
 * Based on guidelines from components.md
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

class ComponentMigrator {
  constructor() {
    this.featuresDir = 'js/features';
    this.migratedComponents = [];
    this.errors = [];
  }

  async migrateAll() {
    console.log(chalk.blue('🔄 Starting component structure migration...'));
    
    try {
      const components = await this.findComponents();
      console.log(chalk.green(`Found ${components.length} components to migrate:`));
      
      for (const component of components) {
        console.log(chalk.yellow(`- ${component.name} (${component.path})`));
      }
      
      console.log();
      
      for (const component of components) {
        await this.migrateComponent(component);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.red('Migration failed:'), error.message);
      process.exit(1);
    }
  }

  async findComponents() {
    const components = [];
    const featuresPath = path.resolve(this.featuresDir);
    
    if (!await fs.pathExists(featuresPath)) {
      throw new Error(`Features directory not found: ${featuresPath}`);
    }
    
    const componentDirs = await fs.readdir(featuresPath);
    
    for (const componentName of componentDirs) {
      const componentPath = path.join(featuresPath, componentName);
      const stat = await fs.stat(componentPath);
      
      if (stat.isDirectory()) {
        // Look for version directories
        const versions = await fs.readdir(componentPath);
        for (const version of versions) {
          const versionPath = path.join(componentPath, version);
          const versionStat = await fs.stat(versionPath);
          
          if (versionStat.isDirectory() && version.match(/^\d+\.\d+\.\d+$/)) {
            components.push({
              name: componentName,
              version,
              path: versionPath,
              relativePath: path.join(this.featuresDir, componentName, version)
            });
          }
        }
      }
    }
    
    return components;
  }

  async migrateComponent(component) {
    console.log(chalk.blue(`🔄 Migrating ${component.name}@${component.version}...`));
    
    try {
      const configPath = path.join(component.path, 'config.json');
      const configDir = path.join(component.path, 'config');
      
      // 1. Create config directory if it doesn't exist
      if (!await fs.pathExists(configDir)) {
        await fs.ensureDir(configDir);
        console.log(chalk.green(`  ✓ Created config/ directory`));
      }
      
      // 2. Move config.json to config/config.json if exists
      if (await fs.pathExists(configPath)) {
        const newConfigPath = path.join(configDir, 'config.json');
        
        if (!await fs.pathExists(newConfigPath)) {
          const config = await fs.readJson(configPath);
          await fs.writeJson(newConfigPath, config, { spaces: 2 });
          await fs.remove(configPath);
          console.log(chalk.green(`  ✓ Moved config.json to config/config.json`));
          
          // 3. Generate additional config files
          await this.generateConfigFiles(component, config);
        } else {
          console.log(chalk.yellow(`  ⚠ Config already exists in config/, skipping move`));
        }
      } else {
        console.log(chalk.yellow(`  ⚠ No config.json found, creating default`));
        await this.createDefaultConfig(component);
      }
      
      // 4. Update index.js imports
      await this.updateIndexImports(component);
      
      // 5. Update package.json if needed
      await this.updatePackageJson(component);
      
      this.migratedComponents.push(component);
      console.log(chalk.green(`  ✅ Migration completed for ${component.name}\n`));
      
    } catch (error) {
      const errorMsg = `Failed to migrate ${component.name}: ${error.message}`;
      this.errors.push(errorMsg);
      console.error(chalk.red(`  ❌ ${errorMsg}\n`));
    }
  }

  async generateConfigFiles(component, config) {
    const configDir = path.join(component.path, 'config');
    
    // Generate data.json (runtime values from config.data section)
    if (config.data) {
      const dataPath = path.join(configDir, 'data.json');
      if (!await fs.pathExists(dataPath)) {
        await fs.writeJson(dataPath, config.data, { spaces: 2 });
        console.log(chalk.green(`  ✓ Generated data.json`));
      }
    }
    
    // Generate basic schema.json
    const schemaPath = path.join(configDir, 'schema.json');
    if (!await fs.pathExists(schemaPath)) {
      const schema = this.generateBasicSchema(config);
      await fs.writeJson(schemaPath, schema, { spaces: 2 });
      console.log(chalk.green(`  ✓ Generated schema.json`));
    }
    
    // Generate basic crud.json
    const crudPath = path.join(configDir, 'crud.json');
    if (!await fs.pathExists(crudPath)) {
      const crud = this.generateBasicCrud(component, config);
      await fs.writeJson(crudPath, crud, { spaces: 2 });
      console.log(chalk.green(`  ✓ Generated crud.json`));
    }
  }

  generateBasicSchema(config) {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": `Configuration Schema`,
      "description": "Auto-generated schema for component configuration",
      "_generated": true,
      "_generated_at": new Date().toISOString(),
      "properties": {
        "ui": {
          "type": "object",
          "description": "UI configuration settings"
        },
        "data": {
          "type": "object", 
          "description": "Runtime data values"
        },
        "api": {
          "type": "object",
          "description": "API configuration"
        },
        "performance": {
          "type": "object",
          "description": "Performance settings"
        }
      }
    };
  }

  generateBasicCrud(component, config) {
    return {
      "name": component.name,
      "title": component.name.charAt(0).toUpperCase() + component.name.slice(1),
      "description": `CRUD rules for ${component.name} component`,
      "_generated": true,
      "_generated_at": new Date().toISOString(),
      "rules": {
        "editable": ["ui", "data", "performance"],
        "readonly": ["component"],
        "protected": [],
        "addable": true,
        "deletable": false
      },
      "field_types": {
        "ui": "object",
        "data": "object", 
        "api": "object",
        "performance": "object"
      },
      "validation_rules": {},
      "ui_hints": {
        "ui": {
          "type": "object",
          "label": "UI Settings",
          "description": "User interface configuration"
        },
        "data": {
          "type": "object", 
          "label": "Data Settings",
          "description": "Runtime data configuration"
        }
      }
    };
  }

  async createDefaultConfig(component) {
    const configDir = path.join(component.path, 'config');
    const configPath = path.join(configDir, 'config.json');
    
    const defaultConfig = {
      "component": {
        "name": component.name,
        "displayName": component.name.charAt(0).toUpperCase() + component.name.slice(1),
        "type": "component",
        "category": "ui-component",
        "version": component.version,
        "enabled": true
      },
      "ui": {
        "enabled": true,
        "theme": "default"
      },
      "data": {},
      "performance": {
        "cache": true,
        "updateInterval": 1000
      }
    };
    
    await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    console.log(chalk.green(`  ✓ Created default config.json`));
    
    await this.generateConfigFiles(component, defaultConfig);
  }

  async updateIndexImports(component) {
    const indexPath = path.join(component.path, 'index.js');
    
    if (await fs.pathExists(indexPath)) {
      let content = await fs.readFile(indexPath, 'utf8');
      
      // Check if config import already exists
      if (!content.includes('import config from') && !content.includes('./config/config.json')) {
        // Add config import at the top
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find where to insert (after other imports)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ') || lines[i].startsWith('//')) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "import config from './config/config.json';");
        lines.splice(insertIndex + 1, 0, ''); // Add empty line
        
        await fs.writeFile(indexPath, lines.join('\n'));
        console.log(chalk.green(`  ✓ Updated index.js imports`));
      }
    }
  }

  async updatePackageJson(component) {
    const packagePath = path.join(component.path, 'package.json');
    
    if (await fs.pathExists(packagePath)) {
      const packageJson = await fs.readJson(packagePath);
      
      // Add config path reference if not exists
      if (!packageJson.maskservice) {
        packageJson.maskservice = {
          component: {
            name: component.name,
            version: component.version,
            configPath: './config/'
          }
        };
        
        await fs.writeJson(packagePath, packageJson, { spaces: 2 });
        console.log(chalk.green(`  ✓ Updated package.json with config path`));
      }
    }
  }

  printSummary() {
    console.log(chalk.blue('\n📋 Migration Summary:'));
    console.log(chalk.green(`✅ Successfully migrated: ${this.migratedComponents.length} components`));
    
    this.migratedComponents.forEach(comp => {
      console.log(chalk.green(`  - ${comp.name}@${comp.version}`));
    });
    
    if (this.errors.length > 0) {
      console.log(chalk.red(`\n❌ Errors: ${this.errors.length}`));
      this.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
    }
    
    console.log(chalk.blue('\n🎉 Migration completed!'));
    console.log(chalk.yellow('Next steps:'));
    console.log(chalk.yellow('1. Run: npm run config:generate'));
    console.log(chalk.yellow('2. Run: npm run validate-all'));
    console.log(chalk.yellow('3. Test components individually'));
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ComponentMigrator();
  migrator.migrateAll().catch(console.error);
}

export default ComponentMigrator;
