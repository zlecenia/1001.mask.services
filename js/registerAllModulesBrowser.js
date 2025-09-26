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
    
    // Register built-in mock modules for development
    await registerMockModules(registry);
    
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
      await registry.register(name, version, mockModule);
      console.log(`Registered mock ${name} module`);
    } catch (error) {
      console.warn(`Failed to register mock ${name} module:`, error);
    }
  }
}
