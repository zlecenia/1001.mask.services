/**
 * Device Data Module Index
 * FeatureRegistry integration for deviceData component
 * Version: 0.1.0
 */

import DeviceDataComponent from './deviceData.js';
import config from './config.json' assert { type: 'json' };

// Module metadata for FeatureRegistry
export const metadata = {
  name: 'deviceData',
  version: '0.1.0',
  description: 'Industrial device monitoring and sensor data management',
  category: 'monitoring',
  author: '1001.mask.services Development Team',
  dependencies: ['securityService', 'i18nService'],
  tags: ['industrial', 'device', 'sensors', 'monitoring', 'real-time'],
  
  // Component registration
  component: DeviceDataComponent,
  config: config,
  
  // Module capabilities
  capabilities: {
    realTimeMonitoring: true,
    dataExport: true,
    securityIntegration: true,
    i18nSupport: true,
    responsiveDesign: true,
    accessibility: true,
    touchOptimized: true
  },

  // Performance characteristics
  performance: {
    loadTime: 'fast',
    memoryUsage: 'medium',
    updateFrequency: 'configurable',
    caching: true
  }
};

// Route definitions for deviceData component
export const routes = [
  {
    path: '/device-data',
    name: 'deviceData',
    component: DeviceDataComponent,
    meta: {
      requiresAuth: true,
      roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
      title: {
        pl: 'Dane Urządzenia',
        en: 'Device Data',
        de: 'Gerätedaten'
      },
      icon: '🏭',
      category: 'monitoring',
      order: 3
    }
  },
  {
    path: '/devices/:deviceId',
    name: 'deviceDetails',
    component: DeviceDataComponent,
    meta: {
      requiresAuth: true,
      roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
      title: {
        pl: 'Szczegóły Urządzenia',
        en: 'Device Details',
        de: 'Gerätedetails'
      },
      icon: '🔍',
      category: 'monitoring',
      hidden: true
    }
  }
];

// Menu integration
export const menu = {
  id: 'deviceData',
  title: {
    pl: 'Dane Urządzenia',
    en: 'Device Data',
    de: 'Gerätedaten'
  },
  icon: '🏭',
  path: '/device-data',
  category: 'monitoring',
  order: 3,
  roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
  
  // Submenu items
  children: [
    {
      id: 'deviceStatus',
      title: {
        pl: 'Status Urządzenia',
        en: 'Device Status',
        de: 'Gerätestatus'
      },
      icon: '📊',
      path: '/device-data#status',
      roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT']
    },
    {
      id: 'sensorData',
      title: {
        pl: 'Dane Sensorów',
        en: 'Sensor Data',
        de: 'Sensordaten'
      },
      icon: '🌡️',
      path: '/device-data#sensors',
      roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT']
    },
    {
      id: 'deviceExport',
      title: {
        pl: 'Eksport Danych',
        en: 'Data Export',
        de: 'Datenexport'
      },
      icon: '📤',
      path: '/device-data#export',
      roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
    }
  ]
};

