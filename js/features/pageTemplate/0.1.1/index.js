/**
 * PageTemplate Component Module - Components v2.0 Contract Compliant
 * Base page template optimized for 7.9" landscape industrial displays
 * 
 * @version 0.1.1
 * @author MASKSERVICE System
 * @contractVersion 2.0
 */

// CRITICAL: Use global Vue pattern instead of ES imports for CDN compatibility
const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const pageTemplateModule = {
  metadata: {
    name: 'pageTemplate',
    version: '0.1.1',
    type: 'layout',
    contractVersion: '2.0',
    description: 'Base page template optimized for 7.9" landscape industrial displays',
    author: 'MASKSERVICE System',
    displayOptimization: '7.9inch-landscape-400x1280px',
    initialized: false,
    
    features: [
      'responsive-layout',
      'role-based-content',
      'pressure-panel-support',
      'multi-language',
      'real-time-updates'
    ],
    
    dependencies: {
      vue: '^3.4.0'
    }
  },

  // Configuration storage
  config: null,
  context: null,
  
  /**
   * Initialize pageTemplate component
   * @param {Object} context - Application context
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async init(context = {}) {
    console.log('🚀 [PageTemplate] Starting initialization...', context);
    
    try {
      // Store context for later use
      this.context = context;
      
      console.log('📋 [PageTemplate] Loading configuration...');
      await this.loadConfig();
      
      console.log('🎨 [PageTemplate] Loading component...');
      await this.loadComponent();
      
      this.metadata.initialized = true;
      console.log('✅ [PageTemplate] Initialization completed successfully');
      
      return { 
        success: true, 
        message: 'PageTemplate component initialized successfully',
        version: this.metadata.version,
        contractVersion: this.metadata.contractVersion
      };
      
    } catch (error) {
      console.error('❌ [PageTemplate] Initialization failed:', error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack
      };
    }
  },

  /**
   * Handle component actions and requests
   * @param {Object} request - Request object
   * @returns {Object} Response object
   */
  handle(request = {}) {
    const { action = 'GET_STATUS', data = {} } = request;
    
    try {
      switch (action) {
        case 'GET_STATUS':
          return {
            success: true,
            data: {
              initialized: this.metadata.initialized,
              version: this.metadata.version,
              contractVersion: this.metadata.contractVersion,
              displayOptimization: this.metadata.displayOptimization
            }
          };

        case 'GET_METADATA':
          return {
            success: true,
            data: this.metadata
          };

        case 'SHOW_PAGE':
          return this.showPage(data);

        case 'CONFIGURE_LAYOUT':
          return this.configureLayout(data);

        case 'GET_LAYOUT_CONFIG':
          return this.getLayoutConfig(data);

        case 'VALIDATE_MENU_ITEMS':
          return this.validateMenuItems(data.menuItems || []);

        case 'SET_USER_ROLE':
          return this.setUserRole(data.role);

        case 'UPDATE_CONTENT':
          return this.updateContent(data);

        default:
          return {
            success: false,
            error: `Unknown action: ${action}`,
            availableActions: [
              'GET_STATUS', 'GET_METADATA', 'SHOW_PAGE', 'CONFIGURE_LAYOUT', 
              'GET_LAYOUT_CONFIG', 'VALIDATE_MENU_ITEMS', 'SET_USER_ROLE', 'UPDATE_CONTENT'
            ]
          };
      }
    } catch (error) {
      console.error(`❌ [PageTemplate] Action ${action} failed:`, error);
      return {
        success: false,
        error: error.message,
        action
      };
    }
  },

  /**
   * Load component resources
   * @returns {Promise<void>}
   */
  async loadComponent() {
    try {
      // Load component-specific resources
      this.templateData = {
        currentUser: 'OPERATOR',
        deviceId: 'MASK-001',
        layout: 'landscape',
        showSidebar: true,
        showPressurePanel: false,
        menuItems: [],
        theme: 'industrial'
      };
      
      console.log('✅ [PageTemplate] Component resources loaded');
    } catch (error) {
      console.error('❌ [PageTemplate] Component loading failed:', error);
      throw error;
    }
  },

  /**
   * Load component configuration  
   * @returns {Promise<void>}
   */
  async loadConfig() {
    try {
      // Try to load external config first, then fall back to default
      const configPaths = [
        'js/features/pageTemplate/0.1.1/component.config.js',
        './js/features/pageTemplate/0.1.1/component.config.js'
      ];
      
      let configLoaded = false;
      
      for (const path of configPaths) {
        try {
          const configModule = await import(path);
          this.config = configModule.default;
          configLoaded = true;
          console.log(`📋 [PageTemplate] Config loaded from: ${path}`);
          break;
        } catch (error) {
          console.warn(`⚠️ [PageTemplate] Config load failed for ${path}:`, error.message);
        }
      }
      
      if (!configLoaded) {
        // Use default configuration
        this.config = this.getDefaultConfig();
        console.log('📋 [PageTemplate] Using default configuration');
      }
      
    } catch (error) {
      console.error('❌ [PageTemplate] Configuration loading failed:', error);
      throw error;
    }
  },

  /**
   * Get default component configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfig() {
    return {
      metadata: {
        name: 'pageTemplate',
        version: '0.1.1',
        description: 'Base page template for 7.9" industrial displays'
      },
      
      ui: {
        theme: 'industrial',
        layout: 'landscape',
        showHeader: true,
        showFooter: true,
        showSidebar: true
      },
      
      display: {
        width: 1280,
        height: 400,
        orientation: 'landscape',
        touchOptimized: true
      },
      
      layout: {
        headerHeight: 40,
        footerHeight: 30,
        sidebarWidth: 180,
        contentPadding: 10
      },
      
      responsive: {
        compactMode: false,
        breakpoint: 1000
      }
    };
  },

  /**
   * Run smoke tests for regression protection
   * @returns {Promise<{success: boolean, details?: any}>}
   */
  async runSmokeTests() {
    try {
      console.log('🧪 [PageTemplate] Running smoke tests...');
      
      // Try to load smoke tests module
      const smokeTestModule = await import('./pageTemplate.smoke.js');
      const SmokeTests = smokeTestModule.default;
      
      if (!SmokeTests) {
        throw new Error('Smoke tests module not found');
      }
      
      const smokeTestInstance = new SmokeTests();
      const result = await smokeTestInstance.runAll();
      
      console.log(`🧪 [PageTemplate] Smoke tests completed: ${result.success ? 'PASSED' : 'FAILED'}`);
      return result;
      
    } catch (error) {
      console.warn('⚠️ [PageTemplate] Smoke tests unavailable:', error.message);
      return {
        success: false,
        error: 'Smoke tests module not available',
        details: error.message
      };
    }
  },

  /**
   * Show page with specified configuration
   * @param {Object} data - Page configuration
   * @returns {Object} Response
   */
  showPage(data = {}) {
    const pageConfig = {
      title: data.title || 'Page Template',
      showSidebar: data.showSidebar !== false,
      showPressurePanel: data.showPressurePanel || false,
      menuItems: data.menuItems || [],
      currentUser: data.currentUser || 'OPERATOR',
      deviceId: data.deviceId || 'MASK-001',
      layout: data.layout || 'landscape'
    };
    
    // Update template data
    Object.assign(this.templateData, pageConfig);
    
    return {
      success: true,
      data: {
        ...pageConfig,
        module: this.metadata.name,
        version: this.metadata.version,
        timestamp: new Date().toISOString(),
        optimizedFor: this.metadata.displayOptimization
      }
    };
  },

  /**
   * Configure layout settings
   * @param {Object} settings - Layout settings
   * @returns {Object} Response
   */
  configureLayout(settings = {}) {
    try {
      const updatedSettings = {
        ...this.config.layout,
        ...settings
      };
      
      this.config.layout = updatedSettings;
      
      return {
        success: true,
        data: {
          settings: updatedSettings,
          applied: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get layout configuration for screen dimensions
   * @param {Object} screenInfo - Screen dimension info
   * @returns {Object} Response with layout config
   */
  getLayoutConfig(screenInfo = {}) {
    const { width = 1280, height = 400 } = screenInfo;
    
    const layoutConfig = {
      isLandscape: width > height,
      showCompactLayout: height < 450,
      headerHeight: height < 450 ? 35 : 40,
      footerHeight: height < 450 ? 25 : 30,
      sidebarWidth: width < 1000 ? 150 : 180,
      contentPadding: height < 450 ? 6 : 10,
      touchTargetSize: 48,
      fontSize: height < 450 ? 14 : 16
    };
    
    return {
      success: true,
      data: layoutConfig
    };
  },

  /**
   * Validate menu items structure  
   * @param {Array} menuItems - Array of menu items
   * @returns {Object} Validation response
   */
  validateMenuItems(menuItems) {
    try {
      if (!Array.isArray(menuItems)) {
        return {
          success: false,
          error: 'Menu items must be an array'
        };
      }
      
      const isValid = menuItems.every(item => 
        item.key && 
        item.label && 
        typeof item.key === 'string' && 
        typeof item.label === 'string'
      );
      
      return {
        success: true,
        data: {
          valid: isValid,
          menuItemsCount: menuItems.length,
          items: menuItems
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Set user role for template
   * @param {string} role - User role
   * @returns {Object} Response
   */
  setUserRole(role) {
    try {
      const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
      
      if (!validRoles.includes(role)) {
        return {
          success: false,
          error: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`
        };
      }
      
      this.templateData.currentUser = role;
      
      return {
        success: true,
        data: {
          role,
          previousRole: this.templateData.currentUser,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Update page content
   * @param {Object} contentData - Content to update
   * @returns {Object} Response
   */
  updateContent(contentData = {}) {
    try {
      Object.assign(this.templateData, contentData);
      
      return {
        success: true,
        data: {
          updated: Object.keys(contentData),
          timestamp: new Date().toISOString(),
          templateData: this.templateData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Render component in container
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Render options
   * @returns {Object} Render result
   */
  render(container, options = {}) {
    console.log('🎨 [PageTemplate] Starting render...');
    
    if (!container) {
      console.error('❌ [PageTemplate] No container provided');
      return { success: false, error: 'No container provided' };
    }

    try {
      const data = this.templateData || {};
      const config = this.config || this.getDefaultConfig();
      
      // Create page template HTML optimized for 7.9" display
      container.innerHTML = `
        <div class="page-template" style="
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
          font-family: Arial, sans-serif;
          overflow: hidden;
        ">
          
          <!-- Header -->
          <header class="page-header" style="
            height: ${config.layout.headerHeight}px;
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            flex-shrink: 0;
          ">
            <div class="header-left" style="display: flex; align-items: center; gap: 15px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold;">
                🏭 MASKSERVICE C20 1001
              </h1>
              <div class="device-info" style="font-size: 12px; color: #bdc3c7;">
                Device: ${data.deviceId || 'MASK-001'}
              </div>
            </div>
            
            <div class="header-right" style="display: flex; align-items: center; gap: 15px;">
              <div class="user-info" style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px;">👤 ${data.currentUser || 'OPERATOR'}</span>
              </div>
              <div class="system-time" style="font-size: 12px; color: #ecf0f1;">
                ${new Date().toLocaleTimeString()}
              </div>
            </div>
          </header>
          
          <!-- Main Content Area -->
          <div class="page-main" style="
            flex: 1;
            display: flex;
            overflow: hidden;
          ">
            
            <!-- Sidebar (if enabled) -->
            ${data.showSidebar !== false ? `
              <aside class="page-sidebar" style="
                width: ${config.layout.sidebarWidth}px;
                background: white;
                border-right: 1px solid #dee2e6;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
              ">
                <div class="sidebar-header" style="
                  padding: 15px;
                  background: #ecf0f1;
                  border-bottom: 1px solid #dee2e6;
                  font-weight: bold;
                  font-size: 14px;
                  color: #2c3e50;
                ">
                  📋 Navigation
                </div>
                
                <nav class="sidebar-nav" style="flex: 1; padding: 10px;">
                  ${(data.menuItems || []).map(item => `
                    <div class="nav-item" style="
                      padding: 8px 12px;
                      margin: 2px 0;
                      border-radius: 4px;
                      cursor: pointer;
                      transition: background 0.2s;
                      font-size: 13px;
                    " 
                    onmouseover="this.style.background='#e3f2fd'"
                    onmouseout="this.style.background='transparent'">
                      ${item.icon || '•'} ${item.label}
                    </div>
                  `).join('')}
                </nav>
              </aside>
            ` : ''}
            
            <!-- Content Area -->
            <main class="page-content" style="
              flex: 1;
              background: white;
              margin: ${config.layout.contentPadding}px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              display: flex;
              flex-direction: column;
              overflow: hidden;
            ">
              <div class="content-header" style="
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
                background: #f8f9fa;
              ">
                <h2 style="margin: 0; color: #2c3e50; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                  📊 ${options.title || data.title || 'Dashboard'}
                </h2>
              </div>
              
              <div class="content-body" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
              ">
                <div class="dashboard-grid" style="
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: 20px;
                ">
                  
                  <!-- Status Card -->
                  <div class="dashboard-card" style="
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                  ">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                      ✅ System Status
                    </h3>
                    <div style="color: #27ae60; font-weight: bold; font-size: 14px;">
                      System działa poprawnie
                    </div>
                    <div style="color: #6c757d; font-size: 12px; margin-top: 5px;">
                      Last update: ${new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <!-- Activity Card -->
                  <div class="dashboard-card" style="
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                  ">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                      📈 Recent Activity
                    </h3>
                    <div style="color: #6c757d; font-size: 14px;">
                      Brak nowych zdarzeń
                    </div>
                    <div style="color: #6c757d; font-size: 12px; margin-top: 5px;">
                      Monitoring active
                    </div>
                  </div>
                  
                  <!-- User Info Card -->
                  <div class="dashboard-card" style="
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                  ">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                      👤 User Information
                    </h3>
                    <div style="color: #2c3e50; font-weight: bold; font-size: 14px;">
                      Role: ${data.currentUser || 'OPERATOR'}
                    </div>
                    <div style="color: #6c757d; font-size: 12px; margin-top: 5px;">
                      Session active
                    </div>
                  </div>
                  
                </div>
              </div>
            </main>
            
            <!-- Pressure Panel (if enabled) -->
            ${data.showPressurePanel ? `
              <aside class="pressure-panel" style="
                width: 200px;
                background: white;
                border-left: 1px solid #dee2e6;
                padding: 15px;
                flex-shrink: 0;
              ">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 14px;">
                  🌡️ Pressure Monitor
                </h3>
                <div style="color: #6c757d; font-size: 12px;">
                  Monitoring disabled
                </div>
              </aside>
            ` : ''}
            
          </div>
          
          <!-- Footer -->
          <footer class="page-footer" style="
            height: ${config.layout.footerHeight}px;
            background: #ecf0f1;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            font-size: 11px;
            color: #6c757d;
            flex-shrink: 0;
          ">
            <div class="footer-left">
              PageTemplate v${this.metadata.version} | Layout: ${data.layout || 'landscape'}
            </div>
            <div class="footer-right">
              Optimized for 7.9" Display (${config.display.width}x${config.display.height})
            </div>
          </footer>
          
        </div>
      `;
      
      console.log('✅ [PageTemplate] Render completed successfully');
      return { 
        success: true, 
        route: options.route,
        rendered: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ [PageTemplate] Render failed:', error);
      container.innerHTML = `<div class="error">PageTemplate render error: ${error.message}</div>`;
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
};

// Lock the structure to prevent modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(pageTemplateModule.metadata);
}

export default pageTemplateModule;
