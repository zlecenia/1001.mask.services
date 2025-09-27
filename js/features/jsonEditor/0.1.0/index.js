/**
 * JSON Editor Component Index
 * Visual configuration editor for component config files
 */

import JsonEditor from './jsonEditor.js';

const metadata = {
  name: 'jsonEditor',
  version: '0.1.0',
  description: 'Visual JSON configuration editor with schema validation',
  author: 'MASKSERVICE System',
  tags: ['editor', 'json', 'configuration', 'validation'],
  category: 'tools',
  
  // Component capabilities
  capabilities: {
    standalone: true,
    configurable: true,
    testable: true,
    mockable: true
  },
  
  // Dependencies
  dependencies: {
    vue: '^3.0.0',
    vuex: '^4.0.0'
  },
  
  // API endpoints
  endpoints: {
    loadComponents: '/api/components',
    loadConfig: '/api/components/:component/config/:file',
    saveConfig: '/api/components/:component/config/:file',
    validateSchema: '/api/schemas/validate'
  },
  
  // Configuration schema
  configSchema: {
    type: 'object',
    properties: {
      defaultSchema: { type: 'string', default: 'app' },
      autoSave: { type: 'boolean', default: false },
      validateOnChange: { type: 'boolean', default: true },
      allowedComponents: { 
        type: 'array', 
        items: { type: 'string' },
        default: []
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark'],
        default: 'light'
      }
    }
  }
};

// Component configuration loader
async function loadConfig() {
  try {
    const configPath = './config/config.json';
    const response = await fetch(configPath);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load jsonEditor config, using defaults');
  }
  
  // Default configuration
  return {
    component: {
      name: 'jsonEditor',
      version: '0.1.0',
      title: 'JSON Configuration Editor'
    },
    settings: {
      defaultSchema: 'app',
      autoSave: false,
      validateOnChange: true,
      allowedComponents: [],
      theme: 'light'
    },
    ui: {
      showPreview: true,
      showValidation: true,
      compactMode: false
    }
  };
}

// Initialize component
async function init(context = {}) {
  try {
    const config = await loadConfig();
    
    // Setup component state
    const componentState = {
      config,
      isInitialized: true,
      lastUpdate: new Date().toISOString(),
      context: context
    };
    
    // Register with global store if available
    if (context.store) {
      await registerWithStore(context.store, componentState);
    }
    
    console.log('🛠️ JsonEditor component initialized');
    
    return {
      success: true,
      component: JsonEditor,
      state: componentState,
      metadata
    };
    
  } catch (error) {
    console.error('Failed to initialize JsonEditor:', error);
    return {
      success: false,
      error: error.message,
      component: JsonEditor, // Still return component for basic functionality
      metadata
    };
  }
}

// Register component with Vuex store
async function registerWithStore(store, state) {
  const moduleName = 'jsonEditor';
  
  // Check if module already registered
  if (store.hasModule && store.hasModule(moduleName)) {
    return;
  }
  
  const storeModule = {
    namespaced: true,
    state: () => ({
      ...state,
      availableComponents: [],
      currentComponent: null,
      currentConfigFile: null,
      currentJSON: null,
      selectedSchema: null,
      isDirty: false
    }),
    
    mutations: {
      SET_COMPONENTS(state, components) {
        state.availableComponents = components;
      },
      SET_CURRENT_COMPONENT(state, component) {
        state.currentComponent = component;
      },
      SET_CONFIG_FILE(state, file) {
        state.currentConfigFile = file;
      },
      SET_JSON_DATA(state, data) {
        state.currentJSON = data;
        state.isDirty = true;
      },
      SET_SCHEMA(state, schema) {
        state.selectedSchema = schema;
      },
      MARK_CLEAN(state) {
        state.isDirty = false;
      },
      UPDATE_CONFIG(state, newConfig) {
        state.config = { ...state.config, ...newConfig };
      }
    },
    
    actions: {
      async loadAvailableComponents({ commit }) {
        try {
          // In real app, this would fetch from API
          const components = [
            'appFooter', 'appHeader', 'auditLogViewer', 'deviceData', 'loginForm',
            'mainMenu', 'pageTemplate', 'pressurePanel', 'realtimeSensors',
            'reportsViewer', 'serviceMenu', 'systemSettings', 'testMenu', 'userMenu'
          ];
          commit('SET_COMPONENTS', components);
          return { success: true, components };
        } catch (error) {
          console.error('Failed to load components:', error);
          return { success: false, error: error.message };
        }
      },
      
      async loadComponentConfig({ commit }, { component, file }) {
        try {
          commit('SET_CURRENT_COMPONENT', component);
          commit('SET_CONFIG_FILE', file);
          
          // In real app, would load from:
          // js/features/${component}/0.1.0/config/${file}
          
          // For demo, return sample data
          const sampleData = {
            appFooter: { "version": "0.1.0", "enabled": true },
            appHeader: { "title": "MASK Service", "showLogo": true }
          };
          
          const data = sampleData[component] || {};
          commit('SET_JSON_DATA', data);
          
          return { success: true, data };
        } catch (error) {
          console.error('Failed to load config:', error);
          return { success: false, error: error.message };
        }
      },
      
      async saveComponentConfig({ state, commit }, { component, file, data }) {
        try {
          // In real app, would save to:
          // js/features/${component}/0.1.0/config/${file}
          
          console.log(`Saving ${file} for ${component}:`, data);
          commit('MARK_CLEAN');
          
          return { success: true };
        } catch (error) {
          console.error('Failed to save config:', error);
          return { success: false, error: error.message };
        }
      }
    },
    
    getters: {
      isReady: (state) => state.isInitialized,
      hasUnsavedChanges: (state) => state.isDirty,
      currentPath: (state) => {
        if (state.currentComponent && state.currentConfigFile) {
          return `${state.currentComponent}/${state.currentConfigFile}`;
        }
        return null;
      }
    }
  };
  
  store.registerModule(moduleName, storeModule);
}

// Handle component actions
async function handle(action, params = {}) {
  switch (action) {
    case 'loadConfig':
      return await loadConfig();
      
    case 'validateJSON':
      return validateJSON(params.data, params.schema);
      
    case 'exportJSON':
      return exportJSON(params.data, params.filename);
      
    case 'importJSON':
      return importJSON(params.file);
      
    case 'resetEditor':
      return { success: true, message: 'Editor reset' };
      
    default:
      return { 
        success: false, 
        error: `Unknown action: ${action}` 
      };
  }
}

// JSON validation helper
function validateJSON(data, schema) {
  try {
    if (!schema) {
      return { success: true, message: 'No schema provided, skipping validation' };
    }
    
    // Basic validation
    if (schema.type === 'object') {
      if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        throw new Error('Expected object type');
      }
      
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
      }
    }
    
    return { success: true, message: 'JSON is valid' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// JSON export helper
function exportJSON(data, filename = 'config.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'File exported successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// JSON import helper
function importJSON(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        resolve({ success: true, data });
      } catch (error) {
        resolve({ success: false, error: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  });
}

// Component lifecycle
const lifecycle = {
  async beforeMount(instance) {
    console.log('JsonEditor: Before mount');
  },
  
  async mounted(instance) {
    console.log('JsonEditor: Mounted');
  },
  
  async beforeUnmount(instance) {
    console.log('JsonEditor: Before unmount');
  }
};

export default {
  component: JsonEditor,
  metadata,
  init,
  handle,
  lifecycle,
  
  // Utility exports
  validateJSON,
  exportJSON,
  importJSON
};
