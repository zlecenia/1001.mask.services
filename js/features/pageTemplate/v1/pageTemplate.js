/**
 * Page Template Component v1
 * Bazowy template strony dla systemu MASKSERVICE z układem dla wyświetlacza 7.9 cala (400x1280px landscape)
 */

// Template for the page layout optimized for 7.9" landscape display
const template = `
<div class="page-template landscape-7-9" :class="{'fullscreen': isFullscreen}">
  <!-- Header Section (40px height) -->
  <header class="page-header">
    <div class="header-left">
      <img src="/favicon.ico" alt="MASKSERVICE" class="logo">
      <h1 class="system-title">{{ title || 'MASKSERVICE C20 1001' }}</h1>
    </div>
    <div class="header-center">
      <div class="connection-status" :class="connectionStatus">
        <i class="status-icon"></i>
        <span>{{ connectionText }}</span>
      </div>
    </div>
    <div class="header-right">
      <div class="device-info">
        <span class="device-id">{{ deviceId }}</span>
        <span class="device-status">{{ deviceStatus }}</span>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <div class="page-content">
    <!-- Sidebar Menu (180px width) -->
    <aside class="page-sidebar" v-if="showSidebar">
      <slot name="sidebar">
        <nav class="sidebar-nav">
          <ul class="nav-menu">
            <li v-for="item in menuItems" :key="item.key" 
                :class="['nav-item', { active: activeItem === item.key }]"
                @click="selectMenuItem(item)">
              <i :class="item.icon"></i>
              <span>{{ $t(item.label) }}</span>
            </li>
          </ul>
        </nav>
      </slot>
    </aside>

    <!-- Content Body -->
    <main class="page-body page-main" :style="mainContentStyle">
      <!-- Pressure Panel (when needed) -->
      <div class="pressure-panel" v-if="showPressurePanel">
        <div class="pressure-item" v-for="sensor in computedPressureSensors" :key="sensor.type">
          <label class="pressure-label">{{ $t('pressure.' + sensor.type) }}</label>
          <div :class="['pressure-value', 'pressure-' + sensor.type, { 'warning': sensor.isWarning, 'critical': sensor.isCritical }]">
            {{ sensor.value || '--' }}
          </div>
          <div class="pressure-unit">{{ sensor.unit }}</div>
          <div class="pressure-chart">
            <svg width="40" height="20">
              <polyline :points="sensor.chartPoints" 
                       fill="none" stroke="#3498db" stroke-width="1"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Dynamic Content Slot -->
      <div class="content-area page-content">
        <slot name="default">
          <div class="placeholder-content">
            <h3>{{ contentTitle }}</h3>
            <p>{{ contentDescription }}</p>
          </div>
        </slot>
      </div>
    </main>
  </div>

  <!-- Footer Section (30px height) -->
  <footer class="page-footer">
    <div class="footer-left">
      <span class="user-info">{{ $t('user.current') }}: {{ currentUser }}</span>
    </div>
    <div class="footer-center">
      <div class="language-selector">
        <select v-model="currentLanguage" @change="changeLanguage">
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
    <div class="footer-right">
      <span class="datetime">{{ currentDateTime }}</span>
      <button @click="logout" class="logout-btn">{{ $t('common.logout') }}</button>
    </div>
  </footer>
</div>
`;

// Styles optimized for 7.9" landscape display (400x1280px)
const styles = `
<style scoped>
.page-template {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #fafafa;
  overflow: hidden;
}

/* Header Styles */
.page-header {
  height: 40px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 13px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 24px;
  height: 24px;
}

.system-title {
  font-weight: bold;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.connection-status.connected .status-icon {
  background: #27ae60;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connection-status.disconnected .status-icon {
  background: #e74c3c;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.device-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 11px;
}

/* Content Area */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.page-sidebar {
  width: 180px;
  background: white;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.nav-item:hover {
  background: #f0f0f0;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

/* Main Content */
.page-main {
  flex: 1;
  padding: 4px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Pressure Panel */
.pressure-panel {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.pressure-item {
  flex: 1;
  text-align: center;
  min-width: 100px;
}

.pressure-label {
  display: block;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  margin-bottom: 2px;
}

.pressure-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
}

.pressure-unit {
  font-size: 9px;
  color: #999;
  margin-bottom: 4px;
}

.pressure-chart {
  height: 20px;
  display: flex;
  justify-content: center;
}

/* Content Area */
.content-area {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #ddd;
  overflow-y: auto;
}

.placeholder-content {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.placeholder-content h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.placeholder-content p {
  margin: 0;
  font-size: 12px;
}

/* Footer */
.page-footer {
  height: 30px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 10px;
  flex-shrink: 0;
}

.language-selector select {
  background: #34495e;
  color: white;
  border: 1px solid #555;
  padding: 2px 4px;
  font-size: 10px;
  border-radius: 2px;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 2px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}

/* Fullscreen mode */
.page-template.fullscreen .page-sidebar {
  display: none;
}

/* Responsive adjustments for 400px height */
@media (max-height: 450px) {
  .page-header {
    height: 35px;
    font-size: 12px;
  }
  
  .page-footer {
    height: 25px;
    font-size: 9px;
  }
  
  .pressure-panel {
    padding: 6px;
  }
  
  .content-area {
    padding: 8px;
  }
}
</style>
`;

