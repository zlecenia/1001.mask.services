#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import Ajv from 'ajv';
import { program } from 'commander';

class SchemaValidator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true,
      strict: false
    });
    this.issues = [];
    this.metaSchema = this.createMetaSchema();
  }

  createMetaSchema() {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['type', 'properties'],
      properties: {
        $schema: { type: 'string' },
        type: { type: 'string', enum: ['object'] },
        properties: { 
          type: 'object',
          additionalProperties: {
            type: 'object',
            required: ['type'],
            properties: {
              type: { 
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ]
              },
              description: { type: 'string' },
              format: { type: 'string' },
              pattern: { type: 'string' },
              minimum: { type: 'number' },
              maximum: { type: 'number' },
              minLength: { type: 'integer', minimum: 0 },
              maxLength: { type: 'integer', minimum: 0 },
              enum: { type: 'array' },
              items: { type: 'object' },
              additionalProperties: { type: 'boolean' }
            }
          }
        },
        required: { 
          type: 'array',
          items: { type: 'string' }
        },
        additionalProperties: { type: 'boolean' },
        _generated: { type: 'string' },
        _generator: { type: 'string' },
        _manual: { type: 'boolean' },
        _modified: { type: 'string' }
      },
      additionalProperties: false
    };
  }

  async validateAll() {
    console.log(chalk.blue('🔍 Validating all schemas...\n'));
    
    const dirs = await fs.readdir(this.configsDir);
    let validated = 0;
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const dirPath = path.join(this.configsDir, dir);
      const stat = await fs.stat(dirPath);
      
      if (stat.isDirectory()) {
        const schemaPath = path.join(dirPath, 'schema.json');
        if (await fs.pathExists(schemaPath)) {
          await this.validateSchema(schemaPath);
          validated++;
        }
      }
    }
    
    this.printReport(validated);
    return this.issues.length === 0;
  }

  async validateSchema(schemaPath) {
    const configName = path.basename(path.dirname(schemaPath));
    const issues = [];
    
    try {
      const schema = await fs.readJson(schemaPath);
      
      // Validate against meta-schema
      const valid = this.ajv.validate(this.metaSchema, schema);
      if (!valid) {
        const errors = this.ajv.errors.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        );
        issues.push(`Meta-schema validation failed: ${errors.join(', ')}`);
      }
      
      // Validate schema structure
      this.validateSchemaStructure(schema, issues);
      
      // Validate property definitions
      this.validateProperties(schema, issues);
      
      // Check for best practices
      this.checkBestPractices(schema, issues);
      
      // Validate against data if exists
      const dataPath = path.join(path.dirname(schemaPath), 'data.json');
      if (await fs.pathExists(dataPath)) {
        await this.validateAgainstData(schema, dataPath, issues);
      }
      
      if (issues.length > 0) {
        this.issues.push({ schema: configName, issues });
        console.log(chalk.red(`✗ ${configName}: ${issues.length} issues`));
      } else {
        console.log(chalk.green(`✓ ${configName}: valid`));
      }
      
    } catch (error) {
      issues.push(`Error reading schema: ${error.message}`);
      this.issues.push({ schema: configName, issues });
      console.log(chalk.red(`✗ ${configName}: ${error.message}`));
    }
  }

  validateSchemaStructure(schema, issues) {
    // Check required properties
    if (!schema.type) {
      issues.push('Missing required property: type');
    } else if (schema.type !== 'object') {
      issues.push('Root type must be "object"');
    }
    
    if (!schema.properties) {
      issues.push('Missing required property: properties');
    }
    
    // Check for proper JSON Schema version
    if (!schema.$schema) {
      issues.push('Missing $schema property');
    } else if (!schema.$schema.includes('json-schema.org')) {
      issues.push('Invalid $schema URL');
    }
    
    // Check additionalProperties
    if (schema.additionalProperties === undefined) {
      issues.push('Consider setting additionalProperties to false for strict validation');
    }
  }

  validateProperties(schema, issues) {
    if (!schema.properties) return;
    
    for (const [propName, propDef] of Object.entries(schema.properties)) {
      // Check required properties for each property
      if (!propDef.type) {
        issues.push(`Property '${propName}' missing type`);
        continue;
      }
      
      if (!propDef.description) {
        issues.push(`Property '${propName}' missing description`);
      }
      
      // Validate type-specific constraints
      this.validatePropertyConstraints(propName, propDef, issues);
      
      // Check for nested objects
      if (propDef.type === 'object' && propDef.properties) {
        this.validateNestedProperties(propName, propDef, issues);
      }
      
      // Check for arrays
      if (propDef.type === 'array' && !propDef.items) {
        issues.push(`Array property '${propName}' missing items definition`);
      }
    }
  }

  validatePropertyConstraints(propName, propDef, issues) {
    const type = Array.isArray(propDef.type) ? propDef.type[0] : propDef.type;
    
    switch (type) {
      case 'string':
        if (propDef.minLength !== undefined && propDef.minLength < 0) {
          issues.push(`Property '${propName}' has invalid minLength`);
        }
        if (propDef.maxLength !== undefined && propDef.maxLength < 1) {
          issues.push(`Property '${propName}' has invalid maxLength`);
        }
        if (propDef.minLength !== undefined && propDef.maxLength !== undefined && 
            propDef.minLength > propDef.maxLength) {
          issues.push(`Property '${propName}' has minLength greater than maxLength`);
        }
        if (propDef.pattern) {
          try {
            new RegExp(propDef.pattern);
          } catch (e) {
            issues.push(`Property '${propName}' has invalid regex pattern`);
          }
        }
        break;
        
      case 'number':
      case 'integer':
        if (propDef.minimum !== undefined && propDef.maximum !== undefined && 
            propDef.minimum > propDef.maximum) {
          issues.push(`Property '${propName}' has minimum greater than maximum`);
        }
        if (propDef.multipleOf !== undefined && propDef.multipleOf <= 0) {
          issues.push(`Property '${propName}' has invalid multipleOf value`);
        }
        break;
        
      case 'array':
        if (propDef.minItems !== undefined && propDef.minItems < 0) {
          issues.push(`Property '${propName}' has invalid minItems`);
        }
        if (propDef.maxItems !== undefined && propDef.maxItems < 0) {
          issues.push(`Property '${propName}' has invalid maxItems`);
        }
        if (propDef.minItems !== undefined && propDef.maxItems !== undefined && 
            propDef.minItems > propDef.maxItems) {
          issues.push(`Property '${propName}' has minItems greater than maxItems`);
        }
        break;
    }
    
    // Check enum values
    if (propDef.enum && (!Array.isArray(propDef.enum) || propDef.enum.length === 0)) {
      issues.push(`Property '${propName}' has invalid enum definition`);
    }
  }

  validateNestedProperties(parentName, propDef, issues) {
    for (const [nestedName, nestedDef] of Object.entries(propDef.properties)) {
      const fullName = `${parentName}.${nestedName}`;
      
      if (!nestedDef.type) {
        issues.push(`Nested property '${fullName}' missing type`);
      }
      
      if (!nestedDef.description) {
        issues.push(`Nested property '${fullName}' missing description`);
      }
      
      this.validatePropertyConstraints(fullName, nestedDef, issues);
    }
  }

  checkBestPractices(schema, issues) {
    const warnings = [];
    
    // Check for missing titles
    if (!schema.title) {
      warnings.push('Consider adding a title property');
    }
    
    // Check for missing descriptions
    if (!schema.description) {
      warnings.push('Consider adding a description property');
    }
    
    // Check for overly permissive schemas
    if (schema.additionalProperties === true) {
      warnings.push('Consider setting additionalProperties to false for better validation');
    }
    
    // Check for missing examples
    if (schema.properties) {
      const propsWithoutExamples = Object.keys(schema.properties).filter(
        key => !schema.properties[key].examples && !schema.properties[key].default
      );
      
      if (propsWithoutExamples.length > 0) {
        warnings.push(`Consider adding examples or defaults for: ${propsWithoutExamples.join(', ')}`);
      }
    }
    
    // Add warnings as issues with lower severity
    warnings.forEach(warning => {
      issues.push(`⚠ Best practice: ${warning}`);
    });
  }

  async validateAgainstData(schema, dataPath, issues) {
    try {
      const data = await fs.readJson(dataPath);
      const validator = new Ajv({ allErrors: true });
      const valid = validator.validate(schema, data);
      
      if (!valid) {
        const errors = validator.errors.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        );
        issues.push(`Data validation failed: ${errors.join(', ')}`);
      }
    } catch (error) {
      issues.push(`Error validating against data: ${error.message}`);
    }
  }

  printReport(validated) {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('SCHEMA VALIDATION REPORT'));
    console.log(chalk.blue('='.repeat(50) + '\n'));
    
    console.log(chalk.gray(`Validated ${validated} schemas\n`));
    
    if (this.issues.length === 0) {
      console.log(chalk.green('✓ All schemas are valid!'));
    } else {
      console.log(chalk.red(`Found issues in ${this.issues.length} schemas:\n`));
      
      this.issues.forEach(({ schema, issues }) => {
        console.log(chalk.yellow(`\n${schema}:`));
        issues.forEach(issue => {
          if (issue.startsWith('⚠')) {
            console.log(chalk.yellow(`  ${issue}`));
          } else {
            console.log(chalk.gray(`  - ${issue}`));
          }
        });
      });
      
      console.log(chalk.cyan('\nRecommendations:'));
      console.log(chalk.gray('• Fix structural issues first'));
      console.log(chalk.gray('• Add missing required properties'));
      console.log(chalk.gray('• Consider best practice warnings'));
      console.log(chalk.gray('• Run "npm run schema:generate" to regenerate schemas'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
  }
}

// CLI
program
  .name('schema-validator')
  .description('Validate JSON schemas')
  .option('-d, --dir <path>', 'Configs directory', './configs')
  .option('-s, --schema <name>', 'Validate specific schema')
  .action(async (options) => {
    const validator = new SchemaValidator({
      configsDir: options.dir
    });
    
    try {
      let success;
      
      if (options.schema) {
        const schemaPath = path.join(options.dir, options.schema, 'schema.json');
        if (await fs.pathExists(schemaPath)) {
          await validator.validateSchema(schemaPath);
          validator.printReport(1);
          success = validator.issues.length === 0;
        } else {
          console.error(chalk.red(`Schema file not found: ${schemaPath}`));
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

export default SchemaValidator;
