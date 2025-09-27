<template>
  <div 
    class="main-menu" 
    :class="'role-' + (userRole || 'none').toLowerCase()" 
    role="navigation" 
    aria-label="Main application menu"
  >
    <div class="menu-header">
      <h3 class="menu-title">{{ $t('menu.title') }}</h3>
      <div 
        class="user-role-badge" 
        :class="'badge-' + (userRole || 'none').toLowerCase()"
      >
        {{ $t('roles.' + (userRole || 'none').toLowerCase()) }}
      </div>
    </div>

    <nav class="menu-navigation" role="navigation" aria-label="Main navigation menu">
      <ul class="menu-items">
        <li 
          v-for="item in filteredMenuItems" 
          :key="item.key" 
          :class="[
            'menu-item', 
            { 
              'active': activeItem === item.key,
              'disabled': item.disabled,
              'primary': item.isPrimary 
            }
          ]"
          role="menuitem"
          tabindex="0"
          @click="selectMenuItem(item)"
          @keydown.enter="selectMenuItem(item)"
          @keydown.space="selectMenuItem(item)"
        >
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
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { getSecurityService } from '../../../services/securityService.js';

export default {
  name: 'MainMenu',
  
  setup(props, { emit }) {
    const store = useStore();
    
    // Refs
    const activeItem = ref(null);
    const securityService = ref(null);
    const sessionTimeoutInterval = ref(null);
    const lastAccessTime = ref(Date.now());
    
    // Menu items configuration
    const menuItems = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
        route: '/dashboard',
        isPrimary: true
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: 'fas fa-cog',
        roles: ['ADMIN', 'SUPERUSER'],
        route: '/settings'
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: 'fas fa-chart-bar',
        roles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
        route: '/reports'
      },
      {
        key: 'admin',
        label: 'Administration',
        icon: 'fas fa-shield-alt',
        roles: ['SUPERUSER'],
        route: '/admin'
      },
      {
        key: 'service',
        label: 'Service',
        icon: 'fas fa-tools',
        roles: ['SERWISANT', 'SUPERUSER'],
        route: '/service'
      }
    ];
    
    // Computed
    const userRole = computed(() => store.state.user?.role || 'OPERATOR');
    
    const filteredMenuItems = computed(() => {
      return menuItems.filter(item => {
        return item.roles.includes(userRole.value) && validateMenuAccess(item);
      });
    });
    
    // Methods
    function selectMenuItem(item) {
      if (item.disabled) return;
      
      activeItem.value = item.key;
      
      // Log the menu selection
      logAuditEvent('MENU_ITEM_SELECTED', {
        menuItem: item.key,
        route: item.route,
        timestamp: new Date().toISOString()
      });
      
      // Emit event or navigate
      if (item.route) {
        // Use router if available, otherwise emit event
        if (window.router) {
          window.router.push(item.route);
        } else {
          // Emit event for parent component to handle
          emit('navigate', item.route);
        }
      }
    }
    
    function validateMenuAccess(item) {
      if (!item.requiredPermissions) return true;
      
      return item.requiredPermissions.every(permission => 
        securityService.value?.hasPermission?.(permission) ?? true
      );
    }
    
    function logAuditEvent(event, data) {
      if (securityService.value?.logAuditEvent) {
        securityService.value.logAuditEvent(event, {
          ...data,
          component: 'MainMenu',
          userRole: userRole.value
        });
      }
    }
    
    function checkSessionTimeout() {
      const now = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      if (now - lastAccessTime.value > sessionTimeout) {
        // Handle session timeout
        logAuditEvent('SESSION_TIMEOUT', {
          lastActivity: new Date(lastAccessTime.value).toISOString(),
          timeoutAfter: '30m'
        });
        
        // Emit event or handle timeout
        emit('session-timeout');
      }
    }
    
    // Lifecycle hooks
    onMounted(() => {
      console.log('MainMenu component mounted');
      
      // Initialize security service
      securityService.value = getSecurityService() || {
        logAuditEvent: (event, data) => console.log(`[Security] ${event}:`, data),
        hasPermission: () => true,
        getCurrentUser: () => ({ role: 'OPERATOR' })
      };
      
      // Log initialization
      logAuditEvent('MENU_COMPONENT_INIT', {
        userRole: userRole.value,
        timestamp: new Date().toISOString()
      });
      
      // Set up session timeout check
      sessionTimeoutInterval.value = setInterval(() => {
        checkSessionTimeout();
      }, 5 * 60 * 1000); // Check every 5 minutes
    });
    
    onBeforeUnmount(() => {
      // Clean up interval
      if (sessionTimeoutInterval.value) {
        clearInterval(sessionTimeoutInterval.value);
      }
      
      // Log cleanup
      logAuditEvent('MENU_COMPONENT_CLEANUP', {
        userRole: userRole.value,
        sessionDuration: Date.now() - lastAccessTime.value,
        timestamp: new Date().toISOString()
      });
    });
    
    // Expose to template
    return {
      activeItem,
      userRole,
      filteredMenuItems,
      selectMenuItem,
      validateMenuAccess,
      logAuditEvent
    };
  }
};
</script>

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
  padding: 8px 0;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 8px 12px;
  margin: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.menu-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.primary {
  font-weight: 500;
}

.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-icon {
  width: 24px;
  margin-right: 8px;
  text-align: center;
}

.menu-text {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-count {
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  margin-left: 8px;
}

.menu-arrow {
  margin-left: 8px;
  font-size: 10px;
  opacity: 0.7;
}

.menu-footer {
  padding: 8px;
  border-top: 1px solid #eee;
  font-size: 11px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-stats {
  display: flex;
  align-items: center;
}

.stats-label {
  margin-right: 4px;
}

.stats-count {
  font-weight: bold;
  color: #2c3e50;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .menu-title {
    font-size: 12px;
  }
  
  .menu-item {
    padding: 6px 8px;
  }
}

@media (max-height: 600px) {
  .menu-header {
    padding: 6px;
  }
  
  .menu-item {
    padding: 4px 8px;
  }
  
  .menu-footer {
    padding: 4px 8px;
  }
}
</style>
