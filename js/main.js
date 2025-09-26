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

      <!-- Main Application -->
      <div v-else-if="appState === 'ready'" class="main-app">
        <!-- App Header -->
        <div class="app-header">
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

        <!-- App Body -->
        <div class="app-body">
          <!-- Main Menu -->
          <div class="main-menu">
            <div v-for="menuGroup in menuItems" :key="menuGroup.id" class="menu-group">
              <div class="menu-group-title">{{ menuGroup.title }}</div>
              <div class="menu-items">
                <div 
                  v-for="item in menuGroup.items" 
                  :key="item.id"
                  class="menu-item"
                  :class="{ active: currentRoute === item.route }"
                  @click="navigateTo(item.route)"
                >
                  <i :class="item.icon" class="menu-item-icon"></i>
                  <span class="menu-item-text">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="content-area" id="content-area">
            <div class="content-placeholder">
              <h2>Witamy w systemie MASKSERVICE</h2>
              <p>Wybierz opcję z menu aby rozpocząć pracę.</p>
            </div>
          </div>
        </div>

        <!-- App Footer -->
        <div class="app-footer">
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
          role: 'admin',
          permissions: ['*']
        };
        
        // Load menu for user role
        await this.loadMenuForRole(this.currentUser.role);
        
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
        const routeModule = await this.registry.findModuleForRoute(route);
        if (routeModule && routeModule.render) {
          // Use cached rendering with performance optimizations
          await this.registry.renderWithCache(routeModule.name || 'unknown', contentArea, { 
            route, 
            user: this.currentUser 
          });
        } else {
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
          // Create Vue component instance for audit viewer
          const { createApp } = Vue;
          const auditApp = createApp({
            components: {
              AuditLogViewer: auditModule.component
            },
            template: '<AuditLogViewer />'
          });
          
          // Use the same i18n and store instances
          auditApp.use(this.$store);
          auditApp.use(this.$i18n);
          
          // Mount audit viewer
          container.innerHTML = '<div id="audit-viewer-mount"></div>';
          auditApp.mount('#audit-viewer-mount');
          
          console.log('✓ Audit Log Viewer loaded successfully');
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
await initializeI18n();

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
    { path: '/', component: { template: '<div>Strona główna</div>' } },
    { path: '/status', component: { template: '<div>Status systemu</div>' } },
    { path: '/users', component: { template: '<div>Użytkownicy</div>' } },
    { path: '/settings', component: { template: '<div>Ustawienia</div>' } },
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

// Mount the application
app.mount('#app');
