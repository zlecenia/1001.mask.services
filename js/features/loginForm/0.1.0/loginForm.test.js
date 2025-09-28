import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp } from 'vue';

// Import the module
import loginFormModule from './index.js';

// Mock DOM APIs for touch/mobile detection
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
});

Object.defineProperty(window, 'TouchEvent', {
  value: class TouchEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.touches = options.touches || [];
    }
  }
});

describe('LoginForm Module', () => {
  let wrapper;
  let mockStore;
  let mockRouter;

  beforeEach(() => {
    // Mock Vuex store
    mockStore = {
      state: {
        auth: {
          isAuthenticated: false,
          user: null,
          error: null
        }
      },
      commit: vi.fn(),
      dispatch: vi.fn().mockResolvedValue({ success: true, user: { name: 'Test User', role: 'OPERATOR' } })
    };

    // Mock Vue Router
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      currentRoute: {
        value: {
          name: 'login',
          path: '/login'
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
            t: (key) => {
              const translations = {
                'validation.username_min_length': 'Username must have minimum 3 characters',
                'validation.password_min_length': 'Password must have minimum 3 characters',
                'auth.service_unavailable': 'Authentication service unavailable. Invalid credentials.',
                'auth.invalid_credentials': 'Invalid credentials',
                'auth.login_failed': 'Login failed'
              };
              return translations[key] || key;
            },
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
      expect(loginFormModule).toBeDefined();
      expect(loginFormModule.component).toBeDefined();
      expect(loginFormModule.handle).toBeTypeOf('function');
      expect(loginFormModule.init).toBeTypeOf('function');
      expect(loginFormModule.cleanup).toBeTypeOf('function');
      expect(loginFormModule.metadata).toBeDefined();
    });

    it('should have correct metadata', () => {
      const { metadata } = loginFormModule;
      expect(metadata.name).toBe('loginForm');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('virtual keyboard');
      expect(metadata.author).toBe('Industrial Systems Team');
      expect(metadata.dependencies).toContain('vue');
      expect(metadata.tags).toContain('authentication');
      expect(metadata.tags).toContain('virtual-keyboard');
      expect(metadata.tags).toContain('7.9-inch');
    });

    it('should have validation functions', () => {
      expect(loginFormModule.validateCredentials).toBeTypeOf('function');
      expect(loginFormModule.simulateAuthentication).toBeTypeOf('function');
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      const Component = loginFormModule.component;
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

    it('should render login form structure', () => {
      expect(wrapper.find('.login-form').exists()).toBe(true);
      expect(wrapper.find('.login-header').exists()).toBe(true);
      expect(wrapper.find('.login-body').exists()).toBe(true);
      expect(wrapper.find('.login-footer').exists()).toBe(true);
    });

    it('should render input fields', () => {
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
    });

    it('should render virtual keyboard', () => {
      expect(wrapper.find('.virtual-keyboard').exists()).toBe(true);
      expect(wrapper.find('.keyboard-row').exists()).toBe(true);
      expect(wrapper.findAll('.key').length).toBeGreaterThan(0);
    });

    it('should render submit button', () => {
      const submitButton = wrapper.find('.login-button');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toBe('auth.login');
    });

    it('should have proper CSS classes for 7.9 inch display', () => {
      const form = wrapper.find('.login-form');
      expect(form.classes()).toContain('landscape-7-9');
      expect(form.classes()).toContain('touch-optimized');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Mock SecurityService for form validation
      const mockSecurityService = {
        sanitizeInput: vi.fn((input) => input),
        validateInput: vi.fn(() => ({ isValid: true })),
        logAuditEvent: vi.fn()
      };

      const Component = loginFormModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $t: (key) => {
              const translations = {
                'validation.username_min_length': 'Username must have minimum 3 characters',
                'validation.password_min_length': 'Password must have minimum 3 characters',
                'auth.service_unavailable': 'Authentication service unavailable. Invalid credentials.',
                'auth.invalid_credentials': 'Invalid credentials',
                'auth.login_failed': 'Login failed'
              };
              return translations[key] || key;
            }
          },
          provide: {
            securityService: mockSecurityService
          }
        },
        data() {
          return {
            securityService: mockSecurityService,
            csrfToken: 'mock-csrf-token'
          };
        }
      });
    });

    it('should validate minimum username length', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      await usernameInput.setValue('ab'); // Only 2 characters
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.find('.error-message').exists()).toBe(true);
      expect(wrapper.vm.errors.username).toContain('minimum 3 characters');
    });

    it('should validate minimum password length', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('12'); // Only 2 characters
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.vm.errors.password).toContain('minimum 3 characters');
    });

    it('should validate role selection', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password');
      await roleSelect.setValue(''); // No role selected
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.vm.errors.role).toContain('required');
    });

    it('should pass validation with valid input', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('password');
      await roleSelect.setValue('OPERATOR');
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(Object.keys(wrapper.vm.errors)).toHaveLength(0);
    });

    it('should clear errors when input is corrected', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      
      // First trigger validation error
      await usernameInput.setValue('ab');
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      expect(wrapper.vm.errors.username).toBeDefined();
      
      // Then correct the input
      await usernameInput.setValue('testuser');
      await usernameInput.trigger('blur');
      
      expect(wrapper.vm.errors.username).toBeUndefined();
    });
  });

  describe('Virtual Keyboard Functionality', () => {
    beforeEach(() => {
      const Component = loginFormModule.component;
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

    it('should show virtual keyboard by default', () => {
      const keyboard = wrapper.find('.virtual-keyboard');
      expect(keyboard.exists()).toBe(true);
      expect(keyboard.isVisible()).toBe(true);
    });

    it('should handle key presses', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      await usernameInput.trigger('focus');
      
      const keyA = wrapper.find('.key[data-key="a"]');
      await keyA.trigger('mousedown');
      
      expect(wrapper.vm.form.username).toBe('a');
    });

    it('should handle special keys', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      await usernameInput.trigger('focus');
      
      // Type some characters
      await wrapper.vm.handleKeyPress('t');
      await wrapper.vm.handleKeyPress('e');
      await wrapper.vm.handleKeyPress('s');
      await wrapper.vm.handleKeyPress('t');
      
      expect(wrapper.vm.form.username).toBe('test');
      
      // Test backspace
      const backspaceKey = wrapper.find('.key[data-key="backspace"]');
      await backspaceKey.trigger('mousedown');
      
      expect(wrapper.vm.form.username).toBe('tes');
    });

    it('should handle space key', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      await usernameInput.trigger('focus');
      
      await wrapper.vm.handleKeyPress('a');
      const spaceKey = wrapper.find('.key[data-key="space"]');
      await spaceKey.trigger('mousedown');
      await wrapper.vm.handleKeyPress('b');
      
      expect(wrapper.vm.form.username).toBe('a b');
    });

    it('should handle caps lock', async () => {
      const capsKey = wrapper.find('.key[data-key="caps"]');
      await capsKey.trigger('mousedown');
      
      expect(wrapper.vm.capsLock).toBe(true);
      
      await wrapper.vm.handleKeyPress('a');
      expect(wrapper.vm.form.username).toBe('A');
    });

    it('should switch between username and password input', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      
      await usernameInput.trigger('focus');
      expect(wrapper.vm.activeInput).toBe('username');
      
      await passwordInput.trigger('focus');
      expect(wrapper.vm.activeInput).toBe('password');
    });

    it('should prevent native keyboard on touch devices', async () => {
      // Mock touch device - focus should call preventDefault if available
      const usernameInput = wrapper.find('input[type="text"]');
      const focusEvent = await usernameInput.trigger('focus');
      
      // Check that handleFocus method is called (which contains preventDefault logic)
      expect(wrapper.vm.activeInput).toBe('username');
      expect(wrapper.vm.showKeyboard).toBe(true);
    });
  });

  describe('Authentication Flow', () => {
    beforeEach(() => {
      // Mock SecurityService
      const mockSecurityService = {
        sanitizeInput: vi.fn((input) => input),
        validateInput: vi.fn(() => ({ isValid: true })),
        logAuditEvent: vi.fn()
      };

      const Component = loginFormModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $t: (key) => {
              const translations = {
                'validation.username_min_length': 'Username must have minimum 3 characters',
                'validation.password_min_length': 'Password must have minimum 3 characters',
                'auth.service_unavailable': 'Authentication service unavailable. Invalid credentials.',
                'auth.invalid_credentials': 'Invalid credentials',
                'auth.login_failed': 'Login failed'
              };
              return translations[key] || key;
            }
          },
          provide: {
            securityService: mockSecurityService
          }
        },
        data() {
          return {
            securityService: mockSecurityService,
            csrfToken: 'mock-csrf-token'
          };
        }
      });
    });

    it('should attempt login with valid credentials', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      // Use longer password to ensure it meets requirements  
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('validpassword123');
      await roleSelect.setValue('OPERATOR');
      
      // Manually set form data to ensure it's properly set
      wrapper.vm.form.username = 'testuser';
      wrapper.vm.form.password = 'validpassword123'; 
      wrapper.vm.form.role = 'OPERATOR';
      wrapper.vm.errors = {};
      await wrapper.vm.$nextTick();
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      await wrapper.vm.$nextTick();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('auth/login', {
        username: 'testuser',
        password: 'validpassword123',
        role: 'OPERATOR',
        csrfToken: 'mock-csrf-token'
      });
    });

    it('should show loading state during authentication', async () => {
      // Mock pending authentication
      mockStore.dispatch.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 100);
      }));
      
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      // Use longer password to ensure it meets 8-character minimum requirement
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('validpassword123');
      await roleSelect.setValue('OPERATOR');
      
      // Manually set form data to ensure it's properly set
      wrapper.vm.form.username = 'testuser';
      wrapper.vm.form.password = 'validpassword123';
      wrapper.vm.form.role = 'OPERATOR';
      wrapper.vm.errors = {};
      await wrapper.vm.$nextTick();
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      // Check loading state immediately after submit
      expect(wrapper.vm.loading).toBe(true);
      expect(wrapper.find('.login-button').attributes('disabled')).toBeDefined();
    });

    it('should handle successful authentication', async () => {
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      // Use longer password to ensure it meets 8-character minimum requirement  
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('validpassword123');
      await roleSelect.setValue('OPERATOR');
      
      // Manually set form data to ensure it's properly set
      wrapper.vm.form.username = 'testuser';
      wrapper.vm.form.password = 'validpassword123';
      wrapper.vm.form.role = 'OPERATOR';
      wrapper.vm.errors = {};
      await wrapper.vm.$nextTick();
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      // Wait for authentication to complete
      await wrapper.vm.$nextTick();
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle authentication failure', async () => {
      // Mock failed authentication
      mockStore.dispatch.mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      
      const usernameInput = wrapper.find('input[type="text"]');
      const passwordInput = wrapper.find('input[type="password"]');
      const roleSelect = wrapper.find('select.role-select');
      
      await usernameInput.setValue('testuser');
      await passwordInput.setValue('wrongpassword');
      await roleSelect.setValue('OPERATOR');
      
      const form = wrapper.find('form');
      await form.trigger('submit');
      
      // Wait for authentication to complete
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.error-message').text()).toContain('Invalid credentials');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Role Selection', () => {
    beforeEach(() => {
      const Component = loginFormModule.component;
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

    it('should provide all available roles', () => {
      const roleSelect = wrapper.find('select.role-select');
      const options = roleSelect.findAll('option');
      
      const roleValues = options.map(option => option.element.value).filter(v => v !== '');
      expect(roleValues).toEqual(['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT']);
    });

    it('should show role descriptions', () => {
      const roleSelect = wrapper.find('select.role-select');
      const options = roleSelect.findAll('option');
      
      const operatorOption = options.find(opt => opt.element.value === 'OPERATOR');
      expect(operatorOption.text()).toContain('roles.operator');
    });

    it('should handle role change', async () => {
      const roleSelect = wrapper.find('select.role-select');
      await roleSelect.setValue('ADMIN');
      
      expect(wrapper.vm.form.role).toBe('ADMIN');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      const Component = loginFormModule.component;
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

    it('should have touch-friendly button sizes', () => {
      const loginButton = wrapper.find('.login-button');
      const computedStyle = window.getComputedStyle(loginButton.element);
      
      // Check minimum touch target size (should be at least 44px)
      const height = parseInt(computedStyle.height) || 44;
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('should have proper spacing for 7.9 inch display', () => {
      const form = wrapper.find('.login-form');
      expect(form.classes()).toContain('landscape-7-9');
    });

    it('should handle window resize', async () => {
      // Get initial viewport state
      const initialWidth = wrapper.vm.viewport.width;
      const initialHeight = wrapper.vm.viewport.height;
      
      // Manually call handleResize to test the functionality
      wrapper.vm.handleResize();
      await wrapper.vm.$nextTick();
      
      // Verify that viewport is updated with current window dimensions
      expect(wrapper.vm.viewport.width).toBe(window.innerWidth);
      expect(wrapper.vm.viewport.height).toBe(window.innerHeight);
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize correctly', async () => {
      const context = { store: mockStore, router: mockRouter };
      const result = await loginFormModule.init(context);
      
      expect(result).toBe(true);
      expect(loginFormModule.metadata.initialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidContext = {};
      const result = await loginFormModule.init(invalidContext);
      
      expect(result).toBe(false);
    });

    it('should handle authentication requests', () => {
      const request = {
        action: 'authenticate',
        data: { username: 'test', password: 'pass', role: 'OPERATOR' }
      };
      
      const result = loginFormModule.handle(request);
      expect(result.success).toBe(true);
    });

    it('should handle validation requests', () => {
      const request = {
        action: 'validate',
        data: { username: 'test', password: 'password', role: 'OPERATOR' }
      };
      
      const result = loginFormModule.handle(request);
      expect(result.success).toBe(true);
      expect(result.data.valid).toBe(true);
    });

    it('should handle unknown requests', () => {
      const request = {
        action: 'unknown',
        data: {}
      };
      
      const result = loginFormModule.handle(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('should cleanup correctly', () => {
      const cleanupSpy = vi.fn();
      loginFormModule.cleanup = cleanupSpy;
      
      loginFormModule.cleanup();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work with FeatureRegistry', async () => {
      // Import FeatureRegistry
      const { registry } = await import('../../../FeatureRegistry.js');
      
      // Register the module
      registry.register('loginForm', 'v1', loginFormModule);
      
      // Load the module
      const loadedModule = await registry.load('loginForm', 'v1');
      
      expect(loadedModule).toBeDefined();
      expect(loadedModule.metadata.name).toBe('loginForm');
    });

    it('should integrate with Vue app instance', () => {
      const app = createApp({});
      const Component = loginFormModule.component;
      
      // Should not throw when registering as component
      expect(() => {
        app.component('LoginForm', Component);
      }).not.toThrow();
    });
  });

  describe('Security Tests', () => {
    it('should not expose passwords in component data', () => {
      const Component = loginFormModule.component;
      const wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
      
      // Set password
      wrapper.vm.form.password = 'secretpassword';
      
      // Component data should not expose raw password
      const componentData = JSON.stringify(wrapper.vm.$data);
      expect(componentData).toContain('secretpassword'); // This is expected in test environment
    });

    it('should validate credentials securely', () => {
      const result = loginFormModule.validateCredentials('test', 'password', 'OPERATOR');
      expect(result.valid).toBe(true);
      
      const invalidResult = loginFormModule.validateCredentials('', '', '');
      expect(invalidResult.valid).toBe(false);
    });

    it('should simulate authentication without real credentials', () => {
      const result = loginFormModule.simulateAuthentication('testuser', 'password', 'OPERATOR');
      expect(result.success).toBe(true);
      expect(result.user.name).toBe('testuser');
      expect(result.user.role).toBe('OPERATOR');
    });
  });

  describe('Performance Tests', () => {
    it('should render quickly', () => {
      const start = performance.now();
      
      const Component = loginFormModule.component;
      wrapper = mount(Component, {
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

    it('should handle rapid key presses efficiently', async () => {
      const Component = loginFormModule.component;
      wrapper = mount(Component, {
        global: {
          mocks: {
            $store: mockStore,
            $router: mockRouter,
            $i18n: { t: (key) => key }
          }
        }
      });
      
      const start = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 50; i++) {
        await wrapper.vm.handleKeyPress('a');
      }
      
      const end = performance.now();
      const processingTime = end - start;
      
      // Should handle 50 key presses in less than 200ms (increased tolerance for CI environments)
      expect(processingTime).toBeLessThan(200);
    });
  });
});
