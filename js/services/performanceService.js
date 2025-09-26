// Performance Optimization Service for Industrial Vue Application
// Handles component caching, lazy loading, throttling, and memory management

class PerformanceService {
  constructor() {
    this.componentCache = new Map();
    this.renderCache = new Map();
    this.throttleMap = new Map();
    this.observerInstances = new Set();
    this.memoryMetrics = {
      componentCount: 0,
      cacheSize: 0,
      throttleCount: 0,
      lastCleanup: Date.now()
    };
    
    // Performance thresholds for industrial application
    this.thresholds = {
      maxCacheSize: 50, // Maximum cached components
      maxRenderCacheSize: 100, // Maximum cached render results
      throttleInterval: 100, // Minimum interval between updates (ms)
      memoryCleanupInterval: 300000, // 5 minutes
      maxMemoryUsage: 50 * 1024 * 1024 // 50MB threshold
    };
    
    this.startMemoryMonitoring();
  }
  
  // Component Caching System
  cacheComponent(key, component) {
    // Implement LRU cache behavior
    if (this.componentCache.size >= this.thresholds.maxCacheSize) {
      const firstKey = this.componentCache.keys().next().value;
      this.componentCache.delete(firstKey);
    }
    
    this.componentCache.set(key, {
      component,
      timestamp: Date.now(),
      accessCount: 0
    });
    
    this.updateMetrics();
  }
  
  getCachedComponent(key) {
    const cached = this.componentCache.get(key);
    if (cached) {
      cached.accessCount++;
      cached.lastAccess = Date.now();
      
      // Move to end for LRU
      this.componentCache.delete(key);
      this.componentCache.set(key, cached);
      
      return cached.component;
    }
    return null;
  }
  
  // Render Result Caching
  cacheRender(key, html, props = {}) {
    const cacheKey = this.generateRenderKey(key, props);
    
    if (this.renderCache.size >= this.thresholds.maxRenderCacheSize) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }
    
