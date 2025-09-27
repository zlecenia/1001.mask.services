#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import Ajv from 'ajv';
import { program } from 'commander';

class ConfigValidator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true,
      strict: false
    });
    this.issues = [];
  }

  async validateAll() {
    console.log(chalk.blue('🔍 Validating all configurations...\n'));
    
    const dirs = await fs.readdir(this.configsDir);
    let validated = 0;
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        await this.validateConfig(dirPath);
        validated++;
      }
    }
    
    this.printReport(validated);
    return this.issues.length === 0;
  }

  async validateConfig(dirPath) {
    const configName = path.basename(dirPath);
    const issues = [];
    
    try {
      // Load files
      const data = await this.loadJson(path.join(dirPath, 'data.json'));
      const schema = await this.loadJson(path.join(dirPath, 'schema.json'));
      const crud = await this.loadJson(path.join(dirPath, 'crud.json'));
      
      if (!data) {
        issues.push('Missing data.json file');
      }
      
      if (!schema) {
        issues.push('Missing schema.json file');
      }
      
      if (!crud) {
        issues.push('Missing crud.json file');
      }
      
      if (!data || !schema) {
        this.issues.push({ config: configName, issues });
        return;
      }
      
      // Check for manual markers
      const hasManualSchema = schema._manual === true;
      const hasManualCrud = crud?._manual === true;
      
      if (hasManualSchema || hasManualCrud) {
        console.log(chalk.yellow(`⚠ ${configName} has manual changes`));
      }
      
      // Validate data against schema
      const valid = this.ajv.validate(schema, data);
      if (!valid) {
        const errors = this.ajv.errors.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        );
        issues.push(`Schema validation failed: ${errors.join(', ')}`);
      }
      
      // Validate CRUD consistency if exists
      if (crud) {
        this.validateCrudConsistency(crud, schema, data, issues);
      }
      
      // Check for conflicts
      if (hasManualSchema && schema._generated) {
        issues.push('Schema has both manual and generated markers');
      }
      
      // Validate schema structure
      this.validateSchemaStructure(schema, issues);
      
      if (issues.length > 0) {
        this.issues.push({ config: configName, issues });
        console.log(chalk.red(`✗ ${configName}: ${issues.length} issues`));
      } else {
        console.log(chalk.green(`✓ ${configName}: valid`));
      }
      
    } catch (error) {
      issues.push(`Error: ${error.message}`);
      this.issues.push({ config: configName, issues });
      console.log(chalk.red(`✗ ${configName}: ${error.message}`));
    }
  }

  async loadJson(filePath) {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      return null;
    }
  }

  validateSchemaStructure(schema, issues) {
    // Check required schema properties
    if (!schema.type) {
      issues.push('Schema missing type property');
    }
    
    if (!schema.properties) {
      issues.push('Schema missing properties');
    }
    
    // Check for proper JSON Schema format
    if (!schema.$schema) {
      issues.push('Schema missing $schema property');
    }
    
    // Validate property definitions
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!prop.type) {
          issues.push(`Property '${key}' missing type`);
        }
        
        if (!prop.description) {
          issues.push(`Property '${key}' missing description`);
        }
        
        // Check for proper constraints
        if (prop.type === 'string' && prop.maxLength && prop.maxLength < 1) {
          issues.push(`Property '${key}' has invalid maxLength`);
        }
        
        if (prop.type === 'number' && prop.minimum !== undefined && prop.maximum !== undefined) {
          if (prop.minimum > prop.maximum) {
            issues.push(`Property '${key}' has minimum greater than maximum`);
          }
        }
      }
    }
  }

  validateCrudConsistency(crud, schema, data, issues) {
    const schemaKeys = Object.keys(schema.properties || {});
    const crudKeys = [
      ...(crud.rules?.editable || []),
      ...(crud.rules?.readonly || []),
      ...(crud.rules?.protected || [])
    ];
    
    // Check for missing fields
    const missingInCrud = schemaKeys.filter(key => !crudKeys.includes(key));
    if (missingInCrud.length > 0) {
      issues.push(`Fields in schema but not in CRUD: ${missingInCrud.join(', ')}`);
    }
    
    // Check for extra fields
    const extraInCrud = crudKeys.filter(key => !schemaKeys.includes(key));
    if (extraInCrud.length > 0) {
      issues.push(`Fields in CRUD but not in schema: ${extraInCrud.join(', ')}`);
    }
    
    // Check for conflicts in CRUD rules
    if (crud.rules) {
      const editableAndReadonly = (crud.rules.editable || []).filter(
        key => (crud.rules.readonly || []).includes(key)
      );
      if (editableAndReadonly.length > 0) {
        issues.push(`Fields both editable and readonly: ${editableAndReadonly.join(', ')}`);
      }
      
      const editableAndProtected = (crud.rules.editable || []).filter(
        key => (crud.rules.protected || []).includes(key)
      );
      if (editableAndProtected.length > 0) {
        issues.push(`Fields both editable and protected: ${editableAndProtected.join(', ')}`);
      }
    }
    
    // Validate field types
    if (crud.field_types) {
      for (const [key, fieldType] of Object.entries(crud.field_types)) {
        if (!schemaKeys.includes(key)) {
          continue;
        }
        
        const schemaProp = schema.properties[key];
        if (!this.isValidFieldType(fieldType, schemaProp)) {
          issues.push(`Invalid field type '${fieldType}' for property '${key}' of type '${schemaProp.type}'`);
        }
      }
    }
    
    // Validate UI hints
    if (crud.ui_hints) {
      for (const [key, hints] of Object.entries(crud.ui_hints)) {
        if (!schemaKeys.includes(key)) {
          continue;
        }
        
        // Check for required hint properties
        if (!hints.label && !hints.help) {
          issues.push(`UI hints for '${key}' missing label or help`);
        }
      }
    }
  }

  isValidFieldType(fieldType, schemaProp) {
    const validTypes = {
      'text': ['string'],
      'textarea': ['string'],
      'number': ['number', 'integer'],
      'boolean': ['boolean'],
      'select': ['string', 'number'],
      'email': ['string'],
      'url': ['string'],
      'password': ['string'],
      'color': ['string'],
      'date': ['string'],
      'datetime': ['string'],
      'time': ['string'],
      'tel': ['string'],
      'array': ['array'],
      'object': ['object'],
      'websocket': ['string']
    };
    
    const allowedTypes = validTypes[fieldType];
    if (!allowedTypes) {
      return false;
    }
    
    return allowedTypes.includes(schemaProp.type) || 
           (Array.isArray(schemaProp.type) && schemaProp.type.some(t => allowedTypes.includes(t)));
  }

  printReport(validated) {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('CONFIGURATION VALIDATION REPORT'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    console.log(chalk.gray(`Validated ${validated} configurations\n`));
    
    if (this.issues.length === 0) {
      console.log(chalk.green('✓ All configurations are valid!'));
    } else {
      console.log(chalk.red(`Found issues in ${this.issues.length} configurations:\n`));
      
      this.issues.forEach(({ config, issues }) => {
        console.log(chalk.yellow(`\n${config}:`));
        issues.forEach(issue => {
          console.log(chalk.gray(`  - ${issue}`));
        });
      });
      
      console.log(chalk.cyan('\nRecommendations:'));
      console.log(chalk.gray('• To mark files as manually edited, add "_manual": true'));
      console.log(chalk.gray('• To regenerate, remove the _manual flag and run npm run generate'));
      console.log(chalk.gray('• Run "npm run schema:generate" to fix schema issues'));
      console.log(chalk.gray('• Run "npm run crud:generate" to fix CRUD issues'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
  }
}

// CLI
program
  .name('config-validator')
  .description('Validate configuration files against schemas')
  .option('-d, --dir <path>', 'Configs directory', './configs')
  .option('-c, --config <name>', 'Validate specific config')
  .action(async (options) => {
    const validator = new ConfigValidator({
      configsDir: options.dir
    });
    
    try {
      let success;
      
      if (options.config) {
        const configPath = path.join(options.dir, options.config);
        if (await fs.pathExists(configPath)) {
          await validator.validateConfig(configPath);
          validator.printReport(1);
          success = validator.issues.length === 0;
        } else {
          console.error(chalk.red(`Config directory '${options.config}' not found`));
          process.exit(1);
        }
      } else {
        success = await validator.validateAll();
      }
      
      if (!success) {
        process.exit(1);
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

export default ConfigValidator;