// Component definition
export default {
  name: 'PageTemplateComponent',
  template: template + styles,
  props: {
    title: {
      type: String,
      default: 'MASKSERVICE C20 1001'
    },
    showSidebar: {
      type: Boolean,
      default: true
    },
    showPressurePanel: {
      type: Boolean,
      default: false
    },
    menuItems: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: String,
      default: 'OPERATOR'
    },
    deviceId: {
      type: String,
      default: 'MASK-001'
    }
  },
  data() {
    return {
      activeItem: null,
      connectionStatus: 'connected',
      deviceStatus: 'Online',
      currentLanguage: 'pl',
      contentTitle: 'Page Template v1',
      contentDescription: 'Bazowy template strony dla systemu MASKSERVICE',
      isFullscreen: false,
      currentDateTime: '',
      pressureSensors: [
        {
          type: 'low',
          value: '850',
          unit: 'mbar',
          chartPoints: '0,15 10,12 20,8 30,10 40,5'
        },
        {
          type: 'medium',
          value: '2.5',
          unit: 'bar',
          chartPoints: '0,10 10,15 20,12 30,8 40,14'
        },
        {
          type: 'high',
          value: '6.2',
          unit: 'bar',
          chartPoints: '0,5 10,8 20,12 30,15 40,10'
        }
      ]
    };
  },
  computed: {
    connectionText() {
      return this.connectionStatus === 'connected' ? 
        this.$t('status.connected') : this.$t('status.disconnected');
    },
    mainContentStyle() {
      return this.showSidebar ? {} : { marginLeft: 0 };
    },
    computedPressureSensors() {
      // Use store data if available, otherwise fallback to default data
      const storeData = this.$store?.state?.system?.pressureData;
      
      if (storeData && storeData !== null) {
        return [
          {
            type: 'inlet',
            value: storeData.inlet || null,
            unit: 'bar',
            chartPoints: '0,15 10,12 20,8 30,10 40,5',
            isWarning: storeData.inlet > 20,
            isCritical: storeData.inlet > 30
          },
          {
            type: 'outlet', 
            value: storeData.outlet || null,
            unit: 'bar',
            chartPoints: '0,10 10,15 20,12 30,8 40,14',
            isWarning: storeData.outlet > 15,
            isCritical: storeData.outlet > 25
          },
          {
            type: 'differential',
            value: storeData.differential || null,
            unit: 'bar',
            chartPoints: '0,5 10,8 20,12 30,15 40,10',
            isWarning: storeData.differential && storeData.differential > 5,
            isCritical: storeData.differential && storeData.differential > 10
          }
        ];
      } else {
        // Return empty data to show '--' when store data is null/missing
        return [
          {
            type: 'inlet',
            value: null,
            unit: 'bar',
            chartPoints: '0,15 10,12 20,8 30,10 40,5',
            isWarning: false,
            isCritical: false
          },
          {
            type: 'outlet', 
            value: null,
            unit: 'bar',
            chartPoints: '0,10 10,15 20,12 30,8 40,14',
            isWarning: false,
            isCritical: false
          },
          {
            type: 'differential',
            value: null,
            unit: 'bar',
            chartPoints: '0,5 10,8 20,12 30,15 40,10',
            isWarning: false,
            isCritical: false
          }
        ];
      }
    }
  },
  watch: {
    // Watch for changes in store pressure data to ensure reactivity
    '$store.state.system.pressureData': {
      handler(newData, oldData) {
        // Force re-evaluation of computed properties when store data changes
        this.$forceUpdate();
      },
      deep: true,
      immediate: false
    }
  },
  methods: {
    selectMenuItem(item) {
      this.activeItem = item.key;
      this.$emit('menu-selected', item);
    },
    changeLanguage() {
      this.$emit('language-changed', this.currentLanguage);
    },
    logout() {
      this.$emit('logout');
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    updateDateTime() {
      this.currentDateTime = new Date().toLocaleString(this.currentLanguage);
    },
    handleResize() {
      // Handle window resize events for responsive design
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Adjust layout based on window size
      if (width < 1280 || height < 400) {
        this.isFullscreen = true;
      } else {
        this.isFullscreen = false;
      }
      
      this.$emit('resize', { width, height });
    }
  },
  mounted() {
    this.updateDateTime();
    this.dateTimeInterval = setInterval(this.updateDateTime, 1000);
    
    // Add window resize event listener
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    if (this.dateTimeInterval) {
      clearInterval(this.dateTimeInterval);
    }
    
    // Remove window resize event listener
    window.removeEventListener('resize', this.handleResize);
  },
  emits: ['menu-selected', 'language-changed', 'logout']
};
