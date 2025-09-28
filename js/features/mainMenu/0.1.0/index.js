import MainMenu from './MainMenu.vue';
import { ConfigLoader } from '../../../shared/configLoader.js';

/**
 * Main Menu Module 0.1.0
 * Główne menu aplikacji z kontrolą dostępu opartą na rolach
 */
const Component = MainMenu;

export default {
  name: 'mainMenu',
  version: '0.1.0',
  component: Component,

  handle(request = {}) {
    const { action = 'getMenu', role = 'OPERATOR' } = request;

    switch (action) {
      case 'getMenu': {
        if (!this.validateRole(role)) {
          return {
            success: false,
            error: `Invalid role: ${role}`,
            data: {
              validRoles: this.getValidRoles()
            }
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
      }

      case 'validateRole':
        return {
          success: true,
          data: {
            valid: this.validateRole(role),
            role
          }
        };

      case 'navigate': {
        const target = request.target || '';
        if (!target) {
          return {
            success: false,
            error: 'Missing navigation target'
          };
        }

        if (!this._context?.router?.push) {
          return {
            success: false,
            error: 'Router not available'
          };
        }

        this._context.router.push(target);
        return {
          success: true,
          data: { target }
        };
      }

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`
        };
    }
  },
  
  
  
  /**
   * Validate user role
   * @param {string} role - User role to validate
   * @returns {boolean} True if role is valid
   */
  validateRole(role) {
    return ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'].includes(role);
  },
  
  /**
   * Get valid roles
   * @returns {Array<string>} Array of valid role names
   */
  getValidRoles() {
    return ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
  },
  
  /**
   * Get menu configuration for specific role
   * @param {string} role - User role
   * @returns {Array} Menu items for the role
   */
  getMenuConfig(role) {
    const configs = {
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

    return (configs[role] || []).map((item, index) => ({ ...item, order: item.order || index + 1 }));
  },
  
  /**
   * Get role capabilities and permissions
   * @param {string} role - User role
   * @returns {object} Role capabilities
   */
  getRoleCapabilities(role) {
    const capabilities = {
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
    
    return capabilities[role] || capabilities.OPERATOR;
  },
  
  /**
   * Apply role-specific theme styling
   * @param {string} role - User role
   */
  applyRoleTheme(role) {
    const themes = {
      OPERATOR: '#3498db',
      ADMIN: '#27ae60',
      SUPERUSER: '#8e44ad',
      SERWISANT: '#e67e22'
    };
    
    const color = themes[role] || themes.OPERATOR;
    document.documentElement.style.setProperty('--role-primary-color', color);
  },
  
  /**
   * Remove role theme styling
   */
  removeRoleTheme() {
    document.documentElement.style.removeProperty('--role-primary-color');
  },
  
  /**
   * Check if role has specific permission
   * @param {string} role - User role
   * @param {string} permission - Permission to check
   * @returns {boolean} True if role has permission
   */
  hasPermission(role, permission) {
    const capabilities = this.getRoleCapabilities(role);
    return capabilities[permission] === true;
  },
  
  /**
   * Get menu statistics
   * @param {string} role - User role
   * @returns {object} Menu statistics
   */
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

  /**
   * Load component configuration using ConfigLoader
   * @returns {object} Configuration object
   */
  async loadConfig() {
    const possiblePaths = [
      'js/features/mainMenu/0.1.0/config/config.json',  // Correct component path
      './js/features/mainMenu/0.1.0/config/config.json', // Alternative
      '/js/features/mainMenu/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'mainMenu');
        if (result.success) break;
      } catch (error) {
        continue; // Try next path
      }
    }
    
    this.config = result?.config || {};
    return result || { success: false, config: {} };
  },

  /**
   * Initialize module with context
   * @param {object} context - Vue context with store and router
   * @returns {boolean} Success status
   */
  async init(context = {}) {
    if (!context || !context.router) {
      return false;
    }
    
    try {
      // Load configuration
      await this.loadConfig();
      
      this._context = context;
      this.metadata.initialized = true;

      if (context?.router?.beforeEach && !this._navigationGuard) {
        this._navigationGuard = context.router.beforeEach((to, from, next) => {
          this.lastRoute = to.fullPath;
          next();
        });
      }

      return true;
    } catch (error) {
      console.error('MainMenu init error:', error);
      return false;
    }
  },

  /**
   * Cleanup module resources
   */
  cleanup() {
    if (this._navigationGuard && this._context?.router?.beforeEach) {
      this._context.router.beforeEach(this._navigationGuard);
      this._navigationGuard = null;
    }

    this._context = null;
    this.metadata.initialized = false;
  },

  // Module metadata
  metadata: {
    name: 'mainMenu',
    version: '1.0.0',
    description: 'role-based main menu system with hierarchical access control for industrial applications',
    author: 'Industrial Systems Team',
    initialized: false,
    dependencies: ['vue'],
    tags: ['menu', 'navigation', 'role-based', 'access-control'],
    features: [
      'role-based-access-control',
      'hierarchical-menu-structure',
      'permission-validation',
      'theme-customization',
      'submenu-support'
    ]
  }
};
