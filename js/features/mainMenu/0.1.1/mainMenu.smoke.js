/**
 * MainMenu Smoke Tests - v2.0 Contract Compliant
 * Fast regression tests for role-based navigation menu component
 * Target: Complete in <10 seconds, critical path validation
 * 
 * @version 0.1.1
 * @author MASKSERVICE System
 */

export default class MainMenuSmokeTests {
  constructor() {
    this.testResults = [];
    this.startTime = performance.now();
    this.maxTestDuration = 10000; // 10 seconds max
  }

  /**
   * Run all smoke tests - main entry point
   */
  async runAll() {
    console.log('🧪 Starting MainMenu Smoke Tests v0.1.1...');
    
    try {
      // Critical Path Tests (must pass)
      await this.testVueIntegration();
      await this.testComponentContract();
      await this.testRoleBasedMenus();
      await this.testPerformanceBenchmarks();
      
      // Safety Tests
      await this.testErrorHandling();
      await this.testSecurityValidation();
      await this.testAccessibility();
      
      // Configuration Tests
      await this.testConfigurationLoading();
      
      const duration = performance.now() - this.startTime;
      const passed = this.testResults.filter(t => t.passed).length;
      const total = this.testResults.length;
      
      const summary = {
        passed,
        total,
        duration: Math.round(duration),
        success: passed === total && duration < this.maxTestDuration,
        details: this.testResults,
        component: 'mainMenu',
        version: '0.1.1',
        contractVersion: '2.0'
      };
      
      if (summary.success) {
        console.log(`✅ MainMenu smoke tests PASSED: ${passed}/${total} in ${summary.duration}ms`);
      } else {
        console.error(`❌ MainMenu smoke tests FAILED: ${passed}/${total} in ${summary.duration}ms`);
      }
      
      return summary;
      
    } catch (error) {
      console.error('💥 MainMenu smoke tests crashed:', error);
      return {
        passed: 0,
        total: this.testResults.length + 1,
        duration: performance.now() - this.startTime,
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Test Vue integration and global pattern
   */
  async testVueIntegration() {
    const testName = 'Vue Integration';
    const start = performance.now();
    
    try {
      // Test global Vue availability
      if (typeof Vue === 'undefined' && typeof window.Vue === 'undefined') {
        throw new Error('Vue not available globally');
      }
      
      // Test Vue composition API methods
      const { reactive, computed, onMounted } = Vue || window.Vue || {};
      if (!reactive || !computed || !onMounted) {
        throw new Error('Vue Composition API methods not available');
      }
      
      // Test reactive state creation
      const testState = reactive({ test: true });
      if (!testState || typeof testState !== 'object') {
        throw new Error('Reactive state creation failed');
      }
      
      // Test computed properties
      const testComputed = computed(() => testState.test);
      if (typeof testComputed.value === 'undefined') {
        throw new Error('Computed properties not working');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test v2.0 component contract compliance
   */
  async testComponentContract() {
    const testName = 'Component Contract v2.0';
    const start = performance.now();
    
    try {
      // Import the component module dynamically
      const moduleResponse = await import('./index.js');
      const componentModule = moduleResponse.default;
      
      if (!componentModule) {
        throw new Error('Component module not exported');
      }
      
      // Test required v2.0 methods
      const requiredMethods = ['init', 'handle', 'loadComponent', 'loadConfig', 'runSmokeTests'];
      for (const method of requiredMethods) {
        if (typeof componentModule[method] !== 'function') {
          throw new Error(`Missing required method: ${method}`);
        }
      }
      
      // Test metadata
      if (!componentModule.metadata || componentModule.metadata.contractVersion !== '2.0') {
        throw new Error('Invalid or missing v2.0 contract metadata');
      }
      
      // Test component name and version
      if (componentModule.metadata.name !== 'mainMenu' || !componentModule.metadata.version) {
        throw new Error('Invalid component metadata');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test role-based menu functionality
   */
  async testRoleBasedMenus() {
    const testName = 'Role-Based Menus';
    const start = performance.now();
    
    try {
      // Import configuration
      const configResponse = await import('./component.config.js');
      const config = configResponse.default;
      
      if (!config || !config.menus || !config.menus.roleMenus) {
        throw new Error('Menu configuration not found');
      }
      
      // Test all defined roles have menus
      const roles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
      for (const role of roles) {
        if (!config.menus.roleMenus[role] || !Array.isArray(config.menus.roleMenus[role])) {
          throw new Error(`Missing menu for role: ${role}`);
        }
        
        // Test menu items structure
        const menuItems = config.menus.roleMenus[role];
        for (const item of menuItems) {
          if (!item.id || !item.icon || !item.label || !item.route) {
            throw new Error(`Invalid menu item structure in ${role} menu`);
          }
        }
      }
      
      // Test role capabilities
      if (!config.roles || !config.roles.capabilities) {
        throw new Error('Role capabilities not defined');
      }
      
      for (const role of roles) {
        if (!config.roles.capabilities[role] || typeof config.roles.capabilities[role].level !== 'number') {
          throw new Error(`Invalid capabilities for role: ${role}`);
        }
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test performance benchmarks
   */
  async testPerformanceBenchmarks() {
    const testName = 'Performance Benchmarks';
    const start = performance.now();
    
    try {
      // Import and initialize component
      const moduleResponse = await import('./index.js');
      const componentModule = moduleResponse.default;
      
      // Test initialization performance (target: <1000ms)
      const initStart = performance.now();
      const initResult = await componentModule.init();
      const initDuration = performance.now() - initStart;
      
      if (initDuration > 1000) {
        console.warn(`⚠️ MainMenu init slow: ${Math.round(initDuration)}ms (target: <1000ms)`);
      }
      
      if (!initResult || !initResult.success) {
        throw new Error('Component initialization failed');
      }
      
      // Test action handling performance (target: <100ms)
      const actionStart = performance.now();
      const actionResult = componentModule.handle({ action: 'GET_METADATA' });
      const actionDuration = performance.now() - actionStart;
      
      if (actionDuration > 100) {
        console.warn(`⚠️ MainMenu action slow: ${Math.round(actionDuration)}ms (target: <100ms)`);
      }
      
      if (!actionResult || !actionResult.success) {
        throw new Error('Action handling failed');
      }
      
      this.addTestResult(testName, true, performance.now() - start, {
        initDuration: Math.round(initDuration),
        actionDuration: Math.round(actionDuration)
      });
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test error handling robustness
   */
  async testErrorHandling() {
    const testName = 'Error Handling';
    const start = performance.now();
    
    try {
      const moduleResponse = await import('./index.js');
      const componentModule = moduleResponse.default;
      
      // Test invalid action handling
      const invalidResult = componentModule.handle({ action: 'INVALID_ACTION' });
      if (!invalidResult || invalidResult.success !== false) {
        throw new Error('Invalid actions should return error');
      }
      
      // Test missing payload handling
      const missingPayloadResult = componentModule.handle({});
      if (!missingPayloadResult) {
        throw new Error('Missing payload should be handled gracefully');
      }
      
      // Test null/undefined inputs
      const nullResult = componentModule.handle(null);
      if (!nullResult) {
        throw new Error('Null input should be handled gracefully');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test security validation
   */
  async testSecurityValidation() {
    const testName = 'Security Validation';
    const start = performance.now();
    
    try {
      const configResponse = await import('./component.config.js');
      const config = configResponse.default;
      
      // Test security configuration exists
      if (!config.security || !config.security.validation) {
        throw new Error('Security configuration missing');
      }
      
      // Test role validation is enabled
      if (!config.security.validation.enabled || !config.security.validation.validateRoles) {
        throw new Error('Role validation not enabled');
      }
      
      // Test XSS protection is enabled
      if (!config.security.protection.xssProtection) {
        throw new Error('XSS protection not enabled');
      }
      
      // Test audit logging is enabled
      if (!config.security.audit || !config.security.audit.enabled) {
        throw new Error('Security audit not enabled');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test accessibility features
   */
  async testAccessibility() {
    const testName = 'Accessibility';
    const start = performance.now();
    
    try {
      const configResponse = await import('./component.config.js');
      const config = configResponse.default;
      
      // Test accessibility configuration
      if (!config.accessibility || !config.accessibility.enabled) {
        throw new Error('Accessibility not enabled');
      }
      
      // Test required accessibility features
      const requiredFeatures = ['keyboardNavigation', 'screenReader', 'focusIndicators'];
      for (const feature of requiredFeatures) {
        if (!config.accessibility.features[feature]) {
          throw new Error(`Missing accessibility feature: ${feature}`);
        }
      }
      
      // Test ARIA support
      if (!config.accessibility.aria || !config.accessibility.aria.labels) {
        throw new Error('ARIA support not configured');
      }
      
      // Test keyboard shortcuts
      if (!config.accessibility.keyboard || !config.accessibility.keyboard.shortcuts) {
        throw new Error('Keyboard shortcuts not configured');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Test configuration loading
   */
  async testConfigurationLoading() {
    const testName = 'Configuration Loading';
    const start = performance.now();
    
    try {
      const configResponse = await import('./component.config.js');
      const config = configResponse.default;
      
      // Test configuration structure
      const requiredSections = ['metadata', 'ui', 'data', 'menus', 'roles', 'responsive', 'accessibility', 'performance', 'security', 'translations'];
      for (const section of requiredSections) {
        if (!config[section]) {
          throw new Error(`Missing configuration section: ${section}`);
        }
      }
      
      // Test translations for all supported languages
      const languages = ['pl', 'en', 'de'];
      for (const lang of languages) {
        if (!config.translations[lang] || !config.translations[lang].menuTitle) {
          throw new Error(`Missing translations for language: ${lang}`);
        }
      }
      
      // Test responsive configuration for 7.9" display
      if (!config.responsive.display79inch || !config.responsive.display79inch.enabled) {
        throw new Error('7.9" display configuration missing');
      }
      
      this.addTestResult(testName, true, performance.now() - start);
      
    } catch (error) {
      this.addTestResult(testName, false, performance.now() - start, error.message);
      throw error;
    }
  }

  /**
   * Add test result to collection
   */
  addTestResult(name, passed, duration, details = null) {
    this.testResults.push({
      name,
      passed,
      duration: Math.round(duration),
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get test summary for external reporting
   */
  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    const duration = performance.now() - this.startTime;
    
    return {
      component: 'mainMenu',
      version: '0.1.1',
      contractVersion: '2.0',
      passed,
      total,
      duration: Math.round(duration),
      success: passed === total && duration < this.maxTestDuration,
      timestamp: new Date().toISOString(),
      tests: this.testResults
    };
  }
}

// Export for dynamic import and standalone usage
export { MainMenuSmokeTests };
