#!/usr/bin/env node

/**
 * Schema generator for component-based structure
 * Works with js/features/[component]/[version]/config/ directories
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class ComponentSchemaGenerator {
  constructor() {
    this.featuresDir = './js/features';
    this.processed = 0;
    this.errors = [];
  }

  async generateAll() {
    console.log(chalk.blue('🔧 Generating schemas for component configs...'));
    
    try {
      const components = await this.findComponents();
      
      for (const component of components) {
        await this.generateComponentSchema(component);
      }
      
      console.log(chalk.green(`\n✓ Generated ${this.processed} schemas`));
      
      if (this.errors.length > 0) {
        console.log(chalk.red(`\n❌ Errors: ${this.errors.length}`));
        this.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      }
      
    } catch (error) {
      console.error(chalk.red('Schema generation failed:'), error.message);
      process.exit(1);
    }
  }

  async findComponents() {
    const components = [];
    
    if (!await fs.pathExists(this.featuresDir)) {
      console.log(chalk.yellow('Features directory not found, skipping component schema generation'));
      return components;
    }
    
    const componentDirs = await fs.readdir(this.featuresDir);
    
    for (const componentName of componentDirs) {
      const componentPath = path.join(this.featuresDir, componentName);
      const stat = await fs.stat(componentPath);
      
      if (stat.isDirectory()) {
        // Look for version directories
        const versions = await fs.readdir(componentPath);
        for (const version of versions) {
          const versionPath = path.join(componentPath, version);
          const configDir = path.join(versionPath, 'config');
          
          if (await fs.pathExists(configDir)) {
            components.push({
              name: componentName,
              version,
              path: versionPath,
              configDir
            });
          }
        }
      }
    }
    
    return components;
  }

  async generateComponentSchema(component) {
    const { name, version, configDir } = component;
    console.log(chalk.blue(`  Processing ${name}@${version}...`));
    
    try {
      const configPath = path.join(configDir, 'config.json');
      const dataPath = path.join(configDir, 'data.json');
      const schemaPath = path.join(configDir, 'schema.json');
      
      // Check if we have source data
      let sourceData = null;
      
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        sourceData = config;
      } else if (await fs.pathExists(dataPath)) {
        sourceData = await fs.readJson(dataPath);
      }
      
      if (!sourceData) {
        console.log(chalk.yellow(`    ⚠ No config data found, skipping`));
        return;
      }
      
      // Check for manual edits
      if (await fs.pathExists(schemaPath)) {
        const existingSchema = await fs.readJson(schemaPath);
        if (existingSchema._manual) {
          console.log(chalk.yellow(`    ⚠ Preserving manual schema`));
          return;
        }
      }
      
      // Generate enhanced schema
      const schema = await this.generateSchema(sourceData, { name, version });
      
      // Write schema
      await fs.writeJson(schemaPath, schema, { spaces: 2 });
      console.log(chalk.green(`    ✓ Generated schema.json`));
      
      this.processed++;
      
    } catch (error) {
      const errorMsg = `Failed to generate schema for ${name}@${version}: ${error.message}`;
      this.errors.push(errorMsg);
      console.log(chalk.red(`    ❌ ${error.message}`));
    }
  }

  async generateSchema(data, context = {}) {
    const schema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "title": `${context.name || 'Component'} Configuration Schema`,
      "description": `Auto-generated schema for ${context.name || 'component'} configuration`,
      "_generated": new Date().toISOString(),
      "_generator": "componentSchemaGenerator v1.0.0",
      "_version": context.version || "0.1.0",
      "properties": {},
      "required": [],
      "additionalProperties": false
    };

    // Analyze data structure
    for (const [key, value] of Object.entries(data)) {
      schema.properties[key] = this.analyzeValue(value, key);
      
      // Mark as required if it's essential configuration
      if (this.isRequiredField(key, value)) {
        schema.required.push(key);
      }
    }

    return schema;
  }

  analyzeValue(value, key = '') {
    if (value === null) {
      return { type: "null" };
    }

    if (Array.isArray(value)) {
      const itemSchema = value.length > 0 ? this.analyzeValue(value[0]) : { type: "string" };
      return {
        type: "array",
        items: itemSchema,
        minItems: 0
      };
    }

    switch (typeof value) {
      case 'string':
        return this.analyzeString(value, key);
      case 'number':
        return this.analyzeNumber(value, key);
      case 'boolean':
        return { type: "boolean" };
      case 'object':
        return this.analyzeObject(value, key);
      default:
        return { type: "string" };
    }
  }

  analyzeString(value, key) {
    const schema = { type: "string" };

    // URL detection
    if (this.isUrl(value)) {
      schema.format = "uri";
      schema.pattern = "^https?://";
    }
    
    // Email detection
    else if (this.isEmail(value)) {
      schema.format = "email";
    }
    
    // Color detection
    else if (this.isColor(value)) {
      schema.pattern = "^#[0-9a-fA-F]{6}$";
      schema.description = "Hex color code";
    }
    
    // Date detection
    else if (this.isDate(value)) {
      schema.format = "date";
      schema.pattern = "^\\d{4}-\\d{2}-\\d{2}$";
    }
    
    // Enum detection for common values
    else if (this.isEnumValue(value, key)) {
      schema.enum = this.getEnumValues(key);
    }

    // Length constraints
    if (value.length > 0) {
      schema.minLength = 1;
      if (value.length > 100) {
        schema.maxLength = 1000;
      }
    }

    return schema;
  }

  analyzeNumber(value, key) {
    const schema = { type: "number" };

    // Range detection based on key and value
    if (key.includes('port') || key.includes('Port')) {
      schema.minimum = 1;
      schema.maximum = 65535;
    } else if (key.includes('timeout') || key.includes('interval')) {
      schema.minimum = 0;
      schema.maximum = 300000; // 5 minutes
    } else if (key.includes('percentage') || key.includes('percent')) {
      schema.minimum = 0;
      schema.maximum = 100;
    } else if (value >= 0) {
      schema.minimum = 0;
    }

    return schema;
  }

  analyzeObject(value, key) {
    const schema = {
      type: "object",
      properties: {},
      additionalProperties: true
    };

    // Recursively analyze object properties
    for (const [subKey, subValue] of Object.entries(value)) {
      schema.properties[subKey] = this.analyzeValue(subValue, subKey);
    }

    return schema;
  }

  isRequiredField(key, value) {
    // Essential configuration fields
    const requiredKeys = [
      'component', 'name', 'version', 'type', 'enabled', 'baseUrl'
    ];
    
    if (requiredKeys.includes(key)) return true;
    
    // Non-null object fields are often required
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value).length > 0;
    }
    
    return false;
  }

  isUrl(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  isColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  isDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
  }

  isEnumValue(value, key) {
    // Common enum patterns
    const enumPatterns = {
      status: ['ONLINE', 'OFFLINE', 'CONNECTING', 'ERROR'],
      role: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
      environment: ['development', 'production', 'staging'],
      theme: ['default', 'dark', 'light'],
      type: ['component', 'service', 'layout']
    };

    for (const [pattern, values] of Object.entries(enumPatterns)) {
      if (key.toLowerCase().includes(pattern) && values.includes(value)) {
        return true;
      }
    }

    return false;
  }

  getEnumValues(key) {
    const enumPatterns = {
      status: ['ONLINE', 'OFFLINE', 'CONNECTING', 'ERROR'],
      role: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
      environment: ['development', 'production', 'staging'],
      theme: ['default', 'dark', 'light'],
      type: ['component', 'service', 'layout']
    };

    for (const [pattern, values] of Object.entries(enumPatterns)) {
      if (key.toLowerCase().includes(pattern)) {
        return values;
      }
    }

    return [];
  }
}

// CLI setup
program
  .name('component-schema-generator')
  .description('Generate JSON schemas for component configurations')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate schemas for all components')
  .action(async () => {
    const generator = new ComponentSchemaGenerator();
    await generator.generateAll();
  });

// Default action
if (process.argv.length === 2) {
  const generator = new ComponentSchemaGenerator();
  generator.generateAll().catch(console.error);
} else {
  program.parse();
}

export default ComponentSchemaGenerator;
