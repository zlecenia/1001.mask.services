/**
 * Device Data Component - Unified Configuration v2.0
 * SDK-Independent configuration for deviceData component
 */

export default {
  // Component metadata
  component: {
    name: 'deviceData',
    version: '0.1.0',
    contractVersion: '2.0',
    type: 'component',
    description: 'Industrial device monitoring and sensor data management',
    category: 'monitoring',
    tags: ['industrial', 'device', 'sensors', 'monitoring', 'real-time']
  },

  // UI Configuration
  ui: {
    title: {
      pl: 'Dane Urządzenia',
      en: 'Device Data',
      de: 'Gerätedaten'
    },
    icon: '🏭',
    theme: 'industrial',
    layout: 'landscape-7-9',
    displayMode: 'dashboard',
    refreshInterval: 5000,
    enableAutoRefresh: true,
    enableExport: true,
    exportFormats: ['csv', 'json'],
    
    // 7.9" display optimizations
    touchTargetSize: '40px',
    fontSize: {
      base: '14px',
      heading: '18px',
      small: '12px'
    },
    
    // Color scheme for device status
    statusColors: {
      online: '#27ae60',
      offline: '#e74c3c',
      warning: '#f39c12',
      error: '#c0392b'
    }
  },

  // Data Configuration
  data: {
    defaultDevice: {
      deviceId: 'DEVICE_001',
      status: 'ONLINE',
      uptime: 0,
      batteryLevel: 85,
      firmwareVersion: '2.1.4',
      updateFrequency: 5
    },
    
    sensors: {
      temperature: {
        unit: '°C',
        min: -40,
        max: 85,
        precision: 1,
        thresholds: { min: 15, max: 30 }
      },
      humidity: {
        unit: '%',
        min: 0,
        max: 100,
        precision: 0,
        thresholds: { min: 30, max: 70 }
      },
      pressure: {
        unit: 'hPa',
        min: 900,
        max: 1100,
        precision: 2,
        thresholds: { min: 980, max: 1050 }
      },
      airQuality: {
        unit: '%',
        min: 0,
        max: 100,
        precision: 0,
        thresholds: { min: 50, max: 90 }
      },
      noise: {
        unit: 'dB',
        min: 0,
        max: 120,
        precision: 1,
        thresholds: { min: 30, max: 60 }
      },
      vibration: {
        unit: 'g',
        min: 0,
        max: 1,
        precision: 3,
        thresholds: { min: 0, max: 0.1 }
      }
    }
  },

  // Responsive Design
  responsive: {
    breakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px',
      industrial: '1280px'
    },
    
    // Layout adjustments for 7.9" displays
    layout_7_9: {
      width: '1280px',
      height: '400px',
      grid: {
        columns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      },
      sensorGrid: {
        columns: '3',
        maxColumns: '6'
      }
    }
  },

  // Accessibility
  accessibility: {
    ariaLabels: {
      pl: {
        deviceStatus: 'Status urządzenia',
        sensorData: 'Dane sensorów',
        exportButton: 'Eksportuj dane',
        refreshButton: 'Odśwież dane'
      },
      en: {
        deviceStatus: 'Device status',
        sensorData: 'Sensor data',
        exportButton: 'Export data',
        refreshButton: 'Refresh data'
      }
    },
    
    keyboardNavigation: true,
    screenReader: true,
    highContrast: true,
    focusVisible: true
  },

  // Performance
  performance: {
    lazyLoading: false,
    virtualScrolling: false,
    debounceMs: 300,
    throttleMs: 100,
    cacheTimeout: 60000,
    maxHistorySize: 1000,
    enablePreloading: true
  },

  // Security
  security: {
    enableAuditLogging: true,
    sanitizeInputs: true,
    validateApiResponses: true,
    requireAuthentication: true,
    allowedRoles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    
    // Data export permissions
    exportPermissions: {
      csv: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
      json: ['ADMIN', 'SUPERUSER'],
      raw: ['SUPERUSER']
    }
  },

  // API Configuration
  api: {
    endpoints: {
      deviceStatus: '/api/device/{deviceId}/status',
      sensorData: '/api/device/{deviceId}/sensors',
      deviceList: '/api/devices',
      exportData: '/api/device/{deviceId}/export'
    },
    
    polling: {
      enabled: true,
      interval: 5000,
      maxRetries: 3,
      backoffMs: 1000
    },
    
    timeout: 10000,
    retryAttempts: 3
  },

  // Development
  development: {
    enableMockData: true,
    enableDebugLogs: false,
    enablePerformanceMetrics: false,
    mockUpdateInterval: 2000,
    
    // Test data generators
    mockDataRanges: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 40, max: 60 },
      pressure: { min: 1000, max: 1020 }
    }
  }
};
