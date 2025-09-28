import appHeaderComponent from './appHeader.js';
import { ConfigLoader } from '../../../shared/configLoader.js';
export default {
  metadata: {
    name: 'appHeader',
    version: '0.1.0',
    displayName: 'App Header',
    description: 'Header component with device status, language selector, and 7.9" display optimization',
    initialized: false
  },
  
  component: appHeaderComponent,
  config: null,
  async loadConfig() {
    const possiblePaths = [
      'js/features/appHeader/0.1.0/config/config.json',  // Correct component path
      './js/features/appHeader/0.1.0/config/config.json', // Alternative
      '/js/features/appHeader/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'appHeader');
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
      // Load configuration
      await this.loadConfig();
      this.metadata.initialized = true;
      return true;
    } catch (error) {
      console.error('AppHeader init error:', error);
      return false;
    }
  },
  
  handle(request = {}) {
    const { action = 'render', deviceStatus = 'OFFLINE', deviceInfo = {}, currentLanguage = 'pl' } = request;
    
    return { 
      success: true, 
      data: { 
        action, 
        deviceStatus,
        deviceInfo: {
          name: deviceInfo.name || 'CONNECT',
          type: deviceInfo.type || '500', 
          url: deviceInfo.url || 'c201001.mask.services'
        },
        currentLanguage,
        timestamp: new Date().toISOString() 
      }
    };
  },
  
  // Method for rendering header in different contexts
  render(container, context = {}) {
    if (!container) return;
    
    const { deviceStatus = 'OFFLINE', deviceInfo = {}, currentLanguage = 'pl' } = context;
    
    // Create Vue app instance for this component
    const { createApp } = Vue;
    const headerApp = createApp({
      components: {
        AppHeader: this.component
      },
      data() {
        return {
          deviceStatus,
          deviceInfo: {
            name: deviceInfo.name || 'CONNECT',
            type: deviceInfo.type || '500',
            url: deviceInfo.url || 'c201001.mask.services'
          },
          currentLanguage
        };
      },
      template: '<AppHeader :device-status="deviceStatus" :device-info="deviceInfo" :current-language="currentLanguage" @language-changed="handleLanguageChange" />',
      methods: {
        handleLanguageChange(newLanguage) {
          this.currentLanguage = newLanguage;
          // Emit to parent context if available
          if (context.onLanguageChange) {
            context.onLanguageChange(newLanguage);
          }
        }
      }
    });
    
    headerApp.mount(container);
  }
};
