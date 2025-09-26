import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import pressurePanelModule from './index.js';

describe('PressurePanel Module', () => {
  let wrapper;
  let mockStore;
  let mockI18n;

  beforeEach(async () => {
    // Mock Vuex store with reactive data
    mockStore = reactive({
      state: {
        sensors: {
          pressure: {
            low: { value: 10.5, unit: 'mbar', status: 'normal' },
            medium: { value: 2.1, unit: 'bar', status: 'normal' },
            high: { value: 15.8, unit: 'bar', status: 'normal' }
          }
        },
        alerts: {
          thresholds: {
            critical: 25.0,
            warning: 15.0
          }
        },
        language: 'pl'
      }
    });
    
    // Mock i18n with fallback behavior
    mockI18n = {
      global: {
        t: (key) => {
          const translations = {
            'sensors.pressure_monitoring': 'Monitoring Ciśnienia',
            'sensors.low_pressure': 'Niskie',
            'sensors.medium_pressure': 'Średnie',
            'sensors.high_pressure': 'Wysokie',
            'sensors.last_update': 'Ostatnia aktualizacja',
            'sensors.refresh': 'Odśwież sensory'
          };
          return translations[key] || key;
        }
      }
    };
    
    const Component = pressurePanelModule.component;
    wrapper = mount(Component, {
      props: {
        pressureData: {
          low: { value: 10.5, unit: 'mbar', status: 'normal' },
          medium: { value: 2.1, unit: 'bar', status: 'normal' },
          high: { value: 15.8, unit: 'bar', status: 'normal' }
        },
        alertThresholds: {
          critical: 25.0,
          warning: 15.0
        }
      },
      global: {
        mocks: {
          $t: mockI18n.global.t,
          $store: mockStore
        }
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // TEST MODUŁU I METADANYCH
  describe('Module Structure and Metadata', () => {
    it('should have correct module metadata', () => {
      expect(pressurePanelModule.metadata).toBeDefined();
      expect(pressurePanelModule.metadata.name).toBe('pressurePanel');
      expect(pressurePanelModule.metadata.version).toBe('0.1.0');
      expect(pressurePanelModule.metadata.displayName).toBe('Pressure Panel');
      expect(pressurePanelModule.metadata.description).toContain('Real-time pressure sensor monitoring');
    });

    it('should have required module methods', () => {
      expect(typeof pressurePanelModule.init).toBe('function');
      expect(typeof pressurePanelModule.handle).toBe('function');
      expect(typeof pressurePanelModule.render).toBe('function');
    });

    it('should handle module initialization', async () => {
      const mockContext = { store: mockStore, i18n: mockI18n };
      const result = await pressurePanelModule.init(mockContext);
      expect(result).toBe(true);
      expect(pressurePanelModule.metadata.initialized).toBe(true);
    });

    it('should handle module actions via handle method', async () => {
      const action = { type: 'GET_PRESSURE_DATA' };
      const result = await pressurePanelModule.handle(action);
      expect(result).toBeDefined();
    });
  });

  // TEST RENDEROWANIA KOMPONENTU
  describe('Component Rendering', () => {
    it('should render pressure panel successfully', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.pressure-panel').exists()).toBe(true);
    });

    it('should display panel title with translation', () => {
      const titleEl = wrapper.find('.panel-title');
      expect(titleEl.exists()).toBe(true);
      expect(titleEl.text()).toBe('Monitoring Ciśnienia');
    });

    it('should display all pressure sensors', () => {
      const sensorsEl = wrapper.find('.pressure-sensors');
      const sensorItems = wrapper.findAll('.pressure-item');
      
      expect(sensorsEl.exists()).toBe(true);
      expect(sensorItems.length).toBe(3); // low, medium, high
    });

    it('should display sensor labels with translations', () => {
      const sensorLabels = wrapper.findAll('.sensor-label');
      
      expect(sensorLabels[0].text()).toBe('Niskie');
      expect(sensorLabels[1].text()).toBe('Średnie');
      expect(sensorLabels[2].text()).toBe('Wysokie');
    });

    it('should display sensor values and units', () => {
      const sensorValues = wrapper.findAll('.value');
      const sensorUnits = wrapper.findAll('.unit');
      
      expect(sensorValues[0].text()).toBe('10.5');
      expect(sensorUnits[0].text()).toBe('mbar');
      expect(sensorValues[1].text()).toBe('2.1');
      expect(sensorUnits[1].text()).toBe('bar');
    });

    it('should display sensor status indicators', () => {
      const statusIndicators = wrapper.findAll('.sensor-status');
      
      statusIndicators.forEach(indicator => {
        expect(indicator.text()).toBe('normal');
        expect(indicator.classes()).toContain('normal');
      });
    });

    it('should display sensor bars with correct styling', () => {
      const sensorBars = wrapper.findAll('.sensor-bar');
      const sensorBarFills = wrapper.findAll('.sensor-bar-fill');
      
      expect(sensorBars.length).toBe(3);
      expect(sensorBarFills.length).toBe(3);
      
      sensorBarFills.forEach(fill => {
        expect(fill.classes()).toContain('normal');
      });
    });

    it('should display threshold information', () => {
      const warningThresholds = wrapper.findAll('.threshold-warning');
      const criticalThresholds = wrapper.findAll('.threshold-critical');
      
      expect(warningThresholds.length).toBe(3);
      expect(criticalThresholds.length).toBe(3);
      expect(warningThresholds[0].text()).toBe('30 mbar');
      expect(criticalThresholds[0].text()).toBe('45 mbar');
    });

    it('should display panel footer with refresh controls', () => {
      const footerEl = wrapper.find('.panel-footer');
      const lastUpdateEl = wrapper.find('.last-update');
      const refreshBtn = wrapper.find('.refresh-btn');
      
      expect(footerEl.exists()).toBe(true);
      expect(lastUpdateEl.exists()).toBe(true);
      expect(refreshBtn.exists()).toBe(true);
    });
  });

  // TEST REAKTYWNOŚCI I PROPS
  describe('Reactivity and Props', () => {
    it('should react to pressureData prop changes', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 25.0, unit: 'mbar', status: 'warning' },
          medium: { value: 3.5, unit: 'bar', status: 'normal' },
          high: { value: 20.0, unit: 'bar', status: 'critical' }
        }
      });
      
      const sensorValues = wrapper.findAll('.value');
      const sensorStatuses = wrapper.findAll('.sensor-status');
      
      expect(sensorValues[0].text()).toBe('25.0');
      expect(sensorStatuses[0].text()).toBe('warning');
      expect(sensorStatuses[2].text()).toBe('critical');
    });

    it('should react to alertThresholds prop changes', async () => {
      await wrapper.setProps({
        alertThresholds: {
          critical: 30.0,
          warning: 20.0
        }
      });
      
      expect(wrapper.props('alertThresholds').critical).toBe(30.0);
      expect(wrapper.props('alertThresholds').warning).toBe(20.0);
    });

    it('should update sensor bar widths based on values', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 25.0, unit: 'mbar', status: 'normal' }, // 50% of 50 max
          medium: { value: 2.5, unit: 'bar', status: 'normal' }, // 50% of 5 max
          high: { value: 15.0, unit: 'bar', status: 'normal' } // 50% of 30 max
        }
      });
      
      const sensorBarFills = wrapper.findAll('.sensor-bar-fill');
      
      sensorBarFills.forEach(fill => {
        const width = fill.element.style.width;
        expect(width).toMatch(/\d+%/);
      });
    });

    it('should handle reactive store changes', async () => {
      // Simulate store update
      mockStore.state.language = 'en';
      await wrapper.vm.$nextTick();
      
      // Component should remain functional with store changes
      expect(wrapper.exists()).toBe(true);
    });
  });

  // TEST LIFECYCLE I INICJALIZACJI
  describe('Lifecycle and Initialization', () => {
    it('should mount component successfully', () => {
      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.vm.$el).toBeTruthy();
    });

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('PressurePanelComponent');
    });

    it('should initialize computed properties correctly', () => {
      expect(wrapper.vm.deviceClass).toBeDefined();
      expect(wrapper.vm.deviceClass).toBe('landscape-7-9');
    });

    it('should initialize time updates', () => {
      expect(wrapper.vm.lastUpdateTime).toBeDefined();
      expect(wrapper.vm.timeInterval).toBeDefined();
    });

    it('should handle component destruction cleanly', () => {
      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  // TEST INTERAKCJI I ZDARZEŃ
  describe('Interactions and Events', () => {
    it('should emit sensors-refreshed event on refresh button click', async () => {
      const refreshBtn = wrapper.find('.refresh-btn');
      
      await refreshBtn.trigger('click');
      
      // Wait for async refresh to complete
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(wrapper.emitted('sensors-refreshed')).toBeTruthy();
      expect(wrapper.emitted('sensors-refreshed')[0][0]).toHaveProperty('timestamp');
    });

    it('should emit pressure-alert events for critical sensors', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 50.0, unit: 'mbar', status: 'critical' },
          medium: { value: 2.1, unit: 'bar', status: 'normal' },
          high: { value: 15.8, unit: 'bar', status: 'normal' }
        }
      });
      
      await wrapper.vm.checkForAlerts();
      
      expect(wrapper.emitted('pressure-alert')).toBeTruthy();
      expect(wrapper.emitted('pressure-alert')[0][0]).toEqual({
        sensor: 'low',
        value: 50.0,
        unit: 'mbar',
        status: 'critical',
        timestamp: expect.any(String)
      });
    });

    it('should disable refresh button during refresh', async () => {
      const refreshBtn = wrapper.find('.refresh-btn');
      
      expect(refreshBtn.attributes('disabled')).toBeUndefined();
      
      await refreshBtn.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isRefreshing).toBe(true);
      expect(refreshBtn.attributes('disabled')).toBeDefined();
    });

    it('should show spinning icon during refresh', async () => {
      const refreshBtn = wrapper.find('.refresh-btn');
      
      await refreshBtn.trigger('click');
      await wrapper.vm.$nextTick();
      
      const spinIcon = wrapper.find('.fa-sync-alt');
      expect(spinIcon.classes()).toContain('fa-spin');
    });

    it('should handle touch events for 7.9" display optimization', async () => {
      const panel = wrapper.find('.pressure-panel');
      await panel.trigger('touchstart');
      
      // Component should remain responsive
      expect(wrapper.exists()).toBe(true);
    });
  });

  // TEST METODÓW I LOGIKI BIZNESOWEJ
  describe('Methods and Business Logic', () => {
    it('should format sensor values correctly', () => {
      expect(wrapper.vm.formatSensorValue(10.567)).toBe('10.6');
      expect(wrapper.vm.formatSensorValue(2)).toBe('2.0');
      expect(wrapper.vm.formatSensorValue('invalid')).toBe('0.0');
    });

    it('should calculate sensor bar widths correctly', () => {
      const sensor = { value: 25.0, unit: 'mbar', status: 'normal' };
      const width = wrapper.vm.getSensorBarWidth(sensor, 'low');
      expect(width).toBe(50); // 25/50 * 100 = 50%
    });

    it('should get correct sensor labels', () => {
      expect(wrapper.vm.getSensorLabel('low')).toBe('Niskie');
      expect(wrapper.vm.getSensorLabel('medium')).toBe('Średnie');
      expect(wrapper.vm.getSensorLabel('high')).toBe('Wysokie');
      expect(wrapper.vm.getSensorLabel('unknown')).toBe('unknown');
    });

    it('should get correct warning thresholds', () => {
      expect(wrapper.vm.getWarningThreshold('low')).toBe('30 mbar');
      expect(wrapper.vm.getWarningThreshold('medium')).toBe('3.0 bar');
      expect(wrapper.vm.getWarningThreshold('high')).toBe('20.0 bar');
    });

    it('should get correct critical thresholds', () => {
      expect(wrapper.vm.getCriticalThreshold('low')).toBe('45 mbar');
      expect(wrapper.vm.getCriticalThreshold('medium')).toBe('4.5 bar');
      expect(wrapper.vm.getCriticalThreshold('high')).toBe('25.0 bar');
    });

    it('should get correct sensor status classes', () => {
      const sensor = { value: 10.5, unit: 'mbar', status: 'normal' };
      const classes = wrapper.vm.getSensorStatusClass(sensor, 'low');
      expect(classes).toEqual(['normal', 'low']);
    });

    it('should update time format correctly', () => {
      wrapper.vm.updateTime();
      expect(wrapper.vm.lastUpdateTime).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  // TEST DOSTĘPNOŚCI I UX
  describe('Accessibility and UX', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      const refreshBtn = wrapper.find('.refresh-btn');
      const ariaLabel = refreshBtn.attributes('aria-label');
      expect(ariaLabel).toBe('Odśwież sensory');
    });

    it('should be optimized for 7.9" landscape display', () => {
      const panel = wrapper.find('.pressure-panel');
      expect(panel.classes()).toContain('landscape-7-9');
    });

    it('should have readable font sizes for industrial display', () => {
      const textElements = wrapper.findAll('.sensor-label, .value, .unit, .last-update');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should provide visual feedback for sensor status', () => {
      const statusElements = wrapper.findAll('.sensor-status');
      statusElements.forEach(element => {
        expect(element.classes()).toContain('normal');
      });
    });
  });

  // TEST PROPS VALIDATION I WARTOŚCI DOMYŚLNYCH
  describe('Props Validation and Defaults', () => {
    it('should use default pressureData values when props not provided', async () => {
      const wrapperWithDefaults = mount(pressurePanelModule.component, {
        global: {
          mocks: {
            $t: mockI18n.global.t,
            $store: mockStore
          }
        }
      });
      
      const sensorValues = wrapperWithDefaults.findAll('.value');
      expect(sensorValues[0].text()).toBe('10.5');
      expect(sensorValues[1].text()).toBe('2.1');
      expect(sensorValues[2].text()).toBe('15.8');
      
      wrapperWithDefaults.unmount();
    });

    it('should use default alertThresholds when props not provided', async () => {
      const wrapperWithDefaults = mount(pressurePanelModule.component, {
        global: {
          mocks: {
            $t: mockI18n.global.t,
            $store: mockStore
          }
        }
      });
      
      expect(wrapperWithDefaults.props('alertThresholds').critical).toBe(25.0);
      expect(wrapperWithDefaults.props('alertThresholds').warning).toBe(15.0);
      
      wrapperWithDefaults.unmount();
    });

    it('should handle null pressureData gracefully', async () => {
      await wrapper.setProps({ pressureData: null });
      
      // Component should handle null data without crashing
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle missing sensor properties gracefully', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 10.5 }, // missing unit and status
          medium: { unit: 'bar' }, // missing value and status
          high: {} // empty object
        }
      });
      
      expect(wrapper.exists()).toBe(true);
    });
  });

  // TEST RESPONSYWNOŚCI I STYLISTYKI
  describe('Responsiveness and Styling', () => {
    it('should apply correct CSS classes for sensor status', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 10.5, unit: 'mbar', status: 'warning' },
          medium: { value: 2.1, unit: 'bar', status: 'critical' },
          high: { value: 15.8, unit: 'bar', status: 'normal' }
        }
      });
      
      const sensorItems = wrapper.findAll('.pressure-item');
      expect(sensorItems[0].classes()).toContain('warning');
      expect(sensorItems[1].classes()).toContain('critical');
      expect(sensorItems[2].classes()).toContain('normal');
    });

    it('should have proper layout structure', () => {
      const panel = wrapper.find('.pressure-panel');
      const sensorsSection = wrapper.find('.pressure-sensors');
      const footerSection = wrapper.find('.panel-footer');
      
      expect(panel.exists()).toBe(true);
      expect(sensorsSection.exists()).toBe(true);
      expect(footerSection.exists()).toBe(true);
    });

    it('should maintain layout integrity with extreme values', async () => {
      await wrapper.setProps({
        pressureData: {
          low: { value: 999.999, unit: 'mbar', status: 'critical' },
          medium: { value: 0.001, unit: 'bar', status: 'warning' },
          high: { value: 999.999, unit: 'bar', status: 'critical' }
        }
      });
      
      const panel = wrapper.find('.pressure-panel');
      const sensorValues = wrapper.findAll('.value');
      expect(panel.exists()).toBe(true);
      expect(sensorValues[0].text()).toBe('1000.0');
      expect(sensorValues[1].text()).toBe('0.0');
    });

    it('should clean up time interval on component unmount', () => {
      const component = wrapper.vm;
      expect(component.timeInterval).toBeDefined();
      
      // Spy on clearInterval
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      wrapper.unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should handle long sensor refresh operations', async () => {
      const refreshBtn = wrapper.find('.refresh-btn');
      
      // Start refresh
      await refreshBtn.trigger('click');
      expect(wrapper.vm.isRefreshing).toBe(true);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1100));
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isRefreshing).toBe(false);
    });
  });
});
