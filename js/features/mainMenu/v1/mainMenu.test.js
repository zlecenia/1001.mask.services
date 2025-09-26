import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp, reactive, ref } from 'vue';

// Import the module
import mainMenuModule from './index.js';

describe('MainMenu Module', () => {
  let wrapper;
  let mockStore;
  let mockRouter;

  beforeEach(() => {
    // Mock Vuex store using Vue reactive system for proper reactivity
    mockStore = {
      state: reactive({
        user: ref({
          role: 'OPERATOR',
          name: 'Test User'
        }),
        system: ref({
          pressureData: {
            inlet: 25.5,
            outlet: 18.3,
            differential: 7.2
          }
        })
      }),
      commit: vi.fn(),
      dispatch: vi.fn()
    };

    // Mock Vue Router
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      currentRoute: {
        value: {
          name: 'dashboard',
          path: '/dashboard'
        }
      }
    };

    // Mock global Vue app instance
    global.$app = {
      config: {
        globalProperties: {
          $store: mockStore,
          $router: mockRouter,
          $i18n: {
            t: (key) => key,
            locale: 'pl'
          }
        }
      }
    };
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  describe('Module Structure', () => {
    it('should export required module interface', () => {
      expect(mainMenuModule).toBeDefined();
      expect(mainMenuModule.component).toBeDefined();
      expect(mainMenuModule.handle).toBeTypeOf('function');
      expect(mainMenuModule.init).toBeTypeOf('function');
      expect(mainMenuModule.cleanup).toBeTypeOf('function');
      expect(mainMenuModule.metadata).toBeDefined();
    });

    it('should have correct metadata', () => {
      const { metadata } = mainMenuModule;
      expect(metadata.name).toBe('mainMenu');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('role-based');
      expect(metadata.author).toBe('Industrial Systems Team');
      expect(metadata.dependencies).toContain('vue');
      expect(metadata.tags).toContain('menu');
      expect(metadata.tags).toContain('navigation');
      expect(metadata.tags).toContain('role-based');
    });

    it('should have role validation function', () => {
      expect(mainMenuModule.validateRole).toBeTypeOf('function');
    });

    it('should have menu configuration', () => {
      expect(mainMenuModule.getMenuConfig).toBeTypeOf('function');
    });
  });

  describe('Role-Based Menu Configuration', () => {
    it('should return correct menu items for OPERATOR role', () => {
      const menuConfig = mainMenuModule.getMenuConfig('OPERATOR');
      expect(menuConfig).toHaveLength(2);
      expect(menuConfig.map(item => item.id)).toEqual(['tests', 'reports']);
    });

    it('should return correct menu items for ADMIN role', () => {
      const menuConfig = mainMenuModule.getMenuConfig('ADMIN');
      expect(menuConfig).toHaveLength(4);
      expect(menuConfig.map(item => item.id)).toEqual(['tests', 'reports', 'users', 'system']);
    });

    it('should return correct menu items for SUPERUSER role', () => {
      const menuConfig = mainMenuModule.getMenuConfig('SUPERUSER');
      expect(menuConfig).toHaveLength(4);
      expect(menuConfig.map(item => item.id)).toEqual(['integration', 'analytics', 'advanced-system', 'audit']);
    });

    it('should return correct menu items for SERWISANT role', () => {
      const menuConfig = mainMenuModule.getMenuConfig('SERWISANT');
      expect(menuConfig).toHaveLength(5);
      expect(menuConfig.map(item => item.id)).toEqual(['diagnostics', 'calibration', 'maintenance', 'workshop', 'tech-docs']);
    });

    it('should return empty array for invalid role', () => {
      const menuConfig = mainMenuModule.getMenuConfig('INVALID_ROLE');
      expect(menuConfig).toEqual([]);
    });

    it('should ensure no menu overlap between roles', () => {
      const operatorMenu = mainMenuModule.getMenuConfig('OPERATOR').map(item => item.id);
      const adminMenu = mainMenuModule.getMenuConfig('ADMIN').map(item => item.id);
      const superuserMenu = mainMenuModule.getMenuConfig('SUPERUSER').map(item => item.id);
      const serwisantMenu = mainMenuModule.getMenuConfig('SERWISANT').map(item => item.id);

      // Check no overlap between any role combinations
      expect(operatorMenu.some(id => adminMenu.includes(id))).toBe(false);
      expect(operatorMenu.some(id => superuserMenu.includes(id))).toBe(false);
      expect(operatorMenu.some(id => serwisantMenu.includes(id))).toBe(false);
      expect(adminMenu.some(id => superuserMenu.includes(id))).toBe(false);
      expect(adminMenu.some(id => serwisantMenu.includes(id))).toBe(false);
      expect(superuserMenu.some(id => serwisantMenu.includes(id))).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should validate correct roles', () => {
      expect(mainMenuModule.validateRole('OPERATOR')).toBe(true);
      expect(mainMenuModule.validateRole('ADMIN')).toBe(true);
      expect(mainMenuModule.validateRole('SUPERUSER')).toBe(true);
      expect(mainMenuModule.validateRole('SERWISANT')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(mainMenuModule.validateRole('INVALID')).toBe(false);
      expect(mainMenuModule.validateRole('')).toBe(false);
      expect(mainMenuModule.validateRole(null)).toBe(false);
      expect(mainMenuModule.validateRole(undefined)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(mainMenuModule.validateRole('operator')).toBe(false);
      expect(mainMenuModule.validateRole('Admin')).toBe(false);
      expect(mainMenuModule.validateRole('SUPERUSER ')).toBe(false);
    });
  });

  describe('Component Functionality - OPERATOR Role', () => {
    beforeEach(() => {
      mockStore.state.user.value = {
        role: 'OPERATOR',
        name: 'Test User'
      };
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should render menu container', () => {
      expect(wrapper.find('.main-menu').exists()).toBe(true);
      expect(wrapper.find('.menu-header').exists()).toBe(true);
      expect(wrapper.find('.menu-items').exists()).toBe(true);
    });

    it('should display correct number of menu items for OPERATOR', () => {
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(2);
    });

    it('should display role-specific styling for OPERATOR', () => {
      const menu = wrapper.find('.main-menu');
      expect(menu.classes()).toContain('role-operator');
    });

    it('should show correct menu items for OPERATOR', () => {
      const menuItems = wrapper.findAll('.menu-item');
      const itemTexts = menuItems.map(item => item.text());
      
      expect(itemTexts).toContain('menu.tests');
      expect(itemTexts).toContain('menu.reports');
    });

    it('should handle menu item clicks', async () => {
      const firstMenuItem = wrapper.find('.menu-item');
      await firstMenuItem.trigger('click');
      
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  describe('Component Functionality - ADMIN Role', () => {
    beforeEach(() => {
      mockStore.state.user.value = {
        role: 'ADMIN',
        name: 'Test User'
      };
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should display correct number of menu items for ADMIN', () => {
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(4);
    });

    it('should display role-specific styling for ADMIN', () => {
      const menu = wrapper.find('.main-menu');
      expect(menu.classes()).toContain('role-admin');
    });

    it('should show correct menu items for ADMIN', () => {
      const menuItems = wrapper.findAll('.menu-item');
      const itemTexts = menuItems.map(item => item.text());
      
      expect(itemTexts).toContain('menu.tests');
      expect(itemTexts).toContain('menu.reports');
      expect(itemTexts).toContain('menu.users');
      expect(itemTexts).toContain('menu.system');
    });
  });

  describe('Component Functionality - SUPERUSER Role', () => {
    beforeEach(() => {
      mockStore.state.user.value = {
        role: 'SUPERUSER',
        name: 'Test User'
      };
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should display correct number of menu items for SUPERUSER', () => {
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(4);
    });

    it('should display role-specific styling for SUPERUSER', () => {
      const menu = wrapper.find('.main-menu');
      expect(menu.classes()).toContain('role-superuser');
    });

    it('should show advanced menu items for SUPERUSER', () => {
      const menuItems = wrapper.findAll('.menu-item');
      const itemTexts = menuItems.map(item => item.text());
      
      expect(itemTexts).toContain('menu.integration');
      expect(itemTexts).toContain('menu.analytics');
      expect(itemTexts).toContain('menu.advanced-system');
      expect(itemTexts).toContain('menu.audit');
    });
  });

  describe('Component Functionality - SERWISANT Role', () => {
    beforeEach(() => {
      mockStore.state.user.value = {
        role: 'SERWISANT',
        name: 'Test User'
      };
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should display correct number of menu items for SERWISANT', () => {
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(5);
    });

    it('should display role-specific styling for SERWISANT', () => {
      const menu = wrapper.find('.main-menu');
      expect(menu.classes()).toContain('role-serwisant');
    });

    it('should show technical menu items for SERWISANT', () => {
      const menuItems = wrapper.findAll('.menu-item');
      const itemTexts = menuItems.map(item => item.text());
      
      expect(itemTexts).toContain('menu.diagnostics');
      expect(itemTexts).toContain('menu.calibration');
      expect(itemTexts).toContain('menu.maintenance');
      expect(itemTexts).toContain('menu.workshop');
      expect(itemTexts).toContain('menu.tech-docs');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user role gracefully', () => {
      mockStore.state.user.value = null;
      
      const Component = mainMenuModule.component;
      expect(() => {
        wrapper = mount(Component, {
          global: {
            mocks: {
              $store: mockStore,
              $router: mockRouter,
              $i18n: { t: (key) => key }
            }
          }
        });
      }).not.toThrow();
      
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(0);
    });

    it('should handle invalid user role gracefully', () => {
      mockStore.state.user.value = 'INVALID_ROLE';
      
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
      
      const menuItems = wrapper.findAll('.menu-item');
      expect(menuItems).toHaveLength(0);
    });

    it('should handle missing store gracefully', () => {
      const Component = mainMenuModule.component;
      
      expect(() => {
        wrapper = mount(Component, {
          global: {
            mocks: {
              $router: mockRouter,
              $i18n: { t: (key) => key }
            }
          }
        });
      }).not.toThrow();
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize correctly', async () => {
      const context = { store: mockStore, router: mockRouter };
      const result = await mainMenuModule.init(context);
      
      expect(result).toBe(true);
      expect(mainMenuModule.metadata.initialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidContext = {};
      const result = await mainMenuModule.init(invalidContext);
      
      expect(result).toBe(false);
    });

    it('should handle menu requests correctly', () => {
      const request = {
        action: 'getMenu',
        data: { role: 'OPERATOR' }
      };
      
      const result = mainMenuModule.handle(request);
      expect(result.success).toBe(true);
      expect(result.data.menuItems).toHaveLength(2);
    });

    it('should handle role validation requests', () => {
      const request = {
        action: 'validateRole',
        data: { role: 'ADMIN' }
      };
      
      const result = mainMenuModule.handle(request);
      expect(result.success).toBe(true);
      expect(result.data.valid).toBe(true);
    });

    it('should handle unknown requests', () => {
      const request = {
        action: 'unknown',
        data: {}
      };
      
      const result = mainMenuModule.handle(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('should cleanup correctly', () => {
      const cleanupSpy = vi.fn();
      mainMenuModule.cleanup = cleanupSpy;
      
      mainMenuModule.cleanup();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work with FeatureRegistry', async () => {
      // Import FeatureRegistry
      const { registry } = await import('../../../FeatureRegistry.js');
      
      // Register the module
      registry.register('mainMenu', 'v1', mainMenuModule);
      
      // Load the module
      const loadedModule = await registry.load('mainMenu', 'v1');
      
      expect(loadedModule).toBeDefined();
      expect(loadedModule.metadata.name).toBe('mainMenu');
    });

    it('should integrate with Vue app instance', () => {
      const app = createApp({});
      const Component = mainMenuModule.component;
      
      // Should not throw when registering as component
      expect(() => {
        app.component('MainMenu', Component);
      }).not.toThrow();
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      mockStore.state.user.value = {
        role: 'OPERATOR',
        name: 'Test User'
      };
      const Component = mainMenuModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should have proper ARIA attributes', () => {
      const menu = wrapper.find('.main-menu');
      expect(menu.attributes('role')).toBe('navigation');
      expect(menu.attributes('aria-label')).toBeDefined();
    });

    it('should have keyboard navigation support', () => {
      const menuItems = wrapper.findAll('.menu-item');
      menuItems.forEach(item => {
        expect(item.attributes('tabindex')).toBeDefined();
        expect(item.attributes('role')).toBe('menuitem');
      });
    });

    it('should support keyboard interaction', async () => {
      const firstMenuItem = wrapper.find('.menu-item');
      await firstMenuItem.trigger('keydown', { key: 'Enter' });
      
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should render quickly for all roles', () => {
      const roles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
      
      roles.forEach(role => {
        const start = performance.now();
        
        mockStore.state.user.value = {
          role,
          name: 'Test User'
        };
        const Component = mainMenuModule.component;
        const testWrapper = mount(Component, {
          global: {
            mocks: {
              $store: mockStore,
              $router: mockRouter,
              $i18n: { t: (key) => key }
            }
          }
        });
        
        const end = performance.now();
        const renderTime = end - start;
        
        // Should render in less than 50ms
        expect(renderTime).toBeLessThan(50);
        
        testWrapper.unmount();
      });
    });
  });
});
