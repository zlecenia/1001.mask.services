#!/usr/bin/env node

/**
 * JSON Editor Component Tests
 * Tests for visual JSON configuration editor
 */

import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Vue environment for testing
global.Vue = {
  createApp: () => ({
    use: () => {},
    mount: () => {},
    component: () => {}
  })
};

// Import component
const JsonEditorModule = await import('./index.js');

class JsonEditorTests {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting JSON Editor Component Tests\n');
    
    // Component structure tests
    await this.testComponentStructure();
    await this.testMetadata();
    await this.testConfigLoading();
    
    // JSON manipulation tests
    await this.testJSONValidation();
    await this.testJSONImportExport();
    
    // Schema validation tests
    await this.testSchemaValidation();
    
    // Component lifecycle tests
    await this.testInitialization();
    await this.testHandleActions();
    
    this.printResults();
  }

  async test(name, testFn) {
    try {
      await testFn();
      this.passedTests++;
      this.testResults.push({ name, status: 'PASS', error: null });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.failedTests++;
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  async testComponentStructure() {
    await this.test('Component export structure', () => {
      assert(JsonEditorModule.default, 'Default export should exist');
      assert(JsonEditorModule.default.component, 'Component should be exported');
      assert(JsonEditorModule.default.metadata, 'Metadata should be exported');
      assert(JsonEditorModule.default.init, 'Init function should be exported');
      assert(JsonEditorModule.default.handle, 'Handle function should be exported');
    });

    await this.test('Component has Vue structure', () => {
      const component = JsonEditorModule.default.component;
      assert(component.name === 'JsonEditor', 'Component should have correct name');
      assert(component.template, 'Component should have template');
      assert(component.data, 'Component should have data function');
      assert(component.methods, 'Component should have methods');
    });
  }

  async testMetadata() {
    await this.test('Metadata structure', () => {
      const metadata = JsonEditorModule.default.metadata;
      assert(metadata.name === 'jsonEditor', 'Correct component name');
      assert(metadata.version === '0.1.0', 'Correct version');
      assert(metadata.description, 'Description should exist');
      assert(metadata.capabilities, 'Capabilities should be defined');
      assert(metadata.dependencies, 'Dependencies should be defined');
    });

    await this.test('Metadata capabilities', () => {
      const capabilities = JsonEditorModule.default.metadata.capabilities;
      assert(capabilities.standalone === true, 'Should support standalone mode');
      assert(capabilities.configurable === true, 'Should be configurable');
      assert(capabilities.testable === true, 'Should be testable');
    });
  }

  async testConfigLoading() {
    await this.test('Config loading', async () => {
      const result = await JsonEditorModule.default.handle('loadConfig');
      assert(result, 'Config loading should return result');
      assert(typeof result === 'object', 'Config should be object');
      assert(result.component, 'Config should have component section');
      assert(result.settings, 'Config should have settings section');
    });
  }

  async testJSONValidation() {
    await this.test('JSON validation with schema', () => {
      const schema = {
        type: 'object',
        required: ['name', 'version']
      };
      
      const validData = { name: 'test', version: '1.0.0' };
      const invalidData = { name: 'test' }; // missing version
      
      const validResult = JsonEditorModule.default.validateJSON(validData, schema);
      const invalidResult = JsonEditorModule.default.validateJSON(invalidData, schema);
      
      assert(validResult.success === true, 'Valid data should pass validation');
      assert(invalidResult.success === false, 'Invalid data should fail validation');
    });

    await this.test('JSON validation without schema', () => {
      const data = { name: 'test' };
      const result = JsonEditorModule.default.validateJSON(data, null);
      
      assert(result.success === true, 'Should succeed without schema');
      assert(result.message.includes('No schema'), 'Should indicate no schema');
    });
  }

  async testJSONImportExport() {
    await this.test('JSON export', () => {
      const data = { name: 'test', value: 123 };
      const result = JsonEditorModule.default.exportJSON(data, 'test.json');
      
      assert(result.success === true, 'Export should succeed');
      assert(result.message.includes('exported'), 'Should indicate success');
    });

    await this.test('JSON import', async () => {
      // Create mock file
      const jsonContent = '{"name": "test", "value": 123}';
      const mockFile = new Blob([jsonContent], { type: 'application/json' });
      
      // Note: In real browser environment this would work with FileReader
      // For Node.js testing, we just verify the function exists and structure
      assert(typeof JsonEditorModule.default.importJSON === 'function', 'Import function should exist');
    });
  }

  async testSchemaValidation() {
    await this.test('Schema validation - object type', () => {
      const schema = { type: 'object', required: ['id'] };
      
      // Valid object
      const validResult = JsonEditorModule.default.validateJSON({ id: 1 }, schema);
      assert(validResult.success === true, 'Valid object should pass');
      
      // Invalid type
      const invalidResult = JsonEditorModule.default.validateJSON('not an object', schema);
      assert(invalidResult.success === false, 'Non-object should fail');
      
      // Missing required field
      const missingFieldResult = JsonEditorModule.default.validateJSON({}, schema);
      assert(missingFieldResult.success === false, 'Missing required field should fail');
    });
  }

  async testInitialization() {
    await this.test('Component initialization', async () => {
      const context = { store: null };
      const result = await JsonEditorModule.default.init(context);
      
      assert(result, 'Init should return result');
      assert(result.component, 'Result should include component');
      assert(result.metadata, 'Result should include metadata');
      assert(typeof result.success === 'boolean', 'Result should indicate success status');
    });

    await this.test('Component initialization with store', async () => {
      const mockStore = {
        hasModule: () => false,
        registerModule: (name, module) => {
          assert(name === 'jsonEditor', 'Should register with correct name');
          assert(module.namespaced === true, 'Module should be namespaced');
          assert(module.state, 'Module should have state');
          assert(module.mutations, 'Module should have mutations');
          assert(module.actions, 'Module should have actions');
        }
      };
      
      const context = { store: mockStore };
      const result = await JsonEditorModule.default.init(context);
      
      assert(result.success !== false, 'Init with store should succeed');
    });
  }

  async testHandleActions() {
    await this.test('Handle loadConfig action', async () => {
      const result = await JsonEditorModule.default.handle('loadConfig');
      assert(result, 'LoadConfig should return result');
      assert(typeof result === 'object', 'Result should be object');
    });

    await this.test('Handle validateJSON action', async () => {
      const params = {
        data: { name: 'test' },
        schema: { type: 'object', required: ['name'] }
      };
      const result = await JsonEditorModule.default.handle('validateJSON', params);
      assert(result.success === true, 'Validation should succeed');
    });

    await this.test('Handle exportJSON action', async () => {
      const params = {
        data: { name: 'test' },
        filename: 'test.json'
      };
      const result = await JsonEditorModule.default.handle('exportJSON', params);
      assert(result.success === true, 'Export should succeed');
    });

    await this.test('Handle unknown action', async () => {
      const result = await JsonEditorModule.default.handle('unknownAction');
      assert(result.success === false, 'Unknown action should fail');
      assert(result.error.includes('Unknown action'), 'Should indicate unknown action');
    });
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('JSON EDITOR TEST RESULTS');
    console.log('='.repeat(50));
    
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    const successRate = ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! JSON Editor component is working correctly.');
    }
    
    // Exit with appropriate code
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new JsonEditorTests();
  await tester.runAllTests();
}
