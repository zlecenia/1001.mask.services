// Sensors Module for Vuex Store
// Handles real-time sensor data, pressure monitoring, and alert management

const sensorsModule = {
  namespaced: true,
  
  state: {
    pressure1: { 
      value: 0, 
      status: 'unknown',
      lastUpdate: null,
      trend: 'stable',
      unit: 'bar',
      min: 0,
      max: 10
    },
    pressure2: { 
      value: 0, 
      status: 'unknown',
      lastUpdate: null,
      trend: 'stable',
      unit: 'bar',
      min: 0,
      max: 5
    },
    pressure3: { 
      value: 0, 
      status: 'unknown',
      lastUpdate: null,
      trend: 'stable',
      unit: 'mbar',
      min: 0,
      max: 1000
    },
    connectionStatus: 'disconnected',
    lastDataUpdate: null,
    alerts: [],
    alertHistory: [],
    maxAlertHistory: 100,
    thresholds: {
      pressure1: {
        normal: { min: 2, max: 8 },
        warning: { min: 1.5, max: 9 },
        critical: { min: 0, max: 10 }
      },
      pressure2: {
        normal: { min: 1, max: 4 },
        warning: { min: 0.5, max: 4.5 },
        critical: { min: 0, max: 5 }
      },
      pressure3: {
        normal: { min: 200, max: 800 },
        warning: { min: 100, max: 900 },
        critical: { min: 0, max: 1000 }
      }
    },
    dataHistory: {
      pressure1: [],
      pressure2: [],
      pressure3: []
    },
    maxDataPoints: 1000,
    updateInterval: 1000,
    autoRefresh: true
  },
  
  getters: {
    getAllSensors: (state) => ({
      pressure1: state.pressure1,
      pressure2: state.pressure2,
      pressure3: state.pressure3
    }),
    
    getSensorByKey: (state) => (key) => state[key],
    
    isConnected: (state) => state.connectionStatus === 'connected',
    
    hasActiveAlerts: (state) => state.alerts.length > 0,
    
    criticalAlerts: (state) => state.alerts.filter(alert => alert.level === 'critical'),
    
    warningAlerts: (state) => state.alerts.filter(alert => alert.level === 'warning'),
    
    getSensorStatus: (state) => (sensorKey) => {
      const sensor = state[sensorKey];
      const thresholds = state.thresholds[sensorKey];
      
      if (!sensor || !thresholds) return 'unknown';
      
      const value = sensor.value;
      
      if (value < thresholds.critical.min || value > thresholds.critical.max) {
        return 'critical';
      } else if (value < thresholds.warning.min || value > thresholds.warning.max) {
        return 'warning';
      } else if (value >= thresholds.normal.min && value <= thresholds.normal.max) {
        return 'normal';
      }
      
      return 'unknown';
    },
    
    getSensorTrend: (state) => (sensorKey) => {
      const history = state.dataHistory[sensorKey];
      if (!history || history.length < 2) return 'stable';
      
      const recent = history.slice(-5); // Last 5 readings
      const trend = recent.reduce((acc, reading, index) => {
        if (index === 0) return acc;
        return acc + (reading.value - recent[index - 1].value);
      }, 0);
      
      if (trend > 0.1) return 'rising';
      if (trend < -0.1) return 'falling';
      return 'stable';
    },
    
    getDataHistory: (state) => (sensorKey, limit = 100) => {
      const history = state.dataHistory[sensorKey] || [];
      return history.slice(-limit);
    }
  },
  
  mutations: {
    UPDATE_SENSOR_VALUE(state, { sensor, value, timestamp }) {
      if (state[sensor]) {
        state[sensor].value = value;
        state[sensor].lastUpdate = timestamp || Date.now();
        state.lastDataUpdate = timestamp || Date.now();
        
        // Add to data history
        if (!state.dataHistory[sensor]) {
          state.dataHistory[sensor] = [];
        }
        
        state.dataHistory[sensor].push({
          value,
          timestamp: timestamp || Date.now()
        });
        
        // Limit history size
        if (state.dataHistory[sensor].length > state.maxDataPoints) {
          state.dataHistory[sensor] = state.dataHistory[sensor].slice(-state.maxDataPoints);
        }
      }
    },
    
    UPDATE_SENSOR_STATUS(state, { sensor, status }) {
      if (state[sensor]) {
        state[sensor].status = status;
      }
    },
    
    UPDATE_SENSOR_TREND(state, { sensor, trend }) {
      if (state[sensor]) {
        state[sensor].trend = trend;
      }
    },
    
    SET_CONNECTION_STATUS(state, status) {
      state.connectionStatus = status;
    },
    
    ADD_ALERT(state, alert) {
      const alertWithId = {
        ...alert,
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        acknowledged: false
      };
      
      state.alerts.push(alertWithId);
      state.alertHistory.push(alertWithId);
      
      // Limit alert history
      if (state.alertHistory.length > state.maxAlertHistory) {
        state.alertHistory = state.alertHistory.slice(-state.maxAlertHistory);
      }
    },
    
    ACKNOWLEDGE_ALERT(state, alertId) {
      const alert = state.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = Date.now();
      }
    },
    
    REMOVE_ALERT(state, alertId) {
      state.alerts = state.alerts.filter(alert => alert.id !== alertId);
    },
    
    CLEAR_ALERTS(state) {
      state.alerts = [];
    },
    
    UPDATE_THRESHOLDS(state, { sensor, thresholds }) {
      if (state.thresholds[sensor]) {
        state.thresholds[sensor] = { ...state.thresholds[sensor], ...thresholds };
      }
    },
    
    SET_AUTO_REFRESH(state, enabled) {
      state.autoRefresh = enabled;
    },
    
    SET_UPDATE_INTERVAL(state, interval) {
      state.updateInterval = interval;
    },
    
    CLEAR_SENSOR_HISTORY(state, sensor) {
      if (sensor) {
        state.dataHistory[sensor] = [];
      } else {
        state.dataHistory = {
          pressure1: [],
          pressure2: [],
          pressure3: []
        };
      }
    }
  },
  
  actions: {
    updateSensorData({ commit, getters }, { sensor, value, timestamp }) {
      commit('UPDATE_SENSOR_VALUE', { sensor, value, timestamp });
      
      // Calculate and update status
      const status = getters.getSensorStatus(sensor);
      commit('UPDATE_SENSOR_STATUS', { sensor, status });
      
      // Calculate and update trend
      const trend = getters.getSensorTrend(sensor);
      commit('UPDATE_SENSOR_TREND', { sensor, trend });
      
      // Check for alerts
      this.dispatch('sensors/checkAlerts', { sensor, value, status });
    },
    
    checkAlerts({ commit, state }, { sensor, value, status }) {
      const currentTime = Date.now();
      
      // Remove existing alerts for this sensor if status improved
      if (status === 'normal') {
        const existingAlerts = state.alerts.filter(alert => 
          alert.sensor === sensor && (alert.level === 'warning' || alert.level === 'critical')
        );
        existingAlerts.forEach(alert => {
          commit('REMOVE_ALERT', alert.id);
        });
      }
      
      // Add new alerts for critical/warning conditions
      if (status === 'critical' || status === 'warning') {
        const existingAlert = state.alerts.find(alert => 
          alert.sensor === sensor && alert.level === status
        );
        
        if (!existingAlert) {
          commit('ADD_ALERT', {
            sensor,
            level: status,
            message: `${sensor.toUpperCase()} ${status}: ${value}${state[sensor].unit}`,
            value,
            requiresAcknowledgment: status === 'critical'
          });
        }
      }
    },
    
    acknowledgeAlert({ commit }, alertId) {
      commit('ACKNOWLEDGE_ALERT', alertId);
    },
    
    clearAlert({ commit }, alertId) {
      commit('REMOVE_ALERT', alertId);
    },
    
    clearAllAlerts({ commit }) {
      commit('CLEAR_ALERTS');
    },
    
    setConnectionStatus({ commit }, status) {
      commit('SET_CONNECTION_STATUS', status);
    },
    
    updateThresholds({ commit }, { sensor, thresholds }) {
      commit('UPDATE_THRESHOLDS', { sensor, thresholds });
    },
    
    setAutoRefresh({ commit }, enabled) {
      commit('SET_AUTO_REFRESH', enabled);
    },
    
    setUpdateInterval({ commit }, interval) {
      commit('SET_UPDATE_INTERVAL', interval);
    },
    
    clearSensorHistory({ commit }, sensor) {
      commit('CLEAR_SENSOR_HISTORY', sensor);
    },
    
    // Batch update for multiple sensors
    updateMultipleSensors({ dispatch }, sensorsData) {
      Object.entries(sensorsData).forEach(([sensor, data]) => {
        dispatch('updateSensorData', { sensor, ...data });
      });
    }
  }
};

export default sensorsModule;
