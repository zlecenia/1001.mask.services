/**
 * RealtimeSensors Module Index 0.1.0
 * Module registration and export for FeatureRegistry integration
 * 1001.mask.services - Industrial Vue.js Application
 */

import RealtimeSensorsComponent from './realtimeSensors.js';
import { ConfigLoader } from '../../../shared/configLoader.js';

// Module metadata for FeatureRegistry
const moduleInfo = {
  name: 'realtimeSensors',
  version: '0.1.0',
  displayName: 'Realtime Sensors Monitor',
  description: 'Advanced real-time industrial sensor monitoring dashboard',
  component: RealtimeSensorsComponent,
  config: null,
  
  async loadConfig() {
    const possiblePaths = [
      'js/features/realtimeSensors/0.1.0/config/config.json',  // Correct component path
      './js/features/realtimeSensors/0.1.0/config/config.json', // Alternative
      '/js/features/realtimeSensors/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'realtimeSensors');
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
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('RealtimeSensors init error:', error);
      return false;
    }
  },
  
  // Feature flags
  features: {
    realtimeMonitoring: true,
    dataRecording: true,
    alertSystem: true,
    dataExport: true,
    multiLanguage: true,
    securityIntegration: true,
    touchOptimized: true,
    industrialDisplay: true
  },
  
  // Dependencies
  dependencies: {
    vue: '^3.0.0',
    services: ['securityService', 'i18nService'],
    stores: ['sensors', 'system', 'auth']
  },
  
  // Route information for navigation
  routes: [
    {
      path: '/sensors',
      name: 'sensors',
      component: 'realtimeSensors',
      meta: {
        requiresAuth: true,
        roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
        permissions: ['sensor_read', 'system_monitoring'],
        title: 'sensors.realtime_title',
        category: 'monitoring'
      }
    },
    {
      path: '/monitoring/sensors',
      name: 'monitoring-sensors',
      component: 'realtimeSensors',
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        permissions: ['sensor_read', 'data_export', 'system_monitoring'],
        title: 'sensors.monitoring_title',
        category: 'monitoring'
      }
    }
  ],
  
  // Menu integration
  menu: {
    category: 'monitoring',
    icon: '🌊',
    label: 'sensors.menu_label',
    order: 20,
    roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    subitems: [
      {
        label: 'sensors.realtime_monitoring',
        route: '/sensors',
        icon: '📊',
        roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT']
      },
      {
        label: 'sensors.sensor_export',
        route: '/monitoring/sensors',
        icon: '📤',
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
      }
    ]
  },
  
  // Security configuration
  security: {
    auditEnabled: true,
    inputValidation: true,
    roleBasedAccess: true,
    sessionTracking: true
  },
  
  // Performance settings
  performance: {
    lazy: false, // Load immediately for monitoring
    cache: true,
    preload: true,
    priority: 'high'
  }
};

// Export for FeatureRegistry registration
export default moduleInfo;

// Named exports for direct access
export {
  RealtimeSensorsComponent,
  moduleInfo
};

// Module initialization function
export function initializeRealtimeSensors(app, options = {}) {
  console.log('🔶 Initializing RealtimeSensors module v0.1.0');
  
  // Validate dependencies
  const requiredServices = ['securityService', 'i18nService'];
  const missingServices = requiredServices.filter(service => !options.services?.[service]);
  
  if (missingServices.length > 0) {
    console.warn('⚠️ RealtimeSensors missing services:', missingServices);
  }
  
  // Register component globally if requested
  if (options.global) {
    app.component('RealtimeSensors', RealtimeSensorsComponent);
    console.log('✅ RealtimeSensors component registered globally');
  }
  
  // Setup event handlers if provided
  if (options.eventBus) {
    options.eventBus.on('sensor-alert', (alert) => {
      console.log('🚨 Sensor alert received:', alert);
    });
    
    options.eventBus.on('sensor-data-export', (data) => {
      console.log('📤 Sensor data export initiated:', data.timestamp);
    });
  }
  
  return {
    component: RealtimeSensorsComponent,
    config,
    routes: moduleInfo.routes,
    menu: moduleInfo.menu
  };
}

// Lifecycle hooks for module management
export const lifecycleHooks = {
  async beforeMount(instance) {
    console.log('🔶 RealtimeSensors: Before mount');
    
    // Initialize security service
    if (instance.securityService) {
      await instance.securityService.logSecurityEvent('MODULE_BEFORE_MOUNT', {
        module: 'realtimeSensors',
        version: '0.1.0'
      });
    }
  },
  
  async mounted(instance) {
    console.log('🔶 RealtimeSensors: Mounted');
    
    // Log successful mount
    if (instance.securityService) {
      await instance.securityService.logSecurityEvent('MODULE_MOUNTED', {
        module: 'realtimeSensors',
        version: '0.1.0',
        sensorsCount: instance.sensors?.length || 0
      });
    }
  },
  
  async beforeUnmount(instance) {
    console.log('🔶 RealtimeSensors: Before unmount');
    
    // Clean up intervals and resources
    if (instance.sensorState?.updateInterval) {
      clearInterval(instance.sensorState.updateInterval);
      instance.sensorState.updateInterval = null;
    }
    
    // Log cleanup
    if (instance.securityService) {
      await instance.securityService.logSecurityEvent('MODULE_BEFORE_UNMOUNT', {
        module: 'realtimeSensors',
        version: '0.1.0'
      });
    }
  },
  
  async unmounted(instance) {
    console.log('🔶 RealtimeSensors: Unmounted');
    
    // Final cleanup logging
    if (instance.securityService) {
      await instance.securityService.logSecurityEvent('MODULE_UNMOUNTED', {
        module: 'realtimeSensors',
        version: '0.1.0'
      });
    }
  }
};

// Development utilities
export const devTools = {
  // Generate sample sensor data
  generateSampleData(count = 6) {
    const sensorTypes = [
      { id: 'pressure1', name: 'Pressure 1', unit: 'kPa', min: 10, max: 25, icon: '🌬️' },
      { id: 'flow_rate', name: 'Flow Rate', unit: 'L/min', min: 1.5, max: 5.0, icon: '🌊' },
      { id: 'resistance', name: 'Resistance', unit: 'Pa·s/L', min: 50, max: 200, icon: '⚡' },
      { id: 'leak_rate', name: 'Leak Rate', unit: 'L/min', min: 0, max: 0.1, icon: '🔍' },
      { id: 'co2_level', name: 'CO₂ Level', unit: 'ppm', min: 300, max: 1000, icon: '🌫️' },
      { id: 'particle_count', name: 'Particle Count', unit: '#/cm³', min: 0, max: 10000, icon: '✨' }
    ];
    
    return sensorTypes.slice(0, count).map((type, index) => ({
      ...type,
      value: type.min + Math.random() * (type.max - type.min),
      status: Math.random() > 0.8 ? 'warning' : 'normal',
      color: ['blue', 'cyan', 'yellow', 'green', 'purple', 'orange'][index],
      trend: ['stable', 'rising', 'falling'][Math.floor(Math.random() * 3)],
      lastAlert: null
    }));
  },
  
  // Simulate sensor data updates
  simulateDataUpdate(sensors) {
    return sensors.map(sensor => ({
      ...sensor,
      value: Math.max(
        sensor.min * 0.8,
        Math.min(
          sensor.max * 1.2,
          sensor.value + (Math.random() - 0.5) * sensor.value * 0.1
        )
      ),
      status: Math.random() > 0.9 ? 'critical' : (Math.random() > 0.7 ? 'warning' : 'normal')
    }));
  }
};

// Export module for FeatureRegistry integration
export default moduleInfo;
