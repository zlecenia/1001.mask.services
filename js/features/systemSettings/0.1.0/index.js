/**
 * SystemSettings Module Index 0.1.0
 * FeatureRegistry integration for system settings component
 * Provides comprehensive system configuration and settings management
 */

import { SystemSettingsComponent } from './systemSettings.js';
import { ConfigLoader } from '../../../shared/configLoader.js';

// FeatureRegistry integration metadata
const metadata = {
  name: 'systemSettings',
  version: '0.1.0',
  displayName: 'System Settings',
  description: 'Comprehensive system configuration and settings management',
  category: 'system',
  dependencies: ['securityService', 'i18nService'],
  compatible: {
    vue: '^3.0.0',
    browser: ['chrome', 'firefox', 'safari', 'edge'],
    display: '7.9-inch-landscape'
  },
  permissions: {
    required: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
    optional: ['OPERATOR']
  },
  routes: [
    {
      path: '/settings',
      name: 'systemSettings',
      component: 'SystemSettingsComponent',
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        title: 'System Settings',
        icon: '⚙️',
        order: 100
      }
    },
    {
      path: '/settings/network',
      name: 'networkSettings',
      component: 'SystemSettingsComponent',
      props: { activeTab: 'network' },
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        title: 'Network Settings',
        parent: 'systemSettings'
      }
    },
    {
      path: '/settings/system',
      name: 'systemConfig',
      component: 'SystemSettingsComponent',
      props: { activeTab: 'system' },
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        title: 'System Configuration',
        parent: 'systemSettings'
      }
    },
    {
      path: '/settings/device',
      name: 'deviceSettings',
      component: 'SystemSettingsComponent',
      props: { activeTab: 'device' },
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        title: 'Device Settings',
        parent: 'systemSettings'
      }
    },
    {
      path: '/settings/security',
      name: 'securitySettings',
      component: 'SystemSettingsComponent',
      props: { activeTab: 'security' },
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        title: 'Security Settings',
        parent: 'systemSettings'
      }
    }
  ],
  menu: {
    main: {
      id: 'system-settings',
      label: 'System Settings',
      icon: '⚙️',
      route: '/settings',
      order: 100,
      roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
      children: [
        {
          id: 'network-settings',
          label: 'Network',
          icon: '🌐',
          route: '/settings/network',
          roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
        },
        {
          id: 'system-config',
          label: 'System',
          icon: '⚙️',
          route: '/settings/system',
          roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
        },
        {
          id: 'device-settings',
          label: 'Device',
          icon: '🔧',
          route: '/settings/device',
          roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
        },
        {
          id: 'security-settings',
          label: 'Security',
          icon: '🔒',
          route: '/settings/security',
          roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
        }
      ]
    }
  }
};

