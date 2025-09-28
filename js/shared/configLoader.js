/**
 * Universal Configuration Loader for MASKSERVICE Components
 * Handles loading JSON config files with proper error handling and logging
 */

export class ConfigLoader {
  static async loadConfig(configPath, componentName = 'unknown') {
    console.log(`🔧 [${componentName}] Loading configuration from: ${configPath}`);
    
    try {
      const response = await fetch(configPath);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const config = await response.json();
      console.log(`✅ [${componentName}] Configuration loaded successfully:`, config);
      
      return {
        success: true,
        config: config,
        source: configPath
      };
      
    } catch (error) {
      console.error(`❌ [${componentName}] Failed to load config from ${configPath}:`, error);
      
      // Return fallback configuration
      const fallbackConfig = {
        component: { 
          name: componentName, 
          version: '0.1.0',
          description: `${componentName} component with fallback configuration`
        },
        settings: { 
          theme: 'light', 
          enabled: true,
          debug: true
        },
        ui: {
          responsive: true,
          displaySize: '7.9inch'
        }
      };
      
      console.log(`🔄 [${componentName}] Using fallback configuration:`, fallbackConfig);
      
      return {
        success: false,
        config: fallbackConfig,
        error: error.message,
        source: 'fallback'
      };
    }
  }

  static async loadMultipleConfigs(configPaths, componentName = 'unknown') {
    console.log(`🔧 [${componentName}] Loading multiple configurations:`, configPaths);
    
    const results = {};
    
    for (const [key, path] of Object.entries(configPaths)) {
      const result = await this.loadConfig(path, `${componentName}:${key}`);
      results[key] = result;
    }
    
    console.log(`📋 [${componentName}] All configurations loaded:`, results);
    return results;
  }

  static createComponentLogger(componentName) {
    return {
      info: (message, ...args) => console.log(`ℹ️ [${componentName}] ${message}`, ...args),
      success: (message, ...args) => console.log(`✅ [${componentName}] ${message}`, ...args),
      error: (message, ...args) => console.error(`❌ [${componentName}] ${message}`, ...args),
      warn: (message, ...args) => console.warn(`⚠️ [${componentName}] ${message}`, ...args),
      debug: (message, ...args) => console.debug(`🐛 [${componentName}] ${message}`, ...args)
    };
  }
}

export default ConfigLoader;
