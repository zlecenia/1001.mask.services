/**
 * FeatureRegistry - Core system for managing versioned modules
 * Handles module registration, loading, and version management
 */

const featureModuleLoaders = import.meta.glob('./features/*/*/index.js');

class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this.versions = new Map();
    this.metadata = new Map();
    this.rollbackHistory = new Map();
  }

  /**
   * Register a module with version and metadata
   * @param {string} name - Module name
   * @param {string} version - Version string (e.g., '0.1.0', 'v2')
   * @param {object} module - Module object
   * @param {object} metadata - Optional metadata from package.json
   */
  register(name, version, module, metadata = {}) {
    const key = `${name}@${version}`;
    this.features.set(key, module);

    // Track versions for each module
    if (!this.versions.has(name)) {
      this.versions.set(name, []);
    }
    const versionList = this.versions.get(name);
    if (!versionList.includes(version)) {
      versionList.push(version);
      // Sort versions to ensure proper ordering
      versionList.sort((a, b) => {
        const aNum = parseInt(a.replace('v', ''));
        const bNum = parseInt(b.replace('v', ''));
        return aNum - bNum;
      });
    }

    // Store metadata
    this.metadata.set(key, {
      name,
      version,
      registeredAt: new Date(),
      ...metadata
    });

    console.log(`✓ Registered ${key}`);
  }

  /**
   * Load a module by name and version
   * @param {string} name - Module name
   * @param {string} version - Version ('latest', '0.1.0', 'v2', etc.)
   * @returns {Promise<object>} Module object
   */
  async load(name, version = 'latest') {
    if (version === 'latest') {
      const versions = this.versions.get(name);
      if (!versions || versions.length === 0) {
        throw new Error(`Module ${name} not found`);
      }
      version = versions[versions.length - 1];
    }

    const key = `${name}@${version}`;
    let module = this.features.get(key);

    if (module) {
      return module;
    }

    const modulePath = `./features/${name}/${version}/index.js`;
    const loader = featureModuleLoaders[modulePath];

    if (!loader) {
      throw new Error(`Failed to load ${key}: module path ${modulePath} not found`);
    }

    try {
      const imported = await loader();
      module = imported.default || imported;

      // Register the dynamically loaded module
      this.register(name, version, module);
      return module;
    } catch (error) {
      throw new Error(`Failed to load ${key}: ${error.message}`);
    }
  }

  /**
   * Get all available versions for a module
   * @param {string} name - Module name
   * @returns {Array<string>} Array of version strings
   */
  getVersions(name) {
    return this.versions.get(name) || [];
  }

  /**
   * Get metadata for a specific module version
   * @param {string} name - Module name
   * @param {string} version - Version string
   * @returns {object} Module metadata
   */
  getMetadata(name, version = 'latest') {
    if (version === 'latest') {
      const versions = this.getVersions(name);
      version = versions[versions.length - 1];
    }
    return this.metadata.get(`${name}@${version}`);
  }

  /**
   * List all registered modules
   * @returns {Array<object>} Array of module info objects
   */
  listModules() {
    const modules = [];
    for (const [name, versions] of this.versions.entries()) {
      const latestVersion = versions[versions.length - 1];
      const metadata = this.getMetadata(name, latestVersion);
      modules.push({
        name,
        versions,
        latestVersion,
        metadata
      });
    }
    return modules;
  }

  /**
   * Rollback a module to a previous version
   * @param {string} name - Module name
   * @param {string} toVersion - Target version to rollback to
   */
  rollback(name, toVersion) {
    const versions = this.getVersions(name);
    if (!versions.includes(toVersion)) {
      throw new Error(`Version ${toVersion} not found for module ${name}`);
    }

    // Store rollback history
    const currentLatest = versions[versions.length - 1];
    if (!this.rollbackHistory.has(name)) {
      this.rollbackHistory.set(name, []);
    }
    this.rollbackHistory.get(name).push({
      from: currentLatest,
      to: toVersion,
      timestamp: new Date()
    });

    console.log(`⚠ Rolled back ${name} from ${currentLatest} to ${toVersion}`);
  }

  /**
   * Check if a module version meets rollback conditions
   * @param {string} name - Module name
   * @param {string} version - Version to check
   * @param {object} testResults - Test results object
   * @returns {boolean} True if rollback should occur
   */
  shouldRollback(name, version, testResults) {
    const metadata = this.getMetadata(name, version);
    if (!metadata || !metadata.rollbackConditions) {
      return false;
    }

    const conditions = metadata.rollbackConditions;
    
    // Check error rate
    if (conditions.errorRate && testResults.errorRate) {
      const threshold = parseFloat(conditions.errorRate.replace('>', '').replace('%', ''));
      if (testResults.errorRate > threshold) {
        return true;
      }
    }

    // Check test failures
    if (conditions.testFailures && testResults.failedTests !== undefined) {
      const threshold = parseInt(conditions.testFailures.replace('>', ''));
      if (testResults.failedTests > threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get rollback history for a module
   * @param {string} name - Module name
   * @returns {Array<object>} Rollback history
   */
  getRollbackHistory(name) {
    return this.rollbackHistory.get(name) || [];
  }

  /**
   * Find a module that can handle a specific route
   * @param {string} route - Route path (e.g., '/', '/users', '/settings')
   * @returns {Promise<object|null>} Module that can handle the route, or null
   */
  async findModuleForRoute(route) {
    // Try to find modules that have route handling capabilities
    for (const [name] of this.versions.entries()) {
      try {
        const module = await this.load(name, 'latest');
        
        // Check if module has route handling capability
        if (module && typeof module.canHandleRoute === 'function') {
          if (await module.canHandleRoute(route)) {
            return module;
          }
        }
        
        // Fallback: check if module has specific route mapping
        if (module && module.routes && Array.isArray(module.routes)) {
          if (module.routes.includes(route)) {
            return module;
          }
        }
        
        // Default route handling for basic paths
        if (module && module.name) {
          // Handle basic route mapping
          const routeModuleMap = {
            '/': 'pageTemplate',
            '/home': 'pageTemplate', 
            '/dashboard': 'pageTemplate',
            '/menu': 'mainMenu',
            '/login': 'loginForm',
            '/users': 'pageTemplate',
            '/settings': 'pageTemplate',
            '/status': 'pageTemplate'
          };
          
          if (routeModuleMap[route] === module.name) {
            return module;
          }
        }
      } catch (error) {
        // Continue to next module if this one fails to load
        console.warn(`Failed to load module ${name} for route matching:`, error);
      }
    }
    
    // If no specific module found, try to return pageTemplate as default
    try {
      return await this.load('pageTemplate', 'latest');
    } catch (error) {
      console.warn('Could not load default pageTemplate module:', error);
      return null;
    }
  }

  /**
   * Clear all registrations (for testing)
   */
  clear() {
    this.features.clear();
    this.versions.clear();
    this.metadata.clear();
    this.rollbackHistory.clear();
  }
}

// Export singleton instance
export const registry = new FeatureRegistry();
export { FeatureRegistry };
