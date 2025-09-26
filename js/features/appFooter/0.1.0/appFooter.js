// AppFooter component for 7.9" display with browser compatibility
const template = `
<footer class="app-footer" :class="deviceClass">
  <div class="footer-left">
    <div class="footer-copyright">
      {{ $t('footer.copyright') || '© 2025 MASKTRONIC' }}
    </div>
    <div class="footer-device-info">
      <span class="device-name">{{ deviceInfo.name || $t('footer.default_device') || 'TEST_DEVICE' }}</span>
      <span class="device-model">{{ deviceInfo.model || 'C20' }}</span>
    </div>
    <span class="system-info" v-if="systemInfo">
      <span class="build-date">{{ formatBuildDate(systemInfo.buildDate) }}</span>
      <span class="environment" :class="systemInfo.environment">{{ $t('footer.environment') || systemInfo.environment }}</span>
    </span>
  </div>
  
  <div class="footer-center">
    <div class="footer-build-info">
      <span class="version">{{ $t('footer.version') }}: {{ buildInfo.version || '3.0.0' }}</span>
      <span class="build-number">{{ $t('footer.build') }}: {{ buildInfo.buildNumber || '2024.001' }}</span>
    </div>
    <span class="current-time footer-text">{{ currentTime }}</span>
  </div>
  
  <div class="footer-right">
    <div class="footer-status" :class="statusClass">
      <span class="status-text">{{ $t('footer.status.' + deviceStatus.toLowerCase()) || deviceStatus || $t('footer.status.online') }}</span>
    </div>
    <span class="user-info footer-info">
      <span class="user-name">{{ currentUser.name }}</span>
      <span class="user-role" :class="currentUser.role.toLowerCase()">{{ $t('footer.role.' + currentUser.role.toLowerCase()) || currentUser.role }}</span>
    </span>
  </div>
</footer>`;

const styles = `
<style scoped>
.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border-top: 2px solid #1a252f;
  min-height: 40px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-copyright {
  color: #bdc3c7;
  font-size: 10px;
}

.footer-device-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.device-name, .device-model {
  background: #34495e;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version {
  background: #3498db;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.build-date {
  color: #bdc3c7;
  font-size: 10px;
}

.environment {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.environment.development {
  background: #f39c12;
  color: white;
}

.environment.production {
  background: #27ae60;
  color: white;
}

.environment.staging {
  background: #9b59b6;
  color: white;
}

.footer-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.footer-build-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.build-number {
  background: #16a085;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.current-time {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #ecf0f1;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.footer-text {
  font-size: 12px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-status {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.footer-status.status-online {
  background: #27ae60;
  color: white;
}

.footer-status.status-offline {
  background: #e74c3c;
  color: white;
}

.footer-status.status-connecting {
  background: #f39c12;
  color: white;
}

.footer-status.status-error {
  background: #c0392b;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-info {
  font-size: 11px;
}

.user-name {
  color: #ecf0f1;
  font-size: 11px;
}

.user-role {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.user-role.operator {
  background: #3498db;
  color: white;
}

.user-role.admin {
  background: #e74c3c;
  color: white;
}

.user-role.superuser {
  background: #9b59b6;
  color: white;
}

.user-role.serwisant {
  background: #f39c12;
  color: white;
}

/* 7.9" landscape display optimization (1280x400px) */
.landscape-7-9 {
  padding: 4px 12px;
  min-height: 30px;
  font-size: 10px;
}

.landscape-7-9 .version {
  font-size: 8px;
  padding: 1px 4px;
}

.landscape-7-9 .build-date {
  font-size: 8px;
}

.landscape-7-9 .environment {
  font-size: 8px;
  padding: 1px 4px;
}

.landscape-7-9 .current-time {
  font-size: 9px;
  padding: 2px 6px;
}

.landscape-7-9 .user-name {
  font-size: 9px;
}

.landscape-7-9 .user-role {
  font-size: 8px;
  padding: 1px 4px;
}

/* Responsive for very small screens */
@media (max-width: 450px) {
  .app-footer {
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    min-height: auto;
  }
  
  .footer-left, .footer-center, .footer-right {
    flex: none;
  }
  
  .system-info {
    gap: 4px;
  }
  
  .user-info {
    gap: 4px;
  }
}
</style>`;

export default {
  name: 'AppFooterComponent',
  template: template + styles,
  
  props: {
    systemInfo: {
      type: Object,
      default: () => ({
        version: 'v3.0',
        buildDate: new Date().toISOString().split('T')[0],
        environment: 'development'
      })
    },
    currentUser: {
      type: Object,
      default: () => ({
        name: 'Guest',
        role: 'OPERATOR'
      })
    },
    deviceInfo: {
      type: Object,
      default: () => ({
        name: 'TEST_DEVICE',
        model: 'C20'
      })
    },
    buildInfo: {
      type: Object,
      default: () => ({
        version: '3.0.0',
        buildNumber: '2025.001'
      })
    },
    deviceStatus: {
      type: String,
      default: 'ONLINE',
      validator: (value) => ['ONLINE', 'OFFLINE', 'CONNECTING', 'ERROR'].includes(value)
    }
  },
  
  data() {
    return {
      currentTime: ''
    };
  },
  
  computed: {
    deviceClass() {
      // Return class for 7.9" landscape optimization
      return 'landscape-7-9';
    },
    statusClass() {
      return {
        'status-online': this.deviceStatus === 'ONLINE',
        'status-offline': this.deviceStatus === 'OFFLINE',
        'status-connecting': this.deviceStatus === 'CONNECTING',
        'status-error': this.deviceStatus === 'ERROR'
      };
    }
  },
  
  methods: {
    formatBuildDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const locale = window.$getCurrentLanguage ? window.$getCurrentLanguage() : 'pl';
      const localeMap = { 'pl': 'pl-PL', 'en': 'en-US', 'de': 'de-DE' };
      return date.toLocaleDateString(localeMap[locale] || 'pl-PL', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    },
    
    updateTime() {
      const now = new Date();
      const locale = window.$getCurrentLanguage ? window.$getCurrentLanguage() : 'pl';
      const localeMap = { 'pl': 'pl-PL', 'en': 'en-US', 'de': 'de-DE' };
      this.currentTime = now.toLocaleTimeString(localeMap[locale] || 'pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  },
  
  mounted() {
    console.log('AppFooter component mounted successfully');
    
    // Update time immediately and then every second
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
  },
  
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
};
