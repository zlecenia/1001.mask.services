#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';
import inquirer from 'inquirer';

class CrudGenerator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.preserveManual = options.preserveManual !== false;
    this.interactive = options.interactive || false;
    this.backupDir = './configs/_backups';
  }

  async generate(targetDir) {
    const dataPath = path.join(targetDir, 'data.json');
    const schemaPath = path.join(targetDir, 'schema.json');
    const crudPath = path.join(targetDir, 'crud.json');
    
    // Check if manual CRUD exists
    if (await fs.pathExists(crudPath)) {
      const existingCrud = await fs.readJson(crudPath);
      
      // Check for manual marker
      if (existingCrud._manual) {
        console.log(chalk.yellow(`⚠ Manual CRUD detected in ${path.basename(targetDir)}`));
        
        if (this.interactive) {
          const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Manual CRUD rules found. What would you like to do?',
            choices: [
              { name: 'Keep manual rules', value: 'keep' },
              { name: 'Merge with generated', value: 'merge' },
              { name: 'Replace with generated', value: 'replace' }
            ]
          }]);
          
          if (action === 'keep') {
            console.log(chalk.green('✓ Keeping manual CRUD rules'));
            return;
          } else if (action === 'merge') {
            await this.mergeCrud(targetDir, existingCrud);
            return;
          }
        } else if (this.preserveManual) {
          await this.mergeCrud(targetDir, existingCrud);
          return;
        }
      }
    }
    
    // Generate new CRUD
    const data = await fs.readJson(dataPath);
    const schema = await fs.readJson(schemaPath);
    const crud = this.generateCrud(data, schema, path.basename(targetDir));
    
    // Add metadata
    crud._generated = new Date().toISOString();
    crud._generator = 'crudGenerator v1.0.0';
    
    await fs.writeJson(crudPath, crud, { spaces: 2 });
    console.log(chalk.green(`✓ Generated CRUD for ${path.basename(targetDir)}`));
  }

  generateCrud(data, schema, name) {
    const crud = {
      name: name,
      title: schema.title || this.humanize(name),
      description: schema.description || `Configuration for ${this.humanize(name)}`,
      rules: {
        editable: [],
        addable: false,
        deletable: false,
        readonly: [],
        protected: []
      },
      field_types: {},
      validation_rules: {},
      ui_hints: {},
      permissions: {
        view: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
        edit: ['ADMIN', 'SUPERUSER'],
        delete: ['SUPERUSER']
      }
    };

    // Process each property
    for (const [key, propSchema] of Object.entries(schema.properties || {})) {
      // Determine editability based on key patterns
      const isSystemField = key.startsWith('_') || key.includes('SYSTEM');
      const isIdField = key === 'id' || key.endsWith('Id');
      const isTimestamp = key.includes('createdAt') || key.includes('updatedAt');
      const isComputed = propSchema.readOnly || propSchema.computed;
      
      if (isSystemField || isTimestamp || isComputed) {
        crud.rules.readonly.push(key);
      } else if (isIdField) {
        crud.rules.protected.push(key);
      } else {
        crud.rules.editable.push(key);
      }

      // Determine field type
      crud.field_types[key] = this.getFieldType(key, propSchema);

      // Generate validation rules
      const validation = this.generateValidation(key, propSchema, schema.required || []);
      if (Object.keys(validation).length > 0) {
        crud.validation_rules[key] = validation;
      }

      // Generate UI hints
      crud.ui_hints[key] = this.generateUIHints(key, propSchema, data[key]);
    }

    return crud;
  }

  getFieldType(key, schema) {
    // Check for explicit format
    if (schema.format === 'email') return 'email';
    if (schema.format === 'uri') return 'url';
    if (schema.format === 'date') return 'date';
    if (schema.format === 'date-time') return 'datetime';
    
    // Check by pattern
    if (schema.pattern) {
      if (schema.pattern.includes('https?')) return 'url';
      if (schema.pattern.includes('wss?')) return 'websocket';
      if (schema.pattern.includes('[0-9A-Fa-f]{6}')) return 'color';
    }
    
    // Check by key name
    const keyLower = key.toLowerCase();
    if (keyLower.includes('password')) return 'password';
    if (keyLower.includes('email')) return 'email';
    if (keyLower.includes('url')) return 'url';
    if (keyLower.includes('color')) return 'color';
    if (keyLower.includes('date')) return 'date';
    if (keyLower.includes('time')) return 'time';
    if (keyLower.includes('phone')) return 'tel';
    
    // Check by enum
    if (schema.enum) return 'select';
    
    // Check by type
    if (schema.type === 'boolean') return 'boolean';
    if (schema.type === 'number' || schema.type === 'integer') return 'number';
    if (schema.type === 'array') return 'array';
    if (schema.type === 'object') return 'object';
    
    // Check for long strings
    if (schema.type === 'string' && (schema.maxLength > 255 || keyLower.includes('description') || keyLower.includes('comment'))) {
      return 'textarea';
    }
    
    return 'text';
  }

  generateValidation(key, schema, required) {
    const validation = {};
    
    if (required.includes(key)) {
      validation.required = true;
    }
    
    if (schema.minimum !== undefined) validation.min = schema.minimum;
    if (schema.maximum !== undefined) validation.max = schema.maximum;
    if (schema.minLength !== undefined) validation.minLength = schema.minLength;
    if (schema.maxLength !== undefined) validation.maxLength = schema.maxLength;
    if (schema.pattern) validation.pattern = schema.pattern;
    if (schema.enum) validation.enum = schema.enum;
    if (schema.multipleOf) validation.step = schema.multipleOf;
    
    // Add field-specific validation
    const fieldType = this.getFieldType(key, schema);
    if (fieldType === 'email') {
      validation.pattern = validation.pattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
    }
    if (fieldType === 'url') {
      validation.pattern = validation.pattern || '^https?://';
    }
    
    return validation;
  }

  generateUIHints(key, schema, currentValue) {
    const hints = {
      help: schema.description || `Configure ${this.humanize(key)}`,
      label: this.humanize(key)
    };
    
    // Add placeholder
    if (currentValue !== undefined && currentValue !== null) {
      if (typeof currentValue === 'string' && currentValue.length < 50) {
        hints.placeholder = currentValue;
      }
    } else if (schema.examples && schema.examples.length > 0) {
      hints.placeholder = schema.examples[0];
    }
    
    // Add field-specific hints
    const fieldType = this.getFieldType(key, schema);
    
    switch (fieldType) {
      case 'password':
        hints.type = 'password';
        hints.autocomplete = 'new-password';
        break;
      case 'email':
        hints.type = 'email';
        hints.autocomplete = 'email';
        break;
      case 'url':
        hints.type = 'url';
        if (key.includes('ws')) {
          hints.placeholder = hints.placeholder || 'ws://localhost:3000';
        } else {
          hints.placeholder = hints.placeholder || 'http://localhost:3000';
        }
        break;
      case 'websocket':
        hints.type = 'url';
        hints.placeholder = hints.placeholder || 'ws://localhost:3000/ws';
        break;
      case 'color':
        hints.type = 'color';
        break;
      case 'boolean':
        hints.type = 'switch';
        hints.trueLabel = 'Enabled';
        hints.falseLabel = 'Disabled';
        break;
      case 'number':
        hints.type = 'number';
        if (schema.multipleOf) hints.step = schema.multipleOf;
        if (key.includes('port')) {
          hints.min = 1;
          hints.max = 65535;
        }
        if (key.includes('percent')) {
          hints.suffix = '%';
          hints.min = 0;
          hints.max = 100;
        }
        break;
      case 'select':
        hints.options = schema.enum.map(value => ({
          value: value,
          label: this.humanize(value.toString())
        }));
        break;
      case 'textarea':
        hints.rows = 4;
        hints.maxLength = schema.maxLength || 1000;
        break;
      case 'array':
        hints.addable = true;
        hints.removable = true;
        break;
    }
    
    // Add units based on key patterns
    const keyLower = key.toLowerCase();
    if (keyLower.includes('timeout') || keyLower.includes('interval') || keyLower.includes('delay')) {
      hints.suffix = 'ms';
    }
    if (keyLower.includes('size') && !keyLower.includes('font')) {
      hints.suffix = 'MB';
    }
    if (keyLower.includes('height') || keyLower.includes('width')) {
      hints.suffix = 'px';
    }
    if (keyLower.includes('temperature')) {
      hints.suffix = '°C';
    }
    if (keyLower.includes('pressure')) {
      hints.suffix = 'bar';
    }
    
    return hints;
  }

  humanize(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  async mergeCrud(targetDir, existingCrud) {
    const dataPath = path.join(targetDir, 'data.json');
    const schemaPath = path.join(targetDir, 'schema.json');
    const crudPath = path.join(targetDir, 'crud.json');
    
    // Backup existing
    await this.backupFile(crudPath);
    
    // Generate new
    const data = await fs.readJson(dataPath);
    const schema = await fs.readJson(schemaPath);
    const generated = this.generateCrud(data, schema, path.basename(targetDir));
    
    // Merge preserving manual changes
    const merged = { ...generated };
    
    // Preserve manual rules
    if (existingCrud.rules) {
      // Keep manually added fields in editable/readonly
      const manualEditable = existingCrud.rules.editable.filter(
        field => !generated.rules.editable.includes(field) && 
                 !generated.rules.readonly.includes(field)
      );
      merged.rules.editable.push(...manualEditable);
      
      // Preserve protected fields
      if (existingCrud.rules.protected) {
        merged.rules.protected = [...new Set([
          ...merged.rules.protected,
          ...existingCrud.rules.protected
        ])];
      }
      
      // Preserve addable/deletable settings
      if (existingCrud.rules.addable !== undefined) {
        merged.rules.addable = existingCrud.rules.addable;
      }
      if (existingCrud.rules.deletable !== undefined) {
        merged.rules.deletable = existingCrud.rules.deletable;
      }
    }
    
    // Preserve manual UI hints
    for (const [key, hints] of Object.entries(existingCrud.ui_hints || {})) {
      if (hints._manual) {
        merged.ui_hints[key] = hints;
      }
    }
    
    // Preserve manual permissions
    if (existingCrud.permissions) {
      merged.permissions = { ...merged.permissions, ...existingCrud.permissions };
    }
    
    // Mark as merged
    merged._modified = new Date().toISOString();
    merged._merged = true;
    if (existingCrud._manual) {
      merged._manual = existingCrud._manual;
    }
    
    await fs.writeJson(crudPath, merged, { spaces: 2 });
    console.log(chalk.green(`✓ Merged CRUD for ${path.basename(targetDir)}`));
  }

  async backupFile(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}`);
    
    await fs.ensureDir(this.backupDir);
    await fs.copy(filePath, backupPath);
  }

  async generateAll() {
    console.log(chalk.blue('🔧 Generating CRUD rules for all configs...\n'));
    
    const dirs = await fs.readdir(this.configsDir);
    let generated = 0;
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        const schemaPath = path.join(dirPath, 'schema.json');
        if (await fs.pathExists(schemaPath)) {
          await this.generate(dirPath);
          generated++;
        }
      }
    }
    
    console.log(chalk.green(`\n✓ Generated ${generated} CRUD configurations`));
  }
}

// CLI
program
  .name('crud-generator')
  .description('Generate CRUD rules from schemas')
  .option('-a, --all', 'Generate CRUD for all configs')
  .option('-d, --dir <path>', 'Target directory', './configs')
  .option('-i, --interactive', 'Interactive mode for manual conflicts')
  .option('-u, --update', 'Update existing CRUD rules')
  .action(async (options) => {
    const generator = new CrudGenerator({
      configsDir: options.dir,
      interactive: options.interactive,
      preserveManual: !options.update
    });
    
    try {
      if (options.all) {
        await generator.generateAll();
      } else {
        console.log(chalk.yellow('Use --all to generate all CRUD rules'));
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

export default CrudGenerator;
