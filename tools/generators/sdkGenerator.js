#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';

class SDKGenerator {
  constructor(options = {}) {
    this.configsDir = options.configsDir || './configs';
    this.outputDir = options.outputDir || './sdk';
    this.language = options.language || 'js';
  }

  async generateSDK() {
    console.log(chalk.blue(`🔧 Generating ${this.language.toUpperCase()} SDK...\n`));
    
    const configs = await this.loadConfigs();
    
    if (configs.length === 0) {
      console.log(chalk.yellow('No configurations found.'));
      return;
    }
    
    const sdkDir = path.join(this.outputDir, this.language);
    await fs.ensureDir(sdkDir);
    
    switch (this.language) {
      case 'js':
        await this.generateJavaScriptSDK(configs, sdkDir);
        break;
      case 'python':
        await this.generatePythonSDK(configs, sdkDir);
        break;
      case 'go':
        await this.generateGoSDK(configs, sdkDir);
        break;
      default:
        throw new Error(`Unsupported language: ${this.language}`);
    }
    
    console.log(chalk.green(`✓ ${this.language.toUpperCase()} SDK generated in ${sdkDir}`));
  }

  async loadConfigs() {
    if (!await fs.pathExists(this.configsDir)) {
      return [];
    }
    
    const dirs = await fs.readdir(this.configsDir);
    const configs = [];
    
    for (const dir of dirs) {
      if (dir.startsWith('_')) continue;
      
      const configDir = path.join(this.configsDir, dir);
      const stat = await fs.stat(configDir);
      
      if (stat.isDirectory()) {
        const config = await this.loadConfig(dir, configDir);
        if (config) {
          configs.push(config);
        }
      }
    }
    
    return configs;
  }

  async loadConfig(name, configDir) {
    try {
      const dataPath = path.join(configDir, 'data.json');
      const schemaPath = path.join(configDir, 'schema.json');
      const crudPath = path.join(configDir, 'crud.json');
      
      const config = { name };
      
      if (await fs.pathExists(dataPath)) {
        config.data = await fs.readJson(dataPath);
      }
      
      if (await fs.pathExists(schemaPath)) {
        config.schema = await fs.readJson(schemaPath);
      }
      
      if (await fs.pathExists(crudPath)) {
        config.crud = await fs.readJson(crudPath);
      }
      
      return config;
    } catch (error) {
      console.log(chalk.red(`Error loading config ${name}: ${error.message}`));
      return null;
    }
  }

  async generateJavaScriptSDK(configs, outputDir) {
    // Generate main ConfigSDK class
    const configSDKContent = this.generateJSConfigSDK();
    await fs.writeFile(path.join(outputDir, 'ConfigSDK.js'), configSDKContent);
    
    // Generate TypeScript definitions
    const typesContent = this.generateJSTypes(configs);
    await fs.writeFile(path.join(outputDir, 'types.d.ts'), typesContent);
    
    // Generate main SDK file
    const sdkContent = this.generateJSMainFile(configs);
    await fs.writeFile(path.join(outputDir, 'index.js'), sdkContent);
    
    // Generate individual config classes
    for (const config of configs) {
      const configClass = this.generateJSConfigClass(config);
      await fs.writeFile(path.join(outputDir, `${config.name}.js`), configClass);
    }
    
    // Generate examples
    const examplesContent = this.generateJSExamples(configs);
    await fs.writeFile(path.join(outputDir, 'examples.js'), examplesContent);
    
    // Generate package.json
    const packageJson = this.generateJSPackageJson();
    await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
    
    // Generate README
    const readme = this.generateJSReadme(configs);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }

