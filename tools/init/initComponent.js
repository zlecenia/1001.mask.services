#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

class ComponentInitializer {
  constructor() {
    this.modulesDir = './modules';
    this.configsDir = './configs';
  }

  async init() {
    console.log(chalk.blue('🚀 Create New Component Module\n'));
    
    // Gather information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Component name (camelCase):',
        validate: (input) => /^[a-z][a-zA-Z0-9]*$/.test(input) || 'Must be camelCase'
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name:',
        default: (answers) => answers.name.charAt(0).toUpperCase() + answers.name.slice(1)
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type:',
        choices: ['component', 'service', 'layout', 'plugin', 'utility']
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: ['ui-component', 'core-service', 'utility', 'monitoring', 'authentication', 'navigation']
      },
      {
        type: 'input',
        name: 'version',
        message: 'Initial version:',
        default: '0.1.0',
        validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || 'Must be semantic version (x.y.z)'
      },
      {
        type: 'confirm',
        name: 'hasUI',
        message: 'Has UI configuration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hasAPI',
        message: 'Has API configuration?',
        default: false
      },
      {
        type: 'confirm',
        name: 'hasData',
        message: 'Has data configuration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'generateTests',
        message: 'Generate test file?',
        default: true
      }
    ]);
    
    // Create module structure
    await this.createModule(answers);
    
    // Generate initial configs
    await this.generateConfigs(answers);
    
    console.log(chalk.green(`\n✓ Component ${answers.name} created successfully!\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`1. cd modules/${answers.name}/${answers.version}`));
    console.log(chalk.gray(`2. Edit config.json to define your configuration`));
    console.log(chalk.gray(`3. Run "npm run config:generate" to create schemas`));
    console.log(chalk.gray(`4. Implement your component in index.js\n`));
  }

  async createModule(config) {
    const moduleDir = path.join(this.modulesDir, config.name, config.version);
    await fs.ensureDir(moduleDir);
    
    // Create package.json
    const packageJson = {
      name: config.name,
      version: config.version,
      description: config.displayName,
      main: 'index.js',
      type: 'module',
      scripts: {
        test: `vitest run ${config.name}.test.js`
      },
      moduleMetadata: {
        displayName: config.displayName,
        category: config.category,
        type: config.type,
        created: new Date().toISOString(),
        author: 'MASKSERVICE Generator'
      }
    };
    
    await fs.writeJson(path.join(moduleDir, 'package.json'), packageJson, { spaces: 2 });
    
    // Create config.json
    const configJson = {
      component: {
        name: config.name,
        displayName: config.displayName,
        type: config.type,
        category: config.category,
        version: config.version,
        enabled: true,
        dependencies: ['vue']
      }
    };
    
    if (config.hasUI) {
      configJson.ui = {
        enabled: true,
        theme: 'default',
        responsive: true,
        touchOptimized: true,
        accessibility: {
          ariaLabels: true,
          keyboardNavigation: true,
          highContrast: false
        }
      };
    }
    
    if (config.hasAPI) {
      configJson.api = {
        baseUrl: 'http://localhost:3000/api',
        timeout: 30000,
        retries: 3,
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    if (config.hasData) {
      configJson.data = {
        cacheEnabled: true,
        cacheTTL: 300000,
        validateOnLoad: true,
        autoSave: false
      };
    }
    
    await fs.writeJson(path.join(moduleDir, 'config.json'), configJson, { spaces: 2 });
    
    // Create index.js
    const indexTemplate = this.generateIndexTemplate(config);
    await fs.writeFile(path.join(moduleDir, 'index.js'), indexTemplate);
    
    // Create component file if it's a Vue component
    if (config.type === 'component') {
      const componentTemplate = this.generateComponentTemplate(config);
      await fs.writeFile(path.join(moduleDir, `${config.name}.vue`), componentTemplate);
    }
    
    // Create test file if requested
    if (config.generateTests) {
      const testTemplate = this.generateTestTemplate(config);
      await fs.writeFile(path.join(moduleDir, `${config.name}.test.js`), testTemplate);
    }
    
    // Create README.md
    const readmeTemplate = this.generateReadmeTemplate(config);
    await fs.writeFile(path.join(moduleDir, 'README.md'), readmeTemplate);
    
    // Create TODO.md
    const todoTemplate = this.generateTodoTemplate(config);
    await fs.writeFile(path.join(moduleDir, 'TODO.md'), todoTemplate);
    
    // Create CHANGELOG.md
    const changelogTemplate = this.generateChangelogTemplate(config);
    await fs.writeFile(path.join(moduleDir, 'CHANGELOG.md'), changelogTemplate);
  }

  generateIndexTemplate(config) {
    return `// ${config.name} Module v${config.version}
import { defineComponent } from 'vue';
${config.type === 'component' ? `import ${config.name}Component from './${config.name}.vue';` : ''}

const metadata = {
  name: '${config.name}',
  version: '${config.version}',
  type: '${config.type}',
  displayName: '${config.displayName}',
  description: '${config.displayName} ${config.type}',
  category: '${config.category}',
  dependencies: ['vue'],
  initialized: false,
  created: '${new Date().toISOString()}'
};

${config.type === 'service' ? `
class ${config.displayName.replace(/\s/g, '')}Service {
  constructor(context = {}) {
    this.context = context;
    this.config = null;
    this.initialized = false;
  }

  async init(config = {}) {
    console.log('Initializing ${config.name} service...');
    this.config = config;
    this.initialized = true;
    return { success: true };
  }

  async handle(request) {
    if (!this.initialized) {
      throw new Error('Service not initialized');
    }
    return { success: true, data: request };
  }

  async destroy() {
    this.initialized = false;
    this.config = null;
  }
}
` : ''}

export default {
  metadata,
  ${config.type === 'component' ? 'component: ' + config.name + 'Component,' : ''}
  ${config.type === 'service' ? 'service: ' + config.displayName.replace(/\s/g, '') + 'Service,' : ''}
  
  async init(context = {}) {
    console.log('Initializing ${config.name}...');
    ${config.type === 'service' ? `
    this.serviceInstance = new ${config.displayName.replace(/\s/g, '')}Service(context);
    await this.serviceInstance.init(context.config);
    ` : ''}
    this.metadata.initialized = true;
    return { success: true };
  },
  
  async handle(request) {
    ${config.type === 'service' ? `
    if (this.serviceInstance) {
      return await this.serviceInstance.handle(request);
    }
    ` : ''}
    return { success: true, data: request };
  },
  
  async destroy() {
    ${config.type === 'service' ? `
    if (this.serviceInstance) {
      await this.serviceInstance.destroy();
      this.serviceInstance = null;
    }
    ` : ''}
    this.metadata.initialized = false;
  }
};
`;
  }

  generateComponentTemplate(config) {
    return `<template>
  <div class="${config.name}" :class="componentClasses">
    <div class="${config.name}__header" v-if="showHeader">
      <h3 class="${config.name}__title">{{ title }}</h3>
    </div>
    
    <div class="${config.name}__content">
      <p class="${config.name}__text">{{ text }}</p>
      
      <!-- Add your component content here -->
      <slot></slot>
    </div>
    
    <div class="${config.name}__footer" v-if="showFooter">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: '${config.displayName.replace(/\s/g, '')}Component',
  
  props: {
    title: {
      type: String,
      default: '${config.displayName}'
    },
    text: {
      type: String,
      default: '${config.displayName} Component'
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary'].includes(value)
    }
  },
  
  emits: ['click', 'change'],
  
  setup(props, { emit }) {
    const componentClasses = computed(() => ({
      [\`\${props.variant}\`]: true,
      'has-header': props.showHeader,
      'has-footer': props.showFooter
    }));
    
    const handleClick = (event) => {
      emit('click', event);
    };
    
    const handleChange = (value) => {
      emit('change', value);
    };
    
    return {
      componentClasses,
      handleClick,
      handleChange
    };
  }
});
</script>

<style scoped>
.${config.name} {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.${config.name}__header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.${config.name}__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.${config.name}__content {
  flex: 1;
}

.${config.name}__text {
  margin: 0 0 1rem 0;
  color: #666;
}

.${config.name}__footer {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

/* Variants */
.${config.name}.primary {
  border-color: #007bff;
}

.${config.name}.secondary {
  border-color: #6c757d;
}

/* Touch optimization for 7.9" display */
@media (max-width: 1280px) {
  .${config.name} {
    padding: 0.75rem;
    font-size: 14px;
  }
  
  .${config.name}__title {
    font-size: 1.1rem;
  }
}
</style>
`;
  }

  generateTestTemplate(config) {
    return `import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import module from './index.js';
${config.type === 'component' ? `import ${config.name}Component from './${config.name}.vue';` : ''}

describe('${config.displayName}', () => {
  let moduleInstance;
  
  beforeEach(() => {
    moduleInstance = { ...module };
  });

  describe('Module Metadata', () => {
    it('should have correct metadata', () => {
      expect(moduleInstance.metadata.name).toBe('${config.name}');
      expect(moduleInstance.metadata.version).toBe('${config.version}');
      expect(moduleInstance.metadata.type).toBe('${config.type}');
      expect(moduleInstance.metadata.category).toBe('${config.category}');
    });
    
    it('should not be initialized by default', () => {
      expect(moduleInstance.metadata.initialized).toBe(false);
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize successfully', async () => {
      const result = await moduleInstance.init();
      expect(result.success).toBe(true);
      expect(moduleInstance.metadata.initialized).toBe(true);
    });
    
    it('should handle requests', async () => {
      await moduleInstance.init();
      const testRequest = { action: 'test', data: 'sample' };
      const result = await moduleInstance.handle(testRequest);
      expect(result.success).toBe(true);
    });
    
    it('should destroy properly', async () => {
      await moduleInstance.init();
      await moduleInstance.destroy();
      expect(moduleInstance.metadata.initialized).toBe(false);
    });
  });

${config.type === 'component' ? `
  describe('Vue Component', () => {
    it('should render correctly', () => {
      const wrapper = mount(${config.name}Component);
      expect(wrapper.find('.${config.name}').exists()).toBe(true);
      expect(wrapper.text()).toContain('${config.displayName}');
    });
    
    it('should accept props', () => {
      const wrapper = mount(${config.name}Component, {
        props: {
          title: 'Custom Title',
          text: 'Custom Text'
        }
      });
      expect(wrapper.text()).toContain('Custom Title');
      expect(wrapper.text()).toContain('Custom Text');
    });
    
    it('should emit events', async () => {
      const wrapper = mount(${config.name}Component);
      await wrapper.trigger('click');
      expect(wrapper.emitted()).toHaveProperty('click');
    });
    
    it('should handle variants', () => {
      const wrapper = mount(${config.name}Component, {
        props: { variant: 'primary' }
      });
      expect(wrapper.classes()).toContain('primary');
    });
  });
` : ''}

${config.type === 'service' ? `
  describe('Service Functionality', () => {
    it('should create service instance on init', async () => {
      await moduleInstance.init();
      expect(moduleInstance.serviceInstance).toBeDefined();
    });
    
    it('should handle service requests', async () => {
      await moduleInstance.init();
      const request = { method: 'GET', data: {} };
      const result = await moduleInstance.handle(request);
      expect(result.success).toBe(true);
    });
    
    it('should cleanup service on destroy', async () => {
      await moduleInstance.init();
      await moduleInstance.destroy();
      expect(moduleInstance.serviceInstance).toBeNull();
    });
  });
` : ''}

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Test with invalid context
      const result = await moduleInstance.init(null);
      expect(result.success).toBe(true); // Should still succeed with defaults
    });
    
    it('should handle request errors gracefully', async () => {
      await moduleInstance.init();
      const result = await moduleInstance.handle(null);
      expect(result.success).toBe(true);
    });
  });
});
`;
  }

  generateReadmeTemplate(config) {
    return `# ${config.displayName}

## Overview
${config.displayName} - ${config.category} ${config.type} for the MASKSERVICE C20 1001 system.

## Version
${config.version}

## Type
${config.type}

## Category
${config.category}

## Installation
\`\`\`bash
npm run module:init ${config.name}
\`\`\`

## Configuration
See \`config.json\` for available options.

### Configuration Sections
${config.hasUI ? '- **ui**: User interface settings' : ''}
${config.hasAPI ? '- **api**: API connection settings' : ''}
${config.hasData ? '- **data**: Data management settings' : ''}

## Usage

### Basic Usage
\`\`\`javascript
import ${config.name} from './modules/${config.name}/${config.version}/index.js';

// Initialize the module
await ${config.name}.init();

// Handle requests
const result = await ${config.name}.handle(request);
\`\`\`

${config.type === 'component' ? `
### Vue Component Usage
\`\`\`vue
<template>
  <${config.displayName.replace(/\s/g, '')}Component 
    :title="title"
    :text="text"
    @click="handleClick"
  />
</template>

<script>
import ${config.name}Component from './modules/${config.name}/${config.version}/${config.name}.vue';

export default {
  components: {
    ${config.displayName.replace(/\s/g, '')}Component: ${config.name}Component
  },
  // ...
};
</script>
\`\`\`
` : ''}

## API

### Methods
- \`init(context)\` - Initialize the module
- \`handle(request)\` - Handle requests
- \`destroy()\` - Clean up resources

### Events
${config.type === 'component' ? `
- \`click\` - Emitted when component is clicked
- \`change\` - Emitted when component state changes
` : 'No events for this module type.'}

## Configuration Schema
The module validates its configuration against a JSON schema. Run \`npm run schema:generate\` to update the schema after configuration changes.

## Testing
\`\`\`bash
npm test ${config.name}.test.js
\`\`\`

## Development
1. Edit the configuration in \`config.json\`
2. Implement your logic in \`index.js\`
${config.type === 'component' ? `3. Update the Vue component in \`${config.name}.vue\`` : ''}
${config.generateTests ? `4. Add tests in \`${config.name}.test.js\`` : ''}
5. Update this README as needed

## Dependencies
- Vue 3
- Vuex (if using state management)
- Vue Router (if using routing)

## License
PROPRIETARY - MASKSERVICE C20 1001 System
`;
  }

  generateTodoTemplate(config) {
    return `# ${config.displayName} - TODO

## Implementation Tasks
- [ ] Implement core functionality in index.js
${config.type === 'component' ? `- [ ] Complete Vue component template in ${config.name}.vue` : ''}
${config.type === 'component' ? `- [ ] Add component styling and responsive design` : ''}
${config.type === 'service' ? `- [ ] Implement service methods and error handling` : ''}
- [ ] Add configuration validation
- [ ] Implement error handling
${config.generateTests ? `- [ ] Complete test coverage in ${config.name}.test.js` : ''}

## Configuration Tasks
${config.hasUI ? '- [ ] Define UI configuration options' : ''}
${config.hasAPI ? '- [ ] Configure API endpoints and settings' : ''}
${config.hasData ? '- [ ] Set up data management and caching' : ''}
- [ ] Generate and validate JSON schema
- [ ] Create CRUD rules

## Documentation Tasks
- [ ] Update README.md with usage examples
- [ ] Document API methods and parameters
- [ ] Add configuration examples
- [ ] Create integration guide

## Testing Tasks
- [ ] Unit tests for core functionality
${config.type === 'component' ? '- [ ] Component rendering tests' : ''}
${config.type === 'component' ? '- [ ] Event handling tests' : ''}
${config.type === 'service' ? '- [ ] Service method tests' : ''}
- [ ] Integration tests
- [ ] Error handling tests

## Integration Tasks
- [ ] Register with FeatureRegistry
- [ ] Add to main application
- [ ] Test with other modules
- [ ] Performance optimization

## Deployment Tasks
- [ ] Build and bundle optimization
- [ ] Production configuration
- [ ] Documentation deployment
- [ ] Version tagging

## Notes
- Created: ${new Date().toISOString()}
- Version: ${config.version}
- Type: ${config.type}
- Category: ${config.category}
`;
  }

  generateChangelogTemplate(config) {
    return `# Changelog

All notable changes to ${config.displayName} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [${config.version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial module structure
- Basic configuration setup
${config.type === 'component' ? '- Vue component template' : ''}
${config.type === 'service' ? '- Service class implementation' : ''}
${config.hasUI ? '- UI configuration section' : ''}
${config.hasAPI ? '- API configuration section' : ''}
${config.hasData ? '- Data management configuration' : ''}
${config.generateTests ? '- Test suite setup' : ''}
- README documentation
- TODO task list

### Changed
- N/A (initial version)

### Deprecated
- N/A (initial version)

### Removed
- N/A (initial version)

### Fixed
- N/A (initial version)

### Security
- N/A (initial version)

---

## Template for Future Versions

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
`;
  }

  async generateConfigs(config) {
    // Create config directories
    const configsToGenerate = [];
    
    if (config.hasUI) {
      configsToGenerate.push(`${config.name}_ui`);
    }
    
    if (config.hasAPI) {
      configsToGenerate.push(`${config.name}_api`);
    }
    
    if (config.hasData) {
      configsToGenerate.push(`${config.name}_data`);
    }
    
    for (const configName of configsToGenerate) {
      const configDir = path.join(this.configsDir, configName);
      await fs.ensureDir(configDir);
      
      // Mark for generation
      await fs.writeFile(path.join(configDir, '.needs-generation'), config.version);
      
      // Create initial data.json based on config type
      let initialData = {};
      
      if (configName.includes('ui')) {
        initialData = {
          enabled: true,
          theme: 'default',
          responsive: true,
          touchOptimized: true,
          accessibility: {
            ariaLabels: true,
            keyboardNavigation: true,
            highContrast: false
          }
        };
      } else if (configName.includes('api')) {
        initialData = {
          baseUrl: 'http://localhost:3000/api',
          timeout: 30000,
          retries: 3,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      } else if (configName.includes('data')) {
        initialData = {
          cacheEnabled: true,
          cacheTTL: 300000,
          validateOnLoad: true,
          autoSave: false
        };
      }
      
      await fs.writeJson(path.join(configDir, 'data.json'), initialData, { spaces: 2 });
    }
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const initializer = new ComponentInitializer();
  initializer.init().catch(console.error);
}

export default ComponentInitializer;
