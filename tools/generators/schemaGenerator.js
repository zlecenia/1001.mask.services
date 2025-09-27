#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class SchemaGenerator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.modulesDir = options.modulesDir || './modules';
    this.preserveManual = options.preserveManual !== false;
    this.backupDir = options.backupDir || './configs/_backups';
  }

  async generate(targetDir) {
    const dataPath = path.join(targetDir, 'data.json');
    const schemaPath = path.join(targetDir, 'schema.json');
    const markerPath = path.join(targetDir, '.needs-generation');
    
    // Check if manual edits should be preserved
    if (await fs.pathExists(schemaPath) && this.preserveManual) {
      const existingSchema = await fs.readJson(schemaPath);
      
      // Check for manual edit marker
      if (existingSchema._manual || existingSchema._modified) {
        console.log(chalk.yellow(`⚠ Preserving manual edits in ${path.basename(targetDir)}/schema.json`));
        
        // Backup and merge
        await this.backupFile(schemaPath);
        const generated = await this.generateSchema(await fs.readJson(dataPath));
        const merged = this.mergeSchemas(generated, existingSchema);
        await fs.writeJson(schemaPath, merged, { spaces: 2 });
        return;
      }
    }
    
    // Generate new schema
    const data = await fs.readJson(dataPath);
    const schema = await this.generateSchema(data);
    
    // Add generation metadata
    schema._generated = new Date().toISOString();
    schema._generator = 'schemaGenerator v1.0.0';
    
    // Write schema
    await fs.writeJson(schemaPath, schema, { spaces: 2 });
    
    // Remove generation marker
    if (await fs.pathExists(markerPath)) {
      await fs.remove(markerPath);
    }
    
    console.log(chalk.green(`✓ Generated schema for ${path.basename(targetDir)}`));
  }

  async generateSchema(data) {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false
    };

    for (const [key, value] of Object.entries(data)) {
      const property = this.inferProperty(key, value);
      schema.properties[key] = property;
      
      // Add to required if not null
      if (value !== null && value !== undefined) {
        schema.required.push(key);
      }
    }

    return schema;
  }

  inferProperty(key, value) {
    const property = {};
    
    if (value === null) {
      property.type = ['null', 'string'];
    } else if (typeof value === 'boolean') {
      property.type = 'boolean';
    } else if (typeof value === 'number') {
      property.type = Number.isInteger(value) ? 'integer' : 'number';
      if (key.includes('port')) {
        property.minimum = 1;
        property.maximum = 65535;
      } else if (key.includes('timeout') || key.includes('interval')) {
        property.minimum = 0;
      }
    } else if (typeof value === 'string') {
      property.type = 'string';
      
      // Pattern detection
      if (key.toLowerCase().includes('url') || value.startsWith('http')) {
        property.pattern = '^https?://';
        property.format = 'uri';
      } else if (key.toLowerCase().includes('email')) {
        property.format = 'email';
      } else if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
        property.pattern = '^#[0-9A-Fa-f]{6}$';
      } else if (key.toLowerCase().includes('ws') && value.startsWith('ws')) {
        property.pattern = '^wss?://';
      }
      
      // Set max length based on content
      if (value.length > 0) {
        property.maxLength = Math.max(value.length * 2, 255);
      }
    } else if (Array.isArray(value)) {
      property.type = 'array';
      if (value.length > 0) {
        property.items = this.inferProperty(`${key}[0]`, value[0]);
      }
      property.minItems = 0;
    } else if (typeof value === 'object') {
      property.type = 'object';
      property.properties = {};
      property.additionalProperties = false;
      for (const [k, v] of Object.entries(value)) {
        property.properties[k] = this.inferProperty(k, v);
      }
    }
    
    // Add description
    property.description = this.generateDescription(key);
    
    return property;
  }

  generateDescription(key) {
    const words = key.split(/(?=[A-Z])|_/).map(w => w.toLowerCase());
    return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1);
  }

  mergeSchemas(generated, existing) {
    const merged = { ...generated };
    
    // Preserve manual additions
    if (existing._manual) {
      merged._manual = existing._manual;
    }
    
    // Preserve custom descriptions and constraints
    for (const [key, prop] of Object.entries(existing.properties || {})) {
      if (merged.properties[key]) {
        // Preserve manual descriptions
        if (prop.description && !prop.description.startsWith('Auto-generated')) {
          merged.properties[key].description = prop.description;
        }
        
        // Preserve manual constraints
        ['minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'enum'].forEach(constraint => {
          if (prop[constraint] !== undefined) {
            merged.properties[key][constraint] = prop[constraint];
          }
        });
      }
    }
    
    // Mark as modified
    merged._modified = new Date().toISOString();
    
    return merged;
  }

  async backupFile(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}`);
    
    await fs.ensureDir(this.backupDir);
    await fs.copy(filePath, backupPath);
    
    console.log(chalk.gray(`  Backed up to ${backupPath}`));
  }

  async generateAll() {
    console.log(chalk.blue('🔧 Generating schemas for all configs...\n'));
    
    const dirs = await fs.readdir(this.configsDir);
    let generated = 0;
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue; // Skip special directories
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        const dataPath = path.join(dirPath, 'data.json');
        if (await fs.pathExists(dataPath)) {
          await this.generate(dirPath);
          generated++;
        }
      }
    }
    
    console.log(chalk.green(`\n✓ Generated ${generated} schemas`));
  }

  async generateFromModuleConfigs() {
    console.log(chalk.blue('🔧 Generating schemas from module configs...\n'));
    
    if (!await fs.pathExists(this.modulesDir)) {
      console.log(chalk.yellow('No modules directory found'));
      return;
    }
    
    const modules = await fs.readdir(this.modulesDir);
    let processed = 0;
    
    for (const moduleName of modules) {
      const modulePath = path.join(this.modulesDir, moduleName);
      const stat = await fs.stat(modulePath);
      
      if (stat.isDirectory()) {
        // Find latest version
        const versions = await fs.readdir(modulePath);
        const latestVersion = versions
          .filter(v => /^\d+\.\d+\.\d+$/.test(v))
          .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
        
        if (latestVersion) {
          const configPath = path.join(modulePath, latestVersion, 'config.json');
          if (await fs.pathExists(configPath)) {
            await this.processModuleConfig(moduleName, configPath);
            processed++;
          }
        }
      }
    }
    
    console.log(chalk.green(`\n✓ Processed ${processed} module configs`));
  }

  async processModuleConfig(moduleName, configPath) {
    const config = await fs.readJson(configPath);
    
    for (const [section, data] of Object.entries(config)) {
      if (section === 'component') continue; // Skip metadata
      
      const configDir = path.join(this.configsDir, `${moduleName}_${section}`);
      await fs.ensureDir(configDir);
      
      // Create data.json if doesn't exist
      const dataPath = path.join(configDir, 'data.json');
      if (!await fs.pathExists(dataPath)) {
        await fs.writeJson(dataPath, data, { spaces: 2 });
      }
      
      // Generate schema
      await this.generate(configDir);
    }
    
    console.log(chalk.green(`✓ Processed ${moduleName}`));
  }
}

// CLI
program
  .name('schema-generator')
  .description('Generate JSON schemas from config data')
  .option('-a, --all', 'Generate schemas for all configs')
  .option('-d, --dir <path>', 'Target directory', './configs')
  .option('-p, --preserve', 'Preserve manual edits', true)
  .option('-f, --from-config', 'Generate from module config.json files')
  .action(async (options) => {
    const generator = new SchemaGenerator({
      configsDir: options.dir,
      preserveManual: options.preserve
    });
    
    try {
      if (options.all) {
        await generator.generateAll();
      } else if (options.fromConfig) {
        await generator.generateFromModuleConfigs();
      } else {
        console.log(chalk.yellow('Use --all to generate all schemas or --from-config to process modules'));
      }
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default SchemaGenerator;
