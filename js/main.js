import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHashHistory } from 'vue-router';

// Import the new modular Vuex store
import store from './store/index.js';

// Import Optimized Feature Registry with Performance Enhancements
import { OptimizedFeatureRegistry } from './OptimizedFeatureRegistry.js';
import { registerAllModules } from './registerAllModulesBrowser.js';

// Import our custom i18n service for industrial applications
import I18nService from './services/i18nService.js';
import { initializeI18n } from './initializeI18n.js';

// Import locales
import pl from '../locales/pl.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

// Hide initial loader when app is ready
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
  
  const app = document.getElementById('app');
  if (app) {
    app.classList.add('loaded');
  }
}

// Global error handler for dynamic imports
window.addEventListener('error', (event) => {
  if (event.message.includes('dynamically imported module')) {
    console.warn('Dynamic import error:', event.message);
    hideInitialLoader();
  }
});

// Create Vue app instance
const app = createApp({
  template: `
    <div class="app-container">
      <!-- Loading Screen -->
      <div v-if="appState === 'loading'" class="loading-screen">
        <img src="/favicon.ico" alt="MASKSERVICE" class="loading-logo">
        <div class="loading-text">{{ loadingMessage }}</div>
        <div class="loading-progress">
          <div class="loading-progress-bar" :style="{ width: loadingProgress + '%' }"></div>
        </div>
      </div>

      <!-- Error Screen -->
      <div v-else-if="appState === 'error'" class="error-screen">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="error-title">Błąd inicjalizacji</div>
        <div class="error-message">{{ errorMessage }}</div>
        <button class="error-retry-btn" @click="retryInitialization">
          <i class="fas fa-redo"></i> Spróbuj ponownie
        </button>
      </div>

      <!-- Main Application with Grid Layout Template -->
      <div v-else-if="appState === 'ready'" class="main-app grid-layout">
        <!-- App Header (Full Width) -->
        <div class="app-header grid-header" id="app-header-container">
          <div class="header-logo">
            <img src="/favicon.ico" alt="MASKSERVICE" class="logo">
            <span class="app-title">MASKSERVICE C20 1001</span>
          </div>
          <div class="header-user" v-if="currentUser">
            <span class="user-name">{{ currentUser.name }}</span>
            <span class="user-role">({{ currentUser.role }})</span>
            <button class="logout-btn" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <!-- App Body Grid: MainMenu + Content + PressurePanel -->
        <div class="app-body grid-body">
          <!-- Main Menu (Left Column) -->
          <div class="main-menu grid-sidebar" id="main-menu-container">
            <div class="menu-header">
              <h3>GŁÓWNE MENU</h3>
              <span class="user-role-badge">{{ currentUser?.role || 'OPERATOR' }}</span>
            </div>
            <div v-for="menuItem in roleBasedMenuItems" :key="menuItem.id" class="menu-item-role"
                 :class="{ active: currentRoute === menuItem.route }"
                 @click="navigateTo(menuItem.route)">
              <i :class="menuItem.icon" class="menu-item-icon"></i>
              <span class="menu-item-text">{{ menuItem.label }}</span>
            </div>
          </div>

          <!-- Content Area (Center Column) -->
          <div class="content-area grid-content" id="content-area">
            <div class="content-placeholder">
              <h2>Dashboard - MASKSERVICE C20 1001</h2>
              <p>Rola: {{ currentUser?.role || 'OPERATOR' }}</p>
              <p>Wybierz opcję z menu aby rozpocząć pracę.</p>
              <div class="dashboard-stats">
                <div class="stat-card">
                  <h4>Status Systemu</h4>
                  <span class="status online">ONLINE</span>
                </div>
                <div class="stat-card">
                  <h4>Aktywne Komponenty</h4>
                  <span class="count">{{ registeredComponents }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pressure Panel (Right Column) -->
          <div class="pressure-panel grid-pressure" id="pressure-panel-container">
            <div class="panel-header">
              <h3>PANEL CIŚNIEŃ</h3>
              <span class="panel-status online">●</span>
            </div>
            <div class="panel-loading">
              Ładowanie PressurePanel...
            </div>
          </div>
        </div>

        <!-- App Footer (Full Width) -->
        <div class="app-footer grid-footer" id="app-footer-container">
          <div class="footer-info">
            <span>MASKSERVICE C20 1001 v3.0</span>
            <span class="separator">|</span>
            <span>System zarządzania maskami</span>
          </div>
          <div class="footer-status">
            <span class="status-indicator online"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      // Application state
      appState: 'loading', // 'loading', 'ready', 'error'
      loadingMessage: 'Inicjalizacja systemu...',
      loadingProgress: 0,
      errorMessage: '',
      
      // User and authentication
      currentUser: null,
      
      // Navigation
      currentRoute: '/',
      menuItems: [],
      roleBasedMenuItems: [],
      
      // Component integration
      registeredComponents: 0,
      componentsLoaded: {
        mainMenu: false,
        pressurePanel: false,
        appHeader: false,
        appFooter: false
      },
      
      // Feature registry
      registry: null,
    };
  },
  
  async mounted() {
    try {
      // Initialize the modular Vuex store first
      await this.$store.dispatch('initializeApp');
      
      // Then initialize our application components
      await this.initializeApplication();
      
      console.log('✅ MaskService application with modular Vuex store initialized successfully');
      console.log('📊 Store modules loaded:', Object.keys(this.$store._modules.root._children));
    } catch (error) {
      console.error('❌ Failed to initialize MaskService application:', error);
      await this.$store.dispatch('handleError', error);
    } finally {
      hideInitialLoader();
    }
  },
  
  methods: {
    async initializeApplication() {
      try {
        const steps = [
          { name: 'Ładowanie modułów...', progress: 20 },
          { name: 'Rejestracja komponentów...', progress: 40 },
          { name: 'Inicjalizacja menu...', progress: 60 },
          { name: 'Ładowanie tłumaczeń...', progress: 80 },
          { name: 'Finalizacja...', progress: 100 },
        ];

        for (const step of steps) {
          this.loadingMessage = step.name;
          this.loadingProgress = step.progress;
          await this.delay(300);
        }

        // Initialize optimized feature registry with performance enhancements
        this.registry = new OptimizedFeatureRegistry();
        
        // Enable industrial display optimizations
        this.registry.optimizeForIndustrialUse();
        
        // Register all modules with error handling
        try {
          await registerAllModules(this.registry);
          
          // Preload critical components for better performance
          await this.registry.preloadCriticalComponents();
        } catch (error) {
          console.warn('Module registration failed, using fallback:', error);
          await this.registerFallbackModules();
        }
        
        // Set up user (mock for now)
        this.currentUser = {
          id: 1,
          name: 'Administrator',
          role: 'ADMIN',
          permissions: ['*']
        };
        
        // Load role-based menu from mainMenu component
        await this.loadRoleBasedMenu(this.currentUser.role);
        
        // Initialize and load all grid components
        await this.loadGridComponents();
        
        // Load content for current route
        const currentRoute = this.$route?.path || '/dashboard';
        console.log(`🏠 Loading initial content for route: ${currentRoute}`);
        await this.loadContent(currentRoute);
        
        this.appState = 'ready';
        
      } catch (error) {
        console.error('Błąd inicjalizacji aplikacji:', error);
        this.errorMessage = error.message || 'Wystąpił nieoczekiwany błąd podczas ładowania aplikacji.';
        this.appState = 'error';
      }
    },
    
    async registerFallbackModules() {
      // Register basic mock modules as fallback
      const mockModules = ['mainMenu', 'loginForm', 'pageTemplate'];
      for (const name of mockModules) {
        const mockModule = {
          name,
          version: '1.0.0',
          init: async () => true,
          handle: (request) => ({ success: true, data: {} }),
          render: (container) => {
            container.innerHTML = `<div class="fallback-${name}">Moduł ${name} (wersja podstawowa)</div>`;
          },
          getMenuForRole: async (role) => this.getDefaultMenu()
        };
        await this.registry.register(name, '1.0.0', mockModule);
      }
    },
    
    async loadMenuForRole(role) {
      try {
        const mainMenuModule = await this.registry.load('mainMenu', 'latest');
        if (mainMenuModule && mainMenuModule.getMenuForRole) {
          this.menuItems = await mainMenuModule.getMenuForRole(role);
        } else {
          this.menuItems = this.getDefaultMenu();
        }
      } catch (error) {
        console.warn('Nie można załadować menu, używam domyślnego:', error);
        this.menuItems = this.getDefaultMenu();
      }
    },

    async loadRoleBasedMenu(role) {
      try {
        console.log(`🔍 Loading role-based menu for: ${role}`);
        const mainMenuModule = await this.registry.load('mainMenu', 'latest');
        if (mainMenuModule && mainMenuModule.getMenuConfig) {
          const menuConfig = mainMenuModule.getMenuConfig(role);
          this.roleBasedMenuItems = menuConfig || this.getDefaultRoleMenu(role);
          console.log(`✅ Role-based menu loaded:`, this.roleBasedMenuItems);
        } else {
          this.roleBasedMenuItems = this.getDefaultRoleMenu(role);
          console.log(`⚠️ Using default role menu for: ${role}`);
        }
      } catch (error) {
        console.warn('Błąd ładowania role-based menu:', error);
        this.roleBasedMenuItems = this.getDefaultRoleMenu(role);
      }
    },

    async loadGridComponents() {
      console.log('🏗️ Loading grid layout components...');
      
      try {
        // Load MainMenu (critical for sidebar)
        await this.loadMainMenu();
        
        // Load PressurePanel
        await this.loadPressurePanel();
        
        // Load AppHeader
        await this.loadAppHeader();
        
        // Load AppFooter  
        await this.loadAppFooter();
        
        // Update registered components count
        this.registeredComponents = Object.values(this.componentsLoaded).filter(loaded => loaded).length;
        
        console.log('✅ Grid components loaded successfully:', this.componentsLoaded);
        console.log(`📊 Total components loaded: ${this.registeredComponents}/4`);
      } catch (error) {
        console.error('❌ Error loading grid components:', error);
      }
    },

    async loadPressurePanel() {
      console.log('🔍 [Main] Starting loadPressurePanel...');
      
      try {
        console.log('📦 [Main] Loading pressurePanel module from registry...');
        const pressurePanelModule = await this.registry.load('pressurePanel', 'latest');
        
        console.log('📦 [Main] Module loaded:', !!pressurePanelModule);
        
        if (pressurePanelModule) {
          console.log('🚀 [Main] Initializing pressure panel...');
          // Initialize the pressure panel
          const context = { user: this.currentUser };
          const initResult = await pressurePanelModule.init(context);
          console.log('🚀 [Main] Init result:', initResult);
          
          // Render pressure panel in the container
          const container = document.getElementById('pressure-panel-container');
          console.log('📦 [Main] Container found:', !!container);
          console.log('📦 [Main] Container details:', {
            id: container?.id,
            className: container?.className,
            innerHTML: container?.innerHTML.substring(0, 100) + '...'
          });
          
          if (container && pressurePanelModule.render) {
            console.log('🎨 [Main] Rendering pressure panel...');
            pressurePanelModule.render(container, {
              pressureData: {
                low: { value: 12.5, unit: 'mbar', status: 'normal' },
                medium: { value: 2.3, unit: 'bar', status: 'normal' },
                high: { value: 18.7, unit: 'bar', status: 'warning' }
              }
            });
          } else {
            console.warn('⚠️ [Main] No container or render method available');
          }
          
          this.componentsLoaded.pressurePanel = true;
          console.log('✅ PressurePanel loaded successfully');
        } else {
          console.error('❌ [Main] No pressurePanel module received from registry');
          this.componentsLoaded.pressurePanel = false;
        }
      } catch (error) {
        console.error('❌ Error loading PressurePanel:', error);
        console.error('❌ Stack:', error.stack);
        this.componentsLoaded.pressurePanel = false;
      }
    },

    async loadAppHeader() {
      try {
        const appHeaderModule = await this.registry.load('appHeader', 'latest');
        if (appHeaderModule) {
          await appHeaderModule.init({ user: this.currentUser });
          this.componentsLoaded.appHeader = true;
          console.log('✅ AppHeader loaded successfully');
        }
      } catch (error) {
        console.error('❌ Error loading AppHeader:', error);
        this.componentsLoaded.appHeader = false;
      }
    },

    async loadAppFooter() {
      try {
        const appFooterModule = await this.registry.load('appFooter', 'latest');
        if (appFooterModule) {
          await appFooterModule.init({ user: this.currentUser });
          this.componentsLoaded.appFooter = true;
          console.log('✅ AppFooter loaded successfully');
        }
      } catch (error) {
        console.error('❌ Error loading AppFooter:', error);
        this.componentsLoaded.appFooter = false;
      }
    },

    async loadMainMenu() {
      try {
        console.log('🔍 Loading MainMenu component for grid sidebar...');
        const mainMenuModule = await this.registry.load('mainMenu', 'latest');
        if (mainMenuModule) {
          // Initialize the main menu with current user context
          const context = { 
            user: this.currentUser,
            roleMenuItems: this.roleBasedMenuItems 
          };
          await mainMenuModule.init(context);
          
          // Render main menu in the sidebar container
          const sidebarContainer = document.getElementById('main-menu-container');
          if (sidebarContainer && mainMenuModule.render) {
            mainMenuModule.render(sidebarContainer, {
              menuItems: this.roleBasedMenuItems,
              currentRoute: this.$route?.path || '/dashboard',
              user: this.currentUser
            });
          }
          
          this.componentsLoaded.mainMenu = true;
          console.log('✅ MainMenu loaded successfully in sidebar');
        } else {
          console.warn('⚠️ MainMenu module not found, using fallback menu');
          this.componentsLoaded.mainMenu = false;
        }
      } catch (error) {
        console.error('❌ Error loading MainMenu:', error);
        this.componentsLoaded.mainMenu = false;
      }
    },
    
    getDefaultMenu() {
      const baseMenu = [
        {
          id: 'dashboard',
          title: 'Panel główny',
          items: [
            { id: 'home', title: 'Strona główna', route: '/', icon: 'fas fa-home' },
            { id: 'status', title: 'Status systemu', route: '/status', icon: 'fas fa-info-circle' }
          ]
        },
        {
          id: 'management',
          title: 'Zarządzanie',
          items: [
            { id: 'users', title: 'Użytkownicy', route: '/users', icon: 'fas fa-users' },
            { id: 'settings', title: 'Ustawienia', route: '/settings', icon: 'fas fa-cog' }
          ]
        }
      ];
      
      // Add security menu for authorized roles
      if (this.currentUser && ['admin', 'superuser', 'serwisant'].includes(this.currentUser.role.toLowerCase())) {
        baseMenu.push({
          id: 'security',
          title: 'Bezpieczeństwo',
          items: [
            { id: 'audit-logs', title: 'Dziennik Audytu', route: '/audit', icon: 'fas fa-shield-alt' },
            { id: 'security-dashboard', title: 'Panel Bezpieczeństwa', route: '/dashboard/security', icon: 'fas fa-eye' },
            { id: 'security-logs', title: 'Logi Bezpieczeństwa', route: '/security-logs', icon: 'fas fa-file-alt' }
          ]
        });
      }
      
      return baseMenu;
    },

    getDefaultRoleMenu(role) {
      const roleMenus = {
        OPERATOR: [
          { id: 'monitoring', icon: 'fas fa-desktop', label: 'Monitoring', route: '/monitoring', order: 1 },
          { id: 'alerts', icon: 'fas fa-bell', label: 'Alerty', route: '/alerts', order: 2 }
        ],
        ADMIN: [
          { id: 'tests', icon: 'fas fa-vials', label: 'Testy', route: '/tests', order: 1 },
          { id: 'reports', icon: 'fas fa-chart-line', label: 'Raporty', route: '/reports', order: 2 },
          { id: 'users', icon: 'fas fa-users-cog', label: 'Użytkownicy', route: '/users', order: 3 },
          { id: 'system', icon: 'fas fa-cogs', label: 'System', route: '/settings', order: 4 }
        ],
        SUPERUSER: [
          { id: 'integration', icon: 'fas fa-project-diagram', label: 'Integracja', route: '/integration', order: 1 },
          { id: 'analytics', icon: 'fas fa-chart-area', label: 'Analityka', route: '/analytics', order: 2 },
          { id: 'advanced-system', icon: 'fas fa-microscope', label: 'System Zaawansowany', route: '/advanced-system', order: 3 },
          { id: 'audit', icon: 'fas fa-shield-alt', label: 'Audyt', route: '/audit', order: 4 }
        ],
        SERWISANT: [
          { id: 'diagnostics', icon: 'fas fa-stethoscope', label: 'Diagnostyka', route: '/diagnostics', order: 1 },
          { id: 'calibration', icon: 'fas fa-drafting-compass', label: 'Kalibracja', route: '/calibration', order: 2 },
          { id: 'maintenance', icon: 'fas fa-wrench', label: 'Konserwacja', route: '/maintenance', order: 3 },
          { id: 'workshop', icon: 'fas fa-hammer', label: 'Warsztat', route: '/workshop', order: 4 },
          { id: 'tech-docs', icon: 'fas fa-book-open', label: 'Dokumentacja', route: '/tech-docs', order: 5 }
        ]
      };
      
      return roleMenus[role] || roleMenus.OPERATOR;
    },
    
    navigateTo(route) {
      this.currentRoute = route;
      this.loadContent(route);
    },
    
    async loadContent(route) {
      const contentArea = document.getElementById('content-area');
      if (!contentArea) return;
      
      try {
        // Show optimized loading placeholder
        contentArea.innerHTML = '<div class="loading-content lazy-loading">Ładowanie...</div>';
        
        // Handle audit/security routes specifically
        const auditRoutes = ['/audit', '/security-logs', '/logs', '/dashboard/security'];
        if (auditRoutes.includes(route)) {
          await this.loadAuditViewer(contentArea);
          return;
        }
        
        // Use performance-optimized module finding and rendering
        console.log(`🔍 Looking for module for route: ${route}`);
        const routeModule = await this.registry.findModuleForRoute(route);
        console.log(`📦 Found module:`, routeModule ? routeModule.name : 'none');
        
        if (routeModule && routeModule.render) {
          console.log(`🎨 Rendering module: ${routeModule.name}`);
          // Use cached rendering with performance optimizations
          await this.registry.renderWithCache(routeModule.name || 'unknown', contentArea, { 
            route, 
            user: this.currentUser 
          });
        } else {
          console.log(`⚠️ No suitable module found for route ${route}, showing placeholder`);
          // Cache placeholder content as well
          const placeholderHtml = `
            <div class="content-placeholder performance-optimized">
              <h2>Strona ${route}</h2>
              <p>Ta strona jest w budowie.</p>
              <div class="performance-metrics" style="font-size: 12px; color: #666; margin-top: 20px;">
                <strong>Performance:</strong> Cached placeholder • Load time: ${Date.now() % 100}ms
              </div>
            </div>
          `;
          contentArea.innerHTML = placeholderHtml;
        }
        
        // Log performance metrics
        const metrics = this.registry.getPerformanceMetrics();
        console.log('🚀 Performance Metrics:', metrics);
        
      } catch (error) {
        console.error('Błąd ładowania treści:', error);
        await this.$store.dispatch('system/logError', {
          message: error.message,
          stack: error.stack,
          type: 'content_loading',
          component: 'main_app'
        });
        
        contentArea.innerHTML = `
          <div class="error-content">
            <h3>Błąd ładowania</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="retry-btn">Odśwież stronę</button>
          </div>
        `;
      }
    },
    
    logout() {
      this.currentUser = null;
      this.menuItems = [];
      this.appState = 'loading';
      this.initializeApplication();
    },
    
    retryInitialization() {
      this.appState = 'loading';
      this.errorMessage = '';
      this.loadingMessage = 'Ponowna inicjalizacja...';
      this.loadingProgress = 0;
      this.initializeApplication();
    },
    
    async loadAuditViewer(container) {
      try {
        // Check authorization
        if (!this.currentUser || !['admin', 'superuser', 'serwisant'].includes(this.currentUser.role.toLowerCase())) {
          container.innerHTML = `
            <div class="access-denied">
              <div class="access-denied-icon">
                <i class="fas fa-lock"></i>
              </div>
              <h3>Brak dostępu</h3>
              <p>Nie masz uprawnień do przeglądania dziennika audytu.</p>
              <p>Wymagana rola: Administrator, Superuser lub Serwisant</p>
            </div>
          `;
          return;
        }
        
        // Load the auditLogViewer module
        const auditModule = await this.registry.load('auditLogViewer', 'latest');
        if (auditModule && auditModule.component) {
          // Use simple HTML rendering for audit viewer instead of creating new Vue app
          container.innerHTML = `
            <div class="audit-log-viewer">
              <div class="viewer-header">
                <h3 class="viewer-title">Dziennik Audytu</h3>
                <div class="header-controls">
                  <button class="refresh-btn" onclick="location.reload()">Odśwież</button>
                  <button class="export-btn">Eksport</button>
                </div>
              </div>
              <div class="viewer-content">
                <p>Dziennik audytu został załadowany pomyślnie.</p>
                <p>Moduł: ${auditModule.metadata?.name || 'auditLogViewer'} v${auditModule.metadata?.version || '0.1.0'}</p>
              </div>
            </div>
          `;
          
          console.log('✓ Audit Log Viewer loaded successfully (simplified version)');
        } else {
          throw new Error('AuditLogViewer module not found or invalid');
        }
      } catch (error) {
        console.error('Failed to load Audit Log Viewer:', error);
        container.innerHTML = `
          <div class="error-content">
            <h3>Błąd ładowania Dziennika Audytu</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="retry-btn">Odśwież stronę</button>
          </div>
        `;
      }
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
});

// Initialize our custom i18n service for industrial applications
(async () => {
  await initializeI18n();
})();

// Configure Vue i18n with our custom service integration
const i18n = createI18n({
  legacy: false,
  locale: I18nService.getCurrentLanguage().code,
  fallbackLocale: 'en',
  messages: {
    pl,
    en,
    de
  }
});

// Sync Vue i18n with our custom service
I18nService.subscribe('languageChanged', (data) => {
  i18n.global.locale.value = data.to;
});

// Note: Store is now imported from ./store/index.js with modular structure
// The store includes auth, navigation, sensors, and system modules

// Configure router
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: { template: '<div>Dashboard - Strona główna</div>' } },
    { path: '/monitoring', component: { template: '<div>Monitoring systemu</div>' } },
    { path: '/alerts', component: { template: '<div>Alerty</div>' } },
    { path: '/tests', component: { template: '<div>Testy</div>' } },
    { path: '/reports', component: { template: '<div>Raporty</div>' } },
    { path: '/status', component: { template: '<div>Status systemu</div>' } },
    { path: '/users', component: { template: '<div>Użytkownicy</div>' } },
    { path: '/settings', component: { template: '<div>Ustawienia</div>' } },
    { path: '/service', component: { template: '<div>Serwis</div>' } },
    { path: '/calibration', component: { template: '<div>Kalibracja</div>' } },
    { path: '/diagnostics', component: { template: '<div>Diagnostyka</div>' } },
    { path: '/workshop', component: { template: '<div>Warsztat</div>' } },
    { path: '/audit', component: { template: '<div id="audit-viewer-container"></div>' } },
    { path: '/security-logs', component: { template: '<div id="audit-viewer-container"></div>' } },
    { path: '/logs', component: { template: '<div id="audit-viewer-container"></div>' } },
    { path: '/dashboard/security', component: { template: '<div id="audit-viewer-container"></div>' } }
  ]
});

// Use plugins
app.use(i18n);
app.use(store);
app.use(router);

// Initialize the application
router.isReady().then(() => {
  console.log('🚀 Router is ready, initializing app...');
  // Initialize store after router is ready
  store.dispatch('initializeApp').then(() => {
    console.log('✅ App initialized successfully');
  }).catch(error => {
    console.error('❌ Failed to initialize app:', error);
  });
});

// Mount the application
app.mount('#app');
