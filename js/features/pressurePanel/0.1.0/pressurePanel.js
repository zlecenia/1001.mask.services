// PressurePanel component for real-time sensor monitoring with 7.9" display optimization
// Enhanced with comprehensive security features based on components.md

// Dynamic imports will be handled in mounted() lifecycle
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
      webSocketSubscriptions: [],
      securityService: null,
      sensorAccessAttempts: 0,
      lastSecurityValidation: Date.now(),
      monitoringStartTime: Date.now(),
      dataValidationErrors: 0,
      suspiciousActivityCount: 0
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
      this.sensorAccessAttempts++;
      
      // Security validation for sensor access
      if (!this.validateSensorAccess()) {
        this.isRefreshing = false;
        return;
      }
      
      try {
        // Log sensor refresh request for audit trail
        this.securityService?.logAuditEvent('PRESSURE_PANEL_REFRESH_REQUESTED', {
          connectionStatus: this.connectionStatus,
          accessAttempts: this.sensorAccessAttempts,
          timestamp: new Date().toISOString(),
          monitoringDuration: Date.now() - this.monitoringStartTime
        });
        
        if (this.connectionStatus === 'connected') {
          // Validate sensor IDs before WebSocket request
          const sensorIds = ['pressure-01', 'pressure-02', 'pressure-03'];
          const sanitizedIds = sensorIds.map(id => this.securityService?.sanitizeInput(id) || id);
          
          // Request fresh sensor data via WebSocket with validated IDs
          WebSocketService.requestSensorData(sanitizedIds, ['pressure']);
        } else {
          // Fallback: simulate sensor refresh
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.updateTime();
        this.lastSecurityValidation = Date.now();
        
        // Log successful sensor refresh
        this.securityService?.logAuditEvent('PRESSURE_PANEL_REFRESH_SUCCESS', {
          timestamp: new Date().toISOString(),
          sensorCount: Object.keys(this.effectivePressureData).length
        });
        
        this.$emit('sensors-refreshed', { timestamp: new Date().toISOString() });
        
        // Check for alerts with security validation
        this.checkForAlerts();
        
      } catch (error) {
        console.error('Failed to refresh sensors:', error);
        this.dataValidationErrors++;
        
        // Log sensor refresh error for security monitoring
        this.securityService?.logAuditEvent('PRESSURE_PANEL_REFRESH_ERROR', {
          error: error.message,
          validationErrors: this.dataValidationErrors,
          timestamp: new Date().toISOString()
        });
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
        
        // Dynamic import WebSocketService
        const WebSocketServiceModule = await import('../../../services/websocketService.js');
        const WebSocketService = WebSocketServiceModule.default;
        
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
        // Fallback mode - continue without websocket
        console.warn('⚠️ Running in fallback mode without WebSocket');
      }
    },
    
    handlePressureData(data) {
      console.log('📡 Real-time pressure data received:', data);
      
      // Security validation for incoming sensor data
      if (!this.validateIncomingSensorData(data)) {
        return;
      }
      
      // Update real-time pressure data with security validation
      if (data.pressure) {
        Object.keys(data.pressure).forEach(key => {
          if (this.realTimePressureData[key]) {
            // Sanitize and validate sensor data
            const sanitizedData = this.sanitizeSensorData(data.pressure[key]);
            if (sanitizedData) {
              this.realTimePressureData[key] = {
                ...this.realTimePressureData[key],
                ...sanitizedData,
                lastUpdate: data.timestamp || Date.now()
              };
            }
          }
        });
      }
      
      // Log successful data update for audit trail
      this.securityService?.logAuditEvent('PRESSURE_PANEL_DATA_RECEIVED', {
        dataKeys: Object.keys(data.pressure || {}),
        timestamp: new Date().toISOString(),
        dataSource: 'websocket'
      });
      
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
      
      // Log disconnection for security monitoring
      this.securityService?.logAuditEvent('PRESSURE_PANEL_WEBSOCKET_DISCONNECTED', {
        reason: disconnectionData?.reason || 'unknown',
        timestamp: new Date().toISOString(),
        monitoringDuration: Date.now() - this.monitoringStartTime
      });
      
      this.$emit('websocket-disconnected', disconnectionData);
    },

    // Security Validation Methods
    validateSensorAccess() {
      // Check if too many access attempts
      if (this.sensorAccessAttempts > 50) {
        this.suspiciousActivityCount++;
        this.securityService?.logAuditEvent('PRESSURE_PANEL_EXCESSIVE_ACCESS', {
          accessAttempts: this.sensorAccessAttempts,
          suspiciousActivity: this.suspiciousActivityCount,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      // Check if security validation is recent
      const validationTimeout = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - this.lastSecurityValidation > validationTimeout) {
        this.securityService?.logAuditEvent('PRESSURE_PANEL_VALIDATION_TIMEOUT', {
          lastValidation: new Date(this.lastSecurityValidation).toISOString(),
          timestamp: new Date().toISOString()
        });
        return false;
      }

      return true;
    },

    validateIncomingSensorData(data) {
      if (!data || typeof data !== 'object') {
        this.dataValidationErrors++;
        this.securityService?.logAuditEvent('PRESSURE_PANEL_INVALID_DATA_FORMAT', {
          dataType: typeof data,
          validationErrors: this.dataValidationErrors,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      // Validate data structure
      if (data.pressure && typeof data.pressure !== 'object') {
        this.dataValidationErrors++;
        this.securityService?.logAuditEvent('PRESSURE_PANEL_INVALID_PRESSURE_DATA', {
          pressureType: typeof data.pressure,
          validationErrors: this.dataValidationErrors,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      return true;
    },

    sanitizeSensorData(sensorData) {
      if (!sensorData || typeof sensorData !== 'object') {
        return null;
      }

      const sanitized = {};

      // Sanitize and validate sensor value
      if (typeof sensorData.value === 'number' && isFinite(sensorData.value)) {
        // Validate reasonable sensor ranges for industrial pressure monitoring
        if (sensorData.value >= -100 && sensorData.value <= 1000) {
          sanitized.value = sensorData.value;
        } else {
          this.dataValidationErrors++;
          this.securityService?.logAuditEvent('PRESSURE_PANEL_VALUE_OUT_OF_RANGE', {
            value: sensorData.value,
            validationErrors: this.dataValidationErrors,
            timestamp: new Date().toISOString()
          });
          return null;
        }
      }

      // Sanitize unit
      if (typeof sensorData.unit === 'string') {
        const allowedUnits = ['bar', 'mbar', 'psi', 'kPa', 'Pa'];
        const sanitizedUnit = this.securityService?.sanitizeInput(sensorData.unit) || sensorData.unit;
        if (allowedUnits.includes(sanitizedUnit)) {
          sanitized.unit = sanitizedUnit;
        }
      }

      // Sanitize status
      if (typeof sensorData.status === 'string') {
        const allowedStatuses = ['normal', 'warning', 'critical', 'error'];
        const sanitizedStatus = this.securityService?.sanitizeInput(sensorData.status) || sensorData.status;
        if (allowedStatuses.includes(sanitizedStatus)) {
          sanitized.status = sanitizedStatus;
        }
      }

      return Object.keys(sanitized).length > 0 ? sanitized : null;
    },

    performSecurityChecks() {
      // Check for suspicious activity patterns
      if (this.sensorAccessAttempts > 30 || this.dataValidationErrors > 10) {
        this.suspiciousActivityCount++;
        this.securityService?.logAuditEvent('PRESSURE_PANEL_SUSPICIOUS_ACTIVITY', {
          accessAttempts: this.sensorAccessAttempts,
          validationErrors: this.dataValidationErrors,
          suspiciousCount: this.suspiciousActivityCount,
          timestamp: new Date().toISOString()
        });
      }
      
      // Reset counters periodically to prevent false positives
      const resetInterval = 30 * 60 * 1000; // 30 minutes
      if (Date.now() - this.monitoringStartTime > resetInterval) {
        this.sensorAccessAttempts = Math.floor(this.sensorAccessAttempts / 2);
        this.dataValidationErrors = Math.floor(this.dataValidationErrors / 2);
      }
    }
  },
  
  async mounted() {
    console.log('🚀 PressurePanel component mounted successfully');
    this.updateTime();

    // Initialize SecurityService for comprehensive security features
    try {
      const { getSecurityService } = await import('../../../services/securityService.js');
      this.securityService = getSecurityService();
      
      // Log pressure panel component initialization for audit trail
      this.securityService.logAuditEvent('PRESSURE_PANEL_INIT', {
        pressureDataKeys: Object.keys(this.realTimePressureData),
        alertThresholds: this.alertThresholds,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });

      // Set up security monitoring
      this.securityMonitorInterval = setInterval(() => {
        this.performSecurityChecks();
      }, 3 * 60 * 1000); // Check every 3 minutes

    } catch (error) {
      console.error('❌ Failed to initialize SecurityService in PressurePanel:', error);
      // Fallback mode without enhanced security features
      this.securityService = null;
    }
    
    // Initialize WebSocket connection for real-time monitoring
    await this.initializeWebSocket();
    
    // Update time every 5 seconds
    this.timeInterval = setInterval(this.updateTime, 5000);
    
    console.log('✅ PressurePanel initialization completed');
  },
  
  beforeUnmount() {
    console.log('🧹 Cleaning up PressurePanel WebSocket subscriptions...');
    
    // Unsubscribe from WebSocket events
    this.webSocketSubscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    // Clean up security monitoring
    if (this.securityMonitorInterval) {
      clearInterval(this.securityMonitorInterval);
    }
    
    // Clear time update interval
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    // Log pressure panel cleanup for audit trail
    this.securityService?.logAuditEvent('PRESSURE_PANEL_CLEANUP', {
      monitoringDuration: Date.now() - this.monitoringStartTime,
      sensorAccessAttempts: this.sensorAccessAttempts,
      dataValidationErrors: this.dataValidationErrors,
      suspiciousActivityCount: this.suspiciousActivityCount,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ PressurePanel cleanup completed');
  }
};
