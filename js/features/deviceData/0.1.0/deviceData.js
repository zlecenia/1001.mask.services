/**
 * Device Data Component 0.1.0
 * Industrial device monitoring and sensor data management
 * Migrated from c201001.mask.services to 1001.mask.services modular structure
 */

import { getSecurityService } from '../../../services/securityService.js';

const template = `
<div class="device-data landscape-7-9">
  <div class="device-container">
    
    <!-- Header -->
    <div class="device-header">
      <button class="back-btn" @click="goBack">← {{ $t('common.back') || 'Powrót' }}</button>
      <h2 class="device-title">{{ pageTitle }}</h2>
      <div class="header-actions">
        <button class="export-btn" @click="exportDeviceData">
          📤 {{ $t('device.export') || 'Eksport' }}
        </button>
        <div class="vue-badge">Vue 3</div>
      </div>
    </div>

    <!-- Device Status Card -->
    <div class="device-section">
      <div class="device-card">
        <h3>{{ $t('device.status_title') || 'Status urządzenia' }}</h3>
        <div class="device-details">
          <div class="detail-row">
            <span class="label">{{ $t('device.device_id') || 'ID Urządzenia:' }}</span>
            <span class="value">{{ deviceState.deviceId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('device.status') || 'Status:' }}</span>
            <span class="value" :class="deviceStatusClass">{{ deviceStatusText }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('device.uptime') || 'Czas pracy:' }}</span>
            <span class="value">{{ uptimeFormatted }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('device.battery') || 'Bateria:' }}</span>
            <span class="value">
              <div class="battery-indicator">
                <div 
                  class="battery-level" 
                  :style="{ width: deviceState.batteryLevel + '%' }"
                  :class="batteryLevelClass"
                ></div>
              </div>
              {{ Math.round(deviceState.batteryLevel) }}%
            </span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('device.firmware') || 'Firmware:' }}</span>
            <span class="value">{{ deviceState.firmwareVersion }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('device.last_update') || 'Ostatnia aktualizacja:' }}</span>
            <span class="value">
              {{ deviceState.lastUpdate ? formatTimestamp(deviceState.lastUpdate) : '---' }}
            </span>
          </div>
        </div>
        
        <div class="device-controls">
          <button class="refresh-btn" @click="updateDeviceData">
            🔄 {{ $t('device.refresh') || 'Odśwież' }}
          </button>
          <button 
            class="toggle-updates-btn"
            :class="{ active: deviceState.updateInterval }"
            @click="deviceState.updateInterval ? stopDataUpdates() : startDataUpdates()"
          >
            {{ deviceState.updateInterval ? '⏸️' : '▶️' }} 
            {{ $t('device.auto_update') || 'Auto-aktualizacja' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sensor Grid -->
    <div class="sensor-section">
      <h3>{{ $t('device.sensor_data') || 'Dane sensorów' }}</h3>
      <div class="sensor-grid">
        <div 
          v-for="sensor in sensorCards" 
          :key="sensor.id"
          class="sensor-card"
          :class="'sensor-' + sensor.status"
        >
          <div class="sensor-header">
            <span class="sensor-icon">{{ sensor.icon }}</span>
            <h4 class="sensor-name">{{ sensor.name }}</h4>
          </div>
          <div class="sensor-value">{{ sensor.value }}</div>
          <div class="sensor-status" :class="'status-' + sensor.status">
            {{ sensor.status === 'good' ? '✅' : sensor.status === 'warning' ? '⚠️' : '🔵' }}
          </div>
          <div class="sensor-trend" v-if="sensor.trend">
            {{ sensor.trend === 'rising' ? '↗️' : sensor.trend === 'falling' ? '↘️' : '→' }}
          </div>
        </div>
      </div>
      
      <div class="sensor-summary">
        <p>
          {{ $t('device.last_measurement') || 'Ostatni pomiar:' }}
          <strong>{{ sensorData.lastMeasurement ? formatTimestamp(sensorData.lastMeasurement) : '---' }}</strong>
        </p>
        <div class="sensor-stats">
          <span class="stat-normal">✅ {{ sensorStats.normal }}</span>
          <span class="stat-warning">⚠️ {{ sensorStats.warning }}</span>
          <span class="stat-critical">🚨 {{ sensorStats.critical }}</span>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="connection-status">
      <div class="status-indicator" :class="{ online: deviceState.isConnected }">
        <span class="status-dot"></span>
        <span>{{ connectionStatusText }}</span>
      </div>
      <div class="real-time-indicator">
        <span class="pulse-dot"></span>
        <span>{{ $t('device.realtime_data') || 'Dane w czasie rzeczywistym' }}</span>
      </div>
      <div class="update-frequency">
        <span>{{ $t('device.update_frequency') || 'Częstotliwość:' }} {{ updateFrequency }}s</span>
      </div>
    </div>
  </div>
</div>`;

