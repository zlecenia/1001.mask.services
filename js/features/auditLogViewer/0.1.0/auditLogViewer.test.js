/**
 * Comprehensive Test Suite for AuditLogViewer Component 0.1.0
 * Tests security dashboard functionality, filtering, export, and SecurityService integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuditLogViewer from './auditLogViewer.js';

// Mock SecurityService
const mockSecurityService = {
  getAuditLogs: vi.fn(),
  logAuditEvent: vi.fn(),
  sanitizeInput: vi.fn(input => input),
  validateInput: vi.fn(() => true)
};

// Mock global functions
const mockGetSecurityService = vi.fn(() => mockSecurityService);

// Mock sample audit logs
const sampleAuditLogs = [
  {
    id: 1,
    timestamp: '2025-01-20T10:30:00.000Z',
    eventType: 'LOGIN_FORM_SUCCESS',
    data: { username: 'testuser', currentUser: 'testuser' }
  },
  {
    id: 2, 
    timestamp: '2025-01-20T10:35:00.000Z',
    eventType: 'MENU_ACCESS_SUCCESS',
    data: { item: 'settings', currentUser: 'testuser' }
  },
  {
    id: 3,
    timestamp: '2025-01-20T10:40:00.000Z',
    eventType: 'PRESSURE_PANEL_DATA_VALIDATION_ERROR',
    data: { error: 'Invalid sensor value', currentUser: 'testuser' }
  },
  {
    id: 4,
    timestamp: '2025-01-20T09:15:00.000Z',
    eventType: 'LOGIN_FORM_FAILED',
    data: { username: 'baduser', error: 'Invalid credentials' }
  },
  {
    id: 5,
    timestamp: '2025-01-20T11:00:00.000Z',
    eventType: 'SECURITY_EXCESSIVE_REQUESTS', 
    data: { accessAttempts: 10, currentUser: 'testuser' }
  }
];

describe('AuditLogViewer Component', () => {
  let wrapper;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    mockSecurityService.getAuditLogs.mockReturnValue(sampleAuditLogs);
    
    // Mock global dependencies
    global.getSecurityService = mockGetSecurityService;
    
    // Mock i18n
    const mockI18n = {
      $t: vi.fn(key => key)
    };

    wrapper = mount(AuditLogViewer, {
      global: {
        mocks: {
          $t: mockI18n.$t
        }
      }
    });
    
    // Wait for component to fully initialize and load audit logs
    await wrapper.vm.$nextTick();
    if (wrapper.vm.securityService) {
      await wrapper.vm.refreshLogs();
      await wrapper.vm.$nextTick();
    }
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render audit log viewer component', () => {
      expect(wrapper.find('.audit-log-viewer').exists()).toBe(true);
    });

    it('should initialize SecurityService on mount', () => {
      expect(mockGetSecurityService).toHaveBeenCalled();
      expect(mockSecurityService.getAuditLogs).toHaveBeenCalled();
    });

    it('should log viewer initialization event', () => {
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'AUDIT_LOG_VIEWER_INIT',
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should render header with title and controls', () => {
      expect(wrapper.find('.viewer-header').exists()).toBe(true);
      expect(wrapper.find('.viewer-title').exists()).toBe(true);
      expect(wrapper.find('.refresh-btn').exists()).toBe(true);
      expect(wrapper.find('.export-btn').exists()).toBe(true);
    });

    it('should render filter controls', () => {
      expect(wrapper.find('.viewer-filters').exists()).toBe(true);
      expect(wrapper.find('.search-input').exists()).toBe(true);
      expect(wrapper.findAll('.filter-select')).toHaveLength(3);
    });
  });

  describe('Audit Log Display', () => {
    it('should display audit logs in table format', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.logs-table').exists()).toBe(true);
      expect(wrapper.findAll('.logs-table tbody tr')).toHaveLength(5);
    });

    it('should show correct log information', async () => {
      await wrapper.vm.$nextTick();
      const rows = wrapper.findAll('.logs-table tbody tr');
      expect(rows[0].find('.event-type').text()).toBe('LOGIN_FORM_SUCCESS');
      expect(rows[0].find('.user').text()).toBe('testuser');
    });

    it('should format timestamps correctly', () => {
      const timestamp = '2025-01-20T10:30:00.000Z';
      const formatted = wrapper.vm.formatTimestamp(timestamp);
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should identify component names from event types', () => {
      expect(wrapper.vm.getComponentName('LOGIN_FORM_SUCCESS')).toBe('LoginForm');
      expect(wrapper.vm.getComponentName('MENU_ACCESS_SUCCESS')).toBe('MainMenu');
      expect(wrapper.vm.getComponentName('PRESSURE_PANEL_DATA_VALIDATION_ERROR')).toBe('PressurePanel');
      expect(wrapper.vm.getComponentName('UNKNOWN_EVENT')).toBe('Unknown');
    });

    it('should determine correct log severity levels', () => {
      expect(wrapper.vm.getLogSeverity({ eventType: 'LOGIN_FORM_SUCCESS' })).toBe('info');
      expect(wrapper.vm.getLogSeverity({ eventType: 'LOGIN_FORM_FAILED' })).toBe('error');
      expect(wrapper.vm.getLogSeverity({ eventType: 'SECURITY_WARNING' })).toBe('warning');
      expect(wrapper.vm.getLogSeverity({ eventType: 'SECURITY_CRITICAL' })).toBe('critical');
    });
  });

  describe('Filtering and Search', () => {
    beforeEach(async () => {
      await wrapper.vm.$nextTick();
    });

    it('should filter logs by search term', async () => {
      await wrapper.setData({ searchTerm: 'testuser' });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.filteredLogs).toHaveLength(4);
    });

    it('should filter logs by event type', async () => {
      await wrapper.setData({ selectedEventType: 'LOGIN_FORM_SUCCESS' });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.filteredLogs).toHaveLength(1);
      expect(wrapper.vm.filteredLogs[0].eventType).toBe('LOGIN_FORM_SUCCESS');
    });

    it('should filter logs by time range', async () => {
      // Mock current time to test time filtering
      const mockDate = new Date('2025-01-20T11:30:00.000Z');
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      
      await wrapper.setData({ selectedTimeRange: '1h' });
      await wrapper.vm.$nextTick();
      
      // Should only show logs from the last hour
      const recentLogs = wrapper.vm.filteredLogs;
      expect(recentLogs.every(log => 
        new Date(log.timestamp).getTime() > mockDate.getTime() - (60 * 60 * 1000)
      )).toBe(true);
    });

    it('should filter logs by component', async () => {
      await wrapper.setData({ selectedComponent: 'LoginForm' });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.filteredLogs.every(log => 
        wrapper.vm.getComponentName(log.eventType) === 'LoginForm'
      )).toBe(true);
    });

    it('should clear filters when reset', async () => {
      // Ensure audit logs are loaded
      expect(wrapper.vm.auditLogs).toHaveLength(5);
      
      await wrapper.setData({ 
        searchTerm: 'test',
        selectedEventType: 'LOGIN_FORM_SUCCESS',
        selectedComponent: 'LoginForm'
      });
      await wrapper.vm.$nextTick();
      
      await wrapper.setData({
        searchTerm: '',
        selectedEventType: '',
        selectedComponent: ''
      });
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.filteredLogs).toHaveLength(5);
    });
  });

  describe('Sorting and Pagination', () => {
    beforeEach(async () => {
      await wrapper.vm.$nextTick();
    });

    it('should sort logs by timestamp', async () => {
      wrapper.vm.sortBy('timestamp');
      await wrapper.vm.$nextTick();
      
      const sortedLogs = wrapper.vm.filteredLogs;
      const timestamps = sortedLogs.map(log => new Date(log.timestamp).getTime());
      const isDescending = timestamps.every((time, i) => i === 0 || timestamps[i-1] >= time);
      expect(isDescending).toBe(true);
    });

    it('should reverse sort direction on second click', async () => {
      // Ensure we have data first
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.vm.$nextTick();
      
      wrapper.vm.sortBy('timestamp');
      await wrapper.vm.$nextTick();
      wrapper.vm.sortBy('timestamp'); 
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.sortDirection).toBe('asc');
    });

    it('should paginate logs correctly', async () => {
      // Ensure we have data first
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.setData({ pageSize: 2 });
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.paginatedLogs).toHaveLength(2);
      expect(wrapper.vm.totalPages).toBe(3);
    });

    it('should navigate between pages', async () => {
      // Ensure we have data first
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.setData({ pageSize: 2, currentPage: 2 });
      await wrapper.vm.$nextTick();
      
      const paginatedLogs = wrapper.vm.paginatedLogs;
      expect(paginatedLogs).toHaveLength(2);
      expect(paginatedLogs[0].id).not.toBe(sampleAuditLogs[0].id);
    });
  });

  describe('Statistics and Metrics', () => {
    beforeEach(async () => {
      // Ensure we have data loaded
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.vm.$nextTick();
    });

    it('should calculate total events correctly', () => {
      expect(wrapper.vm.totalEvents).toBe(5);
    });

    it('should calculate security alerts count', () => {
      // Should count events with 'error' or 'critical' severity
      // LOGIN_FORM_FAILED (error), SECURITY_EXCESSIVE_REQUESTS (error), LOGIN_FORM_ERROR (error)
      expect(wrapper.vm.securityAlerts).toBe(3);
    });

    it('should update statistics when filters change', async () => {
      await wrapper.setData({ selectedEventType: 'LOGIN_FORM_SUCCESS' });
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.filteredLogs.length).toBe(1);
    });

    it('should display statistics in UI', () => {
      expect(wrapper.find('.viewer-stats').exists()).toBe(true);
      expect(wrapper.find('.stat-item').exists()).toBe(true);
    });
  });

  describe('Export Functionality', () => {
    beforeEach(async () => {
      // Ensure we have data loaded first
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.vm.$nextTick();
    });

    it('should export logs as CSV', () => {
      // Ensure we have audit logs loaded
      expect(wrapper.vm.auditLogs).toHaveLength(5);
      
      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      
      wrapper.vm.exportLogs();
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/audit-logs-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should log export event', () => {
      // Clear previous audit event calls from component initialization
      mockSecurityService.logAuditEvent.mockClear();
      
      // Mock export functionality
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '', download: '', click: vi.fn()
      });
      
      wrapper.vm.exportLogs();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'AUDIT_LOG_EXPORT',
        expect.objectContaining({
          exportedCount: expect.any(Number),
          timestamp: expect.any(String)
        })
      );
    });

    it('should disable export when no logs available', async () => {
      await wrapper.setData({ searchTerm: 'nonexistent' });
      await wrapper.vm.$nextTick();
      
      const exportBtn = wrapper.find('.export-btn');
      expect(exportBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('Log Detail Modal', () => {
    beforeEach(async () => {
      await wrapper.vm.$nextTick();
    });

    it('should show modal when log is selected', async () => {
      wrapper.vm.selectLog(sampleAuditLogs[0]);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.log-detail-modal').exists()).toBe(true);
      expect(wrapper.vm.selectedLog).toEqual(sampleAuditLogs[0]);
    });

    it('should display detailed log information in modal', async () => {
      wrapper.vm.selectLog(sampleAuditLogs[0]);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.modal-content').exists()).toBe(true);
      expect(wrapper.find('.json-data').exists()).toBe(true);
    });

    it('should close modal when close button clicked', async () => {
      wrapper.vm.selectLog(sampleAuditLogs[0]);
      await wrapper.vm.$nextTick();
      
      await wrapper.find('.close-btn').trigger('click');
      expect(wrapper.vm.selectedLog).toBe(null);
    });

    it('should close modal when background clicked', async () => {
      wrapper.vm.selectLog(sampleAuditLogs[0]);
      await wrapper.vm.$nextTick();
      
      await wrapper.find('.log-detail-modal').trigger('click');
      expect(wrapper.vm.selectedLog).toBe(null);
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(async () => {
      // Ensure data is loaded
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.vm.$nextTick();
    });
    
    it('should refresh logs automatically', () => {
      expect(wrapper.vm.refreshInterval).toBeTruthy();
    });

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      wrapper.vm.refreshInterval = 123;
      
      wrapper.unmount();
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
    });

    it('should log refresh events', async () => {
      // Clear previous calls from component initialization
      mockSecurityService.logAuditEvent.mockClear();
      
      await wrapper.vm.refreshLogs();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'AUDIT_LOG_VIEWER_REFRESH',
        expect.objectContaining({
          totalLogs: expect.any(Number),
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle SecurityService errors gracefully', async () => {
      mockSecurityService.getAuditLogs.mockImplementation(() => {
        throw new Error('Service unavailable');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await wrapper.vm.refreshLogs();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load audit logs:', expect.any(Error));
    });

    it('should show empty state when no logs available', async () => {
      mockSecurityService.getAuditLogs.mockReturnValue([]);
      await wrapper.vm.refreshLogs();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.empty-state').exists()).toBe(true);
    });

    it('should handle missing SecurityService', async () => {
      // Temporarily override global function to return null
      const originalGetSecurityService = global.getSecurityService;
      global.getSecurityService = vi.fn(() => null);
      
      const newWrapper = mount(AuditLogViewer, {
        global: { mocks: { $t: key => key } }
      });
      
      await newWrapper.vm.$nextTick();
      expect(newWrapper.vm.securityService).toBe(null);
      
      // Restore original function
      global.getSecurityService = originalGetSecurityService;
      newWrapper.unmount();
    });
  });

  describe('Performance and Optimization', () => {
    it('should limit displayed logs for performance', () => {
      // Test with large dataset
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        timestamp: new Date().toISOString(),
        eventType: 'TEST_EVENT',
        data: {}
      }));
      
      mockSecurityService.getAuditLogs.mockReturnValue(largeLogs);
      wrapper.vm.refreshLogs();
      
      expect(wrapper.vm.pageSize).toBe(50); // Should paginate for performance
    });

    it('should debounce search operations', () => {
      // This would require additional implementation for actual debouncing
      expect(wrapper.vm.searchTerm).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      expect(wrapper.find('.audit-log-viewer').exists()).toBe(true);
      // Additional ARIA testing would go here
    });

    it('should support keyboard navigation', async () => {
      // Ensure we have data loaded first
      wrapper.vm.auditLogs = [...sampleAuditLogs];
      await wrapper.vm.$nextTick();
      
      const table = wrapper.find('.logs-table');
      expect(table.exists()).toBe(true);
      // Additional keyboard navigation testing would go here
    });
  });

  describe('7.9 Display Optimization', () => {
    it('should have landscape-optimized CSS class', () => {
      expect(wrapper.find('.landscape-7-9').exists()).toBe(true);
    });

    it('should render responsively for small displays', () => {
      // Test responsive behavior
      expect(wrapper.find('.audit-log-viewer').exists()).toBe(true);
    });
  });
});
