// Auth Module for Vuex Store
// Handles authentication, user management, and role-based access control
// Enhanced with SecurityService integration

import { getSecurityService } from '../../services/securityService.js';

const authModule = {
  namespaced: true,
  
  state: {
    isAuthenticated: false,
    currentUser: null,
    sessionToken: null,
    role: 'OPERATOR', // Default role for unauthenticated users
    permissions: [],
    sessionTimeout: 1800000, // 30 minutes
    loginAttempts: 0,
    maxLoginAttempts: 5, // Increased to match SecurityService
    lockoutDuration: 900000, // 15 minutes to match SecurityService
    lockoutUntil: null,
    lastActivity: null,
    sessionStartTime: null,
    csrfToken: null,
    securityService: null
  },
  
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.currentUser,
    userRole: (state) => state.role,
    userPermissions: (state) => state.permissions,
    hasPermission: (state) => (permission) => {
      if (!state.permissions) return false;
      return state.permissions.includes('*') || state.permissions.includes(permission);
    },
    hasRole: (state) => (role) => {
      return state.role === role;
    },
    isLocked: (state) => {
      if (!state.lockoutUntil) return false;
      return Date.now() < state.lockoutUntil;
    },
    sessionTimeRemaining: (state) => {
      if (!state.lastActivity) return 0;
      const elapsed = Date.now() - state.lastActivity;
      return Math.max(0, state.sessionTimeout - elapsed);
    },
    canLogin: (state, getters) => {
      return !getters.isLocked && state.loginAttempts < state.maxLoginAttempts;
    }
  },
  
  mutations: {
    SET_AUTHENTICATED(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
    
    SET_USER(state, user) {
      state.currentUser = user;
      state.role = user?.role || null;
      state.permissions = user?.permissions || [];
    },
    
    SET_ROLE(state, role) {
      state.role = role;
    },
    
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
    },
    
    INCREMENT_LOGIN_ATTEMPTS(state) {
      state.loginAttempts++;
    },
    
    RESET_LOGIN_ATTEMPTS(state) {
      state.loginAttempts = 0;
      state.lockoutUntil = null;
    },
    
    SET_LOCKOUT(state) {
      state.lockoutUntil = Date.now() + state.lockoutDuration;
    },
    
    UPDATE_LAST_ACTIVITY(state) {
      state.lastActivity = Date.now();
    },
    
    SET_SESSION_START(state) {
      state.sessionStartTime = Date.now();
      state.lastActivity = Date.now();
    },
    
    CLEAR_SESSION(state) {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.sessionToken = null;
      state.csrfToken = null;
      state.role = null;
      state.permissions = [];
      state.sessionStartTime = null;
      state.lastActivity = null;
    },
    
    INIT_SECURITY_SERVICE(state) {
      state.securityService = getSecurityService();
    },
    
    SET_SESSION_TOKEN(state, token) {
      state.sessionToken = token;
    },
    
    SET_CSRF_TOKEN(state, token) {
      state.csrfToken = token;
    }
  },
  
  actions: {
    async login({ commit, state, getters }, { username, password, role }) {
      try {
        // Initialize SecurityService if not already done
        if (!state.securityService) {
          commit('INIT_SECURITY_SERVICE');
        }
        
        // Use SecurityService for comprehensive authentication
        const authResult = await state.securityService.authenticateUser(username, password, role);
        
        if (authResult.success) {
          const user = {
            id: 1,
            username: authResult.user.username,
            name: getDisplayName(authResult.user.role),
            role: authResult.user.role,
            permissions: authResult.user.permissions
          };
          
          // Generate CSRF token for secure form submissions
          const csrfToken = state.securityService.generateCSRFToken(authResult.sessionToken);
          
          commit('SET_AUTHENTICATED', true);
          commit('SET_USER', user);
          commit('SET_SESSION_TOKEN', authResult.sessionToken);
          commit('SET_CSRF_TOKEN', csrfToken);
          commit('SET_SESSION_START');
          commit('RESET_LOGIN_ATTEMPTS');
          
          // Set up session timeout
          setTimeout(() => {
            this.dispatch('auth/logout');
          }, state.sessionTimeout);
          
          return user;
        } else {
          commit('INCREMENT_LOGIN_ATTEMPTS');
          
          if (state.loginAttempts >= state.maxLoginAttempts) {
            commit('SET_LOCKOUT');
          }
          
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        commit('INCREMENT_LOGIN_ATTEMPTS');
        throw error;
      }
    },
    
    logout({ commit }) {
      commit('CLEAR_SESSION');
    },
    
    updateActivity({ commit, state, getters }) {
      if (state.isAuthenticated) {
        commit('UPDATE_LAST_ACTIVITY');
        
        // Check if session should timeout
        if (getters.sessionTimeRemaining <= 0) {
          this.dispatch('auth/logout');
        }
      }
    },
    
    checkSession({ state, dispatch }) {
      if (state.isAuthenticated && state.lastActivity) {
        const elapsed = Date.now() - state.lastActivity;
        if (elapsed > state.sessionTimeout) {
          dispatch('logout');
        }
      }
    },
    
    changeRole({ commit, state }, newRole) {
      if (state.currentUser) {
        const updatedUser = {
          ...state.currentUser,
          role: newRole,
          permissions: getRolePermissions(newRole)
        };
        commit('SET_USER', updatedUser);
      }
    }
  }
};

// Mock authentication function
async function mockAuthenticate(username, password, role) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock validation - replace with real authentication
  const validCredentials = {
    'operator': { username: 'operator', password: 'op123' },
    'admin': { username: 'admin', password: 'admin123' },
    'superuser': { username: 'super', password: 'super123' },
    'serwisant': { username: 'service', password: 'service123' }
  };
  
  const roleKey = role.toLowerCase();
  const validCreds = validCredentials[roleKey];
  
  return validCreds && 
         validCreds.username === username && 
         validCreds.password === password;
}

// Get display name for role
function getDisplayName(role) {
  const displayNames = {
    'OPERATOR': 'Operator',
    'ADMIN': 'Administrator', 
    'SUPERUSER': 'Super User',
    'SERWISANT': 'Serwisant'
  };
  return displayNames[role] || role;
}

// Get permissions for role
function getRolePermissions(role) {
  const rolePermissions = {
    'OPERATOR': ['view_sensors', 'view_alerts'],
    'ADMIN': ['view_sensors', 'view_alerts', 'manage_tests', 'manage_reports', 'manage_users'],
    'SUPERUSER': ['*'], // All permissions
    'SERWISANT': ['view_sensors', 'service_mode', 'calibration', 'diagnostics']
  };
  return rolePermissions[role] || [];
}

export default authModule;
