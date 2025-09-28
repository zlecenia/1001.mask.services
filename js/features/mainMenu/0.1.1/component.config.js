// MainMenu Component Configuration - v2.0 Contract Compliant
// Unified configuration for role-based main navigation menu

export default {
  // Component Metadata
  metadata: {
    name: 'mainMenu',
    version: '0.1.1',
    description: 'Role-based main navigation menu for industrial applications',
    category: 'navigation',
    tags: ['menu', 'navigation', 'role-based', 'layout']
  },

  // UI Configuration
  ui: {
    theme: {
      primaryColor: '#2c3e50',
      secondaryColor: '#34495e',
      accentColor: '#3498db',
      backgroundColor: '#ecf0f1',
      textColor: '#2c3e50'
    },
    
    roleThemes: {
      OPERATOR: '#3498db',
      ADMIN: '#27ae60', 
      SUPERUSER: '#8e44ad',
      SERWISANT: '#e67e22'
    },
    
    layout: {
      width: '15%',
      minWidth: '200px',
      maxWidth: '300px',
      height: '100vh',
      position: 'fixed',
      zIndex: 1000
    },
    
    animations: {
      enabled: true,
      hoverTransition: '0.2s ease',
      clickTransition: '0.1s ease'
    }
  },

  // Data Configuration  
  data: {
    defaultRole: 'OPERATOR',
    maxMenuItems: 10,
    autoSave: true,
    persistence: {
      enabled: true,
      key: 'mainMenu_state',
      expire: 86400000 // 24 hours
    }
  },

  // Role-based Menu Configuration
  menus: {
    roleMenus: {
      OPERATOR: [
        { id: 'monitoring', icon: 'fas fa-desktop', label: 'menu.monitoring', route: '/monitoring', order: 1, primary: true },
        { id: 'alerts', icon: 'fas fa-bell', label: 'menu.alerts', route: '/alerts', order: 2 },
        { id: 'device-data', icon: 'fas fa-microchip', label: 'menu.device-data', route: '/device-data', order: 3 }
      ],
      ADMIN: [
        { id: 'tests', icon: 'fas fa-vials', label: 'menu.tests', route: '/tests', order: 1, primary: true },
        { id: 'reports', icon: 'fas fa-chart-line', label: 'menu.reports', route: '/reports', order: 2 },
        { id: 'users', icon: 'fas fa-users-cog', label: 'menu.users', route: '/admin/users', order: 3 },
        { id: 'system', icon: 'fas fa-cogs', label: 'menu.system', route: '/admin/system', order: 4 }
      ],
      SUPERUSER: [
        { id: 'integration', icon: 'fas fa-project-diagram', label: 'menu.integration', route: '/integration', order: 1, primary: true },
        { id: 'analytics', icon: 'fas fa-chart-area', label: 'menu.analytics', route: '/analytics', order: 2 },
        { id: 'advanced-system', icon: 'fas fa-microscope', label: 'menu.advanced-system', route: '/advanced-system', order: 3 },
        { id: 'audit', icon: 'fas fa-shield-alt', label: 'menu.audit', route: '/audit', order: 4 }
      ],
      SERWISANT: [
        { id: 'diagnostics', icon: 'fas fa-stethoscope', label: 'menu.diagnostics', route: '/diagnostics', order: 1, primary: true },
        { id: 'calibration', icon: 'fas fa-drafting-compass', label: 'menu.calibration', route: '/calibration', order: 2 },
        { id: 'maintenance', icon: 'fas fa-wrench', label: 'menu.maintenance', route: '/maintenance', order: 3 },
        { id: 'workshop', icon: 'fas fa-hammer', label: 'menu.workshop', route: '/workshop', order: 4 },
        { id: 'tech-docs', icon: 'fas fa-book-open', label: 'menu.tech-docs', route: '/tech-docs', order: 5 }
      ]
    }
  },

  // Role Configuration
  roles: {
    validRoles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    defaultRole: 'OPERATOR',
    
    capabilities: {
      OPERATOR: {
        level: 1,
        description: 'Basic monitoring and alert operations',
        canExport: false,
        canManageUsers: false,
        canConfigureSystem: false,
        maxMenuItems: 3,
        allowedSections: ['monitoring', 'alerts', 'device-data']
      },
      ADMIN: {
        level: 2,
        description: 'Administrative functions and system management',
        canExport: true,
        canManageUsers: true,
        canConfigureSystem: true,
        maxMenuItems: 4,
        allowedSections: ['tests', 'reports', 'users', 'system']
      },
      SUPERUSER: {
        level: 3,
        description: 'Advanced system control and integration management',
        canExport: true,
        canManageUsers: true,
        canConfigureSystem: true,
        canIntegrateExternal: true,
        maxMenuItems: 4,
        allowedSections: ['integration', 'analytics', 'advanced-system', 'audit']
      },
      SERWISANT: {
        level: 4,
        description: 'Technical service and maintenance operations',
        canExport: true,
        canManageUsers: false,
        canConfigureSystem: false,
        canServiceEquipment: true,
        canAccessDiagnostics: true,
        maxMenuItems: 5,
        allowedSections: ['diagnostics', 'calibration', 'maintenance', 'workshop', 'tech-docs']
      }
    }
  },

  // Responsive Design for 7.9" Industrial Display
  responsive: {
    display79inch: {
      enabled: true,
      breakpoint: '1024x600',
      adjustments: {
        fontSize: '16px',
        iconSize: '24px',
        padding: '12px',
        touchTargetSize: '48px'
      }
    },
    
    mobile: {
      enabled: true,
      breakpoint: '768px',
      adjustments: {
        layout: 'collapsed',
        showLabels: false,
        iconOnly: true
      }
    }
  },

  // Accessibility Configuration
  accessibility: {
    enabled: true,
    features: {
      keyboardNavigation: true,
      screenReader: true,
      highContrast: true,
      focusIndicators: true
    },
    
    aria: {
      labels: true,
      descriptions: true,
      roles: true
    },
    
    keyboard: {
      shortcuts: {
        'Alt+M': 'toggleMenu',
        'Alt+1': 'selectFirstItem',
        'Alt+0': 'selectLastItem',
        'Escape': 'closeSubmenu'
      }
    }
  },

  // Performance Configuration
  performance: {
    lazy: {
      enabled: true,
      threshold: 0.1
    },
    
    caching: {
      enabled: true,
      duration: 300000, // 5 minutes
      key: 'mainMenu_cache'
    },
    
    animation: {
      reducedMotion: true,  // Respect user preferences
      duration: 200         // Fast for industrial use
    },
    
    benchmarks: {
      initTime: 1000,      // Max 1s initialization
      renderTime: 100,     // Max 100ms render
      actionResponse: 50   // Max 50ms action response
    }
  },

  // Security Configuration
  security: {
    validation: {
      enabled: true,
      strictMode: true,
      validateRoles: true,
      validatePermissions: true
    },
    
    protection: {
      xssProtection: true,
      csrfProtection: true,
      inputSanitization: true
    },
    
    audit: {
      enabled: true,
      logActions: true,
      logRoleChanges: true,
      logNavigations: true
    },
    
    roleValidation: {
      required: true,
      allowFallback: true,
      fallbackRole: 'OPERATOR'
    }
  },

  // Multi-language Support
  translations: {
    pl: {
      menuTitle: 'Menu Główne',
      'menu.monitoring': 'Monitoring',
      'menu.alerts': 'Alerty',
      'menu.device-data': 'Dane Urządzenia',
      'menu.tests': 'Testy',
      'menu.reports': 'Raporty',
      'menu.users': 'Użytkownicy',
      'menu.system': 'System',
      'menu.integration': 'Integracja',
      'menu.analytics': 'Analityka',
      'menu.advanced-system': 'System Zaawansowany',
      'menu.audit': 'Audyt',
      'menu.diagnostics': 'Diagnostyka',
      'menu.calibration': 'Kalibracja',
      'menu.maintenance': 'Konserwacja',
      'menu.workshop': 'Warsztat',
      'menu.tech-docs': 'Dokumentacja',
      'role_operator': 'Operator',
      'role_admin': 'Administrator',
      'role_superuser': 'Superużytkownik',
      'role_serwisant': 'Serwisant'
    },
    
    en: {
      menuTitle: 'Main Menu',
      'menu.monitoring': 'Monitoring',
      'menu.alerts': 'Alerts', 
      'menu.device-data': 'Device Data',
      'menu.tests': 'Tests',
      'menu.reports': 'Reports',
      'menu.users': 'Users',
      'menu.system': 'System',
      'menu.integration': 'Integration',
      'menu.analytics': 'Analytics',
      'menu.advanced-system': 'Advanced System',
      'menu.audit': 'Audit',
      'menu.diagnostics': 'Diagnostics',
      'menu.calibration': 'Calibration',
      'menu.maintenance': 'Maintenance',
      'menu.workshop': 'Workshop',
      'menu.tech-docs': 'Documentation',
      'role_operator': 'Operator',
      'role_admin': 'Administrator', 
      'role_superuser': 'Superuser',
      'role_serwisant': 'Service Technician'
    },
    
    de: {
      menuTitle: 'Hauptmenü',
      'menu.monitoring': 'Überwachung',
      'menu.alerts': 'Alarme',
      'menu.device-data': 'Gerätedaten',
      'menu.tests': 'Tests',
      'menu.reports': 'Berichte',
      'menu.users': 'Benutzer',
      'menu.system': 'System',
      'menu.integration': 'Integration',
      'menu.analytics': 'Analytik',
      'menu.advanced-system': 'Erweiterte System',
      'menu.audit': 'Audit',
      'menu.diagnostics': 'Diagnose',
      'menu.calibration': 'Kalibrierung',
      'menu.maintenance': 'Wartung',
      'menu.workshop': 'Werkstatt',
      'menu.tech-docs': 'Dokumentation',
      'role_operator': 'Operator',
      'role_admin': 'Administrator',
      'role_superuser': 'Superbenutzer',
      'role_serwisant': 'Service-Techniker'
    }
  },

  // API Configuration
  api: {
    endpoints: {
      getMenuConfig: '/api/menu/config',
      validateRole: '/api/auth/validate-role',
      logNavigation: '/api/audit/navigation'
    },
    
    timeout: 5000,
    retries: 3,
    
    headers: {
      'Content-Type': 'application/json',
      'X-Component': 'mainMenu',
      'X-Version': '0.1.1'
    }
  },

  // Development Configuration
  development: {
    debug: false,
    mockData: false,
    
    devServer: {
      port: 3003,
      host: 'localhost',
      autoReload: true
    },
    
    testing: {
      enabled: true,
      smokeTests: true,
      unitTests: true
    }
  }
};
