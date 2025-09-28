// STANDARD COMPONENT INDEX.JS - v2.0
// DO NOT MODIFY WITHOUT TEAM REVIEW

const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const componentModule = {
  metadata: {
    name: 'deviceSelect',
    version: '0.1.0',
    type: 'component',
    contractVersion: '2.0',
    description: 'Interactive device selection for testing'
  },
  
  component: null,
  config: null,
  
  async init(context = {}) {
    try {
      // Standard initialization sequence
      await this.loadComponent();
      await this.loadConfig();
      await this.runSmokeTests();
      
      return { 
        success: true, 
        message: `${this.metadata.name} initialized`,
        contractVersion: this.metadata.contractVersion
      };
    } catch (error) {
      console.error(`[${this.metadata.name}] Init failed:`, error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  },
  
  async loadComponent() {
    const module = await import(`./deviceSelect.js`);
    this.component = module.default || module.DeviceSelectTemplate;
    if (!this.component) {
      throw new Error('Component not found in module');
    }
  },
  
  async loadConfig() {
    const configPaths = [
      './component.config.js',
      './config/config.json',
      `/config/deviceSelect.json`
    ];
    
    for (const path of configPaths) {
      try {
        if (path.endsWith('.js')) {
          const module = await import(path);
          this.config = module.default;
        } else {
          const response = await fetch(path);
          if (response.ok) {
            this.config = await response.json();
          }
        }
        if (this.config) {
          await this.loadSchema();
          await this.loadRuntimeData();
          await this.loadCrudRules();
          return;
        }
      } catch (e) { 
        console.warn(`Config not found at ${path}`);
      }
    }
    
    // Default config fallback
    this.config = {
      component: this.metadata,
      settings: {
        enableSearch: true,
        showDeviceDetails: true,
        autoSelectTimeout: 1000
      }
    };
  },
  
  async loadSchema() {
    try {
      const response = await fetch('./config/schema.json');
      if (response.ok) {
        this.schema = await response.json();
        console.log(`✅ Schema loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`Schema not found for ${this.metadata.name}`);
    }
  },
  
  async loadRuntimeData() {
    try {
      const response = await fetch('./config/data.json');
      if (response.ok) {
        this.runtimeData = await response.json();
        console.log(`✅ Runtime data loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`Runtime data not found for ${this.metadata.name}`);
    }
  },
  
  async loadCrudRules() {
    try {
      const response = await fetch('./config/crud.json');
      if (response.ok) {
        this.crudRules = await response.json();
        console.log(`✅ CRUD rules loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`CRUD rules not found for ${this.metadata.name}`);
    }
  },
  
  async runSmokeTests() {
    if (typeof window !== 'undefined' && window.SKIP_SMOKE_TESTS) return;
    
    // Basic smoke tests
    if (!this.component) throw new Error('Component not loaded');
    if (!this.config) throw new Error('Config not loaded');
    if (typeof this.handle !== 'function') throw new Error('Handle method missing');
  },
  
  handle(request) {
    const { action, payload, language = 'pl' } = request;
    
    // Standard action handling
    switch(action) {
      case 'GET_CONFIG':
        return { success: true, data: this.config };
      case 'GET_METADATA':
        return { success: true, data: this.metadata };
      case 'GET_SCHEMA':
        return { success: true, data: this.schema };
      case 'GET_RUNTIME_DATA':
        return { success: true, data: this.runtimeData };
      case 'GET_CRUD_RULES':
        return { success: true, data: this.crudRules };
      case 'GET_AVAILABLE_DEVICES':
        return this.handleGetAvailableDevices(language);
      case 'SELECT_DEVICE':
        return this.handleSelectDevice(payload);
      case 'SEARCH_DEVICES':
        return this.handleSearchDevices(payload);
      case 'HEALTH_CHECK':
        return { success: true, healthy: true };
      default:
        return { success: true, data: payload };
    }
  },
  
  handleGetAvailableDevices(language = 'pl') {
    try {
      const devices = [
        {
          id: 'PP_MASK',
          name: language === 'pl' ? 'Maska PP' : 'PP Mask',
          description: language === 'pl' ? 'Maska z filtrem cząsteczkowym' : 'Particle Protection Mask',
          icon: '😷',
          category: 'respiratory',
          color: 'blue'
        },
        {
          id: 'NP_MASK',
          name: language === 'pl' ? 'Maska NP' : 'NP Mask',
          description: language === 'pl' ? 'Maska z filtrem przeciwgazowym' : 'Gas Protection Mask',
          icon: '🎭',
          category: 'respiratory',
          color: 'green'
        },
        {
          id: 'SCBA',
          name: language === 'pl' ? 'Aparat oddechowy SCBA' : 'SCBA',
          description: language === 'pl' ? 'Samodzielny aparat oddechowy' : 'Self-Contained Breathing Apparatus',
          icon: '🛡️',
          category: 'respiratory',
          color: 'purple'
        },
        {
          id: 'CPS',
          name: language === 'pl' ? 'Kombinezon CPS' : 'CPS Protection Suit',
          description: language === 'pl' ? 'Kombinezon ochrony chemicznej' : 'Chemical Protection Suit',
          icon: '🧪',
          category: 'chemical',
          color: 'orange'
        }
      ];
      
      return { success: true, data: devices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleSelectDevice(deviceData) {
    try {
      if (!deviceData || !deviceData.id) {
        return { success: false, error: 'Device ID is required' };
      }
      
      // Update runtime data with selected device
      this.runtimeData = { 
        ...this.runtimeData, 
        selectedDevice: deviceData,
        lastSelected: new Date().toISOString()
      };
      
      // Save to localStorage
      const storageKey = `config_${this.metadata.name}_${this.metadata.version}`;
      localStorage.setItem(storageKey, JSON.stringify(this.runtimeData));
      
      return { 
        success: true, 
        data: deviceData,
        message: `Device ${deviceData.id} selected successfully`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleSearchDevices(searchData) {
    try {
      const { query, language = 'pl' } = searchData;
      const allDevices = this.handleGetAvailableDevices(language).data;
      
      if (!query) {
        return { success: true, data: allDevices };
      }
      
      const searchQuery = query.toLowerCase();
      const filteredDevices = allDevices.filter(device => 
        device.name.toLowerCase().includes(searchQuery) ||
        device.description.toLowerCase().includes(searchQuery) ||
        device.category.toLowerCase().includes(searchQuery)
      );
      
      return { 
        success: true, 
        data: filteredDevices,
        query: query,
        totalFound: filteredDevices.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Lock the structure to prevent modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(componentModule.metadata);
}

export default componentModule;
