/**
 * Main Menu Component v1
 * Główne menu aplikacji z kontrolą dostępu opartą na rolach
 * Roles: OPERATOR (2 opcje), ADMIN (4 opcje), SUPERUSER (4 zaawansowane), SERWISANT (5 technicznych)
 */

// Template for role-based menu system
const template = `
<div class="main-menu" :class="'role-' + (userRole || 'none').toLowerCase()">
  <div class="menu-header">
    <h3 class="menu-title">{{ $t('menu.title') }}</h3>
    <div class="user-role-badge" :class="'badge-' + (userRole || 'none').toLowerCase()">
      {{ $t('roles.' + (userRole || 'none').toLowerCase()) }}
    </div>
  </div>

  <nav class="menu-navigation">
    <ul class="menu-list">
      <li v-for="item in filteredMenuItems" 
          :key="item.key" 
          :class="['menu-item', { 
            'active': activeItem === item.key,
            'disabled': item.disabled,
            'primary': item.isPrimary
          }]"
          @click="selectMenuItem(item)">
        
        <div class="menu-item-content">
          <i :class="['menu-icon', item.icon]"></i>
          <div class="menu-text">
            <span class="menu-label">{{ $t('menu.' + item.key) }}</span>
            <span v-if="item.description" class="menu-description">
              {{ $t('menu.' + item.key + '_desc') }}
            </span>
          </div>
          <i v-if="item.hasSubmenu" class="submenu-arrow fas fa-chevron-right"></i>
        </div>

        <!-- Submenu -->
        <ul v-if="item.hasSubmenu && expandedItem === item.key" class="submenu">
          <li v-for="subitem in item.submenu" 
              :key="subitem.key"
              :class="['submenu-item', { 'active': activeSubItem === subitem.key }]"
              @click.stop="selectSubMenuItem(subitem, item)">
            <i :class="['submenu-icon', subitem.icon]"></i>
            <span>{{ $t('menu.' + subitem.key) }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </nav>

  <div class="menu-footer">
    <div class="menu-stats">
      <span class="stats-label">{{ $t('menu.available_options') }}:</span>
      <span class="stats-count">{{ filteredMenuItems.length }}</span>
    </div>
  </div>
</div>
`;

// Styles for menu system optimized for 7.9" display
const styles = `
<style scoped>
.main-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #ddd;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.menu-header {
  padding: 8px;
  border-bottom: 2px solid #eee;
  background: #f8f9fa;
}

.menu-title {
  font-size: 13px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.user-role-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  display: inline-block;
}

.badge-operator { background: #3498db; }
.badge-admin { background: #27ae60; }
.badge-superuser { background: #8e44ad; }
.badge-serwisant { background: #e67e22; }

.menu-navigation {
  flex: 1;
  overflow-y: auto;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.active {
  background: #3498db;
  color: white;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.primary {
  border-left: 3px solid #3498db;
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
}

.menu-icon {
  width: 16px;
  font-size: 14px;
  text-align: center;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  min-width: 0;
}

.menu-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.menu-description {
  display: block;
  font-size: 9px;
  opacity: 0.7;
  line-height: 1.1;
  margin-top: 1px;
}

.submenu-arrow {
  font-size: 10px;
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.menu-item.active .submenu-arrow {
  transform: rotate(90deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.submenu-item {
  padding: 6px 16px 6px 32px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.submenu-item:hover {
  background: #e9ecef;
}

.submenu-item.active {
  background: #2980b9;
  color: white;
}

.submenu-icon {
  width: 12px;
  font-size: 10px;
  text-align: center;
}

.menu-footer {
  padding: 6px 8px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.menu-stats {
  font-size: 9px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-count {
  font-weight: bold;
  color: #3498db;
}

/* Role-specific styling */
.role-operator .menu-item.primary {
  border-left-color: #3498db;
}

.role-admin .menu-item.primary {
  border-left-color: #27ae60;
}

.role-superuser .menu-item.primary {
  border-left-color: #8e44ad;
}

.role-serwisant .menu-item.primary {
  border-left-color: #e67e22;
}

/* Compact mode for smaller screens */
@media (max-height: 450px) {
  .menu-header {
    padding: 6px;
  }
  
  .menu-title {
    font-size: 12px;
  }
  
  .menu-item-content {
    padding: 6px;
  }
  
  .menu-label {
    font-size: 10px;
  }
  
  .menu-description {
    font-size: 8px;
  }
}
</style>
`;

