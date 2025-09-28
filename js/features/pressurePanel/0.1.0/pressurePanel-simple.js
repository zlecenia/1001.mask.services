// Simplified PressurePanel for testing
// Vue will be accessed from global scope when component is used

const template = `
<div class="pressure-panel">
  <h3>PANEL CIŚNIEŃ</h3>
  <div class="sensors">
    <div class="sensor" v-for="(sensor, key) in sensors" :key="key">
      <div class="sensor-label">{{ sensor.label }}</div>
      <div class="sensor-value">{{ sensor.value }} {{ sensor.unit }}</div>
      <div class="sensor-status" :class="sensor.status">{{ sensor.status }}</div>
    </div>
  </div>
  <div class="footer">
    <span>Ostatnia aktualizacja: {{ lastUpdate }}</span>
    <button @click="refresh" :disabled="isRefreshing">
      {{ isRefreshing ? 'Ładowanie...' : 'Odśwież' }}
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
  font-family: Arial, sans-serif;
}
.pressure-panel h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  text-align: center;
}
.sensors {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.sensor {
  flex: 1;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}
.sensor-label {
  font-weight: bold;
  color: #495057;
  font-size: 12px;
}
.sensor-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin: 8px 0;
}
.sensor-status {
  padding: 4px 8px;
  border-radius: 4px;
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
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
}
.footer button {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.footer button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>`;

export default {
  name: 'SimplePressurePanel',
  template: template + styles,
  
  props: {
    pressureData: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      isRefreshing: false,
      lastUpdate: new Date().toLocaleTimeString(),
      sensors: {
        p1: { label: 'P1', value: 12.5, unit: 'bar', status: 'normal' },
        p2: { label: 'P2', value: 8.3, unit: 'bar', status: 'warning' },
        p3: { label: 'P3', value: 950, unit: 'mbar', status: 'normal' }
      }
    };
  },
  
  methods: {
    refresh() {
      this.isRefreshing = true;
      console.log('🔄 Refreshing pressure data...');
      
      // Simulate data refresh
      setTimeout(() => {
        this.sensors.p1.value = (Math.random() * 20 + 5).toFixed(1);
        this.sensors.p2.value = (Math.random() * 15 + 2).toFixed(1);
        this.sensors.p3.value = Math.floor(Math.random() * 1000 + 500);
        this.lastUpdate = new Date().toLocaleTimeString();
        this.isRefreshing = false;
        console.log('✅ Pressure data refreshed');
      }, 1000);
    }
  },
  
  mounted() {
    console.log('🚀 SimplePressurePanel mounted successfully');
    // Auto-refresh every 5 seconds
    setInterval(() => {
      this.lastUpdate = new Date().toLocaleTimeString();
    }, 5000);
  }
};
