import appHeaderComponent from './appHeader.js';
import config from './config/config.json';


export default {
  metadata: {
    name: 'appHeader',
    version: '0.1.0',
    displayName: 'App Header',
    description: 'Header component with device status, language selector, and 7.9" display optimization',
    initialized: false
  },
  
  component: appHeaderComponent,
  
  async init(context = {}) {
    this.metadata.initialized = true;
    return true;
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