const styles = `
<style scoped>
.device-data {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.device-container {
  max-width: 1200px;
  margin: 0 auto;
}

.device-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.back-btn, .export-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.3s;
}

.back-btn {
  background: #6c757d;
  color: white;
}

.back-btn:hover { background: #5a6268; }

.export-btn {
  background: #28a745;
  color: white;
}

.export-btn:hover { background: #218838; }

.device-title {
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

.vue-badge {
  background: #42b883;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: 600;
}

.device-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.device-card h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2em;
  border-bottom: 2px solid #42b883;
  padding-bottom: 6px;
}

.device-details {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9em;
}

.value {
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
}

.status-online { color: #28a745; font-weight: 600; }
.status-offline { color: #dc3545; font-weight: 600; }
.status-warning { color: #ffc107; font-weight: 600; }
.status-error { color: #dc3545; font-weight: 600; }

.battery-indicator {
  width: 50px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.battery-level {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s, background-color 0.3s;
}

.battery-low { background: #dc3545; }
.battery-medium { background: #ffc107; }
.battery-high { background: #28a745; }

.device-controls {
  display: flex;
  gap: 8px;
}

.refresh-btn, .toggle-updates-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s;
}

.refresh-btn:hover { background: #e9ecef; }

.toggle-updates-btn.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.sensor-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.sensor-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2em;
  border-bottom: 2px solid #42b883;
  padding-bottom: 6px;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.sensor-card {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  text-align: center;
  transition: all 0.3s;
}

.sensor-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sensor-card.sensor-warning {
  border-color: #ffc107;
  background: #fff8e1;
}

.sensor-card.sensor-good {
  border-color: #28a745;
  background: #f0fff4;
}

.sensor-card.sensor-critical {
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
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.sensor-icon { font-size: 1.2em; }

.sensor-name {
  margin: 0;
  font-size: 0.8em;
  color: #666;
}

.sensor-value {
  font-size: 1.3em;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.sensor-status { font-size: 1em; margin-bottom: 4px; }

.sensor-trend { font-size: 0.9em; }

.sensor-summary {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.sensor-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-normal, .stat-warning, .stat-critical {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: 600;
}

.stat-normal { background: #d4edda; color: #155724; }
.stat-warning { background: #fff3cd; color: #856404; }
.stat-critical { background: #f8d7da; color: #721c24; }

.connection-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 8px;
}

.status-indicator, .real-time-indicator, .update-frequency {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8em;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-indicator.online .status-dot {
  background: #28a745;
  box-shadow: 0 0 6px rgba(40, 167, 69, 0.6);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #42b883;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* 7.9" display optimizations */
@media (max-height: 450px) {
  .device-data { padding: 8px; }
  .device-header { padding: 8px 12px; margin-bottom: 8px; }
  .device-title { font-size: 1.2em; }
  .device-section, .sensor-section { padding: 12px; margin-bottom: 8px; }
  .sensor-grid { gap: 8px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .sensor-card { padding: 8px; }
  .sensor-value { font-size: 1.1em; }
}
</style>
`;

