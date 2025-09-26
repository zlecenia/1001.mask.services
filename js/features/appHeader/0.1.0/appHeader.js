// AppHeader component for 7.9" display with browser compatibility
const template = `
<header class="app-header" :class="deviceClass">
  <div class="header-left">
    <a href="/" @click.prevent="handleLogoClick">
      <span class="logo">{{ $t('global.company') || 'MASKTRONIC' }}</span>
      <span class="hardware">{{ $t('global.hardware') || 'C20' }}</span>
      <span class="product">{{ $t('global.product') || '1001' }}</span>
      <span class="software">{{ $t('global.version') || 'v3.0' }}</span>
    </a>
  </div>
  
  <div class="header-center">
    <span class="status-indicator">
      <span class="footer-host">
        <a :href="\`https://\${deviceInfo.url}\`" target="_blank" rel="noopener">
          {{ deviceInfo.url }}
        </a>
      </span>
      <span class="status-dot" :class="deviceStatus.toLowerCase()"></span>
      <span class="role-badge" :class="deviceStatus.toLowerCase()">
        {{ $t(\`global.\${deviceStatus.toLowerCase()}\`) || deviceStatus }}
      </span>
    </span>
  </div>

  <div class="header-right">
    <span class="device-info">
      <span>{{ $t('header.device_info') || deviceInfo.name }}</span>
      <span>{{ deviceInfo.type }}</span>
    </span>
    
    <!-- Language Selector -->
    <div class="language-selector">
      <button 
        v-for="lang in languages" 
        :key="lang.code"
        :class="['lang-btn', { active: currentLanguage === lang.code }]"
        @click="changeLanguage(lang.code)"
        :title="lang.nativeName"
        :aria-label="$t('header.language_selector') + ': ' + lang.nativeName"
      >
        {{ lang.flag }}
      </button>
    </div>
  </div>
</header>`;

const styles = `
<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border-bottom: 2px solid #1a252f;
  min-height: 60px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-left a {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.logo {
  font-weight: bold;
  font-size: 18px;
  color: #3498db;
}

.hardware {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.product {
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.software {
  background: #27ae60;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.footer-host a {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
}

.footer-host a:hover {
  text-decoration: underline;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  animation: pulse-dot 2s infinite;
}

.status-dot.online {
  background: #27ae60;
}

.role-badge {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.online {
  color: #27ae60;
}

.role-badge.offline {
  color: #e74c3c;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-info {
  display: flex;
  flex-direction: column;
  text-align: right;
  font-size: 14px;
}

.device-info span:first-child {
  font-weight: bold;
}

.device-info span:last-child {
  color: #bdc3c7;
  font-size: 12px;
}

.language-selector {
  display: flex;
  gap: 4px;
}

.lang-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.lang-btn.active {
  background: #3498db;
  border-color: #2980b9;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 7.9" landscape display optimization (1280x400px) */
.landscape-7-9 {
  padding: 4px 12px;
  min-height: 50px;
}

.landscape-7-9 .logo {
  font-size: 16px;
}

.landscape-7-9 .hardware,
.landscape-7-9 .product,
.landscape-7-9 .software {
  font-size: 10px;
  padding: 2px 6px;
}

.landscape-7-9 .status-indicator {
  padding: 6px 12px;
  font-size: 12px;
}

.landscape-7-9 .device-info {
  font-size: 12px;
}

.landscape-7-9 .lang-btn {
  min-width: 35px;
  padding: 3px 6px;
  font-size: 14px;
}

/* Responsive for very small screens */
@media (max-width: 450px) {
  .app-header {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    min-height: auto;
  }
  
  .header-left, .header-center, .header-right {
    flex: none;
  }
  
  .header-left a {
    gap: 4px;
  }
  
  .status-indicator {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .device-info {
    font-size: 12px;
    text-align: center;
  }
  
  .language-selector {
    justify-content: center;
  }
}
</style>`;

export default {
  name: 'AppHeaderComponent',
  template: template + styles,
  
  props: {
    deviceStatus: {
      type: String,
      default: 'OFFLINE',
      validator: (value) => ['ONLINE', 'OFFLINE', 'CONNECTING'].includes(value)
    },
    deviceInfo: {
      type: Object,
      default: () => ({
        name: 'CONNECT',
        type: '500',
        url: 'c201001.mask.services'
      })
    },
    currentLanguage: {
      type: String,
      default: 'pl',
      validator: (value) => ['pl', 'en', 'de'].includes(value)
    }
  },
  
  data() {
    return {
      languages: window.$getSupportedLanguages ? window.$getSupportedLanguages() : [
        { code: 'pl', name: 'Polski', nativeName: 'Polski', flag: '🇵🇱' },
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' }
      ]
    };
  },
  
  computed: {
    deviceClass() {
      // Return class for 7.9" landscape optimization
      return 'landscape-7-9';
    }
  },
  
  methods: {
    changeLanguage(languageCode) {
      if (languageCode !== this.currentLanguage) {
        // Use global i18n service if available
        if (window.$changeLanguage) {
          window.$changeLanguage(languageCode);
        }
        this.$emit('language-changed', languageCode);
      }
    },
    
    handleLogoClick() {
      this.$emit('logo-clicked');
    }
  },
  
  mounted() {
    console.log('AppHeader component mounted successfully');
  }
};
