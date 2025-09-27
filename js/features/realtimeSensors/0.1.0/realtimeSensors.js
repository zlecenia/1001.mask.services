/**
 * Realtime Sensors Component 0.1.0
 * Advanced real-time industrial sensor monitoring dashboard
 * Migrated from c201001.mask.services to 1001.mask.services modular structure
 */

import { getSecurityService } from '../../../services/securityService.js';

const template = `
<div class="realtime-sensors landscape-7-9">
  <div class="sensors-container">
    
    <!-- Header -->
    <div class="sensors-header">
      <button class="back-btn" @click="goBack">← {{ $t('common.back') || 'Powrót' }}</button>
      <h2 class="sensors-title">{{ pageTitle }}</h2>
      <div class="header-actions">
        <div class="system-status" :class="'status-' + systemStatus">
          <span class="status-indicator"></span>
          <span>{{ systemStatusText }}</span>
        </div>
        <div class="vue-badge">Vue 3</div>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <div class="controls-left">
        <button 
          class="control-btn"
          :class="{ active: sensorState.isLive }"
          @click="sensorState.isLive ? stopRealtimeUpdates() : startRealtimeUpdates()"
        >
          {{ sensorState.isLive ? '⏸️ ' + ($t('sensors.stop') || 'Zatrzymaj') : '▶️ ' + ($t('sensors.start') || 'Start') }}
        </button>
        
        <button 
          class="control-btn"
          :class="{ active: sensorState.recordingData }"
          @click="toggleRecording"
        >
          {{ sensorState.recordingData ? '⏺️ ' + ($t('sensors.recording') || 'Nagrywanie...') : '⏺️ ' + ($t('sensors.record') || 'Nagraj') }}
        </button>
        
        <select 
          v-model="sensorState.refreshRate"
          @change="changeRefreshRate(sensorState.refreshRate)"
          class="refresh-rate-select"
        >
          <option value="100">100ms</option>
          <option value="250">250ms</option>
          <option value="500">500ms</option>
          <option value="1000">1s</option>
          <option value="2000">2s</option>
        </select>
      </div>
      
      <div class="controls-right">
        <div class="sensor-stats">
          <span class="stat-item normal">✅ {{ sensorStats.normal }}</span>
          <span class="stat-item warning">⚠️ {{ sensorStats.warning }}</span>
          <span class="stat-item critical">🚨 {{ sensorStats.critical }}</span>
        </div>
        
        <button class="export-btn" @click="exportSensorData">
          📤 {{ $t('sensors.export') || 'Eksport' }}
        </button>
      </div>
    </div>

    <!-- Sensors Grid -->
    <div class="sensors-section">
      <div class="sensors-grid">
        <div 
          v-for="sensor in sensors" 
          :key="sensor.id"
          class="sensor-card"
          :class="[
            'sensor-' + sensor.color,
            'status-' + sensor.status,
            { 'has-alert': sensor.lastAlert }
          ]"
        >
          <div class="sensor-header">
            <div class="sensor-icon">{{ sensor.icon }}</div>
            <h3 class="sensor-name">{{ sensor.name }}</h3>
            <div class="sensor-trend" :class="'trend-' + sensor.trend">
              {{ sensor.trend === 'rising' ? '↗️' : sensor.trend === 'falling' ? '↘️' : '→' }}
            </div>
          </div>
          
          <div class="sensor-value-section">
            <div class="sensor-value">{{ formatSensorValue(sensor.value) }}</div>
            <div class="sensor-unit">{{ sensor.unit }}</div>
          </div>
          
          <div class="sensor-status-bar">
            <div class="status-text" :class="'text-' + sensor.status">
              {{ getStatusText(sensor.status) }}
            </div>
            <div class="status-indicator" :class="'indicator-' + sensor.status"></div>
          </div>
          
          <div class="sensor-range">
            <span class="range-text">{{ sensor.min }} - {{ sensor.max }} {{ sensor.unit }}</span>
          </div>
          
          <div v-if="sensor.lastAlert" class="sensor-alert">
            <small>⚠️ {{ formatTimestamp(sensor.lastAlert.timestamp) }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Status -->
    <div class="live-status">
      <div class="live-indicator" :class="{ active: sensorState.isLive }">
        <div class="pulse-dot" v-if="sensorState.isLive"></div>
        <span>{{ sensorState.isLive ? ($t('sensors.live') || 'NA ŻYWO') : ($t('sensors.stopped') || 'ZATRZYMANO') }}</span>
      </div>
      
      <div class="data-info">
        <span>{{ $t('sensors.refresh_rate') || 'Odświeżanie' }}: {{ sensorState.refreshRate }}ms</span>
        <span v-if="sensorState.recordingData">
          | {{ $t('sensors.recorded_points') || 'Nagrane punkty' }}: {{ sensorState.dataHistory.length }}
        </span>
      </div>
    </div>
  </div>
</div>`;

