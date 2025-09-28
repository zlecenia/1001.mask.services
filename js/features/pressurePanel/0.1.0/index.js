import pressurePanelComponent from './pressurePanel.js';
import { ConfigLoader } from '../../../shared/configLoader.js';
export default {
  metadata: {
    name: 'pressurePanel',
    version: '0.1.0',
    displayName: 'Pressure Panel',
    description: 'Real-time pressure sensor monitoring panel with critical alerts for 7.9" display',
    initialized: false
  },
  
  component: pressurePanelComponent,
  config: null,
  async loadConfig() {
    // Try multiple possible paths for config
    const possiblePaths = [
      '/config/config.json',               // From component server root
      './config/config.json',              // Relative to component  
      '/component/config/config.json',     // From component server
      'config/config.json'                 // Direct path
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'pressurePanel');
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
      return { success: true, message: 'PressurePanel initialized successfully' };
    } catch (error) {
      console.error('PressurePanel init error:', error);
      return { success: false, error: error.message };
    }
  },
  
  handle(request = {}) {
    const { action = 'render', pressureData = {}, alertThresholds = {} } = request;
    
    return { 
      success: true, 
      data: { 
        action, 
        pressureData: {
          low: pressureData.low || { value: 0, unit: 'mbar', status: 'normal' },
          medium: pressureData.medium || { value: 0, unit: 'bar', status: 'normal' },
          high: pressureData.high || { value: 0, unit: 'bar', status: 'normal' }
        },
        alertThresholds: {
          critical: alertThresholds.critical || 25.0,
          warning: alertThresholds.warning || 15.0
        },
        timestamp: new Date().toISOString() 
      }
    };
  },
  
  // Method for rendering pressure panel in different contexts
  render(container, context = {}) {
    if (!container) return;
    
    const { pressureData = {}, alertThresholds = {}, onAlert = null } = context;
    
    // Create Vue app instance for this component
    const { createApp } = Vue;
    const panelApp = createApp({
      components: {
        PressurePanel: this.component
      },
      data() {
        return {
          pressureData: {
            low: pressureData.low || { value: 10.5, unit: 'mbar', status: 'normal' },
            medium: pressureData.medium || { value: 2.1, unit: 'bar', status: 'normal' },
            high: pressureData.high || { value: 15.8, unit: 'bar', status: 'normal' }
          },
          alertThresholds: {
            critical: alertThresholds.critical || 25.0,
            warning: alertThresholds.warning || 15.0
          }
        };
      },
      template: '<PressurePanel :pressure-data="pressureData" :alert-thresholds="alertThresholds" @pressure-alert="handleAlert" />',
      methods: {
        handleAlert(alertData) {
          if (onAlert) {
            onAlert(alertData);
          }
        }
      }
    });
    
    panelApp.mount(container);
  }
};
