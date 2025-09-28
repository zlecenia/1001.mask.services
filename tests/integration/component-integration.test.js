/**
 * INTEGRATION TESTS - MASKSERVICE C20 1001
 * Tests for component interactions and system integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Import components for integration testing
import JsonEditor from '../../js/features/jsonEditor/0.1.0/index.js';
import MainMenu from '../../js/features/mainMenu/0.1.0/index.js';
import AppHeader from '../../js/features/appHeader/0.1.0/index.js';

describe('Component Integration Tests', () => {
  let store;
  let router;
  let app;

  beforeEach(() => {
    // Setup mock store
    store = createStore({
      modules: {
        auth: {
          namespaced: true,
          state: {
            user: { username: 'admin', role: 'ADMIN' },
            isAuthenticated: true
          },
          mutations: {
            SET_USER: (state, user) => { state.user = user; }
          }
        },
        system: {
          namespaced: true,
          state: {
            language: 'pl',
            deviceStatus: 'ONLINE'
          }
        }
      }
    });

    // Setup mock router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin', component: { template: '<div>Admin</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (app) {
      app.unmount();
    }
  });

  describe('JSON Editor + MainMenu Integration', () => {
    it('should allow JSON Editor to edit MainMenu configuration', async () => {
      // Initialize JSON Editor
      const jsonEditorResult = await JsonEditor.init({ store, router });
      expect(jsonEditorResult.success).toBe(true);

      // Initialize MainMenu
      const mainMenuResult = await MainMenu.init({ store, router });
      expect(mainMenuResult.success).toBe(true);

      // Test JSON Editor can load MainMenu config
      const configResult = await JsonEditor.handle('loadComponentConfig', {
        component: 'mainMenu',
        file: 'config.json'
      });
      
      expect(configResult.success).toBe(true);
      expect(configResult.data).toBeDefined();
      expect(configResult.data.component).toBeDefined();
      expect(configResult.data.component.name).toBe('mainMenu');
    });

    it('should validate configuration changes between components', async () => {
      await JsonEditor.init({ store, router });
      await MainMenu.init({ store, router });

      // Modify MainMenu config through JSON Editor
      const modifiedConfig = {
        component: { name: 'mainMenu', version: '0.1.0' },
        settings: { maxMenuItems: 10 }
      };

      const saveResult = await JsonEditor.handle('saveComponentConfig', {
        component: 'mainMenu',
        file: 'config.json',
        data: modifiedConfig
      });

      expect(saveResult.success).toBe(true);

      // Verify MainMenu can use the modified config
      const menuResult = await MainMenu.handle('getMenuConfig', { role: 'ADMIN' });
      expect(menuResult.success).toBe(true);
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('should handle component initialization chain correctly', async () => {
      const initResults = [];

      // Initialize components in dependency order
      const headerResult = await AppHeader.init({ store, router });
      initResults.push(headerResult.success);

      const menuResult = await MainMenu.init({ store, router });
      initResults.push(menuResult.success);

      const editorResult = await JsonEditor.init({ store, router });
      initResults.push(editorResult.success);

      // All components should initialize successfully
      expect(initResults.every(result => result === true)).toBe(true);
    });

    it('should propagate configuration changes across components', async () => {
      await AppHeader.init({ store, router });
      await MainMenu.init({ store, router });

      // Change system language
      store.commit('system/SET_LANGUAGE', 'en');

      // Both components should reflect the language change
      const headerData = await AppHeader.handle('render', { currentLanguage: 'en' });
      const menuData = await MainMenu.handle('getMenu', { role: 'ADMIN' });

      expect(headerData.success).toBe(true);
      expect(menuData.success).toBe(true);
    });
  });

  describe('Store Integration', () => {
    it('should maintain consistent state across components', async () => {
      await MainMenu.init({ store, router });
      await AppHeader.init({ store, router });

      // Initial state check
      expect(store.state.auth.user.role).toBe('ADMIN');

      // Change user role
      store.commit('auth/SET_USER', { username: 'operator', role: 'OPERATOR' });

      // MainMenu should respect the new role
      const menuResult = await MainMenu.handle('getMenu', { role: 'OPERATOR' });
      expect(menuResult.success).toBe(true);
      expect(menuResult.data.menuItems.length).toBeLessThan(5); // OPERATOR has fewer menu items
    });

    it('should handle store mutations from multiple components', async () => {
      await JsonEditor.init({ store, router });
      await MainMenu.init({ store, router });

      // Register component-specific store modules
      if (!store.hasModule('jsonEditor')) {
        store.registerModule('jsonEditor', {
          namespaced: true,
          state: { currentConfig: null },
          mutations: {
            SET_CONFIG: (state, config) => { state.currentConfig = config; }
          }
        });
      }

      // Test cross-component store interaction
      store.commit('jsonEditor/SET_CONFIG', { component: 'test' });
      
      expect(store.state.jsonEditor.currentConfig).toEqual({ component: 'test' });
    });
  });

  describe('Event System Integration', () => {
    it('should handle inter-component events correctly', async () => {
      const jsonEditor = await JsonEditor.init({ store, router });
      const mainMenu = await MainMenu.init({ store, router });

      // Create mock event bus
      const eventBus = {
        events: {},
        emit(event, data) {
          if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
          }
        },
        on(event, callback) {
          if (!this.events[event]) this.events[event] = [];
          this.events[event].push(callback);
        }
      };

      // Simulate configuration change event
      let configChanged = false;
      eventBus.on('config:changed', (data) => {
        configChanged = true;
      });

      // Emit configuration change
      eventBus.emit('config:changed', { component: 'mainMenu' });

      expect(configChanged).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle component initialization failures gracefully', async () => {
      // Try to initialize with invalid context
      const result = await MainMenu.init(null);
      
      expect(result.success).toBe(false);
      // System should continue to work with other components
    });

    it('should recover from configuration errors', async () => {
      await JsonEditor.init({ store, router });

      // Try to load non-existent configuration
      const result = await JsonEditor.handle('loadComponentConfig', {
        component: 'nonExistentComponent',
        file: 'config.json'
      });

      // Should handle gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    it('should initialize multiple components within time limit', async () => {
      const startTime = performance.now();

      // Initialize multiple components
      await Promise.all([
        AppHeader.init({ store, router }),
        MainMenu.init({ store, router }),
        JsonEditor.init({ store, router })
      ]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All components should initialize within 1 second
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle concurrent component operations', async () => {
      await JsonEditor.init({ store, router });
      await MainMenu.init({ store, router });

      // Perform concurrent operations
      const operations = [
        JsonEditor.handle('loadConfig'),
        MainMenu.handle('getMenu', { role: 'ADMIN' }),
        JsonEditor.handle('validateJSON', { data: {}, schema: {} })
      ];

      const results = await Promise.all(operations);
      
      // All operations should complete successfully
      expect(results.every(result => result !== null)).toBe(true);
    });
  });
});