    this.renderCache.set(cacheKey, {
      html,
      props: JSON.stringify(props),
      timestamp: Date.now()
    });
  }
  
  getCachedRender(key, props = {}) {
    const cacheKey = this.generateRenderKey(key, props);
    const cached = this.renderCache.get(cacheKey);
    
    if (cached) {
      // Check if props match
      if (cached.props === JSON.stringify(props)) {
        // Check if cache is still valid (5 minutes)
        if (Date.now() - cached.timestamp < 300000) {
          return cached.html;
        } else {
          this.renderCache.delete(cacheKey);
        }
      }
    }
    return null;
  }
  
  generateRenderKey(key, props) {
    const propsHash = this.hashObject(props);
    return `${key}_${propsHash}`;
  }
  
  // Throttling System for Real-time Data
  throttle(key, callback, interval = null) {
    const throttleInterval = interval || this.thresholds.throttleInterval;
    
    if (this.throttleMap.has(key)) {
      const existing = this.throttleMap.get(key);
      clearTimeout(existing.timeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      callback();
      this.throttleMap.delete(key);
    }, throttleInterval);
    
    this.throttleMap.set(key, {
      timeoutId,
      timestamp: Date.now(),
      callback
    });
  }
  
  debounce(key, callback, delay = 250) {
    if (this.throttleMap.has(key)) {
      const existing = this.throttleMap.get(key);
      clearTimeout(existing.timeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      callback();
      this.throttleMap.delete(key);
    }, delay);
    
    this.throttleMap.set(key, {
      timeoutId,
      timestamp: Date.now(),
      callback
    });
  }
  
  // Lazy Loading System
  async lazyLoadComponent(componentPath, fallback = null) {
    const cacheKey = `lazy_${componentPath}`;
    
    // Check cache first
    const cached = this.getCachedComponent(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Show fallback while loading
      if (fallback && typeof fallback === 'function') {
        fallback();
      }
      
      const module = await import(componentPath);
      const component = module.default || module;
      
      // Cache the loaded component
      this.cacheComponent(cacheKey, component);
      
      return component;
    } catch (error) {
      console.error(`Failed to lazy load component: ${componentPath}`, error);
      throw error;
    }
  }
  
  // Intersection Observer for Lazy Loading
  observeElement(element, callback, options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);
    
    observer.observe(element);
    this.observerInstances.add(observer);
    
    return observer;
  }
  
  // Memory Management
  startMemoryMonitoring() {
    const monitor = () => {
      this.checkMemoryUsage();
      setTimeout(monitor, this.thresholds.memoryCleanupInterval);
    };
    
    monitor();
  }
  
  checkMemoryUsage() {
    if ('memory' in performance) {
      const memInfo = performance.memory;
      const currentUsage = memInfo.usedJSHeapSize;
      
      if (currentUsage > this.thresholds.maxMemoryUsage) {
        console.warn(`High memory usage detected: ${(currentUsage / 1024 / 1024).toFixed(2)}MB`);
        this.performCleanup();
      }
    }
    
    this.updateMetrics();
  }
  
  performCleanup() {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes
    
    // Clean old cache entries
    for (const [key, value] of this.componentCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.componentCache.delete(key);
      }
    }
    
    // Clean old render cache
    for (const [key, value] of this.renderCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.renderCache.delete(key);
      }
    }
    
    // Clean completed throttles
    for (const [key, value] of this.throttleMap.entries()) {
      if (now - value.timestamp > 60000) { // 1 minute
        clearTimeout(value.timeoutId);
        this.throttleMap.delete(key);
      }
    }
    
    // Disconnect unused observers
    this.observerInstances.forEach(observer => {
      if (observer.takeRecords().length === 0) {
        observer.disconnect();
        this.observerInstances.delete(observer);
      }
    });
    
    this.memoryMetrics.lastCleanup = now;
    console.log('🧹 Performance cleanup completed');
  }
  
  // Utility Methods
  updateMetrics() {
    this.memoryMetrics = {
      componentCount: this.componentCache.size,
      cacheSize: this.renderCache.size,
      throttleCount: this.throttleMap.size,
      lastCleanup: this.memoryMetrics.lastCleanup
    };
  }
  
  hashObject(obj) {
    let hash = 0;
    const str = JSON.stringify(obj);
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  getMetrics() {
    return {
      ...this.memoryMetrics,
      cacheHitRatio: this.calculateCacheHitRatio(),
      memoryUsage: 'memory' in performance ? performance.memory : null,
      thresholds: this.thresholds
    };
  }
  
  calculateCacheHitRatio() {
    let totalAccess = 0;
    let hitCount = 0;
    
    for (const [key, value] of this.componentCache.entries()) {
      totalAccess += value.accessCount;
      if (value.accessCount > 0) hitCount++;
    }
    
    return totalAccess > 0 ? (hitCount / totalAccess) : 0;
  }
  
  // Industrial-specific optimizations
  optimizeForIndustrialDisplay() {
    // Reduce update frequency for industrial displays
    this.thresholds.throttleInterval = 200; // Slower updates for stability
    this.thresholds.maxCacheSize = 30; // Conservative caching
    
    // Preload critical components
    this.preloadCriticalComponents();
  }
  
  async preloadCriticalComponents() {
    const criticalComponents = [
      './features/pressurePanel/0.1.0/index.js',
      './features/appHeader/0.1.0/index.js',
      './features/appFooter/0.1.0/index.js'
    ];
    
    for (const path of criticalComponents) {
      try {
        await this.lazyLoadComponent(path);
      } catch (error) {
        console.warn(`Failed to preload critical component: ${path}`, error);
      }
    }
  }
  
  // Cleanup methods
  destroy() {
    // Clear all caches
    this.componentCache.clear();
    this.renderCache.clear();
    
    // Clear all throttles
    for (const [key, value] of this.throttleMap.entries()) {
      clearTimeout(value.timeoutId);
    }
    this.throttleMap.clear();
    
    // Disconnect all observers
    this.observerInstances.forEach(observer => observer.disconnect());
    this.observerInstances.clear();
  }
}

// Global instance
let performanceServiceInstance = null;

// Factory function
export function getPerformanceService() {
  if (!performanceServiceInstance) {
    performanceServiceInstance = new PerformanceService();
  }
  return performanceServiceInstance;
}

export default PerformanceService;
