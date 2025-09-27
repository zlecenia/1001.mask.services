// Performance-Optimized Feature Registry with Caching and Lazy Loading
// Extends the base FeatureRegistry with performance enhancements

import { FeatureRegistry } from './FeatureRegistry.js';
import { getPerformanceService } from './services/performanceService.js';

export class OptimizedFeatureRegistry extends FeatureRegistry {
  constructor() {
    super();
    this.performanceService = getPerformanceService();
    this.loadingPromises = new Map(); // Prevent duplicate loads
    this.criticalComponents = new Set(['pressurePanel', 'appHeader', 'appFooter']);
    
    // Initialize industrial display optimizations
    this.performanceService.optimizeForIndustrialDisplay();
  }
  
  async register(name, version, module) {
    const cacheKey = `${name}_${version}`;
    
    // Check if already cached
    const cached = this.performanceService.getCachedComponent(cacheKey);
    if (cached) {
      this.modules.set(cacheKey, cached);
      return true;
    }
    
    // Register normally and cache
    const result = await super.register(name, version, module);
    if (result) {
      this.performanceService.cacheComponent(cacheKey, module);
    }
    
    return result;
  }
  
  async load(name, version = 'latest') {
    const resolvedVersion = version === 'latest' ? this.getLatestVersion(name) : version;
    const cacheKey = `${name}_${resolvedVersion}`;
    
    // Check performance cache first
    const cached = this.performanceService.getCachedComponent(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Check if already loading to prevent duplicate requests
    if (this.loadingPromises.has(cacheKey)) {
      return await this.loadingPromises.get(cacheKey);
    }
    
    // Load with performance monitoring
    const loadPromise = this.performanceLoadModule(name, resolvedVersion);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const module = await loadPromise;
      this.loadingPromises.delete(cacheKey);
      return module;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }
  
  async performanceLoadModule(name, version) {
    const startTime = performance.now();
    const cacheKey = `${name}_${version}`;
    
    try {
      // Try base registry first
      let module = await super.load(name, version);
      
      if (!module) {
        // Try lazy loading from file system
        module = await this.lazyLoadFromPath(name, version);
      }
      
      if (module) {
        // Cache the loaded module
        this.performanceService.cacheComponent(cacheKey, module);
        
        // Log performance metrics
        const loadTime = performance.now() - startTime;
        console.log(`📦 Module ${name}@${version} loaded in ${loadTime.toFixed(2)}ms`);
        
        return module;
      }
      
      throw new Error(`Module ${name}@${version} not found`);
    } catch (error) {
      console.error(`❌ Failed to load module ${name}@${version}:`, error);
      throw error;
    }
  }
  
  async lazyLoadFromPath(name, version) {
    const possiblePaths = [
      `./features/${name}/${version}/index.js`,
      `./features/${name}/index.js`,
      `./components/${name}.js`
    ];
    
    for (const path of possiblePaths) {
      try {
        const component = await this.performanceService.lazyLoadComponent(path);
        if (component) {
          // Register the lazy-loaded component
          await this.register(name, version, component);
          return component;
        }
      } catch (error) {
        // Continue to next path
        continue;
      }
    }
    
    return null;
  }
  
  async renderWithCache(name, container, props = {}) {
    const cacheKey = `render_${name}`;
    
    // Check for cached render result
    const cachedRender = this.performanceService.getCachedRender(cacheKey, props);
    if (cachedRender && container) {
      container.innerHTML = cachedRender;
      return;
    }
    
    // Load module and render
    const module = await this.load(name);
    if (module && module.render && container) {
      try {
        console.log(`🎨 Calling render method for ${name}`, { container, props });
        const result = await module.render(container, props);
        console.log(`✅ Render completed for ${name}`, result);
        
        // Cache the render result
        this.performanceService.cacheRender(cacheKey, container.innerHTML, props);
      } catch (error) {
        console.error(`❌ Render error for ${name}:`, error);
        console.error(`Error details:`, error.stack);
        container.innerHTML = `<div class="error">Failed to render ${name}: ${error.message}</div>`;
        throw error; // Re-throw to see the error in main.js
      }
    } else {
      console.log(`⚠️ Module ${name} has no render method or container is missing`, { module, container });
    }
  }
  
  // Preload critical components for industrial application
  async preloadCriticalComponents() {
    console.log('🚀 Preloading critical components...');
    
    const preloadPromises = Array.from(this.criticalComponents).map(async (componentName) => {
      try {
        await this.load(componentName);
        console.log(`✅ Preloaded: ${componentName}`);
      } catch (error) {
        console.warn(`⚠️ Failed to preload: ${componentName}`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.log('🎯 Critical component preloading completed');
  }
  
  // Lazy load components with intersection observer
  observeLazyLoad(element, componentName, props = {}) {
    return this.performanceService.observeElement(element, async (target) => {
      console.log(`👁️ Lazy loading component: ${componentName}`);
      await this.renderWithCache(componentName, target, props);
    });
  }
  
  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceService.getMetrics(),
      registeredModules: this.features.size,
      loadingPromises: this.loadingPromises.size,
      criticalComponents: Array.from(this.criticalComponents)
    };
  }
  
  // Optimized module search with caching
  findModuleForRoute(route) {
    const cacheKey = `route_${route}`;
    
    // Use throttling to prevent excessive route lookups
    return new Promise((resolve) => {
      this.performanceService.throttle(cacheKey, () => {
        const module = super.findModuleForRoute(route);
        resolve(module);
      }, 50); // 50ms throttle for route lookups
    });
  }
  
  // Memory management
  cleanup() {
    // Clear loading promises
    this.loadingPromises.clear();
    
    // Cleanup performance service
    this.performanceService.performCleanup();
    
    console.log('🧹 OptimizedFeatureRegistry cleanup completed');
  }
  
  // Industrial display specific optimizations
  optimizeForIndustrialUse() {
    // Reduce animation and transition delays for industrial reliability
    const style = document.createElement('style');
    style.textContent = `
      * {
        transition-duration: 0.1s !important;
        animation-duration: 0.1s !important;
      }
      
      .performance-optimized {
        will-change: auto;
        contain: layout style paint;
      }
      
      .lazy-loading {
        min-height: 50px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  destroy() {
    this.cleanup();
    this.performanceService.destroy();
    super.destroy?.();
  }
}

export default OptimizedFeatureRegistry;
