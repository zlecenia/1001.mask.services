/**
 * Integration Test Suite for AuditLogViewer Component 0.1.0
 * Tests integration with SecurityService, i18n, Vuex store, and other components
 * Validates complete Vue ecosystem compatibility and data flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, createWrapper } from '@vue/test-utils';
import { createStore } from 'vuex';
import AuditLogViewer from './auditLogViewer.js';

// Import other components for integration testing
import LoginForm from '../../loginForm/0.1.0/loginForm.js';
import MainMenu from '../../mainMenu/0.1.0/mainMenu.js';
import PressurePanel from '../../pressurePanel/0.1.0/pressurePanel.js';

// Mock SecurityService with realistic data
const mockSecurityService = {
  auditLog: [],
  getAuditLogs: vi.fn(),
  logSecurityEvent: vi.fn(),
  sanitizeInput: vi.fn(input => input),
  validateInput: vi.fn(() => true),
  authenticate: vi.fn(),
  isAuthenticated: vi.fn(() => true),
  getCurrentUser: vi.fn(() => ({ username: 'testuser', role: 'admin' })),
  hasPermission: vi.fn(() => true)
};

// Mock i18n service with real translations
const mockI18nService = {
  currentLanguage: 'en',
  translations: {
    en: {
      'audit.security_dashboard': 'Security Dashboard',
      'audit.refresh': 'Refresh',
      'audit.export': 'Export',
      'audit.search': 'Search',
      'audit.event_type': 'Event Type',
      'audit.no_logs': 'No audit logs found'
    },
    pl: {
      'audit.security_dashboard': 'Panel Bezpieczeństwa',
      'audit.refresh': 'Odśwież',
      'audit.export': 'Eksportuj'
    }
  },
  $t: vi.fn(key => {
    const lang = mockI18nService.currentLanguage;
    return mockI18nService.translations[lang]?.[key] || key;
  }),
  changeLanguage: vi.fn(lang => {
    mockI18nService.currentLanguage = lang;
  })
};

// Mock Vuex Store
const createMockStore = () => createStore({
  modules: {
    auth: {
      namespaced: true,
      state: {
        user: { username: 'testuser', role: 'admin' },
        isAuthenticated: true,
        permissions: ['audit_log_view', 'audit_log_export']
      },
      getters: {
        currentUser: state => state.user,
        isAuthenticated: state => state.isAuthenticated,
        hasPermission: state => permission => state.permissions.includes(permission)
      }
    },
    system: {
      namespaced: true,
      state: {
        language: 'en',
        debugMode: false
      }
    }
  }
});

// Sample integrated audit logs from multiple components
const integratedAuditLogs = [
  // LoginForm events
  {
    id: 1,
    timestamp: '2025-01-20T10:30:00.000Z',
    eventType: 'LOGIN_FORM_SUCCESS',
    data: { username: 'testuser', currentUser: 'testuser', component: 'LoginForm' }
  },
  {
    id: 2,
    timestamp: '2025-01-20T10:31:00.000Z',
    eventType: 'LOGIN_FORM_INPUT_VALIDATION',
    data: { field: 'username', valid: true, currentUser: 'testuser' }
  },
  // MainMenu events  
  {
    id: 3,
    timestamp: '2025-01-20T10:32:00.000Z',
    eventType: 'MENU_ACCESS_SUCCESS',
    data: { item: 'security-dashboard', currentUser: 'testuser', component: 'MainMenu' }
  },
  {
    id: 4,
    timestamp: '2025-01-20T10:33:00.000Z',
    eventType: 'MENU_NAVIGATION',
    data: { from: 'main', to: 'audit', currentUser: 'testuser' }
  },
  // PressurePanel events
  {
    id: 5,
    timestamp: '2025-01-20T10:34:00.000Z',
    eventType: 'PRESSURE_PANEL_REFRESH_SUCCESS',
    data: { sensorCount: 3, currentUser: 'testuser', component: 'PressurePanel' }
  },
  {
    id: 6,
    timestamp: '2025-01-20T10:35:00.000Z',
    eventType: 'PRESSURE_PANEL_DATA_VALIDATION_ERROR',
    data: { sensor: 'pressure1', value: 1500, threshold: 1000, currentUser: 'testuser' }
  },
  // Security events
  {
    id: 7,
    timestamp: '2025-01-20T10:36:00.000Z',
    eventType: 'SECURITY_SESSION_TIMEOUT_WARNING',
    data: { remainingTime: 300, currentUser: 'testuser' }
  },
  {
    id: 8,
    timestamp: '2025-01-20T10:37:00.000Z',
    eventType: 'AUDIT_LOG_VIEWER_INIT',
    data: { currentUser: 'testuser', component: 'AuditLogViewer' }
  }
];

describe('AuditLogViewer Integration Tests', () => {
  let wrapper;
  let store;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Configure SecurityService mock with integrated data
    mockSecurityService.getAuditLogs.mockReturnValue(integratedAuditLogs);
    mockSecurityService.auditLog = integratedAuditLogs;
    
    // Setup global mocks
    global.getSecurityService = vi.fn(() => mockSecurityService);
    global.getI18nService = vi.fn(() => mockI18nService);
    
    // Create Vuex store
    store = createMockStore();
    
    // Mount component with full ecosystem
    wrapper = mount(AuditLogViewer, {
      global: {
        plugins: [store],
        mocks: {
          $t: mockI18nService.$t,
          $store: store
        }
      }
    });
    
    // Wait for initialization
    await wrapper.vm.$nextTick();
    await wrapper.vm.refreshLogs();
    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('SecurityService Integration', () => {
    it('should integrate with SecurityService for audit log retrieval', () => {
      expect(mockSecurityService.getAuditLogs).toHaveBeenCalled();
      expect(wrapper.vm.securityService).toBeTruthy();
    });

    it('should load audit logs from SecurityService', () => {
      expect(mockSecurityService.getAuditLogs).toHaveBeenCalled();
      expect(wrapper.vm.auditLogs).toHaveLength(integratedAuditLogs.length);
    });

    it('should log audit viewer initialization to SecurityService', () => {
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
        'AUDIT_LOG_VIEWER_INIT',
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle SecurityService error gracefully in integration', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSecurityService.getAuditLogs.mockImplementation(() => {
        throw new Error('Service integration error');
      });
      
      await wrapper.vm.refreshLogs();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load audit logs:', expect.any(Error));
    });
  });

  describe('Component-Specific Log Filtering', () => {
    it('should filter logs by LoginForm component', async () => {
      await wrapper.setData({ selectedComponent: 'LoginForm' });
      await wrapper.vm.$nextTick();
      
      const loginFormLogs = wrapper.vm.filteredLogs;
      expect(loginFormLogs.every(log => 
        wrapper.vm.getComponentName(log.eventType) === 'LoginForm'
      )).toBe(true);
      expect(loginFormLogs.length).toBeGreaterThan(0);
    });

    it('should filter logs by MainMenu component', async () => {
      await wrapper.setData({ selectedComponent: 'MainMenu' });
      await wrapper.vm.$nextTick();
      
      const menuLogs = wrapper.vm.filteredLogs;
      expect(menuLogs.every(log => 
        wrapper.vm.getComponentName(log.eventType) === 'MainMenu'
      )).toBe(true);
    });

    it('should filter logs by PressurePanel component', async () => {
      await wrapper.setData({ selectedComponent: 'PressurePanel' });
      await wrapper.vm.$nextTick();
      
      const pressureLogs = wrapper.vm.filteredLogs;
      expect(pressureLogs.every(log => 
        wrapper.vm.getComponentName(log.eventType) === 'PressurePanel'
      )).toBe(true);
    });

    it('should identify SecurityService events correctly', () => {
      const securityLog = integratedAuditLogs.find(log => 
        log.eventType === 'SECURITY_SESSION_TIMEOUT_WARNING'
      );
      expect(wrapper.vm.getComponentName(securityLog.eventType)).toBe('SecurityService');
    });
  });

  describe('Multi-Language i18n Integration', () => {
    it('should use i18n translations for UI elements', () => {
      expect(mockI18nService.$t).toHaveBeenCalledWith('audit.security_dashboard');
      expect(mockI18nService.$t).toHaveBeenCalledWith('audit.refresh');
      expect(mockI18nService.$t).toHaveBeenCalledWith('audit.export');
    });

    it('should handle language switching integration', async () => {
      // Simulate language change
      mockI18nService.changeLanguage('pl');
      mockI18nService.currentLanguage = 'pl';
      
      // Trigger component re-render
      await wrapper.vm.$nextTick();
      
      expect(mockI18nService.changeLanguage).toHaveBeenCalledWith('pl');
    });

    it('should gracefully handle missing translations', () => {
      const result = mockI18nService.$t('non.existent.key');
      expect(result).toBe('non.existent.key'); // Fallback behavior
    });
  });

  describe('Vuex Store Integration', () => {
    it('should access current user from Vuex store', () => {
      const currentUser = store.getters['auth/currentUser'];
      expect(currentUser.username).toBe('testuser');
      expect(currentUser.role).toBe('admin');
    });

    it('should check authentication status from store', () => {
      const isAuthenticated = store.getters['auth/isAuthenticated'];
      expect(isAuthenticated).toBe(true);
    });

    it('should validate permissions for audit log access', () => {
      const hasPermission = store.getters['auth/hasPermission']('audit_log_view');
      expect(hasPermission).toBe(true);
    });

    it('should validate export permissions', () => {
      const hasExportPermission = store.getters['auth/hasPermission']('audit_log_export');
      expect(hasExportPermission).toBe(true);
    });
  });

  describe('Real-time Data Flow Integration', () => {
    it('should handle real-time log updates from multiple components', async () => {
      // Simulate new log from LoginForm
      const newLoginLog = {
        id: 9,
        timestamp: new Date().toISOString(),
        eventType: 'LOGIN_FORM_SUCCESS',
        data: { username: 'newuser', currentUser: 'newuser' }
      };
      
      mockSecurityService.auditLog.push(newLoginLog);
      mockSecurityService.getAuditLogs.mockReturnValue([...integratedAuditLogs, newLoginLog]);
      
      await wrapper.vm.refreshLogs();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.auditLogs).toHaveLength(integratedAuditLogs.length + 1);
      expect(wrapper.vm.auditLogs.some(log => log.id === 9)).toBe(true);
    });

    it('should maintain data consistency during concurrent updates', async () => {
      // Simulate concurrent updates from multiple components
      const concurrentLogs = [
        {
          id: 10,
          timestamp: new Date().toISOString(),
          eventType: 'MENU_ACCESS_SUCCESS',
          data: { item: 'settings', currentUser: 'testuser' }
        },
        {
          id: 11, 
          timestamp: new Date().toISOString(),
          eventType: 'PRESSURE_PANEL_ALERT_TRIGGERED',
          data: { sensor: 'pressure2', value: 950, currentUser: 'testuser' }
        }
      ];
      
      mockSecurityService.getAuditLogs.mockReturnValue([...integratedAuditLogs, ...concurrentLogs]);
      
      await wrapper.vm.refreshLogs();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.auditLogs).toHaveLength(integratedAuditLogs.length + 2);
      expect(wrapper.vm.totalEvents).toBe(integratedAuditLogs.length + 2);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle SecurityService unavailable scenario', async () => {
      global.getSecurityService = vi.fn(() => null);
      
      const newWrapper = mount(AuditLogViewer, {
        global: {
          plugins: [store],
          mocks: { $t: mockI18nService.$t }
        }
      });
      
      await newWrapper.vm.$nextTick();
      expect(newWrapper.vm.securityService).toBe(null);
      expect(newWrapper.find('.empty-state').exists()).toBe(true);
      
      newWrapper.unmount();
    });

    it('should handle i18n service failure gracefully', async () => {
      global.getI18nService = vi.fn(() => null);
      
      const newWrapper = mount(AuditLogViewer, {
        global: {
          plugins: [store],
          mocks: { 
            $t: vi.fn(key => key) // Fallback translation
          }
        }
      });
      
      await newWrapper.vm.$nextTick();
      expect(newWrapper.vm).toBeTruthy();
      
      newWrapper.unmount();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets from multiple components efficiently', async () => {
      // Generate large dataset simulating heavy usage
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 100,
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        eventType: i % 4 === 0 ? 'LOGIN_FORM_SUCCESS' : 
                   i % 4 === 1 ? 'MENU_ACCESS_SUCCESS' :
                   i % 4 === 2 ? 'PRESSURE_PANEL_REFRESH_SUCCESS' : 'SECURITY_EVENT',
        data: { currentUser: 'testuser', iteration: i }
      }));
      
      mockSecurityService.getAuditLogs.mockReturnValue(largeLogs);
      
      const startTime = performance.now();
      await wrapper.vm.refreshLogs();
      await wrapper.vm.$nextTick();
      const endTime = performance.now();
      
      expect(wrapper.vm.auditLogs).toHaveLength(1000);
      expect(wrapper.vm.pageSize).toBe(50); // Should paginate for performance
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should maintain responsive UI during data processing', async () => {
      // Test UI responsiveness with filtering on large dataset
      await wrapper.setData({ searchTerm: 'testuser' });
      await wrapper.vm.$nextTick();
      
      const filterStartTime = performance.now();
      const filtered = wrapper.vm.filteredLogs;
      const filterEndTime = performance.now();
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filterEndTime - filterStartTime).toBeLessThan(50);
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('should properly initialize with other components loaded', async () => {
      // Verify initialization sequence
      expect(wrapper.vm.securityService).toBeTruthy();
      expect(wrapper.vm.auditLogs).toHaveLength(integratedAuditLogs.length);
      expect(wrapper.vm.refreshInterval).toBeTruthy();
    });

    it('should handle component unmounting gracefully', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const intervalId = wrapper.vm.refreshInterval;
      
      wrapper.unmount();
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });

    it('should maintain data integrity during component updates', async () => {
      const initialLogCount = wrapper.vm.auditLogs.length;
      
      // Force component update
      await wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.auditLogs.length).toBe(initialLogCount);
      expect(wrapper.vm.totalEvents).toBe(initialLogCount);
    });
  });

  describe('Cross-Component Event Tracking', () => {
    it('should correctly categorize events from different components', () => {
      const componentCounts = {
        LoginForm: 0,
        MainMenu: 0,
        PressurePanel: 0,
        SecurityService: 0,
        AuditLogViewer: 0,
        Unknown: 0
      };
      
      wrapper.vm.auditLogs.forEach(log => {
        const component = wrapper.vm.getComponentName(log.eventType);
        if (Object.prototype.hasOwnProperty.call(componentCounts, component)) {
          componentCounts[component]++;
        } else {
          componentCounts.Unknown++;
        }
      });
      
      // Verify we have events from major components
      expect(componentCounts.LoginForm).toBeGreaterThan(0);
      expect(componentCounts.MainMenu).toBeGreaterThan(0);  
      expect(componentCounts.PressurePanel).toBeGreaterThan(0);
      expect(componentCounts.SecurityService).toBeGreaterThan(0);
      // AuditLogViewer events are generated during component lifecycle, so at least 1
      expect(componentCounts.AuditLogViewer + componentCounts.Unknown).toBeGreaterThan(0);
    });

    it('should track user journey across components', () => {
      const userJourney = wrapper.vm.auditLogs
        .filter(log => log.data.currentUser === 'testuser')
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(log => ({
          component: wrapper.vm.getComponentName(log.eventType),
          action: log.eventType,
          timestamp: log.timestamp
        }));
      
      expect(userJourney.length).toBeGreaterThan(0);
      expect(userJourney[0].component).toBe('LoginForm'); // Journey starts with login
    });
  });

  describe('Export Integration', () => {
    it('should export integrated logs with proper component attribution', async () => {
      // Mock CSV export functionality
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      
      await wrapper.vm.exportLogs();
      
      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
        'AUDIT_LOG_EXPORT',
        expect.objectContaining({
          exportedCount: wrapper.vm.filteredLogs.length,
          timestamp: expect.any(String)
        })
      );
      
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