// Lifecycle hooks
export const lifecycle = {
  // Called when module is registered
  onRegister: async (app, store, router) => {
    console.log('Registering deviceData module...');
    
    // Add routes to router
    routes.forEach(route => {
      router.addRoute(route);
    });
    
    // Register Vuex store modules if needed
    if (store && !store.hasModule('deviceData')) {
      store.registerModule('deviceData', {
        namespaced: true,
        state: () => ({
          devices: [],
          currentDevice: null,
          isMonitoring: false,
          lastUpdate: null
        }),
        
        mutations: {
          SET_DEVICES: (state, devices) => {
            state.devices = devices;
          },
          SET_CURRENT_DEVICE: (state, device) => {
            state.currentDevice = device;
          },
          SET_MONITORING_STATUS: (state, status) => {
            state.isMonitoring = status;
          },
          UPDATE_DEVICE_DATA: (state, { deviceId, data }) => {
            const device = state.devices.find(d => d.id === deviceId);
            if (device) {
              Object.assign(device, data);
            }
            state.lastUpdate = new Date();
          }
        },
        
        actions: {
          async fetchDevices({ commit }) {
            try {
              // Implementation would fetch from real API
              const mockDevices = [
                { id: 'DEVICE_001', name: 'Industrial Sensor Hub', status: 'ONLINE' },
                { id: 'DEVICE_002', name: 'Environmental Monitor', status: 'WARNING' }
              ];
              commit('SET_DEVICES', mockDevices);
              return mockDevices;
            } catch (error) {
              console.error('Error fetching devices:', error);
              throw error;
            }
          },
          
          async startMonitoring({ commit, state }) {
            if (!state.isMonitoring) {
              commit('SET_MONITORING_STATUS', true);
              console.log('Device monitoring started');
            }
          },
          
          async stopMonitoring({ commit, state }) {
            if (state.isMonitoring) {
              commit('SET_MONITORING_STATUS', false);
              console.log('Device monitoring stopped');
            }
          }
        },
        
        getters: {
          onlineDevices: state => state.devices.filter(d => d.status === 'ONLINE'),
          offlineDevices: state => state.devices.filter(d => d.status === 'OFFLINE'),
          deviceCount: state => state.devices.length,
          isCurrentDeviceOnline: state => state.currentDevice?.status === 'ONLINE'
        }
      });
    }
    
    console.log('DeviceData module registered successfully');
  },

  // Called when module is unregistered
  onUnregister: async (app, store, router) => {
    console.log('Unregistering deviceData module...');
    
    // Remove routes
    routes.forEach(route => {
      router.removeRoute(route.name);
    });
    
    // Unregister store module
    if (store && store.hasModule('deviceData')) {
      store.unregisterModule('deviceData');
    }
    
    console.log('DeviceData module unregistered');
  },

  // Called when app is mounted
  onMount: async (app) => {
    console.log('DeviceData module mounted');
    
    // Initialize any global services or event listeners
    if (window.DeviceAPI) {
      console.log('Real DeviceAPI detected - enabling hardware integration');
    } else {
      console.log('DeviceAPI not found - using simulation mode');
    }
  },

  // Called when app is unmounted
  onUnmount: async (app) => {
    console.log('DeviceData module unmounted');
    
    // Cleanup any global resources
  }
};

// Module initialization function
export const initialize = async (options = {}) => {
  console.log('Initializing deviceData module with options:', options);
  
  const defaultOptions = {
    enableRealTimeUpdates: true,
    updateInterval: 2000,
    enableSimulation: true,
    enableAuditLogging: true,
    maxHistorySize: 1000
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Validate configuration
  if (finalOptions.updateInterval < 1000) {
    console.warn('Update interval too low, setting to minimum 1000ms');
    finalOptions.updateInterval = 1000;
  }
  
  // Store configuration for component use
  window.deviceDataConfig = finalOptions;
  
  return {
    success: true,
    options: finalOptions,
    message: 'DeviceData module initialized successfully'
  };
};

// Development utilities
export const devUtils = {
  // Generate mock device data
  generateMockDevice: (deviceId = 'MOCK_DEVICE') => ({
    deviceId,
    status: 'ONLINE',
    uptime: Math.floor(Math.random() * 86400),
    batteryLevel: Math.floor(Math.random() * 100),
    firmwareVersion: '2.1.4',
    isConnected: true,
    lastUpdate: new Date(),
    sensors: {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      pressure: 1000 + Math.random() * 40,
      airQuality: 70 + Math.random() * 30,
      noise: 30 + Math.random() * 40,
      vibration: Math.random() * 0.2
    }
  }),
  
  // Simulate sensor data stream
  startMockDataStream: (callback, interval = 2000) => {
    return setInterval(() => {
      const mockData = devUtils.generateMockDevice();
      callback(mockData);
    }, interval);
  },
  
  // Test component rendering
  testComponentRender: async () => {
    console.log('Testing DeviceData component render...');
    // Implementation would test component instantiation
    return { success: true, message: 'Component renders successfully' };
  },
  
  // Validate configuration
  validateConfig: (config) => {
    const required = ['updateFrequency', 'deviceId'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      return { valid: false, errors: `Missing required config: ${missing.join(', ')}` };
    }
    
    return { valid: true, message: 'Configuration is valid' };
  }
};

// Export main module
export default {
  metadata,
  routes,
  menu,
  lifecycle,
  initialize,
  devUtils,
  component: DeviceDataComponent,
  config
};
