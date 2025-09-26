/**
 * Page Template Module v1
 * Bazowy template strony dla systemu MASKSERVICE z układem dla wyświetlacza 7.9 cala (400x1280px landscape)
 */
import Component from './pageTemplate.js';

export default {
  name: 'pageTemplate',
  version: 'v1',
  component: Component,
  
  /**
   * Main handler function for the page template module
   * @param {object} request - Request object with page configuration
   * @returns {object} Response object
   */
  handle(request = {}) {
    console.log(`Executing ${this.name}@${this.version}`, request);
    
    const config = {
      showSidebar: request.showSidebar !== false,
      showPressurePanel: request.showPressurePanel || false,
      menuItems: request.menuItems || [],
      currentUser: request.currentUser || 'OPERATOR',
      deviceId: request.deviceId || 'MASK-001',
      layout: request.layout || 'landscape'
    };
    
    return {
      status: 200,
      message: `${this.name}@${this.version} template configured successfully`,
      data: {
        module: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        config,
        optimizedFor: '7.9inch-landscape-400x1280px'
      }
    };
  },
  
  /**
   * Initialize page template with configuration
   * @param {object} config - Configuration object
   */
  init(config = {}) {
    console.log(`Initializing ${this.name}@${this.version}`, config);
    
    // Set up responsive design for 7.9" landscape display
    if (typeof window !== 'undefined') {
      // Add viewport meta tag for proper scaling
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=1280, height=400, initial-scale=1.0, user-scalable=no';
      
      // Add custom CSS variables for the layout
      document.documentElement.style.setProperty('--display-width', '1280px');
      document.documentElement.style.setProperty('--display-height', '400px');
      document.documentElement.style.setProperty('--header-height', '40px');
      document.documentElement.style.setProperty('--footer-height', '30px');
      document.documentElement.style.setProperty('--sidebar-width', '180px');
    }
  },
  
  /**
   * Cleanup page template resources
   */
  cleanup() {
    console.log(`Cleaning up ${this.name}@${this.version}`);
    
    // Clean up any intervals or event listeners
    if (typeof window !== 'undefined') {
      // Remove custom CSS variables
      document.documentElement.style.removeProperty('--display-width');
      document.documentElement.style.removeProperty('--display-height');
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--footer-height');
      document.documentElement.style.removeProperty('--sidebar-width');
    }
  },
  
  /**
   * Get layout configuration for different screen sizes
   * @param {object} screenInfo - Screen dimension info
   * @returns {object} Layout configuration
   */
  getLayoutConfig(screenInfo = {}) {
    const { width = 1280, height = 400 } = screenInfo;
    
    // Optimize layout based on screen dimensions
    const config = {
      isLandscape: width > height,
      showCompactLayout: height < 450,
      headerHeight: height < 450 ? 35 : 40,
      footerHeight: height < 450 ? 25 : 30,
      sidebarWidth: width < 1000 ? 150 : 180,
      contentPadding: height < 450 ? 6 : 10
    };
    
    return config;
  },
  
  /**
   * Validate menu items structure
   * @param {Array} menuItems - Array of menu items
   * @returns {boolean} True if valid
   */
  validateMenuItems(menuItems) {
    if (!Array.isArray(menuItems)) return false;
    
    return menuItems.every(item => 
      item.key && 
      item.label && 
      typeof item.key === 'string' && 
      typeof item.label === 'string'
    );
  },
  
  /**
   * Initialize the module
   * @param {Object} context - Application context
   * @returns {boolean} Success status
   */
  async init(context) {
    try {
      // Validate context
      if (!context || !context.store || !context.router) {
        console.error('pageTemplate: Invalid context provided');
        return false;
      }

      // Store context for later use
      this._context = context;
      this.metadata.initialized = true;
      
      console.log('✅ pageTemplate module initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ pageTemplate initialization failed:', error);
      return false;
    }
  },

  /**
   * Handle module requests
   * @param {Object} request - Request object with action and data
   * @returns {Object} Response object
   */
  handle(request) {
    try {
      if (!request || !request.action) {
        return {
          success: false,
          error: 'Invalid request format'
        };
      }

      switch (request.action) {
        case 'show':
          return {
            success: true,
            data: {
              title: request.data?.title || 'Default Page',
              component: this.component
            }
          };

        case 'configure':
          return {
            success: true,
            data: {
              config: this.getLayoutConfig(request.data?.screenInfo)
            }
          };

        case 'validate':
          return {
            success: true,
            data: {
              valid: this.validateMenuItems(request.data?.menuItems || [])
            }
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${request.action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Cleanup module resources
   */
  cleanup() {
    try {
      // Clean up any listeners or resources
      if (this._context) {
        this._context = null;
      }
      this.metadata.initialized = false;
      console.log('🧹 pageTemplate module cleaned up');
    } catch (error) {
      console.error('❌ pageTemplate cleanup failed:', error);
    }
  },

  // Module metadata
  metadata: {
    name: 'pageTemplate',
    version: '1.0.0',
    description: 'Base page template optimized for 7.9" landscape industrial displays with pressure panel support',
    author: 'Industrial Systems Team',
    initialized: false,
    displayOptimization: '7.9inch-landscape-400x1280px',
    dependencies: ['vue'],
    tags: ['layout', 'template', '7.9-inch', 'landscape', 'pressure-panel'],
    features: [
      'responsive-layout',
      'role-based-menu',
      'pressure-panel-support',
      'multi-language',
      'real-time-clock'
    ],
    compatibility: {
      vue: '^3.4.0',
      browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+']
    }
  }
};