  generateJSConfigSDK() {
    return `/**
 * MASKSERVICE C20 1001 Configuration SDK
 * Universal configuration management with validation and real-time sync
 * Auto-generated on ${new Date().toISOString()}
 */

class ConfigSDK {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000/api';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    this.cache = new Map();
    this.validators = new Map();
    this.watchers = new Map();
    this.timeout = options.timeout || 30000;
  }

  /**
   * Load schema for validation
   * @param {string} name - Schema name
   * @returns {Promise<Object>} Schema object
   */
  async loadSchema(name) {
    try {
      const response = await fetch(\`\${this.baseUrl}/schemas/\${name}\`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(\`Failed to load schema: \${response.statusText}\`);
      }
      
      const schema = await response.json();
      this.validators.set(name, schema);
      return schema;
    } catch (error) {
      throw new Error(\`Schema loading failed: \${error.message}\`);
    }
  }

  /**
   * Validate data against schema
   * @param {Object} data - Data to validate
   * @param {string} schemaName - Schema name
   * @returns {Object} Validation result
   */
  validate(data, schemaName) {
    const schema = this.validators.get(schemaName);
    if (!schema) {
      throw new Error(\`Schema \${schemaName} not loaded\`);
    }
    
    const errors = [];
    const properties = schema.properties || {};
    const required = schema.required || [];
    
    // Check required fields
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        errors.push(\`\${field} is required\`);
      }
    }
    
    // Validate field types and constraints
    for (const [key, value] of Object.entries(data)) {
      const propSchema = properties[key];
      if (!propSchema) continue;
      
      const fieldErrors = this.validateField(key, value, propSchema);
      errors.push(...fieldErrors);
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate individual field
   * @private
   */
  validateField(key, value, schema) {
    const errors = [];
    const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
    
    // Type validation
    if (type === 'string' && typeof value !== 'string') {
      errors.push(\`\${key} must be a string\`);
    } else if (type === 'number' && typeof value !== 'number') {
      errors.push(\`\${key} must be a number\`);
    } else if (type === 'boolean' && typeof value !== 'boolean') {
      errors.push(\`\${key} must be a boolean\`);
    } else if (type === 'array' && !Array.isArray(value)) {
      errors.push(\`\${key} must be an array\`);
    }
    
    // Pattern validation
    if (schema.pattern && typeof value === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push(\`\${key} does not match pattern \${schema.pattern}\`);
      }
    }
    
    // Range validation
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(\`\${key} must be >= \${schema.minimum}\`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(\`\${key} must be <= \${schema.maximum}\`);
      }
    }
    
    // Length validation
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push(\`\${key} must be at least \${schema.minLength} characters\`);
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push(\`\${key} must be at most \${schema.maxLength} characters\`);
      }
    }
    
    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(\`\${key} must be one of: \${schema.enum.join(', ')}\`);
    }
    
    return errors;
  }

  /**
   * Get configuration
   * @param {string} configName - Configuration name
   * @param {Object} options - Options
   * @returns {Promise<Object>} Configuration data
   */
  async get(configName, options = {}) {
    if (options.cache && this.cache.has(configName)) {
      return this.cache.get(configName);
    }

    try {
      const response = await fetch(\`\${this.baseUrl}/config/\${configName}\`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(\`Failed to fetch config: \${response.statusText}\`);
      }

      const data = await response.json();
      
      if (options.validate !== false && this.validators.has(configName)) {
        const validation = this.validate(data, configName);
        if (!validation.valid) {
          throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
        }
      }

      if (options.cache) {
        this.cache.set(configName, data);
      }

      return data;
    } catch (error) {
      throw new Error(\`Get config failed: \${error.message}\`);
    }
  }

  /**
   * Update entire configuration
   * @param {string} configName - Configuration name
   * @param {Object} data - New configuration data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Updated configuration
   */
  async update(configName, data, options = {}) {
    if (options.validate !== false && this.validators.has(configName)) {
      const validation = this.validate(data, configName);
      if (!validation.valid) {
        throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
      }
    }

    try {
      const response = await fetch(\`\${this.baseUrl}/config/\${configName}\`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(\`Failed to update config: \${response.statusText}\`);
      }

      const updated = await response.json();
      
      if (this.cache.has(configName)) {
        this.cache.set(configName, updated);
      }

      return updated;
    } catch (error) {
      throw new Error(\`Update config failed: \${error.message}\`);
    }
  }

  /**
   * Partially update configuration
   * @param {string} configName - Configuration name
   * @param {Object} updates - Partial updates
   * @param {Object} options - Options
   * @returns {Promise<Object>} Updated configuration
   */
  async patch(configName, updates, options = {}) {
    if (options.validate !== false) {
      const current = await this.get(configName, { cache: false });
      const merged = { ...current, ...updates };
      
      if (this.validators.has(configName)) {
        const validation = this.validate(merged, configName);
        if (!validation.valid) {
          throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
        }
      }
    }

    try {
      const response = await fetch(\`\${this.baseUrl}/config/\${configName}\`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(\`Failed to patch config: \${response.statusText}\`);
      }

      const updated = await response.json();
      
      if (this.cache.has(configName)) {
        this.cache.set(configName, updated);
      }

      return updated;
    } catch (error) {
      throw new Error(\`Patch config failed: \${error.message}\`);
    }
  }

  /**
   * Get CRUD rules for configuration
   * @param {string} configName - Configuration name
   * @returns {Promise<Object>} CRUD rules
   */
  async getCrud(configName) {
    try {
      const response = await fetch(\`\${this.baseUrl}/crud/\${configName}\`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(\`Failed to get CRUD: \${response.statusText}\`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(\`Get CRUD failed: \${error.message}\`);
    }
  }

  /**
   * Watch configuration for changes
   * @param {string} configName - Configuration name
   * @param {Function} callback - Callback function (error, data) => void
   * @param {number} interval - Poll interval in milliseconds
   * @returns {Function} Stop function
   */
  watch(configName, callback, interval = 5000) {
    if (this.watchers.has(configName)) {
      this.watchers.get(configName)(); // Stop existing watcher
    }

    let lastData = null;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      
      try {
        const data = await this.get(configName, { cache: false });
        const dataStr = JSON.stringify(data);
        
        if (lastData !== dataStr) {
          lastData = dataStr;
          callback(null, data);
        }
      } catch (error) {
        callback(error, null);
      }
      
      if (isActive) {
        setTimeout(poll, interval);
      }
    };

    // Initial fetch
    poll();

    const stopFunction = () => {
      isActive = false;
      this.watchers.delete(configName);
    };

    this.watchers.set(configName, stopFunction);
    return stopFunction;
  }

  /**
   * Clear cache
   * @param {string} [configName] - Specific config to clear, or all if omitted
   */
  clearCache(configName) {
    if (configName) {
      this.cache.delete(configName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Stop all watchers and cleanup
   */
  destroy() {
    for (const stopWatcher of this.watchers.values()) {
      stopWatcher();
    }
    this.watchers.clear();
    this.cache.clear();
    this.validators.clear();
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigSDK;
} else if (typeof define === 'function' && define.amd) {
  define([], () => ConfigSDK);
} else if (typeof globalThis !== 'undefined') {
  globalThis.ConfigSDK = ConfigSDK;
} else if (typeof window !== 'undefined') {
  window.ConfigSDK = ConfigSDK;
}

export default ConfigSDK;
`;
  }

