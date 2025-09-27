/**
 * RealtimeSensors Component Test Suite
 * Comprehensive unit and integration tests for real-time sensor monitoring
 * Version: 0.1.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { RealtimeSensorsComponent } from './realtimeSensors.js';

// Sample sensor data for testing
const mockSensorData = [
  {
    id: 'pressure1',
    name: 'Pressure Sensor 1',
    value: 1013.25,
    unit: 'hPa',
    status: 'normal',
    min: 900,
    max: 1100,
    trend: 'stable',
    lastUpdate: '2024-12-19T10:30:00Z'
  },
  {
    id: 'temperature1',
    name: 'Temperature Sensor 1', 
    value: 23.5,
    unit: '°C',
    status: 'normal',
    min: 18,
    max: 30,
    trend: 'rising',
    lastUpdate: '2024-12-19T10:30:00Z'
  },
  {
    id: 'humidity1',
    name: 'Humidity Sensor 1',
    value: 65.2,
    unit: '%',
    status: 'warning',
    min: 40,
    max: 60,
    trend: 'falling',
    lastUpdate: '2024-12-19T10:30:00Z'
  }
];

// Mock SecurityService with proper lifecycle handling
const mockSecurityService = {
  logAuditEvent: vi.fn().mockResolvedValue(true),
  sanitizeInput: vi.fn((input) => input),
  validateInput: vi.fn(() => ({ isValid: true, errors: [] })),
  getAuditLogs: vi.fn().mockReturnValue([
    {
      timestamp: '2024-12-19T10:30:00Z',
      event: 'sensors_component_init',
      user: 'testuser',
      data: { sensorCount: 3 }
    }
  ])
};

// Mock getSecurityService function
vi.mock('../../../services/securityService.js', () => ({
  getSecurityService: vi.fn().mockResolvedValue(mockSecurityService)
}));

// Mock i18n service
const mockI18n = {
  $t: vi.fn((key, fallback) => fallback || key),
  locale: 'pl'
};

// Mock WebSocket for real-time updates
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1
};

global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket);

// Create Vuex store for testing
const createTestStore = () => {
  return createStore({
    modules: {
      sensors: {
        namespaced: true,
        state: () => ({
          sensors: mockSensorData,
          isConnected: true,
          lastUpdate: '2024-12-19T10:30:00Z',
          alertsEnabled: true,
          refreshRate: 1000,
          recording: false
        }),
        mutations: {
          UPDATE_SENSOR_DATA: (state, sensors) => {
            state.sensors = sensors;
          },
          SET_CONNECTION_STATUS: (state, status) => {
            state.isConnected = status;
          },
          SET_ALERTS_ENABLED: (state, enabled) => {
            state.alertsEnabled = enabled;
          },
          SET_RECORDING: (state, recording) => {
            state.recording = recording;
          }
        },
        actions: {
          updateSensorData: vi.fn(),
          toggleRecording: vi.fn(),
          exportSensorData: vi.fn().mockResolvedValue(true)
        },
        getters: {
          normalSensors: (state) => state.sensors.filter(s => s.status === 'normal'),
          warningSensors: (state) => state.sensors.filter(s => s.status === 'warning'),
          criticalSensors: (state) => state.sensors.filter(s => s.status === 'critical'),
          sensorStats: (state) => ({
            total: state.sensors.length,
            normal: state.sensors.filter(s => s.status === 'normal').length,
            warning: state.sensors.filter(s => s.status === 'warning').length,
            critical: state.sensors.filter(s => s.status === 'critical').length
          })
        }
      }
    }
  });
};

describe('RealtimeSensors Component', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup global mocks
    global.setInterval = vi.fn().mockReturnValue(12345);
    global.clearInterval = vi.fn();
    
    global.window = {
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
    return mount(RealtimeSensorsComponent, {
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
      }
    });
  };

  describe('Component Initialization', () => {
    it('should render without crashing', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should display correct page title', () => {
      wrapper = createWrapper();
      const title = wrapper.find('.sensors-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toContain('Sensory Czasu Rzeczywistego');
    });

    it('should initialize with sensor data from store', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.sensors).toEqual(mockSensorData);
    });

    it('should initialize SecurityService on mount', async () => {
      wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensors_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });

    it('should set up update interval on mount', () => {
      wrapper = createWrapper();
      expect(global.setInterval).toHaveBeenCalled();
    });
  });

  describe('Sensor Data Display', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should display all sensors', () => {
      const sensorCards = wrapper.findAll('[data-testid="sensor-card"]');
      expect(sensorCards.length).toBe(3);
    });

    it('should show sensor details correctly', () => {
      const firstSensor = wrapper.find('[data-testid="sensor-card"]:first-child');
      expect(firstSensor.find('[data-testid="sensor-name"]').text()).toContain('Pressure Sensor 1');
      expect(firstSensor.find('[data-testid="sensor-value"]').text()).toContain('1013.25');
      expect(firstSensor.find('[data-testid="sensor-unit"]').text()).toContain('hPa');
    });

    it('should apply correct status styling', () => {
      const sensorCards = wrapper.findAll('[data-testid="sensor-card"]');
      
      expect(sensorCards[0].classes()).toContain('sensor-normal');
      expect(sensorCards[2].classes()).toContain('sensor-warning');
    });

    it('should display sensor trends', () => {
      const trendElements = wrapper.findAll('[data-testid="sensor-trend"]');
      expect(trendElements[0].text()).toContain('stable');
      expect(trendElements[1].text()).toContain('rising');
      expect(trendElements[2].text()).toContain('falling');
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should update sensor data periodically', async () => {
      const updateMethod = vi.spyOn(wrapper.vm, 'updateSensorData');
      
      // Simulate interval callback
      const intervalCallback = global.setInterval.mock.calls[0][0];
      intervalCallback();
      
      expect(updateMethod).toHaveBeenCalled();
    });

    it('should handle WebSocket connection', () => {
      expect(global.WebSocket).toHaveBeenCalled();
    });

    it('should process WebSocket messages', () => {
      // Simulate WebSocket message
      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      if (messageHandler) {
        messageHandler({
          data: JSON.stringify({
            type: 'sensor_update',
            sensors: mockSensorData
          })
        });
        
        expect(store.state.sensors.sensors).toBeDefined();
      }
    });
  });

  describe('Alert System', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should trigger alerts for critical sensors', () => {
      const alertSpy = vi.spyOn(wrapper.vm, 'triggerAlert');
      
      const criticalSensor = {
        ...mockSensorData[0],
        status: 'critical',
        value: 1200 // Above max threshold
      };
      
      wrapper.vm.triggerAlert(criticalSensor, 'normal');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensor_alert_triggered',
        expect.objectContaining({
          sensorId: criticalSensor.id,
          status: 'critical'
        })
      );
    });

    it('should toggle alerts when switch clicked', async () => {
      const alertSwitch = wrapper.find('[data-testid="alerts-switch"]');
      await alertSwitch.trigger('click');
      
      expect(wrapper.vm.sensorState.alertsEnabled).toBe(false);
    });

    it('should display alert count in summary', () => {
      const alertCount = wrapper.find('[data-testid="alert-count"]');
      expect(alertCount.exists()).toBe(true);
    });
  });

  describe('Data Recording', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should start recording when button clicked', async () => {
      const recordButton = wrapper.find('[data-testid="record-button"]');
      await recordButton.trigger('click');
      
      expect(wrapper.vm.sensorState.recordingData).toBe(true);
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensor_recording_started',
        expect.objectContaining({
          user: 'testuser'
        })
      );
    });

    it('should stop recording when clicked again', async () => {
      wrapper.vm.sensorState.recordingData = true;
      
      const recordButton = wrapper.find('[data-testid="record-button"]');
      await recordButton.trigger('click');
      
      expect(wrapper.vm.sensorState.recordingData).toBe(false);
    });

    it('should record data when recording enabled', () => {
      wrapper.vm.sensorState.recordingData = true;
      const initialLength = wrapper.vm.recordedData.length;
      
      wrapper.vm.recordSensorData();
      
      expect(wrapper.vm.recordedData.length).toBeGreaterThan(initialLength);
    });
  });

  describe('Data Export', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should export sensor data when export button clicked', async () => {
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensor_data_export',
        expect.objectContaining({
          user: 'testuser',
          format: 'CSV'
        })
      );
    });

    it('should generate CSV with correct headers', async () => {
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(global.window.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Sensor ID,Name,Value,Unit,Status')],
        { type: 'text/csv' }
      );
    });

    it('should create download link with timestamp filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      global.document.createElement.mockReturnValue(mockLink);
      
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockLink.download).toMatch(/sensor-data-\d+\.csv/);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should compute sensor statistics correctly', () => {
      const stats = wrapper.vm.sensorStats;
      expect(stats.total).toBe(3);
      expect(stats.normal).toBe(2);
      expect(stats.warning).toBe(1);
      expect(stats.critical).toBe(0);
    });

    it('should compute overall system status', () => {
      expect(wrapper.vm.overallStatus).toBe('warning'); // Has warning sensors
    });

    it('should compute connection status display', () => {
      expect(wrapper.vm.connectionStatus).toBe('connected');
    });

    it('should format refresh rate correctly', () => {
      const formatted = wrapper.vm.formattedRefreshRate;
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should refresh sensor data', async () => {
      await wrapper.vm.refreshSensorData();
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensor_data_refresh',
        expect.objectContaining({
          user: 'testuser'
        })
      );
    });

    it('should change refresh rate', () => {
      const newRate = 2000;
      wrapper.vm.setRefreshRate(newRate);
      
      expect(wrapper.vm.sensorState.refreshRate).toBe(newRate);
    });

    it('should clear recorded data', () => {
      wrapper.vm.recordedData = [{ test: 'data' }];
      wrapper.vm.clearRecordedData();
      
      expect(wrapper.vm.recordedData.length).toBe(0);
    });
  });

  describe('SecurityService Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should log component initialization', () => {
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensors_component_init',
        expect.objectContaining({
          user: 'testuser',
          timestamp: expect.any(String)
        })
      );
    });

    it('should validate user actions', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('click');
      
      expect(mockSecurityService.validateInput).toHaveBeenCalled();
    });

    it('should log all critical operations', async () => {
      // Test multiple operations
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      const recordButton = wrapper.find('[data-testid="record-button"]');
      await recordButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledTimes(3); // init + export + record
    });
  });

  describe('i18n Integration', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should use translation function for all text', () => {
      expect(mockI18n.$t).toHaveBeenCalledWith('sensors.title');
      expect(mockI18n.$t).toHaveBeenCalledWith('sensors.status');
      expect(mockI18n.$t).toHaveBeenCalledWith('sensors.refresh');
    });

    it('should handle language switching', async () => {
      wrapper = createWrapper({ language: 'en' });
      expect(wrapper.vm.language).toBe('en');
    });

    it('should provide fallback text', () => {
      const result = mockI18n.$t('missing.key', 'Fallback Text');
      expect(result).toBe('Fallback Text');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should handle WebSocket errors gracefully', () => {
      const errorHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];
      
      if (errorHandler) {
        errorHandler(new Error('WebSocket error'));
        expect(wrapper.vm.sensorState.isConnected).toBe(false);
      }
    });

    it('should handle export errors', async () => {
      global.window.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Export failed');
      });
      
      const exportButton = wrapper.find('[data-testid="export-button"]');
      await exportButton.trigger('click');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalledWith(
        'sensor_export_error',
        expect.objectContaining({
          error: 'Export failed'
        })
      );
    });
  });

  describe('Performance', () => {
    it('should clean up intervals on unmount', () => {
      wrapper = createWrapper();
      const intervalId = wrapper.vm.updateIntervalId;
      
      wrapper.unmount();
      
      expect(global.clearInterval).toHaveBeenCalledWith(intervalId);
    });

    it('should handle high-frequency updates efficiently', async () => {
      wrapper = createWrapper();
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        await wrapper.vm.updateSensorData();
      }
      
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize WebSocket connection on mount', () => {
      wrapper = createWrapper();
      expect(global.WebSocket).toHaveBeenCalled();
    });

    it('should clean up resources on unmount', () => {
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(global.clearInterval).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should have proper ARIA labels', () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      expect(refreshButton.attributes('aria-label')).toBeDefined();
    });

    it('should support keyboard navigation', async () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      await refreshButton.trigger('keydown.enter');
      
      expect(mockSecurityService.logAuditEvent).toHaveBeenCalled();
    });
  });
});
