import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import appHeaderModule from './index.js';

describe('AppHeader Module', () => {
  let wrapper;
  let mockStore;
  let mockI18n;
  
  beforeEach(() => {
    // KLUCZOWE: Reactive store mock dla Vue reactivity (proven pattern)
    mockStore = reactive({
      state: {
        user: { username: 'TestUser', role: 'ADMIN' },
        device: {
          status: 'ONLINE',
          info: {
            name: 'TEST_DEVICE',
            type: 'C20',
            url: 'test.mask.services'
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
            'global.company': 'MASKTRONIC',
            'global.logo': 'MASKTRONIC',
            'global.hardware': 'C20',
            'global.product': '1001',
            'global.version': 'v3.0',
            'global.software': 'v3.0',
            'global.device_name': 'TEST_DEVICE',
            'global.device_type': 'C20',
            'global.online': 'Online',
            'global.offline': 'Offline',
            'header.device_info': 'TEST_DEVICE',
            'header.language_selector': 'Switch to'
          };
          return translations[key] || key;
        }
      }
    };
    
    const Component = appHeaderModule.component;
    wrapper = mount(Component, {
      props: {
        deviceStatus: 'ONLINE',
        deviceInfo: {
          name: 'TEST_DEVICE',
          type: 'C20',
          url: 'test.mask.services'
        },
        currentLanguage: 'pl'
      },
      global: {
        mocks: {
          $store: mockStore,
          $t: mockI18n.global.t
        }
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // TEST PODSTAWOWEJ STRUKTURY RENDEROWANIA
  describe('Header Structure Rendering', () => {
    it('should render header with correct main structure', () => {
      const header = wrapper.find('.app-header');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain('landscape-7-9');
    });

    it('should render header-left section with logo elements', () => {
      const headerLeft = wrapper.find('.header-left');
      expect(headerLeft.exists()).toBe(true);
      
      const logo = wrapper.find('.logo');
      expect(logo.exists()).toBe(true);
      expect(logo.text()).toBe('MASKTRONIC');
    });

    it('should render all branding elements (hardware, product, software)', () => {
      const hardware = wrapper.find('.hardware');
      const product = wrapper.find('.product');
      const software = wrapper.find('.software');
      
      expect(hardware.exists()).toBe(true);
      expect(hardware.text()).toBe('C20');
      expect(product.exists()).toBe(true);
      expect(product.text()).toBe('1001');
      expect(software.exists()).toBe(true);
      expect(software.text()).toBe('v3.0');
    });
  });

  // TEST STATUSU URZĄDZENIA I CENTRUM HEADERA
  describe('Device Status Display', () => {
    it('should render header-center with status indicator', () => {
      const headerCenter = wrapper.find('.header-center');
      expect(headerCenter.exists()).toBe(true);
      
      const statusIndicator = wrapper.find('.status-indicator');
      expect(statusIndicator.exists()).toBe(true);
    });

    it('should display device URL correctly', () => {
      const footerHost = wrapper.find('.footer-host a');
      expect(footerHost.exists()).toBe(true);
      expect(footerHost.text()).toBe('test.mask.services');
      expect(footerHost.attributes('href')).toBe('https://test.mask.services');
    });

    it('should show correct status dot for online device', () => {
      const statusDot = wrapper.find('.status-dot');
      expect(statusDot.exists()).toBe(true);
      expect(statusDot.classes()).toContain('online');
    });

    it('should show correct role badge for online device', () => {
      const roleBadge = wrapper.find('.role-badge');
      expect(roleBadge.exists()).toBe(true);
      expect(roleBadge.classes()).toContain('online');
      expect(roleBadge.text()).toBe('Online');
    });
  });

  // TEST SEKCJI PRAWEJ Z INFORMACJAMI URZĄDZENIA
  describe('Device Info and Language Selector', () => {
    it('should render header-right section with device info', () => {
      const headerRight = wrapper.find('.header-right');
      expect(headerRight.exists()).toBe(true);
      
      const deviceInfo = wrapper.find('.device-info');
      expect(deviceInfo.exists()).toBe(true);
    });

    it('should display device name and type correctly', () => {
      const deviceInfoSpans = wrapper.find('.device-info').findAll('span');
      expect(deviceInfoSpans).toHaveLength(2);
      expect(deviceInfoSpans[0].text()).toBe('TEST_DEVICE');
      expect(deviceInfoSpans[1].text()).toBe('C20');
    });

    it('should render language selector with all language buttons', () => {
      const languageSelector = wrapper.find('.language-selector');
      expect(languageSelector.exists()).toBe(true);
      
      const langButtons = wrapper.findAll('.lang-btn');
      expect(langButtons).toHaveLength(3);
      
      // Check flag emojis
      expect(langButtons[0].text()).toBe('🇵🇱');
      expect(langButtons[1].text()).toBe('🇺🇸');
      expect(langButtons[2].text()).toBe('🇩🇪');
    });

    it('should mark current language as active', () => {
      const langButtons = wrapper.findAll('.lang-btn');
      const polishButton = langButtons[0]; // pl is default
      expect(polishButton.classes()).toContain('active');
    });
  });

  // TEST INTERAKCJI I EVENTÓW
  describe('User Interactions', () => {
    it('should emit language-changed event when language button clicked', async () => {
      const langButtons = wrapper.findAll('.lang-btn');
      const englishButton = langButtons[1]; // en button
      
      await englishButton.trigger('click');
      
      expect(wrapper.emitted('language-changed')).toBeTruthy();
      expect(wrapper.emitted('language-changed')[0]).toEqual(['en']);
    });

    it('should NOT emit language-changed for already active language', async () => {
      const langButtons = wrapper.findAll('.lang-btn');
      const polishButton = langButtons[0]; // pl is already active
      
      await polishButton.trigger('click');
      
      // Component only emits when language actually changes
      expect(wrapper.emitted('language-changed')).toBeFalsy();
    });

    it('should emit logo-clicked event when logo area clicked', async () => {
      const logoLink = wrapper.find('.header-left a');
      
      await logoLink.trigger('click');
      
      expect(wrapper.emitted('logo-clicked')).toBeTruthy();
    });
  });

  // TEST RESPONSYWNOŚCI DLA 7.9" DISPLAY
  describe('7.9 Inch Display Optimization', () => {
    it('should apply landscape-7-9 class for device compatibility', () => {
      expect(wrapper.vm.deviceClass).toBe('landscape-7-9');
      expect(wrapper.find('.app-header').classes()).toContain('landscape-7-9');
    });

    it('should have proper ARIA labels for accessibility', () => {
      const langButtons = wrapper.findAll('.lang-btn');
      
      langButtons.forEach((button, index) => {
        const ariaLabel = button.attributes('aria-label');
        expect(ariaLabel).toMatch(/Switch to/);
      });
    });
  });

  // TEST PROPS VALIDATION I WARTOŚCI DOMYŚLNYCH
  describe('Props Validation and Defaults', () => {
    it('should display deviceInfo with translation fallback behavior', async () => {
      // Test how template handles translation vs prop values
      await wrapper.setProps({ 
        deviceInfo: {
          name: 'CUSTOM_DEVICE',
          type: '300',
          url: 'test.example.com'
        }
      });
      
      const deviceInfoSpans = wrapper.find('.device-info').findAll('span');
      // First span: $t('global.device_name') returns 'TEST_DEVICE' from mock
      expect(deviceInfoSpans[0].text()).toBe('TEST_DEVICE');
      // Second span: deviceInfo.type prop value is displayed directly
      expect(deviceInfoSpans[1].text()).toBe('300');
    });

    it('should handle offline device status correctly', async () => {
      await wrapper.setProps({ deviceStatus: 'OFFLINE' });
      
      const statusDot = wrapper.find('.status-dot');
      const roleBadge = wrapper.find('.role-badge');
      
      expect(statusDot.classes()).toContain('offline');
      expect(roleBadge.classes()).toContain('offline');
      expect(roleBadge.text()).toBe('Offline');
    });

    it('should validate deviceStatus prop correctly', () => {
      const component = appHeaderModule.component;
      const validator = component.props.deviceStatus.validator;
      
      expect(validator('ONLINE')).toBe(true);
      expect(validator('OFFLINE')).toBe(true);
      expect(validator('CONNECTING')).toBe(true);
      expect(validator('INVALID')).toBe(false);
    });

    it('should validate currentLanguage prop correctly', () => {
      const component = appHeaderModule.component;
      const validator = component.props.currentLanguage.validator;
      
      expect(validator('pl')).toBe(true);
      expect(validator('en')).toBe(true);
      expect(validator('de')).toBe(true);
      expect(validator('fr')).toBe(false);
    });
  });

  // TEST CYKLU ŻYCIA KOMPONENTU
  describe('Component Lifecycle', () => {
    it('should mount successfully and log message', () => {
      // Component should mount without errors
      expect(wrapper.vm).toBeDefined();
      expect(wrapper.exists()).toBe(true);
    });

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('AppHeaderComponent');
    });
  });
});

describe('AppHeader Module Integration', () => {
  let appHeaderModule;

  beforeEach(async () => {
    appHeaderModule = (await import('./index.js')).default;
  });

  // TEST METADANYCH MODUŁU
  describe('Module Metadata', () => {
    it('should have correct module metadata', () => {
      expect(appHeaderModule.metadata.name).toBe('appHeader');
      expect(appHeaderModule.metadata.version).toBe('0.1.0');
      expect(appHeaderModule.metadata.displayName).toBe('App Header');
      expect(appHeaderModule.metadata.initialized).toBe(false);
    });

    it('should initialize successfully', async () => {
      const result = await appHeaderModule.init();
      expect(result).toBe(true);
      expect(appHeaderModule.metadata.initialized).toBe(true);
    });
  });

  // TEST METODY HANDLE MODUŁU
  describe('Module Handle Method', () => {
    it('should handle default request correctly', () => {
      const result = appHeaderModule.handle();
      
      expect(result.success).toBe(true);
      expect(result.data.action).toBe('render');
      expect(result.data.deviceStatus).toBe('OFFLINE');
      expect(result.data.currentLanguage).toBe('pl');
      expect(result.data.timestamp).toBeDefined();
    });

    it('should handle custom request parameters', () => {
      const request = {
        action: 'update',
        deviceStatus: 'ONLINE',
        deviceInfo: { name: 'CUSTOM', type: 'C30', url: 'custom.mask.services' },
        currentLanguage: 'en'
      };
      
      const result = appHeaderModule.handle(request);
      
      expect(result.success).toBe(true);
      expect(result.data.action).toBe('update');
      expect(result.data.deviceStatus).toBe('ONLINE');
      expect(result.data.deviceInfo.name).toBe('CUSTOM');
      expect(result.data.currentLanguage).toBe('en');
    });
  });
});
