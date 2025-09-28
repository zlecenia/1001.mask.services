// STANDARD COMPONENT INDEX.JS - v2.0
// DO NOT MODIFY WITHOUT TEAM REVIEW

const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const componentModule = {
  metadata: {
    name: 'deviceData',
    version: '0.1.1',
    type: 'component',
    contractVersion: '2.0' // Component contract version
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
    const module = await import(`./${this.metadata.name}.js`);
    this.component = module.default || module[this.metadata.name];
    if (!this.component) {
      throw new Error('Component not found in module');
    }
  },
  
  async loadConfig() {
    const configPaths = [
      './component.config.js',     // Unified config (NEW)
      './config/config.json',      // Source config
      `/config/${this.metadata.name}.json`
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
          // Load validation schema if available
          await this.loadSchema();
          // Load runtime data if available
          await this.loadRuntimeData();
          // Load CRUD rules if available
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
      settings: {}
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
  
  async loadLocales(language = 'pl') {
    try {
      const response = await fetch(`./locales/${language}.json`);
      if (response.ok) {
        this.translations = await response.json();
        console.log(`✅ Translations loaded for ${this.metadata.name} (${language})`);
        return this.translations;
      }
      
      // Fallback to Polish
      if (language !== 'pl') {
        return await this.loadLocales('pl');
      }
    } catch (e) {
      console.warn(`Translations not found for ${this.metadata.name} (${language})`);
    }
    return {};
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
      case 'GET_TRANSLATIONS':
        return this.handleGetTranslations(language);
      case 'VALIDATE_DATA':
        return this.handleValidateData(payload);
      case 'UPDATE_DATA':
        return this.handleUpdateData(payload);
      case 'SAVE_CONFIG':
        return this.handleSaveConfig(payload);
      case 'HEALTH_CHECK':
        return { success: true, healthy: true };
      default:
        return { success: true, data: payload };
    }
  },
  
  async handleGetTranslations(language = 'pl') {
    try {
      const translations = await this.loadLocales(language);
      return { success: true, data: translations, language };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleValidateData(data) {
    if (!this.schema) {
      return { success: false, error: 'No validation schema available' };
    }
    
    try {
      // Basic validation - in real implementation use ajv or similar
      const errors = [];
      
      if (this.schema.required) {
        for (const field of this.schema.required) {
          if (!data[field]) {
            errors.push(`Field '${field}' is required`);
          }
        }
      }
      
      if (this.schema.properties) {
        for (const [field, rules] of Object.entries(this.schema.properties)) {
          if (data[field] !== undefined) {
            if (rules.type && typeof data[field] !== rules.type) {
              errors.push(`Field '${field}' must be of type ${rules.type}`);
            }
          }
        }
      }
      
      return {
        success: errors.length === 0,
        valid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleUpdateData(updates) {
    try {
      // Validate before updating
      const validation = this.handleValidateData(updates);
      if (!validation.valid) {
        return { success: false, error: 'Validation failed', details: validation.errors };
      }
      
      // Check CRUD permissions
      if (this.crudRules) {
        for (const field of Object.keys(updates)) {
          if (this.crudRules.readonly && this.crudRules.readonly.includes(field)) {
            return { success: false, error: `Field '${field}' is read-only` };
          }
          if (this.crudRules.editable && !this.crudRules.editable.includes(field)) {
            return { success: false, error: `Field '${field}' is not editable` };
          }
        }
      }
      
      // Update runtime data
      this.runtimeData = { ...this.runtimeData, ...updates };
      
      // Save to localStorage for persistence (SDK-independent)
      const storageKey = `config_${this.metadata.name}_${this.metadata.version}`;
      localStorage.setItem(storageKey, JSON.stringify(this.runtimeData));
      
      return { 
        success: true, 
        data: this.runtimeData,
        message: 'Data updated successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleSaveConfig(configData) {
    try {
      // Validate config data
      const validation = this.handleValidateData(configData);
      if (!validation.valid) {
        return { success: false, error: 'Config validation failed', details: validation.errors };
      }
      
      // Update config
      this.config = { ...this.config, ...configData };
      
      // Save to localStorage (SDK-independent storage)
      const storageKey = `config_${this.metadata.name}_${this.metadata.version}`;
      const backupKey = `config_backup_${this.metadata.name}_${this.metadata.version}`;
      
      // Create backup before saving
      if (localStorage.getItem(storageKey)) {
        localStorage.setItem(backupKey, localStorage.getItem(storageKey));
      }
      
      localStorage.setItem(storageKey, JSON.stringify(this.config));
      
      return { 
        success: true, 
        data: this.config,
        message: 'Configuration saved successfully',
        backup: true
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
