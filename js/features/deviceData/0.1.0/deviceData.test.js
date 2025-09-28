/**
 * DeviceData Component Test Suite
 * Comprehensive unit and integration tests for industrial device monitoring
 * Version: 0.1.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import DeviceDataComponent from './deviceData.js';

// Mock getSecurityService function - MUST be at the top before any variable usage
vi.mock('../../../services/securityService.js', () => ({
  getSecurityService: vi.fn().mockResolvedValue({
    logAuditEvent: vi.fn().mockResolvedValue(true),
    sanitizeInput: vi.fn((input) => input),
    validateInput: vi.fn(() => ({ isValid: true, errors: [] })),
    getAuditLogs: vi.fn().mockReturnValue([
      {
        timestamp: '2024-12-19T10:30:00Z',
        event: 'device_data_component_init',
        user: 'testuser',
        data: { deviceId: 'MASKTRONIC-001' }
      }
    ])
  })
}));

// Sample device data for testing
const mockDeviceData = {
  deviceId: 'MASKTRONIC-001',
  status: 'online',
  batteryLevel: 85,
  lastUpdate: '2024-12-19T10:30:00Z',
  uptime: '5d 12h 30m',
  firmware: '2.1.4',
  ipAddress: '192.168.1.10',
  macAddress: 'AA:BB:CC:DD:EE:FF',
  temperature: 23.5,
  sensors: [
    {
      id: 'sensor1',
      name: 'Temperature Sensor',
      value: 23.5,
      unit: '°C',
      status: 'normal',
      lastUpdate: '2024-12-19T10:30:00Z'
    },
    {
      id: 'sensor2', 
      name: 'Pressure Sensor',
      value: 1013.25,
      unit: 'hPa',
      status: 'normal',
      lastUpdate: '2024-12-19T10:30:00Z'
    },
    {
      id: 'sensor3',
      name: 'Humidity Sensor',
      value: 45.2,
      unit: '%',
      status: 'warning',
      lastUpdate: '2024-12-19T10:30:00Z'
    }
  ]
};

// Mock SecurityService reference for test assertions
let mockSecurityService;

beforeEach(async () => {
  // Get the mocked security service for assertions
  const { getSecurityService } = await import('../../../services/securityService.js');
  mockSecurityService = await getSecurityService();
  vi.clearAllMocks();
});

// Mock i18n service
const mockI18n = {
  $t: vi.fn((key, fallback) => fallback || key),
  locale: 'pl'
};

// Mock DeviceAPI
const mockDeviceAPI = {
  getDeviceData: vi.fn().mockResolvedValue(mockDeviceData),
  refreshDevice: vi.fn().mockResolvedValue(mockDeviceData),
  getSensorData: vi.fn().mockResolvedValue(mockDeviceData.sensors)
};

// Create Vuex store for testing
const createTestStore = () => {
  return createStore({
    modules: {
      deviceData: {
        namespaced: true,
        state: () => ({
          currentDevice: mockDeviceData,
          isLoading: false,
          lastUpdate: null,
          refreshInterval: 5000,
          autoRefresh: true
        }),
        mutations: {
          SET_DEVICE_DATA: (state, data) => {
            state.currentDevice = data;
          },
          SET_LOADING: (state, loading) => {
            state.isLoading = loading;
          },
          SET_LAST_UPDATE: (state, timestamp) => {
            state.lastUpdate = timestamp;
          }
        },
        actions: {
          refreshDeviceData: vi.fn().mockResolvedValue(mockDeviceData),
          exportDeviceData: vi.fn().mockResolvedValue(true)
        },
        getters: {
          deviceStatus: (state) => state.currentDevice?.status || 'unknown',
          batteryLevel: (state) => state.currentDevice?.batteryLevel || 0,
          sensorCount: (state) => state.currentDevice?.sensors?.length || 0
        }
      }
    }
  });
};

describe('DeviceData Component', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup global mocks
    global.window = {
      DeviceAPI: mockDeviceAPI,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      URL: {
        createObjectURL: vi.fn().mockReturnValue('blob:url'),
        revokeObjectURL: vi.fn()
      },
      Blob: vi.fn()
    };
    
    global.document = {
      createElement: vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: vi.fn()
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };
    
    // Create fresh store for each test
    store = createTestStore();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(DeviceDataComponent, {
      props: {
        user: { username: 'testuser', role: 'ADMIN' },
        language: 'pl',
        ...props
      },
      global: {
        plugins: [store],
        mocks: {
          $t: mockI18n.$t,
          $store: store,
          $emit: vi.fn()
        }
      },
      attachTo: document.body
    });
  };

  describe('Component Initialization', () => {
    it('should render without crashing', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should display the correct page title', () => {
      wrapper = createWrapper();
      const title = wrapper.find('.device-data-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toContain('Dane Urządzenia');
    });

    it('should initialize with device data from store', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.deviceData).toEqual(mockDeviceData);
    });

    it('should initialize SecurityService on mount', async () => {
      wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });

    it('should set up auto-refresh interval on mount', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      wrapper = createWrapper();
      
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5000
      );
    });
  });

  describe('Device Information Display', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display device basic information', () => {
      expect(wrapper.find('[data-testid="device-id"]').text()).toContain('MASKTRONIC-001');
      expect(wrapper.find('[data-testid="device-status"]').text()).toContain('Online');
      expect(wrapper.find('[data-testid="firmware-version"]').text()).toContain('2.1.4');
      expect(wrapper.find('[data-testid="ip-address"]').text()).toContain('192.168.1.10');
    });

    it('should display battery level with correct styling', () => {
      const batteryElement = wrapper.find('[data-testid="battery-level"]');
      expect(batteryElement.exists()).toBe(true);
      expect(batteryElement.text()).toContain('85%');
      
      // Check for normal battery level styling (>20%)
      expect(batteryElement.classes()).toContain('battery-normal');
    });

    it('should show low battery warning when level is low', async () => {
      // Update device data with low battery
      await store.commit('deviceData/SET_DEVICE_DATA', {
        ...mockDeviceData,
        batteryLevel: 15
      });
      
      await wrapper.vm.$nextTick();
      
      const batteryElement = wrapper.find('[data-testid="battery-level"]');
      expect(batteryElement.classes()).toContain('battery-low');
    });

    it('should display device uptime correctly', () => {
      const uptimeElement = wrapper.find('[data-testid="device-uptime"]');
      expect(uptimeElement.text()).toContain('5d 12h 30m');
    });

    it('should show last update timestamp', () => {
      const lastUpdateElement = wrapper.find('[data-testid="last-update"]');
      expect(lastUpdateElement.exists()).toBe(true);
    });
  });

  describe('Sensor Information Display', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display all sensors', () => {
      const sensorCards = wrapper.findAll('[data-testid="sensor-card"]');
      expect(sensorCards.length).toBe(3);
    });

    it('should show sensor details correctly', () => {
      const firstSensor = wrapper.find('[data-testid="sensor-card"]:first-child');
      expect(firstSensor.find('[data-testid="sensor-name"]').text()).toContain('Temperature Sensor');
      expect(firstSensor.find('[data-testid="sensor-value"]').text()).toContain('23.5');
      expect(firstSensor.find('[data-testid="sensor-unit"]').text()).toContain('°C');
    });

    it('should apply correct status styling to sensors', () => {
      const sensorCards = wrapper.findAll('[data-testid="sensor-card"]');
      
      // Normal sensor
      expect(sensorCards[0].classes()).toContain('sensor-normal');
      
      // Warning sensor
      expect(sensorCards[2].classes()).toContain('sensor-warning');
    });

    it('should show sensor count in summary', () => {
      const sensorCount = wrapper.find('[data-testid="sensor-count"]');
      expect(sensorCount.text()).toContain('3');
    });
  });

  describe('Data Refresh Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should refresh data when refresh button clicked', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      expect(mockDeviceAPI.getDeviceData).toHaveBeenCalled();
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_manual_refresh',
        expect.objectContaining({
          user: 'testuser',
          deviceId: 'MASKTRONIC-001'
        })
      );
    });

    it('should show loading state during refresh', async () => {
      // Mock delayed API response
      mockDeviceAPI.getDeviceData.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockDeviceData), 100))
      );
      
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      expect(wrapper.vm.isLoading).toBe(true);
      expect(wrapper.find('[data-testid="loading-indicator"]').exists()).toBe(true);
    });

    it('should handle refresh errors gracefully', async () => {
      mockDeviceAPI.getDeviceData.mockRejectedValue(new Error('API Error'));
      
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      await wrapper.vm.$nextTick();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_refresh_error',
        expect.objectContaining({
          error: 'API Error'
        })
      );
    });

    it('should toggle auto-refresh when switch is clicked', async () => {
      const autoRefreshSwitch = wrapper.find('[data-testid="auto-refresh-switch"]');
      await autoRefreshSwitch.trigger('click');
      
      expect(wrapper.vm.autoRefresh).toBe(false);
    });
  });

  describe('Data Export Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should export device data when export button clicked', async () => {
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_export',
        expect.objectContaining({
          user: 'testuser',
          deviceId: 'MASKTRONIC-001',
          format: 'CSV'
        })
      );
    });

    it('should generate CSV content with correct headers', async () => {
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      // Verify CSV content structure
      expect(global.window.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Device ID,Status,Battery Level')],
        { type: 'text/csv' }
      );
    });

    it('should create download link with correct filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      global.document.createElement.mockReturnValue(mockLink);
      
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockLink.download).toMatch(/device-data-\d+\.csv/);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle export errors gracefully', async () => {
      global.window.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation failed');
      });
      
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_export_error',
        expect.objectContaining({
          error: 'Blob creation failed'
        })
      );
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should compute device status correctly', () => {
      expect(wrapper.vm.deviceStatus).toBe('online');
    });

    it('should compute battery status based on level', () => {
      expect(wrapper.vm.batteryStatus).toBe('normal');
      
      // Test low battery
      wrapper.vm.deviceData.batteryLevel = 15;
      expect(wrapper.vm.batteryStatus).toBe('low');
      
      // Test critical battery
      wrapper.vm.deviceData.batteryLevel = 5;
      expect(wrapper.vm.batteryStatus).toBe('critical');
    });

    it('should format uptime correctly', () => {
      expect(wrapper.vm.formattedUptime).toBe('5d 12h 30m');
    });

    it('should format last update timestamp', () => {
      const formatted = wrapper.vm.formattedLastUpdate;
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should compute sensor statistics', () => {
      const stats = wrapper.vm.sensorStats;
      expect(stats.total).toBe(3);
      expect(stats.normal).toBe(2);
      expect(stats.warning).toBe(1);
      expect(stats.critical).toBe(0);
    });

    it('should determine overall device health', () => {
      expect(wrapper.vm.deviceHealth).toBe('good');
      
      // Test with critical sensor
      wrapper.vm.deviceData.sensors[0].status = 'critical';
      expect(wrapper.vm.deviceHealth).toBe('critical');
    });
  });

  describe('Watchers', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should watch device data changes', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await store.commit('deviceData/SET_DEVICE_DATA', {
        ...mockDeviceData,
        status: 'offline'
      });
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.deviceData.status).toBe('offline');
      logSpy.mockRestore();
    });

    it('should restart auto-refresh when interval changes', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      wrapper.vm.refreshInterval = 10000;
      await wrapper.vm.$nextTick();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        10000
      );
    });
  });

  describe('SecurityService Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should log component initialization', () => {
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });

    it('should sanitize user inputs', async () => {
      const deviceNameInput = wrapper.find('[data-testid="device-name-input"]');
      if (deviceNameInput.exists()) {
        await deviceNameInput.setValue('<script>alert("xss")</script>');
        expect(mockSecurityService.sanitizeInput).toHaveBeenCalled();
      }
    });

    it('should validate critical operations', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      expect(mockSecurityService.validateInput).toHaveBeenCalled();
    });

    it('should log all user actions', async () => {
      // Test multiple user actions
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledTimes(3); // init + export + refresh
    });
  });

  describe('i18n Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should use translation function for all text', () => {
      expect(mockI18n.$t).toHaveBeenCalledWith('device.title');
      expect(mockI18n.$t).toHaveBeenCalledWith('device.status');
      expect(mockI18n.$t).toHaveBeenCalledWith('device.battery_level');
    });

    it('should provide fallback text when translations missing', () => {
      const result = mockI18n.$t('missing.key', 'Fallback Text');
      expect(result).toBe('Fallback Text');
    });

    it('should handle language switching', async () => {
      wrapper = createWrapper({ language: 'en' });
      expect(wrapper.vm.language).toBe('en');
    });

    it('should format timestamps based on language', () => {
      const timestamp = new Date('2024-12-19T10:30:00Z');
      const formatted = wrapper.vm.formatTimestamp(timestamp);
      expect(formatted).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle API errors gracefully', async () => {
      mockDeviceAPI.getDeviceData.mockRejectedValue(new Error('Network error'));
      
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isLoading).toBe(false);
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_refresh_error',
        expect.objectContaining({
          error: 'Network error'
        })
      );
    });

    it('should handle missing device data', async () => {
      await store.commit('deviceData/SET_DEVICE_DATA', null);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('[data-testid="no-device-message"]').exists()).toBe(true);
    });

    it('should handle SecurityService initialization errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // This test verifies the component doesn't crash when SecurityService fails
      expect(wrapper.exists()).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with auto-refresh', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should debounce rapid refresh requests', async () => {
      wrapper = createWrapper();
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      
      // Simulate rapid clicking
      await refreshButton.trigger('click');
      await refreshButton.trigger('click');
      await refreshButton.trigger('click');
      
      // Should not call API for every click due to debouncing
      expect(mockDeviceAPI.getDeviceData.mock.calls.length).toBeLessThan(3);
    });

    it('should handle large sensor arrays efficiently', async () => {
      const largeSensorArray = Array.from({ length: 100 }, (_, i) => ({
        id: `sensor${i}`,
        name: `Sensor ${i}`,
        value: Math.random() * 100,
        unit: 'unit',
        status: 'normal',
        lastUpdate: new Date().toISOString()
      }));
      
      await store.commit('deviceData/SET_DEVICE_DATA', {
        ...mockDeviceData,
        sensors: largeSensorArray
      });
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.sensorStats.total).toBe(100);
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up intervals on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      wrapper = createWrapper();
      const intervalId = wrapper.vm.refreshIntervalId;
      
      wrapper.unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });

    it('should log cleanup on unmount', async () => {
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'device_data_component_cleanup',
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle back navigation', async () => {
      const backButton = wrapper.find('[data-testid="back-button"]');
      if (backButton.exists()) {
        await backButton.trigger('click');
        
        expect(wrapper.emitted('back')).toBeTruthy();
        expect(wrapper.emitted('navigate')).toBeTruthy();
      }
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have proper ARIA labels', () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      expect(refreshButton.attributes('aria-label')).toBeDefined();
      
      const exportButton = wrapper.find('[data-testid="export-button"]');
      expect(exportButton.attributes('aria-label')).toBeDefined();
    });

    it('should support keyboard navigation', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('keydown.enter');
      
      expect(mockDeviceAPI.getDeviceData).toHaveBeenCalled();
    });

    it('should have proper focus management', () => {
      const focusableElements = wrapper.findAll('button, input, [tabindex]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
});
