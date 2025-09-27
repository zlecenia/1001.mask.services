#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class CrudValidator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.issues = [];
  }

  async validateAll() {
    console.log(chalk.blue('🔍 Validating all CRUD configurations...\n'));
    
    const dirs = await fs.readdir(this.configsDir);
    let validated = 0;
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        const crudPath = path.join(dirPath, 'crud.json');
        if (await fs.pathExists(crudPath)) {
          await this.validateCrud(crudPath);
          validated++;
        }
      }
    }
    
    this.printReport(validated);
    return this.issues.length === 0;
  }

  async validateCrud(crudPath) {
    const configName = path.basename(path.dirname(crudPath));
    const issues = [];
    
    try {
      const crud = await fs.readJson(crudPath);
      
      // Validate CRUD structure
      this.validateCrudStructure(crud, issues);
      
      // Validate field types
      this.validateFieldTypes(crud, issues);
      
      // Validate validation rules
      this.validateValidationRules(crud, issues);
      
      // Validate UI hints
      this.validateUIHints(crud, issues);
      
      // Validate permissions
      this.validatePermissions(crud, issues);
      
      // Check consistency with schema
      const schemaPath = path.join(path.dirname(crudPath), 'schema.json');
      if (await fs.pathExists(schemaPath)) {
        const schema = await fs.readJson(schemaPath);
        this.validateSchemaConsistency(crud, schema, issues);
      }
      
      if (issues.length > 0) {
        this.issues.push({ crud: configName, issues });
        console.log(chalk.red(`✗ ${configName}: ${issues.length} issues`));
      } else {
        console.log(chalk.green(`✓ ${configName}: valid`));
      }
      
    } catch (error) {
      issues.push(`Error reading CRUD: ${error.message}`);
      this.issues.push({ crud: configName, issues });
      console.log(chalk.red(`✗ ${configName}: ${error.message}`));
    }
  }

  validateCrudStructure(crud, issues) {
    // Required properties
    const requiredProps = ['name', 'rules', 'field_types', 'validation_rules', 'ui_hints'];
    
    for (const prop of requiredProps) {
      if (!crud[prop]) {
        issues.push(`Missing required property: ${prop}`);
      }
    }
    
    // Validate rules structure
    if (crud.rules) {
      const requiredRules = ['editable', 'readonly', 'protected'];
      
      for (const rule of requiredRules) {
        if (!Array.isArray(crud.rules[rule])) {
          issues.push(`rules.${rule} must be an array`);
        }
      }
      
      if (typeof crud.rules.addable !== 'boolean') {
        issues.push('rules.addable must be a boolean');
      }
      
      if (typeof crud.rules.deletable !== 'boolean') {
        issues.push('rules.deletable must be a boolean');
      }
    }
    
    // Validate object properties
    const objectProps = ['field_types', 'validation_rules', 'ui_hints'];
    
    for (const prop of objectProps) {
      if (crud[prop] && typeof crud[prop] !== 'object') {
        issues.push(`${prop} must be an object`);
      }
    }
  }

  validateFieldTypes(crud, issues) {
    if (!crud.field_types) return;
    
    const validFieldTypes = [
      'text', 'textarea', 'number', 'boolean', 'select', 'email', 'url', 
      'password', 'color', 'date', 'datetime', 'time', 'tel', 'array', 
      'object', 'websocket'
    ];
    
    for (const [field, fieldType] of Object.entries(crud.field_types)) {
      if (!validFieldTypes.includes(fieldType)) {
        issues.push(`Invalid field type '${fieldType}' for field '${field}'`);
      }
    }
  }

  validateValidationRules(crud, issues) {
    if (!crud.validation_rules) return;
    
    for (const [field, rules] of Object.entries(crud.validation_rules)) {
      if (typeof rules !== 'object') {
        issues.push(`Validation rules for '${field}' must be an object`);
        continue;
      }
      
      // Validate specific rule types
      if (rules.min !== undefined && typeof rules.min !== 'number') {
        issues.push(`Validation rule 'min' for '${field}' must be a number`);
      }
      
      if (rules.max !== undefined && typeof rules.max !== 'number') {
        issues.push(`Validation rule 'max' for '${field}' must be a number`);
      }
      
      if (rules.minLength !== undefined && (!Number.isInteger(rules.minLength) || rules.minLength < 0)) {
        issues.push(`Validation rule 'minLength' for '${field}' must be a non-negative integer`);
      }
      
      if (rules.maxLength !== undefined && (!Number.isInteger(rules.maxLength) || rules.maxLength < 0)) {
        issues.push(`Validation rule 'maxLength' for '${field}' must be a non-negative integer`);
      }
      
      if (rules.pattern !== undefined && typeof rules.pattern !== 'string') {
        issues.push(`Validation rule 'pattern' for '${field}' must be a string`);
      }
      
      if (rules.enum !== undefined && !Array.isArray(rules.enum)) {
        issues.push(`Validation rule 'enum' for '${field}' must be an array`);
      }
      
      // Validate pattern is valid regex
      if (rules.pattern) {
        try {
          new RegExp(rules.pattern);
        } catch (e) {
          issues.push(`Invalid regex pattern for '${field}': ${rules.pattern}`);
        }
      }
      
      // Check logical consistency
      if (rules.min !== undefined && rules.max !== undefined && rules.min > rules.max) {
        issues.push(`Validation rules for '${field}': min (${rules.min}) cannot be greater than max (${rules.max})`);
      }
      
      if (rules.minLength !== undefined && rules.maxLength !== undefined && rules.minLength > rules.maxLength) {
        issues.push(`Validation rules for '${field}': minLength (${rules.minLength}) cannot be greater than maxLength (${rules.maxLength})`);
      }
    }
  }

  validateUIHints(crud, issues) {
    if (!crud.ui_hints) return;
    
    for (const [field, hints] of Object.entries(crud.ui_hints)) {
      if (typeof hints !== 'object') {
        issues.push(`UI hints for '${field}' must be an object`);
        continue;
      }
      
      // Validate specific hint types
      if (hints.rows !== undefined && (!Number.isInteger(hints.rows) || hints.rows < 1)) {
        issues.push(`UI hint 'rows' for '${field}' must be a positive integer`);
      }
      
      if (hints.min !== undefined && typeof hints.min !== 'number') {
        issues.push(`UI hint 'min' for '${field}' must be a number`);
      }
      
      if (hints.max !== undefined && typeof hints.max !== 'number') {
        issues.push(`UI hint 'max' for '${field}' must be a number`);
      }
      
      if (hints.step !== undefined && typeof hints.step !== 'number') {
        issues.push(`UI hint 'step' for '${field}' must be a number`);
      }
      
      if (hints.options !== undefined && !Array.isArray(hints.options)) {
        issues.push(`UI hint 'options' for '${field}' must be an array`);
      }
      
      // Validate options structure
      if (hints.options) {
        hints.options.forEach((option, index) => {
          if (typeof option !== 'object' || !option.hasOwnProperty('value') || !option.hasOwnProperty('label')) {
            issues.push(`UI hint option ${index} for '${field}' must have 'value' and 'label' properties`);
          }
        });
      }
    }
  }

  validatePermissions(crud, issues) {
    if (!crud.permissions) return;
    
    const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
    const permissionTypes = ['view', 'edit', 'delete'];
    
    for (const [permType, roles] of Object.entries(crud.permissions)) {
      if (!permissionTypes.includes(permType)) {
        issues.push(`Invalid permission type: ${permType}`);
        continue;
      }
      
      if (!Array.isArray(roles)) {
        issues.push(`Permission '${permType}' must be an array`);
        continue;
      }
      
      for (const role of roles) {
        if (!validRoles.includes(role)) {
          issues.push(`Invalid role '${role}' in permission '${permType}'`);
        }
      }
    }
    
    // Check logical consistency
    if (crud.permissions.edit && crud.permissions.view) {
      const canEdit = new Set(crud.permissions.edit);
      const canView = new Set(crud.permissions.view);
      
      for (const role of canEdit) {
        if (!canView.has(role)) {
          issues.push(`Role '${role}' can edit but cannot view - this is inconsistent`);
        }
      }
    }
    
    if (crud.permissions.delete && crud.permissions.edit) {
      const canDelete = new Set(crud.permissions.delete);
      const canEdit = new Set(crud.permissions.edit);
      
      for (const role of canDelete) {
        if (!canEdit.has(role)) {
          issues.push(`Role '${role}' can delete but cannot edit - this is inconsistent`);
        }
      }
    }
  }

  validateSchemaConsistency(crud, schema, issues) {
    if (!schema.properties) return;
    
    const schemaFields = Object.keys(schema.properties);
    const crudFields = [
      ...(crud.rules?.editable || []),
      ...(crud.rules?.readonly || []),
      ...(crud.rules?.protected || [])
    ];
    
    // Check for fields in schema but not in CRUD
    const missingInCrud = schemaFields.filter(field => !crudFields.includes(field));
    if (missingInCrud.length > 0) {
      issues.push(`Fields in schema but not in CRUD rules: ${missingInCrud.join(', ')}`);
    }
    
    // Check for fields in CRUD but not in schema
    const missingInSchema = crudFields.filter(field => !schemaFields.includes(field));
    if (missingInSchema.length > 0) {
      issues.push(`Fields in CRUD rules but not in schema: ${missingInSchema.join(', ')}`);
    }
    
    // Validate field types against schema types
    if (crud.field_types) {
      for (const [field, fieldType] of Object.entries(crud.field_types)) {
        if (schema.properties[field]) {
          const schemaType = schema.properties[field].type;
          if (!this.isCompatibleFieldType(fieldType, schemaType)) {
            issues.push(`Field type '${fieldType}' for '${field}' is incompatible with schema type '${schemaType}'`);
          }
        }
      }
    }
    
    // Check validation rules against schema constraints
    if (crud.validation_rules) {
      for (const [field, rules] of Object.entries(crud.validation_rules)) {
        if (schema.properties[field]) {
          const schemaProp = schema.properties[field];
          
          // Check if required in schema matches CRUD validation
          const isRequired = schema.required?.includes(field);
          if (isRequired && !rules.required) {
            issues.push(`Field '${field}' is required in schema but not in CRUD validation`);
          }
          
          // Check min/max constraints
          if (rules.min !== undefined && schemaProp.minimum !== undefined && rules.min < schemaProp.minimum) {
            issues.push(`CRUD min (${rules.min}) for '${field}' is less than schema minimum (${schemaProp.minimum})`);
          }
          
          if (rules.max !== undefined && schemaProp.maximum !== undefined && rules.max > schemaProp.maximum) {
            issues.push(`CRUD max (${rules.max}) for '${field}' is greater than schema maximum (${schemaProp.maximum})`);
          }
        }
      }
    }
  }

  isCompatibleFieldType(fieldType, schemaType) {
    const compatibility = {
      'text': ['string'],
      'textarea': ['string'],
      'number': ['number', 'integer'],
      'boolean': ['boolean'],
      'select': ['string', 'number', 'integer'],
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
    
    const compatibleTypes = compatibility[fieldType];
    if (!compatibleTypes) return false;
    
    if (Array.isArray(schemaType)) {
      return schemaType.some(type => compatibleTypes.includes(type));
    }
    
    return compatibleTypes.includes(schemaType);
  }

  printReport(validated) {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('CRUD VALIDATION REPORT'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    console.log(chalk.gray(`Validated ${validated} CRUD configurations\n`));
    
    if (this.issues.length === 0) {
      console.log(chalk.green('✓ All CRUD configurations are valid!'));
    } else {
      console.log(chalk.red(`Found issues in ${this.issues.length} CRUD configurations:\n`));
      
      this.issues.forEach(({ crud, issues }) => {
        console.log(chalk.yellow(`\n${crud}:`));
        issues.forEach(issue => {
          console.log(chalk.gray(`  - ${issue}`));
        });
      });
      
      console.log(chalk.cyan('\nRecommendations:'));
      console.log(chalk.gray('• Fix structural issues first'));
      console.log(chalk.gray('• Ensure field types match schema types'));
      console.log(chalk.gray('• Validate permission hierarchies'));
      console.log(chalk.gray('• Run "npm run crud:generate" to regenerate CRUD files'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
  }
}

// CLI
program
  .name('crud-validator')
  .description('Validate CRUD configuration files')
  .option('-d, --dir <path>', 'Configs directory', './configs')
  .option('-c, --crud <name>', 'Validate specific CRUD configuration')
  .action(async (options) => {
    const validator = new CrudValidator({
      configsDir: options.dir
    });
    
    try {
      let success;
      
      if (options.crud) {
        const crudPath = path.join(options.dir, options.crud, 'crud.json');
        if (await fs.pathExists(crudPath)) {
          await validator.validateCrud(crudPath);
          validator.printReport(1);
          success = validator.issues.length === 0;
        } else {
          console.error(chalk.red(`CRUD file not found: ${crudPath}`));
          process.exit(1);
        }
      } else {
        success = await validator.validateAll();
      }
      
      if (!success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Validation failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default CrudValidator;
