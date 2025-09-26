/**
 * Module Manager with Package.json Support
 * Automated module generation from prompts with versioning, testing, and rollback
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { registry } from './FeatureRegistry.js';

const FEATURES_DIR = path.join(process.cwd(), 'js/features');

/**
 * Get the latest version number for a module
 * @param {string} moduleName - Name of the module
 * @returns {number} Latest version number (0 if module doesn't exist)
 */
function getLatestVersion(moduleName) {
  const modulePath = path.join(FEATURES_DIR, moduleName);
  if (!fs.existsSync(modulePath)) return 0;
  
  const versions = fs.readdirSync(modulePath)
    .filter(f => f.startsWith('v'))
    .map(v => parseInt(v.slice(1)))
    .sort((a, b) => a - b);
  
  return versions[versions.length - 1] || 0;
}

/**
 * Create module structure and skeleton files based on prompt description
 * @param {string} moduleName - Name of the module
 * @param {string} promptDescription - Description from prompt
 * @returns {object} Module creation info
 */
function createModuleFromPrompt(moduleName, promptDescription) {
  const latest = getLatestVersion(moduleName);
  const newVersion = latest + 1;
  const versionString = `v${newVersion}`;
  const modulePath = path.join(FEATURES_DIR, moduleName, versionString);
  
  // Create directory structure
  fs.mkdirSync(modulePath, { recursive: true });

  // Generate Vue component template (as .js file based on MIME type memory)
  const vueComponentTemplate = `/**
 * ${moduleName} Component v${newVersion}
 * Generated from prompt: ${promptDescription}
 */

// Template
const template = \`
<div class="${moduleName}-component">
  <!-- ${promptDescription} -->
  <div class="module-header">
    <h2>{{ title }}</h2>
    <p class="description">{{ description }}</p>
  </div>
  <div class="module-content">
    <!-- Module-specific content will be implemented here -->
    <div class="placeholder">
      <i class="icon-placeholder"></i>
      <span>{{ placeholderText }}</span>
    </div>
  </div>
  <div class="module-actions" v-if="showActions">
    <button @click="handleAction" class="btn-primary">{{ actionText }}</button>
  </div>
</div>
\`;

// Styles
const styles = \`
<style scoped>
.${moduleName}-component {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.module-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.module-header h2 {
  font-size: 16px;
  margin: 0 0 5px 0;
  color: #333;
}

.description {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.module-content {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #999;
}

.module-actions {
  margin-top: 15px;
  text-align: right;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.btn-primary:hover {
  background: #2980b9;
}
</style>
\`;

// Component definition
export default {
  name: '${moduleName}Component',
  template: template + styles,
  data() {
    return {
      title: '${moduleName} v${newVersion}',
      description: '${promptDescription}',
      showActions: true,
      actionText: 'Execute Action',
      placeholderText: 'Module content will be implemented here'
    };
  },
  methods: {
    handleAction() {
      console.log('${moduleName} action executed');
      this.$emit('action-executed', {
        module: '${moduleName}',
        version: 'v${newVersion}',
        timestamp: new Date()
      });
    }
  },
  emits: ['action-executed']
};
`;

  // Main module index.js
  const indexJsTemplate = `/**
 * ${moduleName} Module v${newVersion}
 * ${promptDescription}
 */
import Component from './${moduleName}.js';

export default {
  name: '${moduleName}',
  version: 'v${newVersion}',
  Component,
  
  /**
   * Main handler function for the module
   * @param {object} request - Request object
   * @returns {object} Response object
   */
  handle(request = {}) {
    // TODO: Implement ${moduleName} business logic
    console.log(\`Executing \${this.name}@\${this.version}\`, request);
    
    return {
      status: 200,
      message: \`\${this.name}@\${this.version} executed successfully\`,
      data: {
        module: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        request
      }
    };
  },
  
  /**
   * Initialize module
   * @param {object} config - Configuration object
   */
  init(config = {}) {
    console.log(\`Initializing \${this.name}@\${this.version}\`, config);
    // TODO: Add initialization logic
  },
  
  /**
   * Cleanup module resources
   */
  cleanup() {
    console.log(\`Cleaning up \${this.name}@\${this.version}\`);
    // TODO: Add cleanup logic
  }
};
`;

  // README.md
  const readmeTemplate = `# ${moduleName} v${newVersion}

${promptDescription}

## Usage

\`\`\`javascript
import ${moduleName}Module from './index.js';

// Initialize module
${moduleName}Module.init({ /* config */ });

// Execute module
const result = ${moduleName}Module.handle({ /* request data */ });
console.log(result);

// Use as Vue component
import { ${moduleName}Component } from './index.js';
\`\`\`

## API

### Methods

- \`handle(request)\` - Main execution method
- \`init(config)\` - Initialize module
- \`cleanup()\` - Cleanup resources

### Events (Vue Component)

- \`action-executed\` - Emitted when module action is triggered

## Configuration

Module supports configuration through the init() method:

\`\`\`javascript
${moduleName}Module.init({
  // Add configuration options
});
\`\`\`

## Testing

Run tests with:
\`\`\`bash
npm test -- ${moduleName}.spec.js
\`\`\`
`;

  // TODO.md
  const todoTemplate = `# ${moduleName} v${newVersion} TODO

## Implementation Tasks
- [ ] Implement main business logic in handle() method
- [ ] Add proper initialization in init() method
- [ ] Implement cleanup logic
- [ ] Add comprehensive unit tests
- [ ] Integrate with other modules if needed
- [ ] Add error handling and validation
- [ ] Optimize performance
- [ ] Add documentation and examples

## Testing Tasks
- [ ] Write unit tests for handle() method
- [ ] Test Vue component rendering
- [ ] Test component events and interactions
- [ ] Integration tests with other modules
- [ ] Performance tests
- [ ] Error handling tests

## Documentation Tasks
- [ ] Update API documentation
- [ ] Add usage examples
- [ ] Document configuration options
- [ ] Add troubleshooting guide

## Integration Tasks
- [ ] Register with FeatureRegistry
- [ ] Test module loading/unloading
- [ ] Verify version compatibility
- [ ] Test rollback scenarios
`;

  // Test skeleton
  const specTemplate = `/**
 * Tests for ${moduleName} v${newVersion}
 */
import { describe, test, expect, beforeEach } from 'vitest';
import module from './index.js';

describe('${moduleName} v${newVersion}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('module exports correct structure', () => {
    expect(module).toBeDefined();
    expect(module.name).toBe('${moduleName}');
    expect(module.version).toBe('v${newVersion}');
    expect(typeof module.handle).toBe('function');
    expect(typeof module.init).toBe('function');
    expect(typeof module.cleanup).toBe('function');
  });

  test('handle method returns success response', () => {
    const result = module.handle({ test: 'data' });
    expect(result.status).toBe(200);
    expect(result.message).toContain('executed successfully');
    expect(result.data).toBeDefined();
    expect(result.data.module).toBe('${moduleName}');
    expect(result.data.version).toBe('v${newVersion}');
  });

  test('handle method processes request data', () => {
    const requestData = { userId: 123, action: 'test' };
    const result = module.handle(requestData);
    expect(result.data.request).toEqual(requestData);
  });

  test('init method executes without errors', () => {
    expect(() => {
      module.init({ testMode: true });
    }).not.toThrow();
  });

  test('cleanup method executes without errors', () => {
    expect(() => {
      module.cleanup();
    }).not.toThrow();
  });

  test('component is defined', () => {
    expect(module.Component).toBeDefined();
    expect(module.Component.name).toBe('${moduleName}Component');
  });
});

// Integration tests
describe('${moduleName} Integration', () => {
  test('module can be registered in FeatureRegistry', async () => {
    // This test would be run after module is registered
    // expect(registry.getVersions('${moduleName}')).toContain('v${newVersion}');
  });

  test('module handles error scenarios gracefully', () => {
    // Test with invalid input
    const result = module.handle(null);
    expect(result.status).toBe(200); // Should handle gracefully
  });
});
`;

  // Package.json manifest
  const packageJson = {
    name: moduleName,
    version: `${newVersion}.0.0`,
    description: promptDescription,
    main: 'index.js',
    scripts: {
      test: `vitest run ${moduleName}.spec.js`,
      "test:watch": `vitest watch ${moduleName}.spec.js`
    },
    dependencies: {
      vue: "^3.4.0"
    },
    devDependencies: {
      vitest: "^1.0.0"
    },
    type: "module",
    moduleMetadata: {
      contracts: [],
      rollbackConditions: {
        errorRate: ">5%",
        testFailures: ">0"
      },
      generated: {
        prompt: promptDescription,
        timestamp: new Date().toISOString(),
        generator: "moduleManagerWithPackageJson.js v1.0.0"
      }
    }
  };

  // Write all files
  fs.writeFileSync(path.join(modulePath, `${moduleName}.js`), vueComponentTemplate);
  fs.writeFileSync(path.join(modulePath, 'index.js'), indexJsTemplate);
  fs.writeFileSync(path.join(modulePath, 'README.md'), readmeTemplate);
  fs.writeFileSync(path.join(modulePath, 'TODO.md'), todoTemplate);
  fs.writeFileSync(path.join(modulePath, `${moduleName}.spec.js`), specTemplate);
  fs.writeFileSync(path.join(modulePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  console.log(`✓ Created ${moduleName}@v${newVersion} in ${modulePath}`);
  
  return { 
    modulePath, 
    newVersion, 
    versionString,
    packageJson
  };
}

/**
 * Register module in FeatureRegistry
 * @param {string} moduleName - Module name
 * @param {string} versionString - Version string (e.g., 'v1')
 * @param {object} packageJson - Package.json content
 */
async function registerModule(moduleName, versionString, packageJson) {
  try {
    const modulePath = path.join(FEATURES_DIR, moduleName, versionString, 'index.js');
    const mod = await import(modulePath);
    registry.register(moduleName, versionString, mod.default || mod, packageJson.moduleMetadata);
    console.log(`✓ Registered ${moduleName}@${versionString} in FeatureRegistry`);
  } catch (error) {
    console.error(`✗ Failed to register ${moduleName}@${versionString}:`, error.message);
    throw error;
  }
}

/**
 * Run tests for a module version
 * @param {string} moduleName - Module name
 * @param {string} versionString - Version string
 * @returns {object} Test results
 */
function runTests(moduleName, versionString) {
  const modulePath = path.join(FEATURES_DIR, moduleName, versionString);
  const specFile = path.join(modulePath, `${moduleName}.spec.js`);
  
  try {
    console.log(`Running tests for ${moduleName}@${versionString}...`);
    const output = execSync(`npx vitest run ${specFile} --reporter=json`, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    try {
      const results = JSON.parse(output);
      const testResults = {
        passed: results.numPassedTests || 0,
        failed: results.numFailedTests || 0,
        total: results.numTotalTests || 0,
        errorRate: results.numTotalTests > 0 ? (results.numFailedTests / results.numTotalTests) * 100 : 0,
        failedTests: results.numFailedTests || 0
      };
      
      console.log(`✓ Tests passed for ${moduleName}@${versionString}: ${testResults.passed}/${testResults.total}`);
      return { success: true, ...testResults };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const success = !output.includes('FAILED') && !output.includes('Error');
      console.log(`✓ Tests ${success ? 'passed' : 'failed'} for ${moduleName}@${versionString}`);
      return { 
        success, 
        passed: success ? 1 : 0, 
        failed: success ? 0 : 1, 
        total: 1,
        errorRate: success ? 0 : 100,
        failedTests: success ? 0 : 1
      };
    }
  } catch (error) {
    console.error(`✗ Tests failed for ${moduleName}@${versionString}:`, error.message);
    return { 
      success: false, 
      passed: 0, 
      failed: 1, 
      total: 1,
      errorRate: 100,
      failedTests: 1,
      error: error.message 
    };
  }
}

/**
 * Update project README with new module
 * @param {string} moduleName - Module name
 * @param {string} versionString - Version string
 */
function updateProjectReadme(moduleName, versionString) {
  const projectReadme = path.join(process.cwd(), 'README.md');
  const entry = `- ${moduleName}@${versionString} - Added ${new Date().toISOString()}\n`;
  
  if (fs.existsSync(projectReadme)) {
    fs.appendFileSync(projectReadme, entry);
  } else {
    const initialContent = `# 1001.mask.services\n\nModular MASKSERVICE system\n\n## Modules\n\n${entry}`;
    fs.writeFileSync(projectReadme, initialContent);
  }
  
  console.log(`✓ Updated project README.md`);
}

/**
 * Main function to add a new module from a prompt
 * @param {string} moduleName - Name of the module
 * @param {string} promptDescription - Description from prompt
 * @returns {Promise<object>} Module creation results
 */
export async function addModuleWithPrompt(moduleName, promptDescription) {
  console.log(`\n🚀 Creating module: ${moduleName}`);
  console.log(`📝 Prompt: ${promptDescription}\n`);
  
  try {
    // Step 1: Create module structure and files
    const { modulePath, newVersion, versionString, packageJson } = createModuleFromPrompt(moduleName, promptDescription);
    
    // Step 2: Register module in FeatureRegistry
    await registerModule(moduleName, versionString, packageJson);
    
    // Step 3: Run tests
    const testResults = runTests(moduleName, versionString);
    
    // Step 4: Check rollback conditions
    if (!testResults.success || registry.shouldRollback(moduleName, versionString, testResults)) {
      console.log(`⚠ Rollback conditions met for ${moduleName}@${versionString}`);
      console.log(`Removing ${modulePath}`);
      fs.rmSync(modulePath, { recursive: true, force: true });
      
      return {
        success: false,
        module: moduleName,
        version: versionString,
        error: 'Tests failed, module rolled back',
        testResults
      };
    }
    
    // Step 5: Update project documentation
    updateProjectReadme(moduleName, versionString);
    
    console.log(`\n✅ Module ${moduleName}@${versionString} is ready!\n`);
    
    return {
      success: true,
      module: moduleName,
      version: versionString,
      path: modulePath,
      testResults
    };
    
  } catch (error) {
    console.error(`\n❌ Failed to create module ${moduleName}:`, error.message);
    return {
      success: false,
      module: moduleName,
      error: error.message
    };
  }
}

/**
 * CLI usage when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, moduleName, ...promptParts] = process.argv;
  
  if (!moduleName || promptParts.length === 0) {
    console.log('Usage: node moduleManagerWithPackageJson.js <moduleName> <prompt description>');
    console.log('Example: node moduleManagerWithPackageJson.js loginForm "Formularz logowania z walidacją"');
    process.exit(1);
  }
  
  const promptDescription = promptParts.join(' ');
  addModuleWithPrompt(moduleName, promptDescription)
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
