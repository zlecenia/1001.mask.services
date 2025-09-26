// Navigation Module for Vuex Store
// Handles routing, menu state, and navigation-related functionality

const navigationModule = {
  namespaced: true,
  
  state: {
    currentRoute: '/dashboard',
    previousRoute: null,
    menuState: 'expanded', // 'expanded', 'collapsed'
    activeMenuItem: null,
    breadcrumbs: [],
    routeHistory: [],
    maxRouteHistory: 10,
    navigationLoading: false,
    sidebarVisible: true,
    pressurePanelVisible: true
  },
  
  getters: {
    currentRoute: (state) => state.currentRoute,
    previousRoute: (state) => state.previousRoute,
    isMenuCollapsed: (state) => state.menuState === 'collapsed',
    isMenuExpanded: (state) => state.menuState === 'expanded',
    activeMenuItem: (state) => state.activeMenuItem,
    breadcrumbs: (state) => state.breadcrumbs,
    canGoBack: (state) => state.routeHistory.length > 1,
    isNavigationLoading: (state) => state.navigationLoading,
    layoutConfig: (state) => ({
      sidebarVisible: state.sidebarVisible,
      pressurePanelVisible: state.pressurePanelVisible,
      menuState: state.menuState
    })
  },
  
  mutations: {
    SET_CURRENT_ROUTE(state, route) {
      state.previousRoute = state.currentRoute;
      state.currentRoute = route;
      
      // Add to history
      state.routeHistory.push({
        route,
        timestamp: Date.now()
      });
      
      // Limit history size
      if (state.routeHistory.length > state.maxRouteHistory) {
        state.routeHistory = state.routeHistory.slice(-state.maxRouteHistory);
      }
    },
    
    SET_MENU_STATE(state, menuState) {
      state.menuState = menuState;
    },
    
    TOGGLE_MENU(state) {
      state.menuState = state.menuState === 'expanded' ? 'collapsed' : 'expanded';
    },
    
    SET_ACTIVE_MENU_ITEM(state, itemId) {
      state.activeMenuItem = itemId;
    },
    
    SET_BREADCRUMBS(state, breadcrumbs) {
      state.breadcrumbs = breadcrumbs;
    },
    
    ADD_BREADCRUMB(state, breadcrumb) {
      state.breadcrumbs.push(breadcrumb);
    },
    
    CLEAR_BREADCRUMBS(state) {
      state.breadcrumbs = [];
    },
    
    SET_NAVIGATION_LOADING(state, loading) {
      state.navigationLoading = loading;
    },
    
    SET_SIDEBAR_VISIBLE(state, visible) {
      state.sidebarVisible = visible;
    },
    
    SET_PRESSURE_PANEL_VISIBLE(state, visible) {
      state.pressurePanelVisible = visible;
    },
    
    CLEAR_ROUTE_HISTORY(state) {
      state.routeHistory = [];
    }
  },
  
  actions: {
    async navigateTo({ commit, state, rootGetters }, { route, title, updateBreadcrumbs = true }) {
      commit('SET_NAVIGATION_LOADING', true);
      
      try {
        // Check if user has permission to access route
        const userRole = rootGetters['auth/userRole'];
        const hasPermission = checkRoutePermission(route, userRole);
        
        if (!hasPermission) {
          throw new Error('Access denied to this route');
        }
        
        commit('SET_CURRENT_ROUTE', route);
        
        // Update active menu item based on route
        const menuItem = getMenuItemForRoute(route);
        if (menuItem) {
          commit('SET_ACTIVE_MENU_ITEM', menuItem.id);
        }
        
        // Update breadcrumbs if requested
        if (updateBreadcrumbs) {
          const breadcrumbs = generateBreadcrumbs(route, title);
          commit('SET_BREADCRUMBS', breadcrumbs);
        }
        
        return route;
      } catch (error) {
        console.error('Navigation error:', error);
        throw error;
      } finally {
        commit('SET_NAVIGATION_LOADING', false);
      }
    },
    
    goBack({ state, dispatch }) {
      if (state.routeHistory.length > 1) {
        const previousRoute = state.routeHistory[state.routeHistory.length - 2];
        return dispatch('navigateTo', { 
          route: previousRoute.route,
          updateBreadcrumbs: true 
        });
      }
    },
    
    toggleMenu({ commit }) {
      commit('TOGGLE_MENU');
    },
    
    collapseMenu({ commit }) {
      commit('SET_MENU_STATE', 'collapsed');
    },
    
    expandMenu({ commit }) {
      commit('SET_MENU_STATE', 'expanded');
    },
    
    setActiveMenuItem({ commit }, itemId) {
      commit('SET_ACTIVE_MENU_ITEM', itemId);
    },
    
    updateBreadcrumbs({ commit }, breadcrumbs) {
      commit('SET_BREADCRUMBS', breadcrumbs);
    },
    
    addBreadcrumb({ commit }, breadcrumb) {
      commit('ADD_BREADCRUMB', breadcrumb);
    },
    
    clearBreadcrumbs({ commit }) {
      commit('CLEAR_BREADCRUMBS');
    },
    
    toggleSidebar({ commit, state }) {
      commit('SET_SIDEBAR_VISIBLE', !state.sidebarVisible);
    },
    
    togglePressurePanel({ commit, state }) {
      commit('SET_PRESSURE_PANEL_VISIBLE', !state.pressurePanelVisible);
    },
    
    setLayoutConfig({ commit }, config) {
      if (config.sidebarVisible !== undefined) {
        commit('SET_SIDEBAR_VISIBLE', config.sidebarVisible);
      }
      if (config.pressurePanelVisible !== undefined) {
        commit('SET_PRESSURE_PANEL_VISIBLE', config.pressurePanelVisible);
      }
      if (config.menuState !== undefined) {
        commit('SET_MENU_STATE', config.menuState);
      }
    }
  }
};