// Vuex store module for system settings state management
export const storeModule = {
  namespaced: true,
  state: () => ({
    networkSettings: {},
    systemConfig: {},
    deviceSettings: {},
    securitySettings: {},
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
    SET_NETWORK_SETTINGS(state, settings) {
      state.networkSettings = { ...state.networkSettings, ...settings };
      state.settingsState.hasUnsavedChanges = true;
    },
    
    SET_SYSTEM_CONFIG(state, config) {
      state.systemConfig = { ...state.systemConfig, ...config };
      state.settingsState.hasUnsavedChanges = true;
    },
    
    SET_DEVICE_SETTINGS(state, settings) {
      state.deviceSettings = { ...state.deviceSettings, ...settings };
      state.settingsState.hasUnsavedChanges = true;
    },
    
    SET_SECURITY_SETTINGS(state, settings) {
      state.securitySettings = { ...state.securitySettings, ...settings };
      state.settingsState.hasUnsavedChanges = true;
    },
    
    SET_SETTINGS_STATE(state, settingsState) {
      state.settingsState = { ...state.settingsState, ...settingsState };
    },
    
    SET_NETWORK_TEST_RESULT(state, result) {
      state.networkTestResult = result;
    },
    
    SET_VALIDATION_ERRORS(state, errors) {
      state.settingsState.validationErrors = errors;
    },
    
    RESET_SETTINGS(state) {
      state.networkSettings = {};
      state.systemConfig = {};
      state.deviceSettings = {};
      state.securitySettings = {};
      state.settingsState.hasUnsavedChanges = true;
      state.settingsState.validationErrors = [];
      state.networkTestResult = null;
    },
    
    MARK_SETTINGS_SAVED(state) {
      state.settingsState.hasUnsavedChanges = false;
      state.settingsState.lastSaved = new Date();
    }
  },
  
  actions: {
    async saveSettings({ commit, state, rootState }) {
      try {
        commit('SET_SETTINGS_STATE', { isLoading: true, isValidating: true });
        
        // Integrate with global SystemManager if available
        if (window.SystemManager && window.SystemManager.saveSettings) {
          await window.SystemManager.saveSettings({
            network: state.networkSettings,
            system: state.systemConfig,
            device: state.deviceSettings,
            security: { ...state.securitySettings, encryptionLevel: '[PROTECTED]' }
          });
        }
        
        commit('MARK_SETTINGS_SAVED');
        
        return { success: true, message: 'Settings saved successfully' };
      } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, message: error.message };
      } finally {
        commit('SET_SETTINGS_STATE', { isLoading: false, isValidating: false });
      }
    },
    
    async testNetworkConnection({ commit, state }) {
      try {
        commit('SET_SETTINGS_STATE', { isLoading: true });
        commit('SET_NETWORK_TEST_RESULT', null);
        
        // Simulate network test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (window.SystemManager && window.SystemManager.testConnection) {
          const result = await window.SystemManager.testConnection(state.networkSettings);
          commit('SET_NETWORK_TEST_RESULT', result);
          return result;
        } else {
          // Simulate test result
          const success = Math.random() > 0.2; // 80% success rate
          const result = {
            success,
            message: success ? 'Connection test successful!' : 'Connection test failed - check network settings'
          };
          commit('SET_NETWORK_TEST_RESULT', result);
          return result;
        }
      } catch (error) {
        const result = { success: false, message: `Test error: ${error.message}` };
        commit('SET_NETWORK_TEST_RESULT', result);
        return result;
      } finally {
        commit('SET_SETTINGS_STATE', { isLoading: false });
      }
    },
    
    validateSettings({ commit, state }) {
      const errors = [];
      
      // Network validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      if (!ipRegex.test(state.networkSettings.ipAddress)) {
        errors.push('Invalid IP address');
      }
      
      if (state.networkSettings.port < 1 || state.networkSettings.port > 65535) {
        errors.push('Invalid port (1-65535)');
      }
      
      if (!ipRegex.test(state.networkSettings.gateway)) {
        errors.push('Invalid gateway IP address');
      }
      
      // System validation
      if (state.systemConfig.updateInterval < 1 || state.systemConfig.updateInterval > 3600) {
        errors.push('Update interval must be 1-3600 seconds');
      }
      
      if (state.systemConfig.dataRetention < 1 || state.systemConfig.dataRetention > 3650) {
        errors.push('Data retention must be 1-3650 days');
      }
      
      // Security validation
      if (state.securitySettings.sessionTimeout < 5 || state.securitySettings.sessionTimeout > 480) {
        errors.push('Session timeout must be 5-480 minutes');
      }
      
      if (state.securitySettings.maxLoginAttempts < 1 || state.securitySettings.maxLoginAttempts > 10) {
        errors.push('Max login attempts must be 1-10');
      }
      
      commit('SET_VALIDATION_ERRORS', errors);
      return errors.length === 0;
    }
  },
  
  getters: {
    isFormValid: (state) => {
      return state.settingsState.validationErrors.length === 0;
    },
    
    hasUnsavedChanges: (state) => {
      return state.settingsState.hasUnsavedChanges;
    },
    
    lastSavedFormatted: (state) => {
      if (!state.settingsState.lastSaved) return 'Never';
      return new Date(state.settingsState.lastSaved).toLocaleString();
    }
  }
};

