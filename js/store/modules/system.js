// System Module for Vuex Store
// Handles device status, system information, language settings, and global configuration

const systemModule = {
  namespaced: true,
  
  state: {
    deviceStatus: 'OFFLINE',
    connectionInfo: {
      lastPing: null,
      latency: null,
      quality: 'unknown',
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    },
    language: 'pl',
    availableLanguages: ['pl', 'en', 'de'],
    systemInfo: {
      version: '3.0.0',
      buildNumber: '2025.001',
      buildDate: '2025-01-26',
      environment: 'development',
      uptime: 0,
      startTime: null
    },
    deviceInfo: {
      name: 'CONNECT',
      type: '500',
      model: 'C20',
      url: 'c201001.mask.services',
      serialNumber: null,
      firmwareVersion: null
    },
    networkStatus: {
      isOnline: navigator.onLine,
      connectionType: 'unknown',
      bandwidth: null,
      lastSpeedTest: null
    },
    performance: {
      memoryUsage: null,
      cpuUsage: null,
      frameRate: null,
      loadTime: null
    },
    errorLog: [],
    maxErrorLogSize: 100,
    debugMode: false,
    maintenanceMode: false,
    notifications: {
      enabled: true,
      sound: false,
      position: 'top-right'
    },
    theme: {
      mode: 'light', // 'light', 'dark', 'auto'
      primaryColor: '#3498db',
      contrast: 'normal' // 'normal', 'high'
    }
  },
  
  getters: {
    isOnline: (state) => state.deviceStatus === 'ONLINE',
    isOffline: (state) => state.deviceStatus === 'OFFLINE',
    isConnecting: (state) => state.deviceStatus === 'CONNECTING',
    currentLanguage: (state) => state.language,
    systemVersion: (state) => state.systemInfo.version,
    deviceName: (state) => state.deviceInfo.name,
    isDebugMode: (state) => state.debugMode,
    isMaintenanceMode: (state) => state.maintenanceMode,
    connectionQuality: (state) => state.connectionInfo.quality,
    systemUptime: (state) => {
      if (!state.systemInfo.startTime) return 0;
      return Date.now() - state.systemInfo.startTime;
    },
    recentErrors: (state) => (limit = 10) => {
      return state.errorLog.slice(-limit).reverse();
    },
    networkInfo: (state) => ({
      isOnline: state.networkStatus.isOnline,
      connectionType: state.networkStatus.connectionType,
      bandwidth: state.networkStatus.bandwidth
    }),
    performanceMetrics: (state) => state.performance,
    notificationSettings: (state) => state.notifications,
    themeSettings: (state) => state.theme
  },
  
  mutations: {
    SET_DEVICE_STATUS(state, status) {
      state.deviceStatus = status;
    },
    
    UPDATE_CONNECTION_INFO(state, connectionInfo) {
      state.connectionInfo = { ...state.connectionInfo, ...connectionInfo };
    },
    
    SET_LANGUAGE(state, language) {
      if (state.availableLanguages.includes(language)) {
        state.language = language;
      }
    },
    
    UPDATE_SYSTEM_INFO(state, systemInfo) {
      state.systemInfo = { ...state.systemInfo, ...systemInfo };
    },
    
    UPDATE_DEVICE_INFO(state, deviceInfo) {
      state.deviceInfo = { ...state.deviceInfo, ...deviceInfo };
    },
    
    SET_NETWORK_STATUS(state, networkStatus) {
      state.networkStatus = { ...state.networkStatus, ...networkStatus };
    },
    
    UPDATE_PERFORMANCE(state, performance) {
      state.performance = { ...state.performance, ...performance };
    },
    
    ADD_ERROR_LOG(state, error) {
      const errorEntry = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        stack: error.stack,
        type: error.type || 'error',
        component: error.component,
        userAgent: navigator.userAgent
      };
      
      state.errorLog.push(errorEntry);
      
      // Limit log size
      if (state.errorLog.length > state.maxErrorLogSize) {
        state.errorLog = state.errorLog.slice(-state.maxErrorLogSize);
      }
    },
    
    CLEAR_ERROR_LOG(state) {
      state.errorLog = [];
    },
    
    SET_DEBUG_MODE(state, enabled) {
      state.debugMode = enabled;
    },
    
    SET_MAINTENANCE_MODE(state, enabled) {
      state.maintenanceMode = enabled;
    },
    
    UPDATE_NOTIFICATIONS(state, notifications) {
      state.notifications = { ...state.notifications, ...notifications };
    },
    
    UPDATE_THEME(state, theme) {
      state.theme = { ...state.theme, ...theme };
    },
    
    INCREMENT_RECONNECT_ATTEMPTS(state) {
      state.connectionInfo.reconnectAttempts++;
    },
    
    RESET_RECONNECT_ATTEMPTS(state) {
      state.connectionInfo.reconnectAttempts = 0;
    },
    
    SET_SYSTEM_START_TIME(state, startTime) {
      state.systemInfo.startTime = startTime || Date.now();
    }
  },
  
  actions: {
    async updateDeviceStatus({ commit, state }, status) {
      const previousStatus = state.deviceStatus;
      commit('SET_DEVICE_STATUS', status);
      
      // Log status change
      if (previousStatus !== status) {
        console.log(`Device status changed: ${previousStatus} -> ${status}`);
        
        // Reset reconnect attempts on successful connection
        if (status === 'ONLINE') {
          commit('RESET_RECONNECT_ATTEMPTS');
        }
      }
      
      return status;
    },
    
    async testConnection({ commit, state }) {
      commit('SET_DEVICE_STATUS', 'CONNECTING');
      
      try {
        const startTime = Date.now();
        
        // Mock connection test - replace with real implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const latency = Date.now() - startTime;
        const quality = latency < 100 ? 'excellent' : 
                       latency < 300 ? 'good' : 
                       latency < 1000 ? 'fair' : 'poor';
        
        commit('UPDATE_CONNECTION_INFO', {
          lastPing: Date.now(),
          latency,
          quality
        });
        
        commit('SET_DEVICE_STATUS', 'ONLINE');
        return true;
      } catch (error) {
        commit('SET_DEVICE_STATUS', 'OFFLINE');
        commit('INCREMENT_RECONNECT_ATTEMPTS');
        throw error;
      }
    },
    
    changeLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language);
      
      // Persist to localStorage
      try {
        localStorage.setItem('maskservice_language', language);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    },
    
    loadLanguageFromStorage({ commit }) {
      try {
        const savedLanguage = localStorage.getItem('maskservice_language');
        if (savedLanguage) {
          commit('SET_LANGUAGE', savedLanguage);
        }
      } catch (error) {
        console.warn('Could not load language preference:', error);
      }
    },
    
    updateSystemInfo({ commit }, systemInfo) {
      commit('UPDATE_SYSTEM_INFO', systemInfo);
    },
    
    updateDeviceInfo({ commit }, deviceInfo) {
      commit('UPDATE_DEVICE_INFO', deviceInfo);
    },
    
    logError({ commit, state }, error) {
      commit('ADD_ERROR_LOG', error);
      
      // In debug mode, also log to console
      if (state.debugMode) {
        console.error('System Error:', error);
      }
    },
    
    clearErrorLog({ commit }) {
      commit('CLEAR_ERROR_LOG');
    },
    
    setDebugMode({ commit }, enabled) {
      commit('SET_DEBUG_MODE', enabled);
    },
    
    setMaintenanceMode({ commit }, enabled) {
      commit('SET_MAINTENANCE_MODE', enabled);
    },
    
    updateNotificationSettings({ commit }, notifications) {
      commit('UPDATE_NOTIFICATIONS', notifications);
    },
    
    updateThemeSettings({ commit }, theme) {
      commit('UPDATE_THEME', theme);
    },
    
    async measurePerformance({ commit }) {
      const performance = {};
      
      // Memory usage (if available)
      if ('memory' in performance) {
        performance.memoryUsage = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      
      // Frame rate measurement
      let frameCount = 0;
      const startTime = Date.now();
      
      const measureFrames = () => {
        frameCount++;
        if (Date.now() - startTime < 1000) {
          requestAnimationFrame(measureFrames);
        } else {
          performance.frameRate = frameCount;
          commit('UPDATE_PERFORMANCE', performance);
        }
      };
      
      requestAnimationFrame(measureFrames);
    },
    
    initializeSystem({ commit, dispatch }) {
      commit('SET_SYSTEM_START_TIME');
      
      // Load saved preferences
      dispatch('loadLanguageFromStorage');
      
      // Set up network status monitoring
      window.addEventListener('online', () => {
        commit('SET_NETWORK_STATUS', { isOnline: true });
      });
      
      window.addEventListener('offline', () => {
        commit('SET_NETWORK_STATUS', { isOnline: false });
      });
      
      // Set up periodic performance monitoring
      setInterval(() => {
        dispatch('measurePerformance');
      }, 10000); // Every 10 seconds
    }
  }
};

export default systemModule;
