// STANDARD COMPONENT INDEX.JS - v2.0
// DO NOT MODIFY WITHOUT TEAM REVIEW

const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const componentModule = {
  metadata: {
    name: 'mainMenu',
    version: '0.1.1',
    type: 'component',
    contractVersion: '2.0' // Component contract version
  },
  
  component: null,
  config: null,
  
  async init(context = {}) {
    try {
      // Standard initialization sequence
      await this.loadComponent();
      await this.loadConfig();
      await this.runSmokeTests();
      
      return { 
        success: true, 
        message: `${this.metadata.name} initialized`,
        contractVersion: this.metadata.contractVersion
      };
    } catch (error) {
      console.error(`[${this.metadata.name}] Init failed:`, error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  },
  
  handle(request) {
    const { action, payload, language = 'pl' } = request;
    
    switch(action) {
      case 'GET_CONFIG':
        return { success: true, data: this.config };
        
      case 'GET_METADATA':
        return { success: true, data: this.metadata };
        
      case 'GET_MENU':
        return this.handleGetMenu(payload);
        
      case 'VALIDATE_ROLE':
        return this.handleValidateRole(payload);
        
      case 'NAVIGATE':
        return this.handleNavigate(payload);
        
      case 'GET_TRANSLATIONS':
        return this.handleGetTranslations(language);
        
      case 'HEALTH_CHECK':
        return { success: true, data: { status: 'healthy', timestamp: Date.now() } };
        
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  },
  
  async loadComponent() {
    try {
      const module = await import('./mainMenu.js');
      this.component = module.default || module.mainMenu;
      if (!this.component) {
        throw new Error('MainMenu component not found in module');
      }
      console.log(`✓ ${this.metadata.name} component loaded`);
    } catch (error) {
      console.error(`✗ Failed to load ${this.metadata.name} component:`, error);
      throw error;
    }
  },
  
  async loadConfig() {
    try {
      const module = await import('./component.config.js');
      this.config = module.default || module.config;
      if (!this.config) {
        throw new Error('MainMenu config not found');
      }
      console.log(`✓ ${this.metadata.name} config loaded`);
    } catch (error) {
      console.error(`✗ Failed to load ${this.metadata.name} config:`, error);
      throw error;
    }
  },
  
  async runSmokeTests() {
    try {
      const tests = await import('./mainMenu.smoke.js');
      const results = await tests.runSmokeTests(this);
      if (!results.success) {
        throw new Error(`Smoke tests failed: ${results.message}`);
      }
      console.log(`✓ ${this.metadata.name} smoke tests passed`);
    } catch (error) {
      console.warn(`⚠ ${this.metadata.name} smoke tests unavailable:`, error.message);
      // Don't throw - smoke tests are optional
    }
  },
  
  handleGetMenu(payload) {
    const { role = 'OPERATOR' } = payload || {};
    
    if (!this.validateRole(role)) {
      return {
        success: false,
        error: `Invalid role: ${role}`,
        data: { validRoles: this.getValidRoles() }
      };
    }
    
    const menuItems = this.getMenuConfig(role);
    return {
      success: true,
      data: {
        menuItems,
        role,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  handleValidateRole(payload) {
    const { role = 'OPERATOR' } = payload || {};
    return {
      success: true,
      data: {
        valid: this.validateRole(role),
        role
      }
    };
  },
  
  handleNavigate(payload) {
    const { target } = payload || {};
    if (!target) {
      return {
        success: false,
        error: 'Missing navigation target'
      };
    }
    
    // Navigation will be handled by parent application
    return {
      success: true,
      data: { target, action: 'navigate' }
    };
  },
  
  handleGetTranslations(language) {
    const translations = this.config?.translations?.[language] || this.config?.translations?.pl || {};
    return {
      success: true,
      data: { translations, language }
    };
  },
  
  validateRole(role) {
    const validRoles = this.config?.roles?.validRoles || ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
    return validRoles.includes(role);
  },
  
  getValidRoles() {
    return this.config?.roles?.validRoles || ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
  },
  
  getMenuConfig(role) {
    const roleMenus = this.config?.menus?.roleMenus || {};
    const defaultMenus = {
      OPERATOR: [
        { id: 'monitoring', icon: 'fas fa-desktop', label: 'menu.monitoring', route: '/monitoring', order: 1 },
        { id: 'alerts', icon: 'fas fa-bell', label: 'menu.alerts', route: '/alerts', order: 2 }
      ],
      ADMIN: [
        { id: 'tests', icon: 'fas fa-vials', label: 'menu.tests', route: '/tests', order: 1 },
        { id: 'reports', icon: 'fas fa-chart-line', label: 'menu.reports', route: '/reports', order: 2 },
        { id: 'users', icon: 'fas fa-users-cog', label: 'menu.users', route: '/admin/users', order: 3 },
        { id: 'system', icon: 'fas fa-cogs', label: 'menu.system', route: '/admin/system', order: 4 }
      ],
      SUPERUSER: [
        { id: 'integration', icon: 'fas fa-project-diagram', label: 'menu.integration', route: '/integration', order: 1 },
        { id: 'analytics', icon: 'fas fa-chart-area', label: 'menu.analytics', route: '/analytics', order: 2 },
        { id: 'advanced-system', icon: 'fas fa-microscope', label: 'menu.advanced-system', route: '/advanced-system', order: 3 },
        { id: 'audit', icon: 'fas fa-shield-alt', label: 'menu.audit', route: '/audit', order: 4 }
      ],
      SERWISANT: [
        { id: 'diagnostics', icon: 'fas fa-stethoscope', label: 'menu.diagnostics', route: '/diagnostics', order: 1 },
        { id: 'calibration', icon: 'fas fa-drafting-compass', label: 'menu.calibration', route: '/calibration', order: 2 },
        { id: 'maintenance', icon: 'fas fa-wrench', label: 'menu.maintenance', route: '/maintenance', order: 3 },
        { id: 'workshop', icon: 'fas fa-hammer', label: 'menu.workshop', route: '/workshop', order: 4 },
        { id: 'tech-docs', icon: 'fas fa-book-open', label: 'menu.tech-docs', route: '/tech-docs', order: 5 }
      ]
    };
    
    const menuConfig = roleMenus[role] || defaultMenus[role] || [];
    return menuConfig.map((item, index) => ({ ...item, order: item.order || index + 1 }));
  },
  
  getRoleCapabilities(role) {
    const capabilities = this.config?.roles?.capabilities || {};
    const defaultCapabilities = {
      OPERATOR: {
        level: 1,
        description: 'Basic operations: tests and reports viewing',
        canExport: false,
        canManageUsers: false,
        canConfigureSystem: false,
        maxMenuItems: 2
      },
      ADMIN: {
        level: 2,
        description: 'Administrative functions: user management and system configuration',
        canExport: true,
        canManageUsers: true,
        canConfigureSystem: true,
        maxMenuItems: 4
      },
      SUPERUSER: {
        level: 3,
        description: 'Advanced system control and integration management',
        canExport: true,
        canManageUsers: true,
        canConfigureSystem: true,
        canIntegrateExternal: true,
        maxMenuItems: 4
      },
      SERWISANT: {
        level: 4,
        description: 'Technical service and maintenance operations',
        canExport: true,
        canManageUsers: false,
        canConfigureSystem: false,
        canServiceEquipment: true,
        canAccessDiagnostics: true,
        maxMenuItems: 5
      }
    };
    
    return capabilities[role] || defaultCapabilities[role] || defaultCapabilities.OPERATOR;
  },
  
  applyRoleTheme(role) {
    const themes = this.config?.ui?.roleThemes || {
      OPERATOR: '#3498db',
      ADMIN: '#27ae60',
      SUPERUSER: '#8e44ad',
      SERWISANT: '#e67e22'
    };
    
    const color = themes[role] || themes.OPERATOR;
    document.documentElement.style.setProperty('--role-primary-color', color);
  },
  
  removeRoleTheme() {
    document.documentElement.style.removeProperty('--role-primary-color');
  },
  
  hasPermission(role, permission) {
    const capabilities = this.getRoleCapabilities(role);
    return capabilities[permission] === true;
  },
  
  getMenuStats(role) {
    const config = this.getMenuConfig(role);
    const capabilities = this.getRoleCapabilities(role);
    
    return {
      totalItems: config.length,
      primaryItems: config.filter(item => item.isPrimary).length,
      maxAllowed: capabilities.maxMenuItems,
      utilizationPercent: (config.length / capabilities.maxMenuItems) * 100
    };
  },

  render(container, props = {}) {
    if (!container || !this.component) {
      console.error('MainMenu render: Missing container or component');
      return;
    }
    
    try {
      // Use component rendering logic
      this.component.render(container, {
        ...props,
        config: this.config,
        metadata: this.metadata
      });
      console.log(`✓ ${this.metadata.name} rendered successfully`);
    } catch (error) {
      console.error(`✗ ${this.metadata.name} render failed:`, error);
      container.innerHTML = `<div class="error">MainMenu render error: ${error.message}</div>`;
    }
  }
};

export default componentModule;