// Component definition with role-based menu logic
export default {
  name: 'MainMenuComponent',
  template: template + styles,
  props: {
    userRole: {
      type: String,
      required: true,
      validator: value => ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'].includes(value)
    },
    currentUser: {
      type: String,
      default: 'user'
    }
  },
  data() {
    return {
      activeItem: null,
      activeSubItem: null,
      expandedItem: null,
      
      // Complete menu configuration for all roles
      menuConfig: {
        OPERATOR: [
          {
            key: 'tests',
            icon: 'fas fa-flask',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'run_test', icon: 'fas fa-play' },
              { key: 'test_history', icon: 'fas fa-history' }
            ]
          },
          {
            key: 'reports',
            icon: 'fas fa-file-alt',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'view_reports', icon: 'fas fa-eye' },
              { key: 'export_reports', icon: 'fas fa-download' }
            ]
          }
        ],
        
        ADMIN: [
          {
            key: 'tests',
            icon: 'fas fa-flask',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'run_test', icon: 'fas fa-play' },
              { key: 'test_history', icon: 'fas fa-history' },
              { key: 'test_config', icon: 'fas fa-cog' }
            ]
          },
          {
            key: 'reports',
            icon: 'fas fa-file-alt',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'view_reports', icon: 'fas fa-eye' },
              { key: 'export_reports', icon: 'fas fa-download' },
              { key: 'report_templates', icon: 'fas fa-template' }
            ]
          },
          {
            key: 'users',
            icon: 'fas fa-users',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'manage_users', icon: 'fas fa-user-edit' },
              { key: 'user_permissions', icon: 'fas fa-key' }
            ]
          },
          {
            key: 'system',
            icon: 'fas fa-cogs',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'system_settings', icon: 'fas fa-sliders-h' },
              { key: 'backup_restore', icon: 'fas fa-database' }
            ]
          }
        ],
        
        SUPERUSER: [
          {
            key: 'advanced_tests',
            icon: 'fas fa-microscope',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'custom_scenarios', icon: 'fas fa-code' },
              { key: 'test_automation', icon: 'fas fa-robot' },
              { key: 'performance_analysis', icon: 'fas fa-chart-line' }
            ]
          },
          {
            key: 'system_integration',
            icon: 'fas fa-network-wired',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'api_management', icon: 'fas fa-plug' },
              { key: 'data_sync', icon: 'fas fa-sync' },
              { key: 'external_systems', icon: 'fas fa-external-link-alt' }
            ]
          },
          {
            key: 'advanced_reports',
            icon: 'fas fa-chart-pie',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'analytics', icon: 'fas fa-analytics' },
              { key: 'data_mining', icon: 'fas fa-search-plus' },
              { key: 'trend_analysis', icon: 'fas fa-trending-up' }
            ]
          },
          {
            key: 'system_admin',
            icon: 'fas fa-shield-alt',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'security_audit', icon: 'fas fa-lock' },
              { key: 'system_monitoring', icon: 'fas fa-monitor-heart-rate' },
              { key: 'maintenance_mode', icon: 'fas fa-tools' }
            ]
          }
        ],
        
        SERWISANT: [
          {
            key: 'diagnostics',
            icon: 'fas fa-stethoscope',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'hardware_test', icon: 'fas fa-microchip' },
              { key: 'sensor_calibration', icon: 'fas fa-balance-scale' },
              { key: 'error_logs', icon: 'fas fa-bug' }
            ]
          },
          {
            key: 'maintenance',
            icon: 'fas fa-wrench',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'scheduled_maintenance', icon: 'fas fa-calendar-check' },
              { key: 'preventive_care', icon: 'fas fa-shield-virus' },
              { key: 'component_replacement', icon: 'fas fa-exchange-alt' }
            ]
          },
          {
            key: 'workshop',
            icon: 'fas fa-hammer',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'repair_orders', icon: 'fas fa-clipboard-list' },
              { key: 'parts_inventory', icon: 'fas fa-boxes' },
              { key: 'service_history', icon: 'fas fa-history' }
            ]
          },
          {
            key: 'technical_docs',
            icon: 'fas fa-book-open',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'manuals', icon: 'fas fa-book' },
              { key: 'schematics', icon: 'fas fa-project-diagram' },
              { key: 'procedures', icon: 'fas fa-list-ol' }
            ]
          },
          {
            key: 'quality_control',
            icon: 'fas fa-check-double',
            isPrimary: true,
            hasSubmenu: true,
            submenu: [
              { key: 'certification', icon: 'fas fa-certificate' },
              { key: 'compliance_check', icon: 'fas fa-clipboard-check' },
              { key: 'standards_validation', icon: 'fas fa-stamp' }
            ]
          }
        ]
      }
    };
  },
  computed: {
    userRole() {
      return this.$store?.state?.user?.role || 'OPERATOR';
    },
    filteredMenuItems() {
      return this.menuConfig[this.userRole] || [];
    }
  },
  methods: {
    selectMenuItem(item) {
      if (item.disabled) return;
      
      if (item.hasSubmenu) {
        this.expandedItem = this.expandedItem === item.key ? null : item.key;
      } else {
        this.activeItem = item.key;
        this.expandedItem = null;
        this.$emit('menu-selected', {
          item: item.key,
          role: this.userRole,
          timestamp: new Date()
        });
      }
    },
    
    selectSubMenuItem(subitem, parentItem) {
      this.activeItem = parentItem.key;
      this.activeSubItem = subitem.key;
      
      this.$emit('menu-selected', {
        item: parentItem.key,
        subitem: subitem.key,
        role: this.userRole,
        timestamp: new Date()
      });
    },
    
    getMenuItemCount() {
      return this.filteredMenuItems.length;
    },
    
    hasPermission(requiredRole) {
      const roleHierarchy = {
        'OPERATOR': 1,
        'ADMIN': 2,
        'SUPERUSER': 3,
        'SERWISANT': 4
      };
      
      return roleHierarchy[this.userRole] >= roleHierarchy[requiredRole];
    }
  },
  
  mounted() {
    console.log(`MainMenu initialized for role: ${this.userRole}`);
    console.log(`Available menu items: ${this.getMenuItemCount()}`);
  },
  
  emits: ['menu-selected']
};
