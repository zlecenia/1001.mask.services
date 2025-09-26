// Main Vuex Store Configuration
// Combines all modules following components.md specification

import { createStore } from 'vuex';
import authModule from './modules/auth.js';
import navigationModule from './modules/navigation.js';
import sensorsModule from './modules/sensors.js';
import systemModule from './modules/system.js';

// Root state for global application data
const rootState = {
  appVersion: '3.0.0',
  appName: 'MASKSERVICE C20 1001',
  initialized: false,
  loading: false,
  error: null
};

// Root getters
const rootGetters = {
  isInitialized: (state) => state.initialized,
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error,
  appInfo: (state) => ({
    name: state.appName,
    version: state.appVersion
  })
};

// Root mutations
const rootMutations = {
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized;
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  CLEAR_ERROR(state) {
    state.error = null;
  }
};

// Root actions
const rootActions = {
  async initializeApp({ commit, dispatch }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      // Initialize system first
      await dispatch('system/initializeSystem');
      
      // Test connection
      await dispatch('system/testConnection');
      
      // Set default route
      await dispatch('navigation/navigateTo', { 
        route: '/dashboard', 
        title: 'Dashboard' 
      });
      
      commit('SET_INITIALIZED', true);
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async handleError({ commit, dispatch }, error) {
    commit('SET_ERROR', error.message);
    
    // Log error to system module
    await dispatch('system/logError', {
      message: error.message,
      stack: error.stack,
      type: 'application',
      component: 'root'
    });
  }
};

// Create and configure the store
const store = createStore({
  state: rootState,
  getters: rootGetters,
  mutations: rootMutations,
  actions: rootActions,
  
  modules: {
    auth: authModule,
    navigation: navigationModule,
    sensors: sensorsModule,
    system: systemModule
  },
  
  // Enable strict mode in development
  strict: process.env.NODE_ENV !== 'production'
});

// Set up global error handling
store.subscribe((mutation, state) => {
  // Log all mutations in debug mode
  if (state.system?.debugMode) {
    console.log('Vuex Mutation:', mutation.type, mutation.payload);
  }
});

// Set up action error handling
store.subscribeAction({
  error: (action, state, error) => {
    console.error('Vuex Action Error:', action.type, error);
    store.dispatch('handleError', error);
  }
});

export default store;
