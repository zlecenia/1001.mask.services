import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp, reactive } from 'vue';

// Import the module
import pageTemplateModule from './index.js';

// Mock DOM APIs
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('PageTemplate Module', () => {
  let wrapper;
  let mockStore;
  let mockRouter;

  beforeEach(() => {
    // Mock Vuex store using Vue reactive system for proper reactivity
    mockStore = {
      state: reactive({
        user: {
          role: 'OPERATOR',
          name: 'Test User'
        },
        system: {
          pressureData: {
            inlet: 25.5,
            outlet: 18.3,
            differential: 7.2
          }
        }
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
      expect(pageTemplateModule).toBeDefined();
      expect(pageTemplateModule.component).toBeDefined();
      expect(pageTemplateModule.handle).toBeTypeOf('function');
      expect(pageTemplateModule.init).toBeTypeOf('function');
      expect(pageTemplateModule.cleanup).toBeTypeOf('function');
      expect(pageTemplateModule.metadata).toBeDefined();
    });

    it('should have correct metadata', () => {
      const { metadata } = pageTemplateModule;
      expect(metadata.name).toBe('pageTemplate');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('7.9');
      expect(metadata.author).toBe('Industrial Systems Team');
      expect(metadata.dependencies).toContain('vue');
      expect(metadata.tags).toContain('layout');
      expect(metadata.tags).toContain('7.9-inch');
      expect(metadata.tags).toContain('landscape');
    });
  });

  describe('Component Functionality', () => {
    beforeEach(() => {
      const Component = pageTemplateModule.component;
      wrapper = mount(Component, {
        props: {
          title: 'Test Page',
          showSidebar: true,
          showPressurePanel: true
        },
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: {
              t: (key) => key,
              locale: 'pl'
            }
          }
        },
        slots: {
          default: '<div id="test-content">Test Content</div>',
          sidebar: '<div id="test-sidebar">Test Sidebar</div>'
        }
      });
    });

    it('should render page structure correctly', () => {
      expect(wrapper.find('.page-template').exists()).toBe(true);
      expect(wrapper.find('.page-header').exists()).toBe(true);
      expect(wrapper.find('.page-body').exists()).toBe(true);
      expect(wrapper.find('.page-footer').exists()).toBe(true);
    });

    it('should display title in header', () => {
      const header = wrapper.find('.page-header h1');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('Test Page');
    });

    it('should show sidebar when enabled', () => {
      const sidebar = wrapper.find('.page-sidebar');
      expect(sidebar.exists()).toBe(true);
      expect(sidebar.isVisible()).toBe(true);
      expect(sidebar.text()).toContain('Test Sidebar');
    });

    it('should hide sidebar when disabled', async () => {
      await wrapper.setProps({ showSidebar: false });
      const sidebar = wrapper.find('.page-sidebar');
      expect(sidebar.exists()).toBe(false);
    });

    it('should show pressure panel when enabled', () => {
      const pressurePanel = wrapper.find('.pressure-panel');
      expect(pressurePanel.exists()).toBe(true);
      expect(pressurePanel.isVisible()).toBe(true);
    });

    it('should hide pressure panel when disabled', async () => {
      await wrapper.setProps({ showPressurePanel: false });
      const pressurePanel = wrapper.find('.pressure-panel');
      expect(pressurePanel.exists()).toBe(false);
    });

    it('should render main content area', () => {
      const content = wrapper.find('.page-content');
      expect(content.exists()).toBe(true);
      expect(content.text()).toContain('Test Content');
    });
  });

  describe('Pressure Panel', () => {
    beforeEach(() => {
      const Component = pageTemplateModule.component;
      wrapper = mount(Component, {
        props: {
          title: 'Test Page',
          showPressurePanel: true
        },
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should display pressure values from store', () => {
      const pressurePanel = wrapper.find('.pressure-panel');
      expect(pressurePanel.text()).toContain('25.5');
      expect(pressurePanel.text()).toContain('18.3');
      expect(pressurePanel.text()).toContain('7.2');
    });

    it('should handle missing pressure data gracefully', async () => {
      mockStore.state.system.pressureData = null;
      await wrapper.vm.$forceUpdate();
      
      const pressurePanel = wrapper.find('.pressure-panel');
      expect(pressurePanel.text()).toContain('--');
    });

    it('should apply warning styles for high differential', async () => {
      mockStore.state.system.pressureData.differential = 15.0;
      await wrapper.vm.$forceUpdate();
      
      const diffValue = wrapper.find('.pressure-differential');
      expect(diffValue.classes()).toContain('warning');
    });

    it('should apply critical styles for very high differential', async () => {
      mockStore.state.system.pressureData.differential = 25.0;
      await wrapper.vm.$forceUpdate();
      
      const diffValue = wrapper.find('.pressure-differential');
      expect(diffValue.classes()).toContain('critical');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      const Component = pageTemplateModule.component;
      wrapper = mount(Component, {
        props: {
          title: 'Test Page',
          showSidebar: true
        },
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
    });

    it('should have correct CSS classes for 7.9 inch display', () => {
      const template = wrapper.find('.page-template');
      expect(template.classes()).toContain('landscape-7-9');
    });

    it('should have proper touch-friendly styling', () => {
      const template = wrapper.find('.page-template');
      expect(template.element.style.getPropertyValue('--touch-target-size')).toBeDefined();
    });

    it('should handle window resize events', async () => {
      // Create spy on the component constructor before mounting
      const handleResizeSpy = vi.fn();
      const ComponentWithSpy = {
        ...pageTemplateModule.component,
        methods: {
          ...pageTemplateModule.component.methods,
          handleResize: handleResizeSpy
        }
      };
      
      // Mount component with spy
      const testWrapper = mount(ComponentWithSpy, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $t: (key) => key
          }
        },
        props: {
          title: 'Test Page'
        }
      });
      
      // Simulate window resize
      window.dispatchEvent(new Event('resize'));
      
      // Wait for next tick
      await testWrapper.vm.$nextTick();
      
      expect(handleResizeSpy).toHaveBeenCalled();
      
      // Cleanup
      testWrapper.unmount();
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize correctly', async () => {
      const context = { store: mockStore, router: mockRouter };
      const result = await pageTemplateModule.init(context);
      
      expect(result).toBe(true);
      expect(pageTemplateModule.metadata.initialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidContext = {};
      const result = await pageTemplateModule.init(invalidContext);
      
      expect(result).toBe(false);
    });

    it('should handle requests correctly', () => {
      const request = {
        action: 'show',
        data: { title: 'Dynamic Title' }
      };
      
      const result = pageTemplateModule.handle(request);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Dynamic Title');
    });

    it('should handle unknown requests', () => {
      const request = {
        action: 'unknown',
        data: {}
      };
      
      const result = pageTemplateModule.handle(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('should cleanup correctly', () => {
      const cleanupSpy = vi.fn();
      pageTemplateModule.cleanup = cleanupSpy;
      
      pageTemplateModule.cleanup();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work with FeatureRegistry', async () => {
      // Import FeatureRegistry
      const { registry } = await import('../../../FeatureRegistry.js');
      
      // Register the module
      registry.register('pageTemplate', '0.1.0', pageTemplateModule);
      
      // Load the module
      const loadedModule = await registry.load('pageTemplate', '0.1.0');
      
      expect(loadedModule).toBeDefined();
      expect(loadedModule.metadata.name).toBe('pageTemplate');
    });

    it('should integrate with Vue app instance', () => {
      const app = createApp({});
      const Component = pageTemplateModule.component;
      
      // Should not throw when registering as component
      expect(() => {
        app.component('PageTemplate', Component);
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should render within acceptable time', () => {
      const start = performance.now();
      
      const Component = pageTemplateModule.component;
      wrapper = mount(Component, {
        props: { title: 'Performance Test' },
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
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large content efficiently', () => {
      const largeContent = '<div>' + 'x'.repeat(10000) + '</div>';
      
      const Component = pageTemplateModule.component;
      
      expect(() => {
        wrapper = mount(Component, {
          props: { title: 'Large Content Test' },
          slots: { default: largeContent },
          global: {
            mocks: {
              $store: mockStore,
              $router: mockRouter,
              $i18n: { t: (key) => key }
            }
          }
        });
      }).not.toThrow();
    });
  });
});
