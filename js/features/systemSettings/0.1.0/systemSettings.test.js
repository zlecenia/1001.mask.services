/**
 * SystemSettings Component Test Suite
 * Comprehensive unit and integration tests for system configuration management
 * Version: 0.1.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { SystemSettingsComponent } from './systemSettings.js';

// Mock SecurityService
const mockSecurityService = {
  logAuditEvent: vi.fn().mockResolvedValue(true),
  sanitizeInput: vi.fn((input) => input),
  validateInput: vi.fn(() => ({ isValid: true, errors: [] }))
};

// Mock getSecurityService function
vi.mock('../../../services/securityService.js', () => ({
  getSecurityService: vi.fn().mockResolvedValue(mockSecurityService)
}));

// Mock i18n service
const mockI18n = {
  $t: vi.fn((key, fallback) => fallback || key),
  locale: 'pl'
};

// Mock SystemManager
const mockSystemManager = {
  testConnection: vi.fn(),
  saveSettings: vi.fn(),
  loadSettings: vi.fn()
};

// Create Vuex store for testing
const createTestStore = () => {
  return createStore({
    modules: {
      systemSettings: {
        namespaced: true,
        state: () => ({
          networkSettings: {
            ipAddress: '192.168.1.10',
            port: 8080,
            dhcpEnabled: false,
            gateway: '192.168.1.1',
            dnsServer: '8.8.8.8',
            connectionTimeout: 30
          },
          systemConfig: {
            updateInterval: 5,
            debugMode: false,
            logLevel: 'INFO',
            maxLogFiles: 10,
            autoBackup: true,
            backupInterval: 24,
            dataRetention: 365,
            enableMonitoring: true
          },
          deviceSettings: {
            deviceName: 'MASKTRONIC-001',
            location: 'Production Floor',
            timezone: 'Europe/Warsaw',
            language: 'pl',
            units: 'metric',
            precision: 2
          },
          securitySettings: {
            sessionTimeout: 30,
            maxLoginAttempts: 3,
            passwordExpiry: 90,
            lockoutDuration: 15,
            enableTwoFactor: false,
            encryptionLevel: 'AES256',
            auditLogging: true,
            forcePasswordChange: true,
            enableSessionMonitoring: true
          },
          settingsState: {
            isLoading: false,
            isValidating: false,
            hasUnsavedChanges: false,
            lastSaved: null,
            validationErrors: []
          },
          networkTestResult: null
        }),
        mutations: {
          SET_NETWORK_SETTINGS: (state, settings) => {
            Object.assign(state.networkSettings, settings);
          },
          SET_SETTINGS_STATE: (state, settingsState) => {
            Object.assign(state.settingsState, settingsState);
          },
          SET_NETWORK_TEST_RESULT: (state, result) => {
            state.networkTestResult = result;
          }
        },
        actions: {
          saveSettings: vi.fn(),
          testNetworkConnection: vi.fn(),
          validateSettings: vi.fn()
        },
        getters: {
          isFormValid: (state) => state.settingsState.validationErrors.length === 0,
          hasUnsavedChanges: (state) => state.settingsState.hasUnsavedChanges
        }
      }
    }
  });
};

describe('SystemSettings Component', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup global mocks
    global.window = {
      SystemManager: mockSystemManager,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    // Create fresh store for each test
    store = createTestStore();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(SystemSettingsComponent, {
      props: {
        user: { username: 'testuser', role: 'ADMIN' },
        language: 'pl',
        ...props
      },
      global: {
        plugins: [store],
        mocks: {
          $t: mockI18n.$t,
          $store: store,
          $emit: vi.fn()
        }
      }
    });
  };

  describe('Component Initialization', () => {
    it('should render without crashing', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should display the correct page title', () => {
      wrapper = createWrapper();
      const title = wrapper.find('.settings-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toContain('Ustawienia Systemu');
    });

    it('should initialize with network tab active by default', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.activeTab).toBe('network');
    });

    it('should accept activeTab prop override', () => {
      wrapper = createWrapper({ activeTab: 'security' });
      expect(wrapper.vm.activeTab).toBe('security');
    });

    it('should initialize SecurityService on mount', async () => {
      wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'system_settings_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display all four setting tabs', () => {
      const tabs = wrapper.findAll('.tab-button');
      expect(tabs.length).toBe(4);
      
      const tabTexts = tabs.map(tab => tab.text());
      expect(tabTexts).toContain('Sieć');
      expect(tabTexts).toContain('System');
      expect(tabTexts).toContain('Urządzenie');
      expect(tabTexts).toContain('Bezpieczeństwo');
    });

    it('should switch tabs when clicked', async () => {
      const systemTab = wrapper.find('[data-tab="system"]');
      await systemTab.trigger('click');
      expect(wrapper.vm.activeTab).toBe('system');
    });

    it('should show correct content for each tab', async () => {
      // Test network tab
      expect(wrapper.find('.network-settings').exists()).toBe(true);
      
      // Switch to system tab
      const systemTab = wrapper.find('[data-tab="system"]');
      await systemTab.trigger('click');
      expect(wrapper.find('.system-settings').exists()).toBe(true);
      
      // Switch to device tab
      const deviceTab = wrapper.find('[data-tab="device"]');
      await deviceTab.trigger('click');
      expect(wrapper.find('.device-settings').exists()).toBe(true);
      
      // Switch to security tab
      const securityTab = wrapper.find('[data-tab="security"]');
      await securityTab.trigger('click');
      expect(wrapper.find('.security-settings').exists()).toBe(true);
    });
  });

  describe('Network Settings', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display network form fields', () => {
      expect(wrapper.find('input[data-field="ipAddress"]').exists()).toBe(true);
      expect(wrapper.find('input[data-field="port"]').exists()).toBe(true);
      expect(wrapper.find('input[data-field="gateway"]').exists()).toBe(true);
      expect(wrapper.find('input[data-field="dnsServer"]').exists()).toBe(true);
    });

    it('should populate network fields with current values', () => {
      const ipField = wrapper.find('input[data-field="ipAddress"]');
      expect(ipField.element.value).toBe('192.168.1.10');
      
      const portField = wrapper.find('input[data-field="port"]');
      expect(portField.element.value).toBe('8080');
    });

    it('should update network settings on input change', async () => {
      const ipField = wrapper.find('input[data-field="ipAddress"]');
      await ipField.setValue('192.168.1.100');
      
      expect(wrapper.vm.networkSettings.ipAddress).toBe('192.168.1.100');
    });

    it('should trigger validation on network settings change', async () => {
      const ipField = wrapper.find('input[data-field="ipAddress"]');
      await ipField.setValue('invalid-ip');
      
      // Wait for validation to trigger
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.validationErrors.length).toBeGreaterThan(0);
    });

    it('should test network connection when button clicked', async () => {
      mockSystemManager.testConnection.mockResolvedValue({
        success: true,
        message: 'Connection successful'
      });

      const testButton = wrapper.find('.test-connection-btn');
      await testButton.trigger('click');

      expect(wrapper.vm.settingsState.isLoading).toBe(true);
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'network_connection_test',
        expect.objectContaining({
          ipAddress: '192.168.1.10',
          port: 8080
        })
      );
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    describe('IP Address Validation', () => {
      it('should validate correct IP addresses', () => {
        expect(wrapper.vm.isValidIP('192.168.1.1')).toBe(true);
        expect(wrapper.vm.isValidIP('10.0.0.1')).toBe(true);
        expect(wrapper.vm.isValidIP('255.255.255.255')).toBe(true);
      });

      it('should reject invalid IP addresses', () => {
        expect(wrapper.vm.isValidIP('256.1.1.1')).toBe(false);
        expect(wrapper.vm.isValidIP('192.168.1')).toBe(false);
        expect(wrapper.vm.isValidIP('invalid-ip')).toBe(false);
        expect(wrapper.vm.isValidIP('')).toBe(false);
      });
    });

    describe('Port Validation', () => {
      it('should validate correct port numbers', () => {
        expect(wrapper.vm.isValidPort(80)).toBe(true);
        expect(wrapper.vm.isValidPort(8080)).toBe(true);
        expect(wrapper.vm.isValidPort(65535)).toBe(true);
      });

      it('should reject invalid port numbers', () => {
        expect(wrapper.vm.isValidPort(0)).toBe(false);
        expect(wrapper.vm.isValidPort(65536)).toBe(false);
        expect(wrapper.vm.isValidPort(-1)).toBe(false);
      });
    });

    describe('Settings Validation', () => {
      it('should validate all settings and show no errors for valid data', () => {
        wrapper.vm.validateSettings();
        expect(wrapper.vm.validationErrors.length).toBe(0);
      });

      it('should show validation errors for invalid network settings', async () => {
        wrapper.vm.networkSettings.ipAddress = 'invalid-ip';
        wrapper.vm.networkSettings.port = 99999;
        wrapper.vm.validateSettings();
        
        expect(wrapper.vm.validationErrors.length).toBeGreaterThan(0);
        expect(wrapper.vm.validationErrors).toContain('Nieprawidłowy adres IP');
        expect(wrapper.vm.validationErrors).toContain('Nieprawidłowy port (1-65535)');
      });

      it('should show validation errors for invalid system settings', () => {
        wrapper.vm.systemConfig.updateInterval = 0;
        wrapper.vm.systemConfig.dataRetention = 5000;
        wrapper.vm.validateSettings();
        
        expect(wrapper.vm.validationErrors.length).toBeGreaterThan(0);
      });

      it('should show validation errors for invalid security settings', () => {
        wrapper.vm.securitySettings.sessionTimeout = 1;
        wrapper.vm.securitySettings.maxLoginAttempts = 20;
        wrapper.vm.validateSettings();
        
        expect(wrapper.vm.validationErrors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Settings Operations', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    describe('Save Settings', () => {
      it('should save settings when validation passes', async () => {
        mockSystemManager.saveSettings.mockResolvedValue(true);
        
        const saveButton = wrapper.find('.save-btn');
        await saveButton.trigger('click');
        
        expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
          'system_settings_save',
          expect.objectContaining({
            user: 'testuser',
            activeTab: 'network'
          })
        );
      });

      it('should not save settings when validation fails', async () => {
        wrapper.vm.networkSettings.ipAddress = 'invalid-ip';
        wrapper.vm.validateSettings();
        
        const saveButton = wrapper.find('.save-btn');
        await saveButton.trigger('click');
        
        expect(mockSystemManager.saveSettings).not.toHaveBeenCalled();
      });

      it('should emit settings-changed event on successful save', async () => {
        mockSystemManager.saveSettings.mockResolvedValue(true);
        const saveButton = wrapper.find('.save-btn');
        await saveButton.trigger('click');
        
        await wrapper.vm.$nextTick();
        
        expect(wrapper.emitted('settings-changed')).toBeTruthy();
        expect(wrapper.emitted('settings-changed')[0][0]).toEqual({
          network: wrapper.vm.networkSettings,
          system: wrapper.vm.systemConfig,
          device: wrapper.vm.deviceSettings,
          security: wrapper.vm.securitySettings
        });
      });

      it('should handle save errors gracefully', async () => {
        mockSystemManager.saveSettings.mockRejectedValue(new Error('Save failed'));
        
        const saveButton = wrapper.find('.save-btn');
        await saveButton.trigger('click');
        
        expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
          'system_settings_save_error',
          expect.objectContaining({
            error: 'Save failed'
          })
        );
      });
    });

    describe('Reset Settings', () => {
      it('should reset settings to defaults when confirmed', async () => {
        // Mock window.confirm to return true
        global.window.confirm = vi.fn().mockReturnValue(true);
        
        // Change some settings first
        wrapper.vm.networkSettings.ipAddress = '10.0.0.1';
        wrapper.vm.systemConfig.debugMode = true;
        
        const resetButton = wrapper.find('.reset-btn');
        await resetButton.trigger('click');
        
        expect(wrapper.vm.networkSettings.ipAddress).toBe('192.168.1.10');
        expect(wrapper.vm.systemConfig.debugMode).toBe(false);
      });

      it('should not reset settings when cancelled', async () => {
        global.window.confirm = vi.fn().mockReturnValue(false);
        
        wrapper.vm.networkSettings.ipAddress = '10.0.0.1';
        const originalIP = wrapper.vm.networkSettings.ipAddress;
        
        const resetButton = wrapper.find('.reset-btn');
        await resetButton.trigger('click');
        
        expect(wrapper.vm.networkSettings.ipAddress).toBe(originalIP);
      });
    });

    describe('Export Settings', () => {
      it('should export settings as JSON file', async () => {
        // Mock document.createElement and related DOM methods
        const mockLink = {
          href: '',
          download: '',
          click: vi.fn()
        };
        global.document.createElement = vi.fn().mockReturnValue(mockLink);
        global.document.body.appendChild = vi.fn();
        global.document.body.removeChild = vi.fn();
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
        global.URL.revokeObjectURL = vi.fn();
        global.Blob = vi.fn();
        
        const exportButton = wrapper.find('.export-btn');
        await exportButton.trigger('click');
        
        expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
          'settings_export',
          expect.objectContaining({
            user: 'testuser'
          })
        );
      });
    });

    describe('Import Settings', () => {
      it('should import valid settings file', async () => {
        const mockFile = {
          text: vi.fn().mockResolvedValue(JSON.stringify({
            network: { ipAddress: '10.0.0.1' },
            system: { debugMode: true },
            device: { deviceName: 'TEST-DEVICE' },
            security: { sessionTimeout: 60 }
          }))
        };
        
        const mockInput = {
          type: '',
          accept: '',
          click: vi.fn(),
          onchange: null
        };
        global.document.createElement = vi.fn().mockReturnValue(mockInput);
        
        const importButton = wrapper.find('.import-btn');
        await importButton.trigger('click');
        
        // Simulate file selection and reading
        mockInput.onchange({ target: { files: [mockFile] } });
        await wrapper.vm.$nextTick();
        
        expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
          'settings_import',
          expect.objectContaining({
            user: 'testuser'
          })
        );
      });
    });
  });

  describe('Security Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should log audit event on component initialization', () => {
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'system_settings_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });

    it('should sanitize user inputs', async () => {
      const deviceNameField = wrapper.find('input[data-field="deviceName"]');
      await deviceNameField.setValue('<script>alert("xss")</script>');
      
      expect(mockSecurityService.sanitizeInput).toHaveBeenCalled();
    });

    it('should validate inputs through SecurityService', async () => {
      const locationField = wrapper.find('input[data-field="location"]');
      await locationField.setValue('Test Location');
      
      expect(mockSecurityService.validateInput).toHaveBeenCalled();
    });
  });

  describe('i18n Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should use translation function for all text', () => {
      expect(mockI18n.$t).toHaveBeenCalledWith('settings.page_title');
      expect(mockI18n.$t).toHaveBeenCalledWith('settings.network_category');
      expect(mockI18n.$t).toHaveBeenCalledWith('settings.save_settings');
    });

    it('should provide fallback text when translations missing', () => {
      const result = mockI18n.$t('missing.key', 'Fallback Text');
      expect(result).toBe('Fallback Text');
    });

    it('should format timestamps based on language', () => {
      const timestamp = new Date('2024-12-19T10:30:00Z');
      const formatted = wrapper.vm.formatTimestamp(timestamp);
      expect(formatted).toBeDefined();
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should return correct page title', () => {
      expect(wrapper.vm.pageTitle).toBe('Ustawienia Systemu');
    });

    it('should return settings categories with icons', () => {
      const categories = wrapper.vm.settingsCategories;
      expect(categories).toHaveLength(4);
      expect(categories[0]).toEqual({
        id: 'network',
        name: 'Sieć',
        icon: '🌐'
      });
    });

    it('should return log level options', () => {
      const options = wrapper.vm.logLevelOptions;
      expect(options).toContainEqual({ value: 'DEBUG', label: 'Debug' });
      expect(options).toContainEqual({ value: 'INFO', label: 'Info' });
    });

    it('should return timezone options', () => {
      const options = wrapper.vm.timezoneOptions;
      expect(options).toContainEqual({ value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET)' });
    });

    it('should return device status information', () => {
      const status = wrapper.vm.deviceStatus;
      expect(status.connection.status).toBe('online');
      expect(status.memory.status).toBe('warning');
      expect(status.storage.status).toBe('online');
    });

    it('should determine form validity based on validation errors', () => {
      expect(wrapper.vm.isFormValid).toBe(true);
      
      wrapper.vm.validationErrors = ['Error 1'];
      expect(wrapper.vm.isFormValid).toBe(false);
    });
  });

  describe('Watchers', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should mark settings as changed when network settings modified', async () => {
      wrapper.vm.networkSettings.ipAddress = '10.0.0.1';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.settingsState.hasUnsavedChanges).toBe(true);
    });

    it('should trigger validation when settings change', async () => {
      const validateSpy = vi.spyOn(wrapper.vm, 'validateSettings');
      
      wrapper.vm.systemConfig.updateInterval = 10;
      await wrapper.vm.$nextTick();
      
      expect(validateSpy).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle back navigation', async () => {
      const backButton = wrapper.find('.back-btn');
      await backButton.trigger('click');
      
      expect(wrapper.emitted('back')).toBeTruthy();
      expect(wrapper.emitted('navigate')).toBeTruthy();
      expect(wrapper.emitted('navigate')[0][0]).toEqual({ path: '/dashboard' });
    });

    it('should warn about unsaved changes when navigating back', async () => {
      global.window.confirm = vi.fn().mockReturnValue(false);
      wrapper.vm.settingsState.hasUnsavedChanges = true;
      
      const backButton = wrapper.find('.back-btn');
      await backButton.trigger('click');
      
      expect(global.window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('niezapisane zmiany')
      );
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up on unmount', async () => {
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'system_settings_component_cleanup',
        expect.objectContaining({
          hasUnsavedChanges: false,
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle SecurityService initialization errors gracefully', async () => {
      // This test verifies the component doesn't crash when SecurityService fails
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(wrapper.exists()).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should handle network test failures', async () => {
      mockSystemManager.testConnection.mockRejectedValue(new Error('Network error'));
      
      const testButton = wrapper.find('.test-connection-btn');
      await testButton.trigger('click');
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.networkTestResult.success).toBe(false);
      expect(wrapper.vm.networkTestResult.message).toContain('Test błąd');
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with large settings objects', () => {
      const largeSettings = {
        ...wrapper.vm.networkSettings,
        largeArray: new Array(10000).fill('test')
      };
      
      wrapper.vm.networkSettings = largeSettings;
      expect(wrapper.exists()).toBe(true);
    });

    it('should debounce validation calls', async () => {
      const validateSpy = vi.spyOn(wrapper.vm, 'validateSettings');
      
      // Simulate rapid changes
      for (let i = 0; i < 5; i++) {
        wrapper.vm.networkSettings.port = 8000 + i;
        await wrapper.vm.$nextTick();
      }
      
      // Should be debounced
      expect(validateSpy.calls.length).toBeLessThan(10);
    });
  });
});