const styles = `
<style scoped>
.realtime-sensors {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.sensors-container {
  max-width: 1200px;
  margin: 0 auto;
}

.sensors-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.back-btn {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.3s;
}

.back-btn:hover { background: #5a6268; }

.sensors-title {
  margin: 0;
  color: #333;
  font-size: 1.4em;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.8em;
}

.system-status.status-normal { background: #d4edda; color: #155724; }
.system-status.status-warning { background: #fff3cd; color: #856404; }
.system-status.status-critical { background: #f8d7da; color: #721c24; }

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.status-normal .status-indicator { background: #28a745; }
.status-warning .status-indicator { background: #ffc107; }
.status-critical .status-indicator { background: #dc3545; }

.vue-badge {
  background: #42b883;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: 600;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.controls-left, .controls-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 11px;
  transition: all 0.3s;
}

.control-btn:hover { background: #f8f9fa; }

.control-btn.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.refresh-rate-select {
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  font-size: 11px;
}

.sensor-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-item {
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: 600;
}

.stat-item.normal { background: #d4edda; color: #155724; }
.stat-item.warning { background: #fff3cd; color: #856404; }
.stat-item.critical { background: #f8d7da; color: #721c24; }

.export-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 11px;
  transition: all 0.3s;
}

.export-btn:hover { background: #218838; }

.sensors-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.sensor-card {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
}

.sensor-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sensor-card.status-warning {
  border-color: #ffc107;
  background: #fff8e1;
}

.sensor-card.status-critical {
  border-color: #dc3545;
  background: #ffeaea;
  animation: alertBlink 2s infinite;
}

@keyframes alertBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.sensor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sensor-icon { font-size: 1.2em; }

.sensor-name {
  flex: 1;
  margin: 0 8px;
  font-size: 0.9em;
  color: #333;
}

.sensor-trend { font-size: 1em; }

.sensor-value-section {
  text-align: center;
  margin-bottom: 8px;
}

.sensor-value {
  font-size: 1.6em;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.sensor-unit {
  font-size: 0.7em;
  color: #666;
  margin-top: 2px;
}

.sensor-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.status-text {
  font-weight: 600;
  font-size: 0.8em;
}

.text-normal { color: #28a745; }
.text-warning { color: #ffc107; }
.text-critical { color: #dc3545; }

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-normal { background: #28a745; }
.indicator-warning { background: #ffc107; }
.indicator-critical { background: #dc3545; }

.sensor-range {
  text-align: center;
  font-size: 0.7em;
  color: #666;
  margin-bottom: 4px;
}

.sensor-alert {
  text-align: center;
  color: #dc3545;
  font-size: 0.7em;
}

.live-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.8em;
}

.live-indicator.active { color: #28a745; }

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dc3545;
  animation: pulse 1s infinite;
}

.live-indicator.active .pulse-dot { background: #28a745; }

.data-info {
  font-size: 0.7em;
  color: #666;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* 7.9" display optimizations */
@media (max-height: 450px) {
  .realtime-sensors { padding: 8px; }
  .sensors-header { padding: 8px 12px; margin-bottom: 8px; }
  .sensors-title { font-size: 1.2em; }
  .sensor-card { padding: 8px; }
  .sensor-value { font-size: 1.4em; }
  .sensors-grid { gap: 8px; }
}
</style>
`;

