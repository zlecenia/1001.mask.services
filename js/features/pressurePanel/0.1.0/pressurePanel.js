// PressurePanel component for real-time sensor monitoring with 7.9" display optimization
import WebSocketService from '../../services/websocketService.js';
const template = `
<div class="pressure-panel" :class="deviceClass">
  <h3 class="panel-title">{{ $t('sensors.pressure_monitoring') || 'Monitoring Ciśnienia' }}</h3>
  
  <div class="pressure-sensors">
    <div 
      v-for="(sensor, key) in effectivePressureData" 
      :key="key"
      class="pressure-item"
      :class="getSensorStatusClass(sensor, key)"
    >
      <div class="sensor-header">
        <span class="sensor-label">{{ getSensorLabel(key) }}</span>
        <span class="sensor-status" :class="sensor.status">{{ sensor.status }}</span>
      </div>
      
      <div class="sensor-value">
        <span class="value">{{ formatSensorValue(sensor.value) }}</span>
        <span class="unit">{{ sensor.unit }}</span>
      </div>
      
      <div class="sensor-bar">
        <div 
          class="sensor-bar-fill"
          :class="sensor.status"
          :style="{ width: getSensorBarWidth(sensor, key) + '%' }"
        ></div>
      </div>
      
      <div class="sensor-thresholds">
        <span class="threshold-warning">{{ getWarningThreshold(key) }}</span>
        <span class="threshold-critical">{{ getCriticalThreshold(key) }}</span>
      </div>
    </div>
  </div>
  
  <div class="panel-footer">
    <span class="last-update">{{ $t('sensors.last_update') || 'Ostatnia aktualizacja' }}: {{ lastUpdateTime }}</span>
    <button 
      class="refresh-btn" 
      @click="refreshSensors"
      :disabled="isRefreshing"
      :aria-label="$t('sensors.refresh') || 'Odśwież sensory'"
    >
      <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
    </button>
  </div>
</div>`;

const styles = `
<style scoped>
.pressure-panel {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.panel-title {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.pressure-sensors {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pressure-item {
  flex: 1;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
}

.pressure-item.normal {
  border-color: #28a745;
}

.pressure-item.warning {
  border-color: #ffc107;
  background: #fff3cd;
}

.pressure-item.critical {
  border-color: #dc3545;
  background: #f8d7da;
  animation: pulse-critical 2s infinite;
}

.sensor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sensor-label {
  font-weight: 600;
  color: #495057;
  font-size: 12px;
  text-transform: uppercase;
}

.sensor-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.sensor-status.normal {
  background: #d4edda;
  color: #155724;
}

.sensor-status.warning {
  background: #fff3cd;
  color: #856404;
}

.sensor-status.critical {
  background: #f8d7da;
  color: #721c24;
}

.sensor-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.unit {
  font-size: 12px;
  color: #6c757d;
  font-weight: normal;
}

.sensor-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.sensor-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.sensor-bar-fill.normal {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.sensor-bar-fill.warning {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.sensor-bar-fill.critical {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.sensor-thresholds {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6c757d;
}

.threshold-warning::before {
  content: "⚠ ";
}

.threshold-critical::before {
  content: "🚨 ";
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.last-update {
  font-size: 11px;
  color: #6c757d;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pulse-critical {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(220, 53, 69, 0); }
}

/* 7.9" landscape display optimization (1280x400px) */
.landscape-7-9 {
  padding: 8px;
  font-size: 11px;
}

.landscape-7-9 .panel-title {
  font-size: 14px;
  margin-bottom: 8px;
}

.landscape-7-9 .pressure-sensors {
  gap: 8px;
  margin-bottom: 8px;
}

.landscape-7-9 .pressure-item {
  padding: 8px;
}

.landscape-7-9 .sensor-label {
  font-size: 10px;
}

.landscape-7-9 .sensor-status {
  font-size: 8px;
  padding: 1px 4px;
}

.landscape-7-9 .value {
  font-size: 18px;
}

.landscape-7-9 .unit {
  font-size: 10px;
}

.landscape-7-9 .sensor-bar {
  height: 6px;
  margin-bottom: 6px;
}

.landscape-7-9 .sensor-thresholds {
  font-size: 8px;
}

.landscape-7-9 .last-update {
  font-size: 9px;
}

.landscape-7-9 .refresh-btn {
  padding: 4px 6px;
  font-size: 11px;
}

/* Responsive for very small screens */
@media (max-width: 450px) {
  .pressure-sensors {
    flex-direction: column;
  }
  
  .panel-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>`;