// Helper function to check route permissions
function checkRoutePermission(route, userRole) {
  const roleRouteAccess = {
    'OPERATOR': ['/dashboard', '/monitoring', '/alerts'],
    'ADMIN': ['/dashboard', '/monitoring', '/alerts', '/tests', '/reports', '/users'],
    'SUPERUSER': ['*'], // All routes
    'SERWISANT': ['/dashboard', '/monitoring', '/service', '/calibration', '/diagnostics', '/workshop']
  };
  
  const allowedRoutes = roleRouteAccess[userRole] || [];
  return allowedRoutes.includes('*') || allowedRoutes.includes(route);
}

// Helper function to get menu item for route
function getMenuItemForRoute(route) {
  const routeMenuMap = {
    '/dashboard': { id: 'dashboard', title: 'Dashboard' },
    '/monitoring': { id: 'monitoring', title: 'Monitoring' },
    '/alerts': { id: 'alerts', title: 'Alerts' },
    '/tests': { id: 'tests', title: 'Tests' },
    '/reports': { id: 'reports', title: 'Reports' },
    '/users': { id: 'users', title: 'Users' },
    '/system': { id: 'system', title: 'System' },
    '/service': { id: 'service', title: 'Service' },
    '/calibration': { id: 'calibration', title: 'Calibration' },
    '/diagnostics': { id: 'diagnostics', title: 'Diagnostics' },
    '/workshop': { id: 'workshop', title: 'Workshop' }
  };
  
  return routeMenuMap[route];
}

// Helper function to generate breadcrumbs
function generateBreadcrumbs(route, title) {
  const breadcrumbs = [
    { text: 'Home', route: '/dashboard', active: false }
  ];
  
  const routeParts = route.split('/').filter(part => part);
  let currentPath = '';
  
  routeParts.forEach((part, index) => {
    currentPath += '/' + part;
    const isLast = index === routeParts.length - 1;
    
    breadcrumbs.push({
      text: title || capitalizeFirst(part),
      route: currentPath,
      active: isLast
    });
  });
  
  return breadcrumbs;
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default navigationModule;