export default {
  name: 'RealtimeSensorsComponent',
  template: template + styles,
  
  props: {
    user: {
      type: Object,
      default: () => ({ username: null, role: null, isAuthenticated: false })
    },
    language: {
      type: String,
      default: 'pl'
    }
  },
  
  emits: ['navigate', 'sensor-alert', 'back'],
  
  data() {
    return {
      sensorState: {
        isLive: false,
        updateInterval: null,
        refreshRate: 500,
        alertsEnabled: true,
        recordingData: false,
        dataHistory: []
      },
      
      sensors: [
        {
          id: 'pressure1',
          name: this.$t ? this.$t('sensors.pressure') : 'Ciśnienie 1',
          value: 15.2,
          unit: 'kPa',
          min: 10,
          max: 25,
          status: 'normal',
          icon: '🌬️',
          color: 'blue',
          trend: 'stable',
          lastAlert: null
        },
        {
          id: 'flow_rate',
          name: this.$t ? this.$t('sensors.flow_rate') : 'Przepływ',
          value: 2.8,
          unit: 'L/min',
          min: 1.5,
          max: 5.0,
          status: 'normal',
          icon: '🌊',
          color: 'cyan',
          trend: 'rising',
          lastAlert: null
        },
        {
          id: 'resistance',
          name: this.$t ? this.$t('sensors.resistance') : 'Opór',
          value: 125,
          unit: 'Pa·s/L',
          min: 50,
          max: 200,
          status: 'normal',
          icon: '⚡',
          color: 'yellow',
          trend: 'falling',
          lastAlert: null
        },
        {
          id: 'leak_rate',
          name: this.$t ? this.$t('sensors.leak_rate') : 'Wskaźnik nieszczelności',
          value: 0.02,
          unit: 'L/min',
          min: 0,
          max: 0.1,
          status: 'normal',
          icon: '🔍',
          color: 'green',
          trend: 'stable',
          lastAlert: null
        },
        {
          id: 'co2_level',
          name: this.$t ? this.$t('sensors.co2_level') : 'Poziom CO₂',
          value: 450,
          unit: 'ppm',
          min: 300,
          max: 1000,
          status: 'normal',
          icon: '🌫️',
          color: 'purple',
          trend: 'rising',
          lastAlert: null
        },
        {
          id: 'particle_count',
          name: this.$t ? this.$t('sensors.particle_count') : 'Liczba cząsteczek',
          value: 2500,
          unit: '#/cm³',
          min: 0,
          max: 10000,
          status: 'normal',
          icon: '✨',
          color: 'orange',
          trend: 'falling',
          lastAlert: null
        }
      ],
      
      securityService: null
    };
  },
  
  computed: {
    pageTitle() {
      const titleMap = {
        pl: 'Sensory w Czasie Rzeczywistym',
        en: 'Real-time Sensors',
        de: 'Echtzeit-Sensoren'
      };
      return titleMap[this.language] || 'Sensory w Czasie Rzeczywistym';
    },
    
    sensorStats() {
      return {
        total: this.sensors.length,
        normal: this.sensors.filter(s => s.status === 'normal').length,
        warning: this.sensors.filter(s => s.status === 'warning').length,
        critical: this.sensors.filter(s => s.status === 'critical').length
      };
    },
    
    systemStatus() {
      const criticalCount = this.sensorStats.critical;
      const warningCount = this.sensorStats.warning;
      
      if (criticalCount > 0) return 'critical';
      if (warningCount > 0) return 'warning';
      return 'normal';
    },
    
    systemStatusText() {
      const statusMap = {
        pl: { normal: 'NORMALNY', warning: 'OSTRZEŻENIE', critical: 'KRYTYCZNY' },
        en: { normal: 'NORMAL', warning: 'WARNING', critical: 'CRITICAL' },
        de: { normal: 'NORMAL', warning: 'WARNUNG', critical: 'KRITISCH' }
      };
      return statusMap[this.language]?.[this.systemStatus] || this.systemStatus.toUpperCase();
    }
  },
  
  methods: {
    updateSensorData() {
      this.sensors.forEach(sensor => {
        // Simulate realistic sensor readings with trends
        let change = 0;
        
        switch (sensor.trend) {
          case 'rising':
            change = Math.random() * 0.2 + 0.05;
            break;
          case 'falling':
            change = -(Math.random() * 0.2 + 0.05);
            break;
          case 'stable':
          default:
            change = (Math.random() - 0.5) * 0.1;
            break;
        }
        
        // Apply change based on sensor type
        const baseChange = sensor.value * 0.02;
        sensor.value += baseChange * change;
        
        // Keep within reasonable bounds
        sensor.value = Math.max(sensor.min * 0.8, Math.min(sensor.max * 1.2, sensor.value));
        
        // Round to appropriate decimal places
        sensor.value = Math.round(sensor.value * 100) / 100;
        
        // Update status based on thresholds
        const oldStatus = sensor.status;
        if (sensor.value < sensor.min * 0.9 || sensor.value > sensor.max * 1.1) {
          sensor.status = 'critical';
        } else if (sensor.value < sensor.min || sensor.value > sensor.max) {
          sensor.status = 'warning';
        } else {
          sensor.status = 'normal';
        }
        
        // Trigger alerts for status changes
        if (oldStatus !== sensor.status && sensor.status !== 'normal' && this.sensorState.alertsEnabled) {
          this.triggerAlert(sensor, oldStatus);
        }
        
        // Randomly change trends occasionally
        if (Math.random() < 0.05) {
          const trends = ['stable', 'rising', 'falling'];
          sensor.trend = trends[Math.floor(Math.random() * trends.length)];
        }
      });
      
      // Record data if recording is enabled
      if (this.sensorState.recordingData) {
        this.recordDataPoint();
      }
    },
    
    triggerAlert(sensor, oldStatus) {
      const alert = {
        timestamp: new Date(),
        sensor: sensor.name,
        oldStatus,
        newStatus: sensor.status,
        value: sensor.value,
        unit: sensor.unit
      };
      
      sensor.lastAlert = alert;
      this.$emit('sensor-alert', alert);
      
      // Log security event
      if (this.securityService) {
        this.securityService.logSecurityEvent('REALTIME_SENSORS_ALERT', {
          sensorId: sensor.id,
          sensorName: sensor.name,
          oldStatus,
          newStatus: sensor.status,
          value: sensor.value,
          unit: sensor.unit,
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log(`🚨 Sensor alert - ${sensor.name}: ${oldStatus} → ${sensor.status} (${sensor.value}${sensor.unit})`);
    },
    
    recordDataPoint() {
      const dataPoint = {
        timestamp: new Date(),
        sensors: this.sensors.map(s => ({
          id: s.id,
          value: s.value,
          status: s.status
        }))
      };
      
      this.sensorState.dataHistory.push(dataPoint);
      
      // Keep only last 500 data points (optimized for performance)
      if (this.sensorState.dataHistory.length > 500) {
        this.sensorState.dataHistory.shift();
      }
    },
    
    startRealtimeUpdates() {
      this.sensorState.isLive = true;
      this.sensorState.updateInterval = setInterval(
        this.updateSensorData, 
        this.sensorState.refreshRate
      );
      
      // Log security event
      if (this.securityService) {
        this.securityService.logSecurityEvent('REALTIME_SENSORS_MONITORING_STARTED', {
          refreshRate: this.sensorState.refreshRate,
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log(`🔶 Real-time sensor updates started (${this.sensorState.refreshRate}ms)`);
    },
    
    stopRealtimeUpdates() {
      this.sensorState.isLive = false;
      if (this.sensorState.updateInterval) {
        clearInterval(this.sensorState.updateInterval);
        this.sensorState.updateInterval = null;
      }
      
      // Log security event
      if (this.securityService) {
        this.securityService.logSecurityEvent('REALTIME_SENSORS_MONITORING_STOPPED', {
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log('🔶 Real-time sensor updates stopped');
    },
    
    toggleRecording() {
      this.sensorState.recordingData = !this.sensorState.recordingData;
      
      // Log security event
      if (this.securityService) {
        this.securityService.logSecurityEvent('REALTIME_SENSORS_RECORDING_TOGGLED', {
          recording: this.sensorState.recordingData,
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log(`🔶 Data recording ${this.sensorState.recordingData ? 'started' : 'stopped'}`);
    },
    
    exportSensorData() {
      const exportData = {
        timestamp: new Date().toISOString(),
        user: this.user?.username || 'system',
        sensors: this.sensors.map(s => ({...s})),
        history: this.sensorState.dataHistory,
        systemStatus: this.systemStatus,
        recordingEnabled: this.sensorState.recordingData
      };
      
      const content = JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Log security event
      if (this.securityService) {
        this.securityService.logSecurityEvent('REALTIME_SENSORS_DATA_EXPORT', {
          exportedCount: this.sensors.length,
          historyPoints: this.sensorState.dataHistory.length,
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log('✅ Sensor data exported successfully');
    },
    
    changeRefreshRate(newRate) {
      this.sensorState.refreshRate = parseInt(newRate);
      
      if (this.sensorState.isLive) {
        this.stopRealtimeUpdates();
        this.startRealtimeUpdates();
      }
    },
    
    formatSensorValue(value) {
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      return value;
    },
    
    formatTimestamp(timestamp) {
      if (timestamp instanceof Date) {
        return timestamp.toLocaleTimeString();
      }
      return new Date(timestamp).toLocaleTimeString();
    },
    
    getStatusText(status) {
      const statusTexts = {
        pl: { normal: 'Normalny', warning: 'Ostrzeżenie', critical: 'Krytyczny' },
        en: { normal: 'Normal', warning: 'Warning', critical: 'Critical' },
        de: { normal: 'Normal', warning: 'Warnung', critical: 'Kritisch' }
      };
      return statusTexts[this.language]?.[status] || status;
    },
    
    goBack() {
      console.log('🔶 Returning to main menu');
      this.$emit('back');
      this.$emit('navigate', 'main');
    }
  },
  
  async mounted() {
    try {
      // Initialize SecurityService
      this.securityService = getSecurityService();
      
      // Log component initialization
      if (this.securityService) {
        await this.securityService.logSecurityEvent('REALTIME_SENSORS_INIT', {
          sensorsCount: this.sensors.length,
          currentUser: this.user?.username || 'system'
        });
      }
      
      console.log('🔶 RealtimeSensors component initialized');
      
    } catch (error) {
      console.error('❌ Error initializing RealtimeSensors:', error);
    }
  },
  
  unmounted() {
    // Clean up intervals and resources
    if (this.sensorState.updateInterval) {
      clearInterval(this.sensorState.updateInterval);
      this.sensorState.updateInterval = null;
    }
    
    // Log component cleanup
    if (this.securityService) {
      this.securityService.logSecurityEvent('REALTIME_SENSORS_CLEANUP', {
        currentUser: this.user?.username || 'system'
      });
    }
    
    console.log('🔶 RealtimeSensors component cleaned up');
  }
};
