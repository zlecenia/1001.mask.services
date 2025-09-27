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
    // Generate main SDK file
    const sdkContent = this.generateJSMainFile(configs);
    await fs.writeFile(path.join(outputDir, 'index.js'), sdkContent);
    
    // Generate individual config classes
    for (const config of configs) {
      const configClass = this.generateJSConfigClass(config);
      await fs.writeFile(path.join(outputDir, `${config.name}.js`), configClass);
    }
    
    // Generate package.json
    const packageJson = this.generateJSPackageJson();
    await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
    
    // Generate README
    const readme = this.generateJSReadme(configs);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }

  generateJSMainFile(configs) {
    const imports = configs.map(config => 
      `import ${this.toPascalCase(config.name)} from './${config.name}.js';`
    ).join('\n');
    
    const exports = configs.map(config => 
      `  ${this.toPascalCase(config.name)}`
    ).join(',\n');
    
    return `// MASKSERVICE C20 1001 Configuration SDK
// Auto-generated on ${new Date().toISOString()}

${imports}

export {
${exports}
};

export default {
${exports}
};
`;
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
    // Generate main module
    const initContent = this.generatePythonInit(configs);
    await fs.writeFile(path.join(outputDir, '__init__.py'), initContent);
    
    // Generate individual config classes
    for (const config of configs) {
      const configClass = this.generatePythonConfigClass(config);
      await fs.writeFile(path.join(outputDir, `${config.name}.py`), configClass);
    }
    
    // Generate setup.py
    const setupPy = this.generatePythonSetup();
    await fs.writeFile(path.join(outputDir, 'setup.py'), setupPy);
    
    // Generate README
    const readme = this.generatePythonReadme(configs);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  }

  generatePythonInit(configs) {
    const imports = configs.map(config => 
      `from .${config.name} import ${this.toPascalCase(config.name)}`
    ).join('\n');
    
    const all = configs.map(config => `'${this.toPascalCase(config.name)}'`).join(', ');
    
    return `"""MASKSERVICE C20 1001 Configuration SDK
Auto-generated on ${new Date().toISOString()}
"""

${imports}

__all__ = [${all}]
__version__ = '1.0.0'
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