  generateJSTypes(configs) {
    const configTypes = configs.map(config => {
      const typeName = this.toPascalCase(config.name);
      const properties = config.schema?.properties || {};
      
      const typeProps = Object.entries(properties).map(([key, prop]) => {
        const optional = !(config.schema?.required || []).includes(key) ? '?' : '';
        const type = this.getTypeScriptType(prop.type);
        const comment = prop.description ? \`  /** \${prop.description} */\` : '';
        return \`\${comment}\n  \${key}\${optional}: \${type};\`;
      }).join('\\n');
      
      return \`export interface \${typeName}Config {
\${typeProps}
}\`;
    }).join('\\n\\n');

    return \`/**
 * TypeScript definitions for MASKSERVICE Configuration SDK
 * Auto-generated on \${new Date().toISOString()}
 */

export interface SDKOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface GetOptions {
  cache?: boolean;
  validate?: boolean;
}

export interface UpdateOptions {
  validate?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CrudRules {
  name: string;
  title: string;
  description: string;
  rules: {
    editable: string[];
    readonly: string[];
    protected: string[];
    addable: boolean;
    deletable: boolean;
  };
  field_types: Record<string, string>;
  validation_rules: Record<string, any>;
  ui_hints: Record<string, any>;
  permissions?: Record<string, string[]>;
}

export declare class ConfigSDK {
  constructor(options?: SDKOptions);
  
  loadSchema(name: string): Promise<any>;
  validate(data: any, schemaName: string): ValidationResult;
  get(configName: string, options?: GetOptions): Promise<any>;
  update(configName: string, data: any, options?: UpdateOptions): Promise<any>;
  patch(configName: string, updates: any, options?: UpdateOptions): Promise<any>;
  getCrud(configName: string): Promise<CrudRules>;
  watch(configName: string, callback: (error: Error | null, data: any) => void, interval?: number): () => void;
  clearCache(configName?: string): void;
  destroy(): void;
}

\${configTypes}

export default ConfigSDK;
\`;
  }

  getTypeScriptType(schemaType) {
    if (Array.isArray(schemaType)) {
      return schemaType.map(t => this.getTypeScriptType(t)).join(' | ');
    }
    
    switch (schemaType) {
      case 'string': return 'string';
      case 'number': 
      case 'integer': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'any[]';
      case 'object': return 'Record<string, any>';
      default: return 'any';
    }
  }

  generateJSMainFile(configs) {
    const imports = configs.map(config => 
      \`import \${this.toPascalCase(config.name)} from './\${config.name}.js';\`
    ).join('\\n');
    
    const exports = configs.map(config => 
      \`  \${this.toPascalCase(config.name)}\`
    ).join(',\\n');
    
    return \`// MASKSERVICE C20 1001 Configuration SDK
// Auto-generated on \${new Date().toISOString()}

import ConfigSDK from './ConfigSDK.js';
\${imports}

export {
  ConfigSDK,
\${exports}
};

export default {
  ConfigSDK,
\${exports}
};
\`;
  }

  generateJSExamples(configs) {
    const exampleConfigs = configs.slice(0, 3);
    
    return \`/**
 * MASKSERVICE Configuration SDK Examples
 * Auto-generated on \${new Date().toISOString()}
 */

import ConfigSDK from './ConfigSDK.js';

// Initialize SDK
const sdk = new ConfigSDK({
  baseUrl: 'http://localhost:3000/api',
  timeout: 30000
});

async function basicUsage() {
  try {
    console.log('=== Basic Usage Examples ===\\n');
    
    \${exampleConfigs.map(config => \`
    // \${config.name} configuration
    await sdk.loadSchema('\${config.name}');
    const \${config.name}Config = await sdk.get('\${config.name}', { cache: true });
    console.log('\${config.name} config:', JSON.stringify(\${config.name}Config, null, 2));
    
    // Update configuration
    const updated\${this.toPascalCase(config.name)} = await sdk.patch('\${config.name}', {
      // Add your updates here based on schema
    });
    console.log('Updated \${config.name}:', updated\${this.toPascalCase(config.name)});
    \`).join('\\n')}
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function watchingExample() {
  console.log('\\n=== Watching for Changes ===\\n');
  
  \${exampleConfigs[0] ? \`
  // Watch for changes in \${exampleConfigs[0].name}
  const stopWatching = sdk.watch('\${exampleConfigs[0].name}', (error, data) => {
    if (error) {
      console.error('Watch error:', error.message);
    } else {
      console.log('Configuration changed:', data);
    }
  }, 5000); // Check every 5 seconds
  
  // Stop watching after 30 seconds
  setTimeout(() => {
    stopWatching();
    console.log('Stopped watching');
  }, 30000);
  \` : '// No configurations available for watching example'}
}

async function validationExample() {
  console.log('\\n=== Validation Examples ===\\n');
  
  \${exampleConfigs[0] ? \`
  try {
    // Load schema for validation
    await sdk.loadSchema('\${exampleConfigs[0].name}');
    
    // Example validation
    const testData = {
      // Add test data based on your schema
    };
    
    const validation = sdk.validate(testData, '\${exampleConfigs[0].name}');
    if (validation.valid) {
      console.log('✓ Data is valid');
    } else {
      console.log('✗ Validation errors:', validation.errors);
    }
  } catch (error) {
    console.error('Validation error:', error.message);
  }
  \` : '// No configurations available for validation example'}
}

async function crudExample() {
  console.log('\\n=== CRUD Rules Examples ===\\n');
  
  \${exampleConfigs[0] ? \`
  try {
    const crudRules = await sdk.getCrud('\${exampleConfigs[0].name}');
    console.log('CRUD rules for \${exampleConfigs[0].name}:');
    console.log('- Editable fields:', crudRules.rules.editable);
    console.log('- Readonly fields:', crudRules.rules.readonly);
    console.log('- Protected fields:', crudRules.rules.protected);
    console.log('- Can add:', crudRules.rules.addable);
    console.log('- Can delete:', crudRules.rules.deletable);
  } catch (error) {
    console.error('CRUD error:', error.message);
  }
  \` : '// No configurations available for CRUD example'}
}

// Run examples
if (typeof window === 'undefined') {
  // Node.js environment
  basicUsage()
    .then(() => watchingExample())
    .then(() => validationExample())
    .then(() => crudExample())
    .then(() => {
      console.log('\\n=== Examples completed ===');
      sdk.destroy(); // Cleanup
    })
    .catch(console.error);
} else {
  // Browser environment
  console.log('SDK examples ready. Call basicUsage(), watchingExample(), validationExample(), or crudExample() to run.');
  window.sdkExamples = {
    basicUsage,
    watchingExample,
    validationExample,
    crudExample,
    sdk
  };
}

export { basicUsage, watchingExample, validationExample, crudExample, sdk };
\`;
  }

  generateJSConfigClass(config) {
    const className = this.toPascalCase(config.name);
    const properties = config.schema?.properties || {};
    
    const propertyMethods = Object.keys(properties).map(prop => {
      const propSchema = properties[prop];
      const methodName = this.toCamelCase(prop);
      const type = this.getJSType(propSchema.type);
      
      return `  /**
   * Get ${prop}
   * @returns {${type}} ${propSchema.description || prop}
   */
  get${this.toPascalCase(prop)}() {
    return this.config.${prop};
  }

  /**
   * Set ${prop}
   * @param {${type}} value - ${propSchema.description || prop}
   */
  set${this.toPascalCase(prop)}(value) {
    this.validateProperty('${prop}', value);
    this.config.${prop} = value;
  }`;
    }).join('\n\n');

    return `/**
 * Configuration class for ${config.name}
 * Auto-generated from schema
 */
export default class ${className} {
  constructor(initialConfig = {}) {
    this.config = { ...this.getDefaults(), ...initialConfig };
    this.schema = ${JSON.stringify(config.schema || {}, null, 2)};
    this.crud = ${JSON.stringify(config.crud || {}, null, 2)};
  }

  getDefaults() {
    return ${JSON.stringify(config.data || {}, null, 2)};
  }

  validateProperty(name, value) {
    const propSchema = this.schema.properties?.[name];
    if (!propSchema) return;
    
    // Basic type validation
    const expectedType = propSchema.type;
    const actualType = typeof value;
    
    if (expectedType === 'string' && actualType !== 'string') {
      throw new Error(\`Property \${name} must be a string\`);
    }
    if (expectedType === 'number' && actualType !== 'number') {
      throw new Error(\`Property \${name} must be a number\`);
    }
    if (expectedType === 'boolean' && actualType !== 'boolean') {
      throw new Error(\`Property \${name} must be a boolean\`);
    }
  }

  validate() {
    const errors = [];
    const required = this.schema.required || [];
    
    for (const prop of required) {
      if (this.config[prop] === undefined || this.config[prop] === null) {
        errors.push(\`Required property \${prop} is missing\`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(', '));
    }
    
    return true;
  }

  toJSON() {
    return this.config;
  }

${propertyMethods}
}`;
  }

  generateJSPackageJson() {
    return {
      name: 'maskservice-config-sdk',
      version: '1.0.0',
      description: 'JavaScript SDK for MASKSERVICE C20 1001 configurations',
      main: 'index.js',
      type: 'module',
      keywords: ['maskservice', 'config', 'sdk', 'javascript'],
      license: 'PROPRIETARY'
    };
  }

  generateJSReadme(configs) {
    const examples = configs.slice(0, 2).map(config => {
      const className = this.toPascalCase(config.name);
      return `
## ${className}

\`\`\`javascript
import { ${className} } from 'maskservice-config-sdk';

const config = new ${className}();
console.log(config.toJSON());

// Validate configuration
config.validate();
\`\`\``;
    }).join('\n');

    return `# MASKSERVICE Configuration SDK

Auto-generated JavaScript SDK for MASKSERVICE C20 1001 configurations.

## Installation

\`\`\`bash
npm install ./sdk/js
\`\`\`

## Usage

\`\`\`javascript
import SDK from 'maskservice-config-sdk';
// or
import { ${configs.map(c => this.toPascalCase(c.name)).join(', ')} } from 'maskservice-config-sdk';
\`\`\`

${examples}

## Available Configurations

${configs.map(config => `- **${this.toPascalCase(config.name)}**: ${config.crud?.description || config.name}`).join('\n')}

## Generated on

${new Date().toISOString()}
`;
  }

  async generatePythonSDK(configs, outputDir) {
    // Copy Python SDK template
    const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'pythonSDKTemplate.py');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    await fs.writeFile(path.join(outputDir, 'config_sdk.py'), templateContent);
    
    // Generate main module
    const initContent = this.generatePythonInit(configs);
    await fs.writeFile(path.join(outputDir, '__init__.py'), initContent);
    
    // Generate examples
    const examplesContent = this.generatePythonExamples(configs);
    await fs.writeFile(path.join(outputDir, 'examples.py'), examplesContent);
    
    // Generate setup.py
    const setupPy = this.generatePythonSetup();
    await fs.writeFile(path.join(outputDir, 'setup.py'), setupPy);
    
    // Generate requirements.txt
    const requirements = this.generatePythonRequirements();
    await fs.writeFile(path.join(outputDir, 'requirements.txt'), requirements);
    
    // Generate README
    const readme = this.generatePythonReadme(configs);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }

  async generateGoSDK(configs, outputDir) {
    // Copy Go SDK template
    const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'goSDKTemplate.go');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    await fs.writeFile(path.join(outputDir, 'config_sdk.go'), templateContent);
    
    // Generate examples
    const examplesContent = this.generateGoExamples(configs);
    await fs.writeFile(path.join(outputDir, 'examples.go'), examplesContent);
    
    // Generate go.mod
    const goMod = this.generateGoMod();
    await fs.writeFile(path.join(outputDir, 'go.mod'), goMod);
    
    // Generate README
    const readme = this.generateGoReadme(configs);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }

  generatePythonInit(configs) {
    return `"""MASKSERVICE C20 1001 Configuration SDK
Auto-generated on ${new Date().toISOString()}
"""

from .config_sdk import ConfigSDK, AsyncConfigSDK

__all__ = ['ConfigSDK', 'AsyncConfigSDK']
__version__ = '1.0.0'
`;
  }

  generatePythonExamples(configs) {
    const exampleConfigs = configs.slice(0, 3);
    
    return `"""
MASKSERVICE Configuration SDK Examples - Python
Auto-generated on ${new Date().toISOString()}
"""

import asyncio
from config_sdk import ConfigSDK, AsyncConfigSDK

def sync_examples():
    """Synchronous SDK examples"""
    print("=== Synchronous SDK Examples ===\\n")
    
    # Initialize SDK
    with ConfigSDK("http://localhost:3000/api") as sdk:
        ${exampleConfigs.map(config => `
        # ${config.name} configuration
        try:
            sdk.load_schema("${config.name}")
            config = sdk.get("${config.name}", cache=True)
            print(f"${config.name} config: {config}")
            
            # Update configuration
            updated = sdk.patch("${config.name}", {
                # Add your updates here based on schema
            })
            print(f"Updated ${config.name}: {updated}")
        except Exception as e:
            print(f"Error with ${config.name}: {e}")
        `).join('\n')}
        
        # Watch for changes example
        ${exampleConfigs[0] ? `
        def on_change(error, data):
            if error:
                print(f"Watch error: {error}")
            else:
                print(f"Configuration changed: {data}")
        
        # Watch ${exampleConfigs[0].name} for 10 seconds
        stop_watching = sdk.watch("${exampleConfigs[0].name}", on_change, interval=2.0)
        import time
        time.sleep(10)
        stop_watching()
        ` : ''}

async def async_examples():
    """Asynchronous SDK examples"""
    print("\\n=== Asynchronous SDK Examples ===\\n")
    
    # Initialize async SDK
    async with AsyncConfigSDK("http://localhost:3000/api") as sdk:
        ${exampleConfigs.map(config => `
        # ${config.name} configuration
        try:
            await sdk.load_schema("${config.name}")
            config = await sdk.get("${config.name}", cache=True)
            print(f"${config.name} config: {config}")
            
            # Update configuration
            updated = await sdk.patch("${config.name}", {
                # Add your updates here based on schema
            })
            print(f"Updated ${config.name}: {updated}")
        except Exception as e:
            print(f"Error with ${config.name}: {e}")
        `).join('\n')}
        
        # Async watch example
        ${exampleConfigs[0] ? `
        async def on_change(error, data):
            if error:
                print(f"Async watch error: {error}")
            else:
                print(f"Async configuration changed: {data}")
        
        # Watch ${exampleConfigs[0].name} for 10 seconds
        stop_watching = await sdk.watch("${exampleConfigs[0].name}", on_change, interval=2.0)
        await asyncio.sleep(10)
        stop_watching()
        ` : ''}

if __name__ == "__main__":
    # Run synchronous examples
    sync_examples()
    
    # Run asynchronous examples
    asyncio.run(async_examples())
`;
  }

  generatePythonRequirements() {
    return `requests>=2.28.0
aiohttp>=3.8.0
jsonschema>=4.17.0
`;
  }

  generatePythonSetup() {
    return `from setuptools import setup, find_packages

setup(
    name='maskservice-config-sdk',
    version='1.0.0',
    description='Python SDK for MASKSERVICE C20 1001 configurations',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    packages=find_packages(),
    install_requires=[
        'requests>=2.28.0',
        'aiohttp>=3.8.0',
        'jsonschema>=4.17.0',
    ],
    python_requires='>=3.8',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: Other/Proprietary License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
    ],
    keywords='maskservice config sdk python async',
)
`;
  }

  generatePythonReadme(configs) {
    return `# MASKSERVICE Configuration SDK (Python)

Auto-generated Python SDK for MASKSERVICE C20 1001 configurations with both synchronous and asynchronous support.

## Installation

\`\`\`bash
pip install ./sdk/python
\`\`\`

## Features

- **Synchronous & Asynchronous APIs**
- **Schema Validation** with jsonschema
- **Configuration Watching** with real-time updates
- **Caching Support** for better performance
- **Type Safety** with Python type hints
- **Context Manager Support** for proper resource cleanup

## Quick Start

### Synchronous Usage

\`\`\`python
from maskservice_config_sdk import ConfigSDK

# Using context manager (recommended)
with ConfigSDK("http://localhost:3000/api") as sdk:
    # Load schema for validation
    sdk.load_schema("appFooter_ui")
    
    # Get configuration
    config = sdk.get("appFooter_ui", cache=True)
    print(config)
    
    # Update configuration
    updated = sdk.patch("appFooter_ui", {"height": 40})
    print(updated)
\`\`\`

### Asynchronous Usage

\`\`\`python
import asyncio
from maskservice_config_sdk import AsyncConfigSDK

async def main():
    async with AsyncConfigSDK("http://localhost:3000/api") as sdk:
        # Load schema
        await sdk.load_schema("dataService_api")
        
        # Get configuration
        config = await sdk.get("dataService_api", cache=True)
        print(config)
        
        # Update configuration
        updated = await sdk.patch("dataService_api", {"timeout": 60000})
        print(updated)

asyncio.run(main())
\`\`\`

### Watching for Changes

\`\`\`python
def on_change(error, data):
    if error:
        print(f"Error: {error}")
    else:
        print(f"Config changed: {data}")

# Watch for changes
stop_watching = sdk.watch("appFooter_ui", on_change, interval=5.0)

# Stop watching when done
stop_watching()
\`\`\`

## API Reference

### ConfigSDK (Synchronous)

- \`load_schema(name: str) -> dict\`
- \`get(config_name: str, cache: bool = False, validate_data: bool = True) -> dict\`
- \`update(config_name: str, data: dict, validate_data: bool = True) -> dict\`
- \`patch(config_name: str, updates: dict, validate_data: bool = True) -> dict\`
- \`get_crud(config_name: str) -> dict\`
- \`watch(config_name: str, callback: Callable, interval: float = 5.0) -> Callable\`
- \`validate(data: dict, schema_name: str) -> tuple[bool, list]\`
- \`clear_cache(config_name: Optional[str] = None)\`

### AsyncConfigSDK (Asynchronous)

Same methods as ConfigSDK but with \`async\`/\`await\` support.

## Available Configurations

${configs.map(config => `- **${this.toPascalCase(config.name)}**: ${config.crud?.description || config.name}`).join('\n')}

## Generated on

${new Date().toISOString()}
`;
  }

  generateGoExamples(configs) {
    const exampleConfigs = configs.slice(0, 3);
    
    return `// MASKSERVICE Configuration SDK Examples - Go
// Auto-generated on ${new Date().toISOString()}

package main

import (
	"fmt"
	"log"
	"time"
	
	configsdk "."
)

func main() {
	// Initialize SDK
	sdk := configsdk.NewConfigSDK(configsdk.SDKOptions{
		BaseURL: "http://localhost:3000/api",
		Headers: map[string]string{
			"Authorization": "Bearer your-token-here",
		},
		Timeout: 30 * time.Second,
	})
	defer sdk.Destroy()

	// Basic usage examples
	basicExamples(sdk)
	
	// Watching example
	watchingExample(sdk)
	
	// Validation example
	validationExample(sdk)
	
	// CRUD example
	crudExample(sdk)
}

func basicExamples(sdk *configsdk.ConfigSDK) {
	fmt.Println("=== Basic Usage Examples ===\\n")
	
	${exampleConfigs.map(config => `
	// ${config.name} configuration
	if err := loadAndUse${this.toPascalCase(config.name)}(sdk); err != nil {
		log.Printf("Error with ${config.name}: %v", err)
	}
	`).join('\n')}
}

${exampleConfigs.map(config => `
func loadAndUse${this.toPascalCase(config.name)}(sdk *configsdk.ConfigSDK) error {
	// Load schema for validation
	_, err := sdk.LoadSchema("${config.name}")
	if err != nil {
		return fmt.Errorf("failed to load schema: %w", err)
	}
	
	// Get configuration with caching
	config, err := sdk.Get("${config.name}", configsdk.GetOptions{
		UseCache: true,
		Validate: true,
	})
	if err != nil {
		return fmt.Errorf("failed to get config: %w", err)
	}
	
	fmt.Printf("${config.name} config: %+v\\n", config)
	
	// Patch configuration
	updates := map[string]interface{}{
		// Add your updates here based on schema
	}
	
	if len(updates) > 0 {
		updated, err := sdk.Patch("${config.name}", updates, configsdk.UpdateOptions{
			Validate: true,
		})
		if err != nil {
			return fmt.Errorf("failed to patch config: %w", err)
		}
		
		fmt.Printf("Updated ${config.name}: %+v\\n", updated)
	}
	
	return nil
}
`).join('\n')}

func watchingExample(sdk *configsdk.ConfigSDK) {
	fmt.Println("\\n=== Watching for Changes ===\\n")
	
	${exampleConfigs[0] ? `
	// Watch ${exampleConfigs[0].name} for changes
	stopWatching := sdk.Watch("${exampleConfigs[0].name}", func(err error, data map[string]interface{}) {
		if err != nil {
			log.Printf("Watch error: %v", err)
		} else {
			fmt.Printf("Configuration changed: %+v\\n", data)
		}
	}, 5*time.Second)
	
	// Watch for 30 seconds
	time.Sleep(30 * time.Second)
	stopWatching()
	fmt.Println("Stopped watching")
	` : '// No configurations available for watching example'}
}

func validationExample(sdk *configsdk.ConfigSDK) {
	fmt.Println("\\n=== Validation Examples ===\\n")
	
	${exampleConfigs[0] ? `
	// Load schema
	_, err := sdk.LoadSchema("${exampleConfigs[0].name}")
	if err != nil {
		log.Printf("Failed to load schema: %v", err)
		return
	}
	
	// Example validation
	testData := map[string]interface{}{
		// Add test data based on your schema
	}
	
	validation := sdk.Validate(testData, "${exampleConfigs[0].name}")
	if validation.Valid {
		fmt.Println("✓ Data is valid")
	} else {
		fmt.Printf("✗ Validation errors: %v\\n", validation.Errors)
	}
	` : '// No configurations available for validation example'}
}

func crudExample(sdk *configsdk.ConfigSDK) {
	fmt.Println("\\n=== CRUD Rules Examples ===\\n")
	
	${exampleConfigs[0] ? `
	crud, err := sdk.GetCrud("${exampleConfigs[0].name}")
	if err != nil {
		log.Printf("Failed to get CRUD rules: %v", err)
		return
	}
	
	fmt.Printf("CRUD rules for ${exampleConfigs[0].name}:\\n")
	fmt.Printf("- Editable fields: %v\\n", crud.Rules.Editable)
	fmt.Printf("- Readonly fields: %v\\n", crud.Rules.Readonly)
	fmt.Printf("- Protected fields: %v\\n", crud.Rules.Protected)
	fmt.Printf("- Can add: %v\\n", crud.Rules.Addable)
	fmt.Printf("- Can delete: %v\\n", crud.Rules.Deletable)
	` : '// No configurations available for CRUD example'}
}
`;
  }

  generateGoMod() {
    return `module maskservice-config-sdk

go 1.19

require (
	// No external dependencies - uses only Go standard library
)
`;
  }

  generateGoReadme(configs) {
    return `# MASKSERVICE Configuration SDK (Go)

Auto-generated Go SDK for MASKSERVICE C20 1001 configurations with full concurrency support.

## Installation

\`\`\`bash
go get ./sdk/go
\`\`\`

## Features

- **Concurrent Operations** with goroutines and channels
- **Type Safety** with Go structs and interfaces
- **Schema Validation** with built-in validators
- **Configuration Watching** with real-time updates
- **Caching Support** with thread-safe operations
- **Context Support** for cancellation and timeouts
- **Zero External Dependencies** - uses only Go standard library

## Quick Start

\`\`\`go
package main

import (
    "fmt"
    "time"
    
    configsdk "maskservice-config-sdk"
)

func main() {
    // Initialize SDK
    sdk := configsdk.NewConfigSDK(configsdk.SDKOptions{
        BaseURL: "http://localhost:3000/api",
        Headers: map[string]string{
            "Authorization": "Bearer your-token",
        },
        Timeout: 30 * time.Second,
    })
    defer sdk.Destroy()

    // Load schema for validation
    _, err := sdk.LoadSchema("appFooter_ui")
    if err != nil {
        panic(err)
    }

    // Get configuration with caching
    config, err := sdk.Get("appFooter_ui", configsdk.GetOptions{
        UseCache: true,
        Validate: true,
    })
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Config: %+v\\n", config)

    // Update configuration
    updates := map[string]interface{}{
        "height": 40,
    }
    
    updated, err := sdk.Patch("appFooter_ui", updates, configsdk.UpdateOptions{
        Validate: true,
    })
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Updated: %+v\\n", updated)
}
\`\`\`

### Watching for Changes

\`\`\`go
// Watch for configuration changes
stopWatching := sdk.Watch("appFooter_ui", func(err error, data map[string]interface{}) {
    if err != nil {
        log.Printf("Watch error: %v", err)
    } else {
        fmt.Printf("Config changed: %+v\\n", data)
    }
}, 5*time.Second)

// Stop watching when done
defer stopWatching()
\`\`\`

### Validation

\`\`\`go
// Load schema
_, err := sdk.LoadSchema("dataService_api")
if err != nil {
    panic(err)
}

// Validate data
testData := map[string]interface{}{
    "timeout": 30000,
    "baseUrl": "http://localhost:3000/api",
}

validation := sdk.Validate(testData, "dataService_api")
if !validation.Valid {
    fmt.Printf("Validation errors: %v\\n", validation.Errors)
}
\`\`\`

## API Reference

### Types

\`\`\`go
type ConfigSDK struct { ... }

type SDKOptions struct {
    BaseURL string
    Headers map[string]string
    Timeout time.Duration
}

type GetOptions struct {
    UseCache bool
    Validate bool
}

type UpdateOptions struct {
    Validate bool
}

type ValidationResult struct {
    Valid  bool
    Errors []string
}

type CrudRules struct {
    Name        string
    Title       string
    Description string
    Rules       CrudRuleSet
    FieldTypes  map[string]string
    Validation  map[string]map[string]interface{}
    UIHints     map[string]map[string]interface{}
    Permissions map[string][]string
}
\`\`\`

### Methods

- \`NewConfigSDK(options SDKOptions) *ConfigSDK\`
- \`LoadSchema(name string) (map[string]interface{}, error)\`
- \`Get(configName string, options GetOptions) (map[string]interface{}, error)\`
- \`Update(configName string, data map[string]interface{}, options UpdateOptions) (map[string]interface{}, error)\`
- \`Patch(configName string, updates map[string]interface{}, options UpdateOptions) (map[string]interface{}, error)\`
- \`GetCrud(configName string) (*CrudRules, error)\`
- \`Watch(configName string, callback func(error, map[string]interface{}), interval time.Duration) func()\`
- \`Validate(data map[string]interface{}, schemaName string) ValidationResult\`
- \`ClearCache(configNames ...string)\`
- \`Destroy()\`

## Available Configurations

${configs.map(config => `- **${this.toPascalCase(config.name)}**: ${config.crud?.description || config.name}`).join('\n')}

## Concurrency

This SDK is designed to be thread-safe and can be used concurrently from multiple goroutines. All operations use proper synchronization mechanisms.

## Generated on

${new Date().toISOString()}
`;
  }

  generatePythonConfigClass(config) {
    const className = this.toPascalCase(config.name);
    
    return `"""Configuration class for ${config.name}"""

import json
from typing import Dict, Any, Optional


class ${className}:
    """Configuration class for ${config.name}
    Auto-generated from schema
    """
    
    def __init__(self, initial_config: Optional[Dict[str, Any]] = None):
        self.config = {**self.get_defaults(), **(initial_config or {})}
        self.schema = ${JSON.stringify(config.schema || {}, null, 4)}
        self.crud = ${JSON.stringify(config.crud || {}, null, 4)}
    
    def get_defaults(self) -> Dict[str, Any]:
        """Get default configuration values"""
        return ${JSON.stringify(config.data || {}, null, 4)}
    
    def validate(self) -> bool:
        """Validate the configuration"""
        errors = []
        required = self.schema.get('required', [])
        
        for prop in required:
            if prop not in self.config or self.config[prop] is None:
                errors.append(f"Required property {prop} is missing")
        
        if errors:
            raise ValueError(f"Validation failed: {', '.join(errors)}")
        
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return self.config.copy()
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.config, indent=2)
    
    def __str__(self) -> str:
        return self.to_json()
    
    def __repr__(self) -> str:
        return f"${className}({self.config})"
`;
  }

  generatePythonSetup() {
    return `from setuptools import setup, find_packages

setup(
    name='maskservice-config-sdk',
    version='1.0.0',
    description='Python SDK for MASKSERVICE C20 1001 configurations',
    packages=find_packages(),
    python_requires='>=3.7',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: Other/Proprietary License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
    ],
)
`;
  }

  generatePythonReadme(configs) {
    return `# MASKSERVICE Configuration SDK (Python)

Auto-generated Python SDK for MASKSERVICE C20 1001 configurations.

## Installation

\`\`\`bash
pip install ./sdk/python
\`\`\`

## Usage

\`\`\`python
from maskservice_config_sdk import ${configs.map(c => this.toPascalCase(c.name)).slice(0, 2).join(', ')}

# Example usage
config = ${this.toPascalCase(configs[0]?.name || 'Config')}()
print(config.to_json())

# Validate configuration
config.validate()
\`\`\`

## Available Configurations

${configs.map(config => `- **${this.toPascalCase(config.name)}**: ${config.crud?.description || config.name}`).join('\n')}

## Generated on

${new Date().toISOString()}
`;
  }

  // Helper methods
  toPascalCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
  }

  toCamelCase(str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  }

  getJSType(schemaType) {
    if (Array.isArray(schemaType)) {
      return schemaType.join(' | ');
    }
    
    switch (schemaType) {
      case 'string': return 'string';
      case 'number': 
      case 'integer': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'Array';
      case 'object': return 'Object';
      default: return 'any';
    }
  }
}

// CLI
program
  .name('sdk-generator')
  .description('Generate SDKs for configuration schemas')
  .option('-l, --lang <language>', 'Target language (js, python, go)', 'js')
  .option('-o, --output <dir>', 'Output directory', './sdk')
  .option('-c, --configs <dir>', 'Configs directory', './configs')
  .action(async (options) => {
    const generator = new SDKGenerator({
      language: options.lang,
      outputDir: options.output,
      configsDir: options.configs
    });
    
    try {
      await generator.generateSDK();
    } catch (error) {
      console.error(chalk.red('SDK generation failed:', error.message));
      process.exit(1);
    }
  });

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}

export default SDKGenerator;
