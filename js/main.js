import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createStore } from 'vuex';
import { createRouter, createWebHashHistory } from 'vue-router';

// Import Feature Registry
import { FeatureRegistry } from './FeatureRegistry.js';
import { registerAllModules } from './registerAllModules.js';

// Import locales
import pl from '../locales/pl.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

// Create Vue app instance
const app = createApp({
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
    await this.initializeApplication();
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

        // Initialize feature registry
        this.registry = new FeatureRegistry();
        
        // Register all modules
        await registerAllModules(this.registry);
        
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
    
    async loadMenuForRole(role) {
      try {
        const mainMenuModule = await this.registry.load('mainMenu', 'latest');
        if (mainMenuModule && mainMenuModule.getMenuForRole) {
          this.menuItems = await mainMenuModule.getMenuForRole(role);
        } else {
          // Fallback menu if mainMenu module is not available
          this.menuItems = this.getDefaultMenu();
        }
      } catch (error) {
        console.warn('Nie można załadować menu, używam domyślnego:', error);
        this.menuItems = this.getDefaultMenu();
      }
    },
    
    getDefaultMenu() {
      return [
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
    },
    
    navigateTo(route) {
      this.currentRoute = route;
      this.loadContent(route);
    },
    
    async loadContent(route) {
      const contentArea = document.getElementById('content-area');
      if (!contentArea) return;
      
      try {
        // Clear previous content
        contentArea.innerHTML = '<div class="loading-content">Ładowanie...</div>';
        
        // Find module for this route
        const routeModule = await this.registry.findModuleForRoute(route);
        if (routeModule && routeModule.render) {
          await routeModule.render(contentArea, { route, user: this.currentUser });
        } else {
          contentArea.innerHTML = `
            <div class="content-placeholder">
              <h2>Strona ${route}</h2>
              <p>Ta strona jest w budowie.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Błąd ładowania treści:', error);
        contentArea.innerHTML = `
          <div class="error-content">
            <h3>Błąd ładowania</h3>
            <p>${error.message}</p>
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
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
});

// Configure i18n
const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: {
    pl,
    en,
    de
  }
});

// Configure Vuex store
const store = createStore({
  state: {
    user: null,
    settings: {},
    modules: {}
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_SETTINGS(state, settings) {
      state.settings = settings;
    },
    REGISTER_MODULE(state, { name, module }) {
      state.modules[name] = module;
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    setSettings({ commit }, settings) {
      commit('SET_SETTINGS', settings);
    },
    registerModule({ commit }, payload) {
      commit('REGISTER_MODULE', payload);
    }
  }
});

// Configure router
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div>Strona główna</div>' } },
    { path: '/status', component: { template: '<div>Status systemu</div>' } },
    { path: '/users', component: { template: '<div>Użytkownicy</div>' } },
    { path: '/settings', component: { template: '<div>Ustawienia</div>' } }
  ]
});

// Use plugins
app.use(i18n);
app.use(store);
app.use(router);

// Mount the application
app.mount('#app');