export default {
  name: 'DeviceDataComponent',
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
  
  emits: ['navigate', 'device-status-changed', 'back'],
  
  data() {
    return {
      deviceState: {
        deviceId: 'DEVICE_001',
        status: 'ONLINE',
        uptime: 0,
        lastUpdate: null,
        updateInterval: null,
        isConnected: true,
        batteryLevel: 85,
        firmwareVersion: '2.1.4'
      },

      sensorData: {
        temperature: 22.5,
        humidity: 45,
        pressure: 1013.25,
        airQuality: 95,
        noise: 35.2,
        vibration: 0.08,
        lastMeasurement: null
      },
      
      updateFrequency: 2,
      securityService: null
    };
  },

  computed: {
    pageTitle() {
      return this.$t('device.page_title') || 'Dane urządzenia przemysłowego';
    },

    deviceStatusClass() {
      return `status-${this.deviceState.status.toLowerCase()}`;
    },

    deviceStatusText() {
      const statusMap = {
        ONLINE: this.$t('device.status_online') || 'Online',
        OFFLINE: this.$t('device.status_offline') || 'Offline',
        WARNING: this.$t('device.status_warning') || 'Ostrzeżenie',
        ERROR: this.$t('device.status_error') || 'Błąd'
      };
      return statusMap[this.deviceState.status] || this.deviceState.status;
    },

    uptimeFormatted() {
      if (!this.deviceState.uptime) return '00:00:00';
      const hours = Math.floor(this.deviceState.uptime / 3600);
      const minutes = Math.floor((this.deviceState.uptime % 3600) / 60);
      const seconds = this.deviceState.uptime % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    batteryLevelClass() {
      if (this.deviceState.batteryLevel > 60) return 'battery-high';
      if (this.deviceState.batteryLevel > 30) return 'battery-medium';
      return 'battery-low';
    },

    sensorCards() {
      return [
        {
          id: 'temperature',
          name: this.$t('device.temperature') || 'Temperatura',
          value: `${this.sensorData.temperature.toFixed(1)}°C`,
          icon: '🌡️',
          status: this.getSensorStatus('temperature', this.sensorData.temperature, 18, 25),
          trend: this.getSensorTrend('temperature')
        },
        {
          id: 'humidity',
          name: this.$t('device.humidity') || 'Wilgotność',
          value: `${this.sensorData.humidity.toFixed(0)}%`,
          icon: '💧',
          status: this.getSensorStatus('humidity', this.sensorData.humidity, 40, 70),
          trend: this.getSensorTrend('humidity')
        },
        {
          id: 'pressure',
          name: this.$t('device.pressure') || 'Ciśnienie',
          value: `${this.sensorData.pressure.toFixed(2)} hPa`,
          icon: '🌪️',
          status: this.getSensorStatus('pressure', this.sensorData.pressure, 1000, 1020),
          trend: this.getSensorTrend('pressure')
        },
        {
          id: 'air_quality',
          name: this.$t('device.air_quality') || 'Jakość powietrza',
          value: `${this.sensorData.airQuality.toFixed(0)}%`,
          icon: '🌬️',
          status: this.getSensorStatus('airQuality', this.sensorData.airQuality, 70, 100),
          trend: this.getSensorTrend('airQuality')
        },
        {
          id: 'noise',
          name: this.$t('device.noise') || 'Hałas',
          value: `${this.sensorData.noise.toFixed(1)} dB`,
          icon: '🔊',
          status: this.getSensorStatus('noise', this.sensorData.noise, 0, 50),
          trend: this.getSensorTrend('noise')
        },
        {
          id: 'vibration',
          name: this.$t('device.vibration') || 'Wibracje',
          value: `${this.sensorData.vibration.toFixed(3)} g`,
          icon: '📳',
          status: this.getSensorStatus('vibration', this.sensorData.vibration, 0, 0.1),
          trend: this.getSensorTrend('vibration')
        }
      ];
    },

    sensorStats() {
      const stats = { normal: 0, warning: 0, critical: 0 };
      this.sensorCards.forEach(sensor => {
        if (sensor.status === 'good') stats.normal++;
        else if (sensor.status === 'warning') stats.warning++;
        else stats.critical++;
      });
      return stats;
    },

    connectionStatusText() {
      return this.deviceState.isConnected 
        ? (this.$t('device.connected') || 'Połączony')
        : (this.$t('device.disconnected') || 'Rozłączony');
    }
  },

  methods: {
    async updateDeviceData() {
      try {
        // Log device data refresh attempt
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_data_refresh', {
            deviceId: this.deviceState.deviceId,
            timestamp: new Date().toISOString(),
            user: this.user?.username || 'anonymous'
          });
        }

        // Check if real DeviceAPI exists
        if (window.DeviceAPI && typeof window.DeviceAPI.getDeviceStatus === 'function') {
          // Use real device API
          const deviceStatus = await window.DeviceAPI.getDeviceStatus();
          this.deviceState = { ...this.deviceState, ...deviceStatus };
          
          const sensorData = await window.DeviceAPI.getSensorData();
          this.sensorData = { ...this.sensorData, ...sensorData };
        } else {
          // Use simulation
          this.simulateDeviceData();
        }

        this.deviceState.lastUpdate = new Date();

        // Log successful refresh
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_data_updated', {
            deviceId: this.deviceState.deviceId,
            sensorCount: Object.keys(this.sensorData).length,
            batteryLevel: this.deviceState.batteryLevel,
            timestamp: new Date().toISOString()
          });
        }

        this.$emit('device-status-changed', {
          deviceId: this.deviceState.deviceId,
          status: this.deviceState.status,
          batteryLevel: this.deviceState.batteryLevel
        });

      } catch (error) {
        console.error('Error updating device data:', error);
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_data_error', {
            error: error.message,
            deviceId: this.deviceState.deviceId,
            timestamp: new Date().toISOString()
          });
        }
      }
    },

    simulateDeviceData() {
      // Simulate realistic sensor data with trends
      this.sensorData.temperature += (Math.random() - 0.5) * 2;
      this.sensorData.temperature = Math.max(15, Math.min(30, this.sensorData.temperature));

      this.sensorData.humidity += (Math.random() - 0.5) * 5;
      this.sensorData.humidity = Math.max(20, Math.min(80, this.sensorData.humidity));

      this.sensorData.pressure += (Math.random() - 0.5) * 5;
      this.sensorData.pressure = Math.max(980, Math.min(1040, this.sensorData.pressure));

      this.sensorData.airQuality += (Math.random() - 0.5) * 3;
      this.sensorData.airQuality = Math.max(50, Math.min(100, this.sensorData.airQuality));

      this.sensorData.noise += (Math.random() - 0.5) * 10;
      this.sensorData.noise = Math.max(25, Math.min(70, this.sensorData.noise));

      this.sensorData.vibration += (Math.random() - 0.5) * 0.02;
      this.sensorData.vibration = Math.max(0, Math.min(0.2, this.sensorData.vibration));

      // Simulate battery drain
      this.deviceState.batteryLevel -= Math.random() * 0.1;
      this.deviceState.batteryLevel = Math.max(0, this.deviceState.batteryLevel);

      // Update uptime
      this.deviceState.uptime += this.updateFrequency;

      // Update last measurement time
      this.sensorData.lastMeasurement = new Date();

      // Simulate connection status changes (rarely)
      if (Math.random() < 0.02) {
        this.deviceState.isConnected = !this.deviceState.isConnected;
        this.deviceState.status = this.deviceState.isConnected ? 'ONLINE' : 'OFFLINE';
      }
    },

    getSensorStatus(sensorType, value, minGood, maxGood) {
      if (value >= minGood && value <= maxGood) return 'good';
      
      const minWarning = minGood * 0.8;
      const maxWarning = maxGood * 1.2;
      
      if (value >= minWarning && value <= maxWarning) return 'warning';
      
      return 'critical';
    },

    getSensorTrend(sensorType) {
      // Simple trend simulation based on recent changes
      const trends = ['stable', 'rising', 'falling'];
      return trends[Math.floor(Math.random() * trends.length)];
    },

    async exportDeviceData() {
      try {
        // Log data export attempt
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_data_export', {
            deviceId: this.deviceState.deviceId,
            exportType: 'csv',
            user: this.user?.username || 'anonymous',
            timestamp: new Date().toISOString()
          });
        }

        const exportData = {
          device: this.deviceState,
          sensors: this.sensorData,
          exportTime: new Date().toISOString(),
          sensorCards: this.sensorCards.map(sensor => ({
            name: sensor.name,
            value: sensor.value,
            status: sensor.status,
            trend: sensor.trend
          }))
        };

        const csvContent = this.generateCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `device_data_${this.deviceState.deviceId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Log successful export
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_data_exported', {
            deviceId: this.deviceState.deviceId,
            filename: link.download,
            recordCount: this.sensorCards.length,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Error exporting device data:', error);
        if (this.securityService) {
          await this.securityService.logAuditEvent('device_export_error', {
            error: error.message,
            deviceId: this.deviceState.deviceId,
            timestamp: new Date().toISOString()
          });
        }
      }
    },

    generateCSV(data) {
      const headers = ['Sensor', 'Value', 'Status', 'Trend', 'Timestamp'];
      const rows = [headers.join(',')];
      
      data.sensorCards.forEach(sensor => {
        rows.push([
          sensor.name,
          sensor.value,
          sensor.status,
          sensor.trend,
          data.exportTime
        ].join(','));
      });
      
      return rows.join('\n');
    },

    startDataUpdates() {
      if (this.deviceState.updateInterval) return;
      
      this.deviceState.updateInterval = setInterval(() => {
        this.updateDeviceData();
      }, this.updateFrequency * 1000);
      
      if (this.securityService) {
        this.securityService.logAuditEvent('device_auto_update_started', {
          deviceId: this.deviceState.deviceId,
          frequency: this.updateFrequency,
          timestamp: new Date().toISOString()
        });
      }
    },

    stopDataUpdates() {
      if (this.deviceState.updateInterval) {
        clearInterval(this.deviceState.updateInterval);
        this.deviceState.updateInterval = null;
        
        if (this.securityService) {
          this.securityService.logAuditEvent('device_auto_update_stopped', {
            deviceId: this.deviceState.deviceId,
            timestamp: new Date().toISOString()
          });
        }
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '---';
      return new Date(timestamp).toLocaleString(this.language === 'pl' ? 'pl-PL' : 'en-US');
    },

    goBack() {
      this.$emit('back');
      this.$emit('navigate', { path: '/dashboard' });
    }
  },

  async mounted() {
    try {
      // Initialize SecurityService
      this.securityService = await getSecurityService();
      
      // Log component initialization
      if (this.securityService) {
        await this.securityService.logAuditEvent('device_data_component_init', {
          deviceId: this.deviceState.deviceId,
          user: this.user?.username || 'anonymous',
          timestamp: new Date().toISOString()
        });
      }

      // Initial data load
      await this.updateDeviceData();
      
      // Start auto-updates if needed
      this.startDataUpdates();

    } catch (error) {
      console.error('Error initializing device data component:', error);
    }
  },

  beforeUnmount() {
    // Clean up intervals
    this.stopDataUpdates();
    
    // Log component cleanup
    if (this.securityService) {
      this.securityService.logAuditEvent('device_data_component_cleanup', {
        deviceId: this.deviceState.deviceId,
        uptime: this.deviceState.uptime,
        timestamp: new Date().toISOString()
      });
    }
  }
};
