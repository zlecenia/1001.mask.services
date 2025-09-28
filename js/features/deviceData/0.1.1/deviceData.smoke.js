/**
 * Device Data Component - Smoke Tests v2.0
 * Fast regression tests to prevent breaking changes
 * Run time: <10 seconds
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('DeviceData Smoke Tests', () => {
  let componentModule;
  
  beforeAll(async () => {
    // Skip smoke tests in CI if flag is set
    if (typeof window !== 'undefined' && window.SKIP_SMOKE_TESTS) {
      return;
    }
    
    // Load component module
    componentModule = await import('./index.js');
  });

  describe('🏗️ Component Structure', () => {
    it('should export component module with v2.0 contract', async () => {
      expect(componentModule.default).toBeDefined();
      expect(componentModule.default.metadata).toBeDefined();
      expect(componentModule.default.metadata.contractVersion).toBe('2.0');
      expect(componentModule.default.metadata.name).toBe('deviceData');
    });

    it('should have required v2.0 methods', async () => {
      const module = componentModule.default;
      expect(typeof module.init).toBe('function');
      expect(typeof module.handle).toBe('function');
      expect(typeof module.loadComponent).toBe('function');
      expect(typeof module.loadConfig).toBe('function');
    });

    it('should have frozen metadata to prevent modifications', async () => {
      const module = componentModule.default;
      expect(Object.isFrozen(module.metadata)).toBe(true);
    });
  });

  describe('🔧 Initialization', () => {
    it('should initialize successfully', async () => {
      // Set skip flag to avoid circular smoke test calls
      const originalSkip = window?.SKIP_SMOKE_TESTS;
      if (typeof window !== 'undefined') {
        window.SKIP_SMOKE_TESTS = true;
      }

      try {
        const result = await componentModule.default.init();
        expect(result.success).toBe(true);
        expect(result.contractVersion).toBe('2.0');
        expect(result.message).toContain('deviceData initialized');
      } finally {
        // Restore original flag
        if (typeof window !== 'undefined') {
          window.SKIP_SMOKE_TESTS = originalSkip;
        }
      }
    });

    it('should load component successfully', async () => {
      const module = componentModule.default;
      await module.loadComponent();
      expect(module.component).toBeDefined();
      expect(module.component.name).toBe('DeviceDataComponent');
    });

    it('should handle missing config gracefully', async () => {
      const module = componentModule.default;
      await module.loadConfig();
      expect(module.config).toBeDefined();
      // Should have default fallback config
      expect(module.config.component || module.config.settings).toBeDefined();
    });
  });

  describe('📨 Standard Actions', () => {
    it('should handle GET_METADATA action', async () => {
      const result = componentModule.default.handle({ action: 'GET_METADATA' });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('deviceData');
      expect(result.data.contractVersion).toBe('2.0');
    });

    it('should handle GET_CONFIG action', async () => {
      const result = componentModule.default.handle({ action: 'GET_CONFIG' });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle HEALTH_CHECK action', async () => {
      const result = componentModule.default.handle({ action: 'HEALTH_CHECK' });
      expect(result.success).toBe(true);
      expect(result.healthy).toBe(true);
    });

    it('should handle unknown actions gracefully', async () => {
      const result = componentModule.default.handle({ 
        action: 'UNKNOWN_ACTION', 
        payload: { test: 'data' } 
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'data' });
    });
  });

  describe('🛡️ Vue Integration Safety', () => {
    it('should use global Vue pattern (not ES imports)', async () => {
      const componentSource = await import('./deviceData.js');
      const componentString = componentSource.default.toString();
      
      // Should NOT contain ES import patterns for Vue
      expect(componentString).not.toMatch(/import.*vue/i);
      expect(componentString).not.toMatch(/from\s+['"]vue['"]/);
    });

    it('should export component instance (not factory)', async () => {
      const componentSource = await import('./deviceData.js');
      
      // Should be an object, not a function
      expect(typeof componentSource.default).toBe('object');
      expect(componentSource.default.name).toBeDefined();
    });
  });

  describe('🔧 Configuration Management', () => {
    it('should validate data with schema when available', async () => {
      const module = componentModule.default;
      
      // Mock schema for testing
      module.schema = {
        required: ['deviceId'],
        properties: {
          deviceId: { type: 'string' },
          enabled: { type: 'boolean' }
        }
      };

      const validData = { deviceId: 'TEST_001', enabled: true };
      const result = module.handleValidateData(validData);
      
      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid data when schema is available', async () => {
      const module = componentModule.default;
      
      // Mock schema for testing
      module.schema = {
        required: ['deviceId'],
        properties: {
          deviceId: { type: 'string' }
        }
      };

      const invalidData = { enabled: true }; // Missing required deviceId
      const result = module.handleValidateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle data updates with localStorage persistence', async () => {
      const module = componentModule.default;
      
      // Mock valid schema
      module.schema = {
        properties: {
          title: { type: 'string' },
          enabled: { type: 'boolean' }
        }
      };

      const updates = { title: 'Test Device', enabled: true };
      const result = module.handleUpdateData(updates);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Data updated successfully');
      expect(result.data).toMatchObject(updates);
      
      // Check localStorage persistence
      const storageKey = `config_${module.metadata.name}_${module.metadata.version}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expect(stored).toMatchObject(updates);
    });
  });

  describe('🌐 Internationalization', () => {
    it('should handle translation requests', async () => {
      const result = await componentModule.default.handleGetTranslations('pl');
      expect(result.success).toBe(true);
      expect(result.language).toBe('pl');
      // Data might be empty if no translation files exist, but should not error
    });

    it('should fallback to Polish when language not found', async () => {
      const result = await componentModule.default.handleGetTranslations('nonexistent');
      expect(result.success).toBe(true);
      // Should attempt fallback to 'pl'
    });
  });

  describe('⚡ Performance', () => {
    it('should initialize quickly (< 2 seconds)', async () => {
      const startTime = performance.now();
      
      // Set skip flag to avoid circular calls
      const originalSkip = window?.SKIP_SMOKE_TESTS;
      if (typeof window !== 'undefined') {
        window.SKIP_SMOKE_TESTS = true;
      }

      try {
        await componentModule.default.init();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(2000); // < 2 seconds
      } finally {
        if (typeof window !== 'undefined') {
          window.SKIP_SMOKE_TESTS = originalSkip;
        }
      }
    });

    it('should handle multiple actions quickly', async () => {
      const startTime = performance.now();
      
      // Run multiple standard actions
      const actions = [
        'GET_METADATA',
        'GET_CONFIG', 
        'HEALTH_CHECK',
        'GET_METADATA'
      ];
      
      for (const action of actions) {
        componentModule.default.handle({ action });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // < 100ms for basic actions
    });
  });

  describe('🚨 Error Handling', () => {
    it('should handle init failures gracefully', async () => {
      // Create a module copy to test error conditions
      const testModule = { 
        ...componentModule.default,
        loadComponent: () => { throw new Error('Test error'); }
      };
      
      const result = await testModule.init();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.stack).toBeDefined();
    });

    it('should handle malformed requests gracefully', async () => {
      const result = componentModule.default.handle(null);
      expect(result.success).toBe(true);
      // Should not throw, should handle gracefully
    });

    it('should handle validation errors properly', async () => {
      const module = componentModule.default;
      
      // Test with no schema
      module.schema = null;
      const result = module.handleValidateData({ test: 'data' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No validation schema available');
    });
  });
});