export default {
  name: 'PressurePanelComponent',
  template: template + styles,
  
  props: {
    pressureData: {
      type: Object,
      default: () => ({
        low: { value: 10.5, unit: 'mbar', status: 'normal' },
        medium: { value: 2.1, unit: 'bar', status: 'normal' },
        high: { value: 15.8, unit: 'bar', status: 'normal' }
      })
    },
    alertThresholds: {
      type: Object,
      default: () => ({
        critical: 25.0,
        warning: 15.0
      })
    }
  },
  
  data() {
    return {
      lastUpdateTime: '',
      isRefreshing: false,
      realTimePressureData: {
        low: { value: 10.5, unit: 'mbar', status: 'normal', lastUpdate: Date.now() },
        medium: { value: 2.1, unit: 'bar', status: 'normal', lastUpdate: Date.now() },
        high: { value: 15.8, unit: 'bar', status: 'normal', lastUpdate: Date.now() }
      },
      connectionStatus: 'disconnected',
      alertHistory: [],
      webSocketSubscriptions: []
    };
  },
  
  computed: {
    deviceClass() {
      return 'landscape-7-9';
    },
    
    // Use real-time data if available, otherwise fall back to props
    effectivePressureData() {
      return this.connectionStatus === 'connected' ? this.realTimePressureData : this.pressureData;
    }
  },
  
  methods: {
    getSensorLabel(key) {
      const labels = {
        low: this.$t('sensors.low_pressure') || 'Niskie',
        medium: this.$t('sensors.medium_pressure') || 'Średnie', 
        high: this.$t('sensors.high_pressure') || 'Wysokie'
      };
      return labels[key] || key;
    },
    
    getSensorStatusClass(sensor, key) {
      return [sensor.status, key];
    },
    
    formatSensorValue(value) {
      return typeof value === 'number' ? value.toFixed(1) : '0.0';
    },
    
    getSensorBarWidth(sensor, key) {
      const maxValues = {
        low: 50, // mbar
        medium: 5, // bar
        high: 30 // bar
      };
      const max = maxValues[key] || 100;
      return Math.min((sensor.value / max) * 100, 100);
    },
    
    getWarningThreshold(key) {
      const thresholds = {
        low: '30 mbar',
        medium: '3.0 bar',
        high: '20.0 bar'
      };
      return thresholds[key] || '';
    },
    
    getCriticalThreshold(key) {
      const thresholds = {
        low: '45 mbar',
        medium: '4.5 bar', 
        high: '25.0 bar'
      };
      return thresholds[key] || '';
    },
    
    updateTime() {
      const now = new Date();
      this.lastUpdateTime = now.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    async refreshSensors() {
      this.isRefreshing = true;
      
      try {
        if (this.connectionStatus === 'connected') {
          // Request fresh sensor data via WebSocket
          WebSocketService.requestSensorData(['pressure-01', 'pressure-02', 'pressure-03'], ['pressure']);
        } else {
          // Fallback: simulate sensor refresh
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.updateTime();
        this.$emit('sensors-refreshed', { timestamp: new Date().toISOString() });
        
        // Check for alerts
        this.checkForAlerts();
        
      } catch (error) {
        console.error('Failed to refresh sensors:', error);
      } finally {
        this.isRefreshing = false;
      }
    },
    
    checkForAlerts() {
      Object.entries(this.effectivePressureData).forEach(([key, sensor]) => {
        if (sensor.status === 'critical' || sensor.status === 'warning') {
          this.$emit('pressure-alert', {
            sensor: key,
            value: sensor.value,
            unit: sensor.unit,
            status: sensor.status,
            timestamp: new Date().toISOString()
          });
        }
      });
    },

    // WebSocket Integration Methods
    async initializeWebSocket() {
      try {
        console.log('🔌 Initializing WebSocket connection for pressure monitoring...');
        
        // Connect to WebSocket service (fallback URL for development)
        await WebSocketService.connect({
          url: process.env.WEBSOCKET_URL || 'ws://localhost:8080/sensor-data',
          protocols: ['pressure-monitoring-v1']
        });
        
        // Subscribe to real-time events
        const pressureDataSub = WebSocketService.subscribe('pressure-data', this.handlePressureData);
        const alertSub = WebSocketService.subscribe('alert', this.handleAlert);
        const connectedSub = WebSocketService.subscribe('connected', this.handleConnected);
        const disconnectedSub = WebSocketService.subscribe('disconnected', this.handleDisconnected);
        
        // Store subscriptions for cleanup
        this.webSocketSubscriptions = [pressureDataSub, alertSub, connectedSub, disconnectedSub];
        
        console.log('✅ WebSocket pressure monitoring initialized');
        
      } catch (error) {
        console.error('❌ WebSocket initialization failed:', error);
        this.connectionStatus = 'error';
        this.$emit('websocket-error', error);
      }
    },
    
    handlePressureData(data) {
      console.log('📡 Real-time pressure data received:', data);
      
      // Update real-time pressure data
      if (data.pressure) {
        Object.keys(data.pressure).forEach(key => {
          if (this.realTimePressureData[key]) {
            this.realTimePressureData[key] = {
              ...this.realTimePressureData[key],
              ...data.pressure[key],
              lastUpdate: data.timestamp || Date.now()
            };
          }
        });
      }
      
      this.updateTime();
      this.$emit('pressure-data-updated', data);
    },
    
    handleAlert(alert) {
      console.warn('🚨 Pressure alert received:', alert);
      
      // Add to alert history
      this.alertHistory.unshift({
        ...alert,
        component: 'pressurePanel',
        receivedAt: Date.now()
      });
      
      // Keep only last 10 alerts
      if (this.alertHistory.length > 10) {
        this.alertHistory = this.alertHistory.slice(0, 10);
      }
      
      // Emit alert to parent components
      this.$emit('pressure-alert', alert);
    },
    
    handleConnected(connectionData) {
      console.log('✅ WebSocket connected for pressure monitoring:', connectionData);
      this.connectionStatus = 'connected';
      this.$emit('websocket-connected', connectionData);
      
      // Request initial sensor data
      WebSocketService.requestSensorData(['pressure-01', 'pressure-02', 'pressure-03'], ['pressure']);
    },
    
    handleDisconnected(disconnectionData) {
      console.log('🔌 WebSocket disconnected from pressure monitoring:', disconnectionData);
      this.connectionStatus = 'disconnected';
      this.$emit('websocket-disconnected', disconnectionData);
    }
  },
  
  async mounted() {
    console.log('PressurePanel component mounted successfully');
    this.updateTime();
    
    // Initialize WebSocket connection for real-time monitoring
    await this.initializeWebSocket();
    
    // Update time every 5 seconds
    this.timeInterval = setInterval(this.updateTime, 5000);
  },
  
  beforeUnmount() {
    console.log('🧹 Cleaning up PressurePanel WebSocket subscriptions...');
    
    // Unsubscribe from WebSocket events
    this.webSocketSubscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    // Clear time update interval
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    
    console.log('✅ PressurePanel cleanup completed');
  }
};
