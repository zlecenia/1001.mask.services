// PageTemplate Component Configuration - v2.0 Contract Compliant
// Unified configuration for base page template optimized for 7.9" industrial displays

export default {
  // Component Metadata
  metadata: {
    name: 'pageTemplate',
    version: '0.1.1',
    description: 'Base page template optimized for 7.9" landscape industrial displays',
    category: 'layout',
    tags: ['template', 'layout', '7.9-inch', 'landscape', 'industrial']
  },

  // UI Configuration
  ui: {
    theme: {
      primaryColor: '#2c3e50',
      secondaryColor: '#34495e',
      accentColor: '#3498db',
      backgroundColor: '#f8f9fa',
      textColor: '#2c3e50',
      borderColor: '#dee2e6'
    },
    
    layout: {
      type: 'landscape',
      orientation: 'horizontal',
      showHeader: true,
      showFooter: true,
      showSidebar: true,
      showPressurePanel: false
    },

    header: {
      height: 40,
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      color: '#ffffff',
      fontSize: 18,
      padding: '0 15px',
      showLogo: true,
      showDeviceInfo: true,
      showUserInfo: true,
      showTime: true
    },

    footer: {
      height: 30,
      background: '#ecf0f1',
      color: '#6c757d',
      fontSize: 11,
      padding: '0 15px',
      showVersion: true,
      showOptimization: true
    },

    sidebar: {
      width: 180,
      minWidth: 150,
      maxWidth: 250,
      background: '#ffffff',
      borderColor: '#dee2e6',
      showHeader: true,
      collapsible: false
    },

    content: {
      background: '#ffffff',
      padding: 20,
      borderRadius: 8,
      margin: 10,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }
  },

  // Display Configuration for 7.9" Industrial Display
  display: {
    width: 1280,
    height: 400,
    orientation: 'landscape',
    pixelDensity: 'standard',
    touchOptimized: true,
    
    breakpoints: {
      compact: 1000,
      mobile: 768,
      tiny: 480
    },

    optimizations: {
      '7.9inch': {
        targetResolution: '1280x400',
        touchTargetSize: 48,
        fontSize: {
          small: 11,
          normal: 14,
          large: 18,
          xlarge: 20
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 15,
          lg: 20,
          xl: 30
        }
      }
    }
  },

  // Layout Configuration
  layout: {
    type: 'three-column', // header-content-footer with optional sidebar
    
    grid: {
      areas: {
        default: `
          "header header header"
          "sidebar content pressure"
          "footer footer footer"
        `,
        noSidebar: `
          "header header header"
          "content content pressure"
          "footer footer footer"
        `,
        noPressure: `
          "header header"
          "sidebar content"
          "footer footer"
        `,
        contentOnly: `
          "header"
          "content"
          "footer"
        `
      },
      
      columns: {
        sidebar: '180px',
        content: '1fr',
        pressure: '200px'
      },
      
      rows: {
        header: '40px',
        content: '1fr',
        footer: '30px'
      }
    },

    responsive: {
      compact: {
        headerHeight: 35,
        footerHeight: 25,
        sidebarWidth: 150,
        contentPadding: 6,
        fontSize: 14
      },
      
      normal: {
        headerHeight: 40,
        footerHeight: 30,
        sidebarWidth: 180,
        contentPadding: 10,
        fontSize: 16
      }
    }
  },

  // Data Configuration
  data: {
    defaultUser: 'OPERATOR',
    defaultDevice: 'MASK-001',
    defaultLayout: 'landscape',
    
    templates: {
      dashboard: {
        title: 'Dashboard',
        showSidebar: true,
        showPressurePanel: false,
        menuItems: []
      },
      
      monitoring: {
        title: 'Monitoring',
        showSidebar: true,
        showPressurePanel: true,
        menuItems: []
      },
      
      minimal: {
        title: 'Minimal View',
        showSidebar: false,
        showPressurePanel: false,
        menuItems: []
      }
    },

    persistence: {
      enabled: true,
      key: 'pageTemplate_state',
      expire: 86400000 // 24 hours
    }
  },

  // Role-based Configuration
  roles: {
    validRoles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    defaultRole: 'OPERATOR',
    
    roleConfigurations: {
      OPERATOR: {
        level: 1,
        description: 'Basic monitoring interface',
        allowedTemplates: ['dashboard', 'monitoring'],
        features: {
          canCustomizeLayout: false,
          canAccessSettings: false,
          canViewLogs: false
        }
      },
      
      ADMIN: {
        level: 2,
        description: 'Administrative interface',
        allowedTemplates: ['dashboard', 'monitoring', 'minimal'],
        features: {
          canCustomizeLayout: true,
          canAccessSettings: true,
          canViewLogs: true
        }
      },
      
      SUPERUSER: {
        level: 3,
        description: 'Advanced system interface',
        allowedTemplates: ['dashboard', 'monitoring', 'minimal'],
        features: {
          canCustomizeLayout: true,
          canAccessSettings: true,
          canViewLogs: true,
          canModifySystem: true
        }
      },
      
      SERWISANT: {
        level: 4,
        description: 'Service technician interface',
        allowedTemplates: ['dashboard', 'monitoring', 'minimal'],
        features: {
          canCustomizeLayout: true,
          canAccessSettings: false,
          canViewLogs: true,
          canServiceEquipment: true
        }
      }
    }
  },

  // Responsive Design for Various Screen Sizes
  responsive: {
    enabled: true,
    
    breakpoints: {
      mobile: {
        maxWidth: 768,
        layout: 'single-column',
        sidebarCollapsed: true,
        headerCompact: true
      },
      
      tablet: {
        maxWidth: 1024,
        layout: 'two-column',
        sidebarWidth: 150
      },
      
      desktop: {
        minWidth: 1025,
        layout: 'three-column',
        sidebarWidth: 180
      }
    },

    adaptiveFeatures: {
      autoCollapseSidebar: true,
      compactHeader: true,
      stackedLayout: true,
      touchFriendly: true
    }
  },

  // Accessibility Configuration
  accessibility: {
    enabled: true,
    
    features: {
      keyboardNavigation: true,
      screenReader: true,
      highContrast: true,
      focusIndicators: true,
      skipLinks: true
    },
    
    aria: {
      labels: true,
      descriptions: true,
      roles: true,
      landmarks: true
    },
    
    keyboard: {
      shortcuts: {
        'Alt+H': 'focusHeader',
        'Alt+S': 'focusSidebar',
        'Alt+C': 'focusContent',
        'Alt+F': 'focusFooter',
        'Tab': 'nextElement',
        'Shift+Tab': 'previousElement',
        'Escape': 'closeDialogs'
      }
    },

    touchTargets: {
      minSize: 48, // pixels
      spacing: 8,   // pixels between targets
      feedback: true
    }
  },

  // Performance Configuration
  performance: {
    lazy: {
      enabled: true,
      threshold: 0.1,
      rootMargin: '50px'
    },
    
    caching: {
      enabled: true,
      duration: 300000, // 5 minutes
      key: 'pageTemplate_cache',
      strategies: ['memory', 'localStorage']
    },
    
    optimization: {
      debounceResize: 250,
      throttleScroll: 16,
      minUpdateInterval: 100
    },
    
    benchmarks: {
      initTime: 1000,      // Max 1s initialization
      renderTime: 200,     // Max 200ms render
      layoutTime: 100,     // Max 100ms layout calculation
      interactionResponse: 50 // Max 50ms interaction response
    }
  },

  // Security Configuration
  security: {
    validation: {
      enabled: true,
      strictMode: true,
      validateRoles: true,
      validatePermissions: true,
      sanitizeInput: true
    },
    
    protection: {
      xssProtection: true,
      csrfProtection: true,
      clickjacking: true,
      contentSecurityPolicy: true
    },
    
    audit: {
      enabled: true,
      logActions: true,
      logRoleChanges: true,
      logLayoutChanges: true,
      logErrors: true
    }
  },

  // Multi-language Support
  translations: {
    pl: {
      'page.title': 'MASKSERVICE C20 1001',
      'page.device': 'Urządzenie',
      'page.user': 'Użytkownik',
      'page.navigation': 'Nawigacja',
      'page.dashboard': 'Panel główny',
      'page.monitoring': 'Monitoring',
      'page.status': 'Status systemu',
      'page.activity': 'Ostatnia aktywność',
      'page.userInfo': 'Informacje użytkownika',
      'page.role': 'Rola',
      'page.session': 'Sesja aktywna',
      'page.systemOk': 'System działa poprawnie',
      'page.noEvents': 'Brak nowych zdarzeń',
      'page.monitoringActive': 'Monitoring aktywny',
      'page.lastUpdate': 'Ostatnia aktualizacja',
      'page.layout': 'Układ',
      'page.optimizedFor': 'Zoptymalizowane dla wyświetlacza'
    },
    
    en: {
      'page.title': 'MASKSERVICE C20 1001',
      'page.device': 'Device',
      'page.user': 'User',
      'page.navigation': 'Navigation',
      'page.dashboard': 'Dashboard',
      'page.monitoring': 'Monitoring',
      'page.status': 'System Status',
      'page.activity': 'Recent Activity',
      'page.userInfo': 'User Information',
      'page.role': 'Role',
      'page.session': 'Session active',
      'page.systemOk': 'System running normally',
      'page.noEvents': 'No recent events',
      'page.monitoringActive': 'Monitoring active',
      'page.lastUpdate': 'Last update',
      'page.layout': 'Layout',
      'page.optimizedFor': 'Optimized for display'
    },
    
    de: {
      'page.title': 'MASKSERVICE C20 1001',
      'page.device': 'Gerät',
      'page.user': 'Benutzer',
      'page.navigation': 'Navigation',
      'page.dashboard': 'Dashboard',
      'page.monitoring': 'Überwachung',
      'page.status': 'Systemstatus',
      'page.activity': 'Letzte Aktivität',
      'page.userInfo': 'Benutzerinformationen',
      'page.role': 'Rolle',
      'page.session': 'Sitzung aktiv',
      'page.systemOk': 'System läuft normal',
      'page.noEvents': 'Keine neuen Ereignisse',
      'page.monitoringActive': 'Überwachung aktiv',
      'page.lastUpdate': 'Letzte Aktualisierung',
      'page.layout': 'Layout',
      'page.optimizedFor': 'Optimiert für Display'
    }
  },

  // Animation and Effects
  animations: {
    enabled: true,
    
    transitions: {
      duration: 200,
      easing: 'ease-in-out',
      properties: ['opacity', 'transform', 'background-color']
    },
    
    effects: {
      fadeIn: true,
      slideIn: true,
      hover: true,
      focus: true
    },
    
    reduceMotion: {
      respectPreference: true,
      fallback: 'instant'
    }
  },

  // API Configuration
  api: {
    endpoints: {
      getTemplate: '/api/template/config',
      saveLayout: '/api/template/layout',
      getUserPreferences: '/api/user/preferences',
      logActivity: '/api/audit/activity'
    },
    
    timeout: 5000,
    retries: 2,
    
    headers: {
      'Content-Type': 'application/json',
      'X-Component': 'pageTemplate',
      'X-Version': '0.1.1'
    }
  },

  // Development Configuration
  development: {
    debug: false,
    mockData: false,
    showGrid: false,
    showBoundaries: false,
    
    devServer: {
      port: 3005,
      host: 'localhost',
      autoReload: true
    },
    
    testing: {
      enabled: true,
      smokeTests: true,
      unitTests: true,
      visualTests: true
    }
  },

  // Component State Management
  state: {
    defaultState: {
      isLoading: false,
      isError: false,
      currentTemplate: 'dashboard',
      userRole: 'OPERATOR',
      deviceId: 'MASK-001',
      lastUpdate: null
    },
    
    persistence: {
      save: ['currentTemplate', 'userRole', 'layoutPreferences'],
      ignore: ['isLoading', 'isError', 'lastUpdate']
    }
  }
};