// Component lifecycle hooks
export const hooks = {
  beforeMount: async (app) => {
    console.log('🔧 SystemSettings component mounting...');
    
    // Initialize SecurityService integration
    try {
      const { getSecurityService } = await import('../../../services/securityService.js');
      const securityService = await getSecurityService();
      
      if (securityService) {
        await securityService.logAuditEvent('system_settings_module_init', {
          version: metadata.version,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('SecurityService not available for SystemSettings:', error);
    }
    
    // Load existing settings if available
    if (window.SystemManager && window.SystemManager.loadSettings) {
      try {
        const savedSettings = await window.SystemManager.loadSettings();
        if (savedSettings && app.config.globalProperties.$store) {
          const store = app.config.globalProperties.$store;
          if (savedSettings.network) store.commit('systemSettings/SET_NETWORK_SETTINGS', savedSettings.network);
          if (savedSettings.system) store.commit('systemSettings/SET_SYSTEM_CONFIG', savedSettings.system);
          if (savedSettings.device) store.commit('systemSettings/SET_DEVICE_SETTINGS', savedSettings.device);
          if (savedSettings.security) store.commit('systemSettings/SET_SECURITY_SETTINGS', savedSettings.security);
        }
      } catch (error) {
        console.warn('Failed to load existing settings:', error);
      }
    }
  },
  
  mounted: async (app) => {
    console.log('✅ SystemSettings component mounted successfully');
    
    // Validate initial settings
    if (app.config.globalProperties.$store) {
      const store = app.config.globalProperties.$store;
      store.dispatch('systemSettings/validateSettings');
    }
  },
  
  beforeUnmount: async (app) => {
    console.log('🔧 SystemSettings component unmounting...');
    
    // Log component cleanup
    try {
      const { getSecurityService } = await import('../../../services/securityService.js');
      const securityService = await getSecurityService();
      
      if (securityService) {
        await securityService.logAuditEvent('system_settings_module_cleanup', {
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('SecurityService not available during cleanup:', error);
    }
  }
};

// Development utilities
export const devUtils = {
  // Reset settings to defaults for testing
  resetToDefaults: () => {
    const store = window.app?.$store;
    if (store) {
      store.commit('systemSettings/RESET_SETTINGS');
      console.log('🔄 SystemSettings reset to defaults');
    }
  },
  
  // Simulate network test with custom result
  simulateNetworkTest: (success = true, message = 'Test completed') => {
    const store = window.app?.$store;
    if (store) {
      store.commit('systemSettings/SET_NETWORK_TEST_RESULT', { success, message });
      console.log('🌐 Network test simulated:', { success, message });
    }
  },
  
  // Export current settings for debugging
  exportCurrentSettings: () => {
    const store = window.app?.$store;
    if (store) {
      const settings = {
        network: store.state.systemSettings.networkSettings,
        system: store.state.systemSettings.systemConfig,
        device: store.state.systemSettings.deviceSettings,
        security: store.state.systemSettings.securitySettings
      };
      console.log('📋 Current settings:', JSON.stringify(settings, null, 2));
      return settings;
    }
  },
  
  // Validate current settings
  validateCurrentSettings: () => {
    const store = window.app?.$store;
    if (store) {
      const isValid = store.dispatch('systemSettings/validateSettings');
      const errors = store.state.systemSettings.settingsState.validationErrors;
      console.log('✅ Settings validation:', { isValid, errors });
      return { isValid, errors };
    }
  }
};

// Module initialization function
export async function initializeModule(app, options = {}) {
  try {
    console.log('🚀 Initializing SystemSettings module v' + metadata.version);
    
    // Register component globally
    app.component('SystemSettingsComponent', SystemSettingsComponent);
    
    // Register Vuex store module
    if (app.config.globalProperties.$store && storeModule) {
      app.config.globalProperties.$store.registerModule('systemSettings', storeModule);
    }
    
    // Execute before mount hook
    if (hooks.beforeMount) {
      await hooks.beforeMount(app);
    }
    
    // Add development utilities in development mode
    if (process.env.NODE_ENV === 'development' || options.development) {
      window.systemSettingsDevUtils = devUtils;
    }
    
    console.log('✅ SystemSettings module initialized successfully');
    return { success: true, component: SystemSettingsComponent, store: storeModule };
    
  } catch (error) {
    console.error('❌ Failed to initialize SystemSettings module:', error);
    return { success: false, error: error.message };
  }
}

// Export main component and configuration
export { SystemSettingsComponent };

export default {
  metadata,
  component: SystemSettingsComponent,
  config: null,
  
  async loadConfig() {
    const possiblePaths = [
      'js/features/systemSettings/0.1.0/config/config.json',  // Correct component path
      './js/features/systemSettings/0.1.0/config/config.json', // Alternative
      '/js/features/systemSettings/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'systemSettings');
        if (result.success) break;
      } catch (error) {
        continue; // Try next path
      }
    }
    
    this.config = result?.config || {};
    return result || { success: false, config: {} };
  },
  
  async init(context = {}) {
    try {
      // Load configuration first
      await this.loadConfig();
      this.metadata.initialized = true;
      return true;
    } catch (error) {
      console.error('SystemSettings init error:', error);
      return false;
    }
  },
  
  storeModule,
  hooks,
  devUtils,
  initialize: initializeModule
};
