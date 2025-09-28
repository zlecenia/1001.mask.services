/**
 * Register All Modules - Browser Version
 * Browser-compatible module registration without Node.js dependencies
 */
import { FeatureRegistry } from './FeatureRegistry.js';

/**
 * Register all available modules in the browser environment
 * @param {FeatureRegistry} registry - The feature registry instance
 */
export async function registerAllModules(registry) {
  if (!registry) {
    console.warn('No registry provided to registerAllModules');
    return;
  }

  try {
    console.log('Registering modules in browser environment...');
    
    // Try to register real modules first, fallback to mock if needed
    try {
      await registerRealModules(registry);
      console.log('Real modules registered successfully');
    } catch (error) {
      console.warn('Real modules failed, using mock modules:', error);
      await registerMockModules(registry);
    }
    
    console.log('Module registration completed');
  } catch (error) {
    console.error('Error registering modules:', error);
  }
}

/**
 * Create a mock module for testing purposes
 * @param {string} name - Module name
 * @returns {object} Mock module
 */
function createMockModule(name) {
  return {
    name,
    version: '1.0.0',
    init: async () => true,
    handle: (request) => ({ success: true, data: { message: `Mock ${name} response` } }),
    render: (container, context) => {
      container.innerHTML = `<div class="mock-${name}">Mock ${name} content for ${context.user?.name || 'user'}</div>`;
    },
    getMenuForRole: async (role) => {
      return [
        {
          id: name,
          title: name.charAt(0).toUpperCase() + name.slice(1),
          items: [
            { id: `${name}-item1`, title: `${name} Item 1`, route: `/${name}`, icon: 'fas fa-home' },
            { id: `${name}-item2`, title: `${name} Item 2`, route: `/${name}/settings`, icon: 'fas fa-cog' }
          ]
        }
      ];
    }
  };
}

/**
 * Register real .js modules from the features directory
 * @param {FeatureRegistry} registry - The feature registry instance
 */
async function registerRealModules(registry) {
  const modules = [
    // Core application modules
    { name: 'pageTemplate', version: '0.1.0' },
    { name: 'mainMenu', version: '0.1.0' },
    { name: 'loginForm', version: '0.1.0' },
    
    // UI layout components
    { name: 'appHeader', version: '0.1.0' },
    { name: 'appFooter', version: '0.1.0' },
    
    // Monitoring components
    { name: 'pressurePanel', version: '0.1.0' },
    
    // Data components (v2.0 contract compliant)
    { name: 'deviceData', version: '0.1.1' }
  ];

  const moduleLoaders = {
    pageTemplate: () => import('./features/pageTemplate/0.1.0/index.js'),
    mainMenu: () => import('./features/mainMenu/0.1.0/index.js'),
    loginForm: () => import('./features/loginForm/0.1.0/index.js'),
    appHeader: () => import('./features/appHeader/0.1.0/index.js'),
    appFooter: () => import('./features/appFooter/0.1.0/index.js'),
    pressurePanel: () => import('./features/pressurePanel/0.1.0/index.js'),
    deviceData: () => import('./features/deviceData/0.1.1/index.js')
  };
  
  for (const { name, version } of modules) {
    const loadModule = moduleLoaders[name];
    if (!loadModule) {
      console.warn(`No loader defined for ${name}, skipping`);
      continue;
    }

    try {
      console.log(`Loading real ${name} module...`);
      const moduleExport = await loadModule();
      const module = moduleExport.default || moduleExport;
      
      if (module && typeof module === 'object') {
        registry.register(name, version, module);
        console.log(`✅ Registered real ${name}@${version} module`);
      } else {
        throw new Error(`Invalid module export for ${name}`);
      }
    } catch (error) {
      console.warn(`❌ Failed to register real ${name} module:`, error);
      throw error; // Re-throw to trigger fallback
    }
  }
}

/**
 * Register mock modules for development/testing
 * @param {FeatureRegistry} registry - The feature registry instance
 */
async function registerMockModules(registry) {
  const mockModules = [
    { name: 'mainMenu', version: '1.0.0' },
    { name: 'loginForm', version: '1.0.0' },
    { name: 'pageTemplate', version: '1.0.0' }
  ];
  
  for (const { name, version } of mockModules) {
    try {
      const mockModule = createMockModule(name);
      registry.register(name, version, mockModule);
      console.log(`Registered mock ${name} module`);
    } catch (error) {
      console.warn(`Failed to register mock ${name} module:`, error);
    }
  }
}
