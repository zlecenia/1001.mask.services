/**
 * MainMenu Component JavaScript Module
 * Main navigation menu for the industrial control system
 * 
 * @version 0.1.1
 * @author MASKSERVICE System
 * Components v2.0 Contract Compliant
 */

// CRITICAL: Use global Vue pattern instead of ES imports for CDN compatibility
const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const mainMenuComponent = {
  name: 'MainMenu',
  version: '0.1.1',
  
  template: `
    <nav class="main-menu" :class="'role-' + (userRole || 'none').toLowerCase()" aria-label="Main application menu">
      <div class="menu-header">
        <h3 class="menu-title">{{ translations.menuTitle || 'Menu' }}</h3>
        <div class="user-role-badge" :class="'badge-' + (userRole || 'none').toLowerCase()">
          {{ translations['role_' + (userRole || 'none').toLowerCase()] || userRole }}
        </div>
      </div>

      <nav class="menu-navigation" role="navigation" aria-label="Main navigation menu">
        <ul class="menu-items">
          <li v-for="item in filteredMenuItems" :key="item.id" 
              :class="['menu-item', { 
                'active': activeItem === item.id,
                'disabled': item.disabled,
                'primary': item.isPrimary 
              }]">
            <button class="menu-item-button"
                    :aria-label="'Navigate to ' + item.label"
                    @click="selectMenuItem(item)"
                    @keydown.enter="selectMenuItem(item)"
                    @keydown.space="selectMenuItem(item)">
              <div class="menu-item-content">
                <i :class="['menu-icon', item.icon]"></i>
                <div class="menu-text">
                  <span class="menu-label">{{ getMenuItemLabel(item) }}</span>
                  <span v-if="item.count" class="menu-count">{{ item.count }}</span>
                </div>
                <i class="menu-arrow fas fa-chevron-right"></i>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </nav>
  `,
  
  setup(props = {}) {
    const state = reactive({
      userRole: props.userRole || 'OPERATOR',
      activeItem: props.activeItem || null,
      menuItems: props.menuItems || [],
      translations: props.translations || {}
    });
    
    const filteredMenuItems = computed(() => {
      return state.menuItems.filter(item => {
        if (item.disabled) return false;
        if (item.requiredRole && state.userRole !== item.requiredRole) return false;
        return true;
      });
    });
    
    const selectMenuItem = (item) => {
      if (item.disabled) return;
      
      state.activeItem = item.id;
      
      // Emit navigation event to parent
      if (props.onNavigate && typeof props.onNavigate === 'function') {
        props.onNavigate({
          item,
          route: item.route,
          target: item.route
        });
      }
      
      console.log(`MainMenu: Navigating to ${item.route}`);
    };
    
    const getMenuItemLabel = (item) => {
      const translationKey = `menu.${item.id}`;
      return state.translations[translationKey] || item.label || item.id;
    };
    
    return {
      ...state,
      filteredMenuItems,
      selectMenuItem,
      getMenuItemLabel
    };
  },
  
  render(container, renderProps = {}) {
    if (!container) {
      console.error('MainMenu render: No container provided');
      return;
    }
    
    try {
      // Create Vue app instance for this component
      const app = Vue.createApp({
        ...this,
        setup: () => this.setup(renderProps)
      });
      
      // Mount to container
      app.mount(container);
      
      console.log('✓ MainMenu component rendered successfully');
    } catch (error) {
      console.error('✗ MainMenu render failed:', error);
      container.innerHTML = `<div class="error">MainMenu render error: ${error.message}</div>`;
    }
  }
};

// Export the component
export default mainMenuComponent;
