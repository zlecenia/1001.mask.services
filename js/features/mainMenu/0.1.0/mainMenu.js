/**
 * Main Menu Component 0.1.0
 * Główne menu aplikacji z kontrolą dostępu opartą na rolach
 * Roles: OPERATOR (2 opcje), ADMIN (4 opcje), SUPERUSER (4 zaawansowane), SERWISANT (5 technicznych)
 */

// Template for role-based menu system
const template = `
<div class="main-menu" :class="'role-' + (userRole || 'none').toLowerCase()" role="navigation" aria-label="Main application menu">
  <div class="menu-header">
    <h3 class="menu-title">{{ $t('menu.title') }}</h3>
    <div class="user-role-badge" :class="'badge-' + (userRole || 'none').toLowerCase()">
      {{ $t('roles.' + (userRole || 'none').toLowerCase()) }}
    </div>
  </div>

  <nav class="menu-navigation" role="navigation" aria-label="Main navigation menu">
    <ul class="menu-items">
      <li v-for="item in filteredMenuItems" 
          :key="item.key" 
          :class="['menu-item', { 
            'active': activeItem === item.key,
            'disabled': item.disabled,
            'primary': item.isPrimary
          }]"
          role="menuitem"
          tabindex="0"
          @click="selectMenuItem(item)"
          @keydown.enter="selectMenuItem(item)"
          @keydown.space="selectMenuItem(item)">
        
        <div class="menu-item-content">
          <i :class="['menu-icon', item.icon]"></i>
          <div class="menu-text">
            <span class="menu-label">{{ $t('menu.' + item.key) }}</span>
            <span v-if="item.count" class="menu-count">{{ item.count }}</span>
          </div>
          <i class="menu-arrow fas fa-chevron-right"></i>
        </div>
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
    // userRole is now computed from store - no props needed
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
      
      // Complete menu configuration for all roles - matches module config
      menuConfig: {
        OPERATOR: [
          { id: 'monitoring', key: 'monitoring', icon: 'fas fa-desktop', isPrimary: true },
          { id: 'alerts', key: 'alerts', icon: 'fas fa-bell', isPrimary: true }
        ],
        
        ADMIN: [
          { id: 'tests', key: 'tests', icon: 'fas fa-flask', isPrimary: true },
          { id: 'reports', key: 'reports', icon: 'fas fa-file-alt', isPrimary: true },
          { id: 'users', key: 'users', icon: 'fas fa-users', isPrimary: true },
          { id: 'system', key: 'system', icon: 'fas fa-cogs', isPrimary: true }
        ],
        SUPERUSER: [
          { id: 'integration', key: 'integration', icon: 'fas fa-network-wired', isPrimary: true },
          { id: 'analytics', key: 'analytics', icon: 'fas fa-chart-pie', isPrimary: true },
          { id: 'advanced-system', key: 'advanced-system', icon: 'fas fa-microscope', isPrimary: true },
          { id: 'audit', key: 'audit', icon: 'fas fa-shield-alt', isPrimary: true }
        ],
        SERWISANT: [
          { id: 'diagnostics', key: 'diagnostics', icon: 'fas fa-stethoscope', isPrimary: true },
          { id: 'calibration', key: 'calibration', icon: 'fas fa-balance-scale', isPrimary: true },
          { id: 'maintenance', key: 'maintenance', icon: 'fas fa-wrench', isPrimary: true },
          { id: 'workshop', key: 'workshop', icon: 'fas fa-hammer', isPrimary: true },
          { id: 'tech-docs', key: 'tech-docs', icon: 'fas fa-book-open', isPrimary: true }
        ]
      }
    };
  },
  computed: {
    userRole() {
      const role = this.$store?.state?.user?.role;
      console.log('MainMenu userRole computed:', role, 'store:', this.$store?.state?.user);
      // Return empty string for null/undefined role to show 0 menu items
      return role || '';
    },
    filteredMenuItems() {
      const items = this.menuConfig[this.userRole] || [];
      console.log('MainMenu filteredMenuItems:', items.length, 'for role:', this.userRole);
      return items;
    }
  },
  methods: {
    selectMenuItem(item) {
      console.log('MainMenu selectMenuItem called:', item, 'router:', this.$router);
      if (item.disabled) return;
      
      // Set active item and clear expansion
      this.activeItem = item.key;
      this.expandedItem = null;
      
      // Router navigation - now always happens since no submenu
      console.log('MainMenu router navigation attempt:', this.$router, item.key);
      if (this.$router && this.$router.push) {
        console.log('MainMenu calling router.push:', `/${item.key}`);
        this.$router.push(`/${item.key}`);
      } else {
        console.log('MainMenu no router available or push method missing');
      }
      
      this.$emit('menu-selected', {
        item: item.key,
        role: this.userRole,
        timestamp: new Date()
      });
    },
    
    selectSubMenuItem(subitem, parentItem) {
      this.activeItem = parentItem.key;
      this.activeSubItem = subitem.key;
      
      // Router navigation for submenus
      if (this.$router) {
        this.$router.push(`/${parentItem.key}/${subitem.key}`);
      }
      
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
