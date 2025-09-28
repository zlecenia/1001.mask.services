/**
 * AuditLogViewer Module Index 0.1.0
 * Entry point for the comprehensive security audit log viewer component
 */

import AuditLogViewerComponent from './auditLogViewer.js';
import { ConfigLoader } from '../../../shared/configLoader.js';

// Load config dynamically to avoid import assertion issues
const loadConfig = async () => {
  try {
    const response = await fetch(new URL('./config.json', import.meta.url));
    return await response.json();
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
    return {};
  }
};

export default {
  name: 'auditLogViewer',
  version: '0.1.0',
  component: auditLogViewerComponent,
  config: null,
  async loadConfig() {
    const possiblePaths = [
      'js/features/auditLogViewer/0.1.0/config/config.json',  // Correct component path
      './js/features/auditLogViewer/0.1.0/config/config.json', // Alternative
      '/js/features/auditLogViewer/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'auditLogViewer');
        if (result.success) break;
      } catch (error) {
        continue; // Try next path
      }
    }
    
    this.config = result?.config || {};
    return result || { success: false, config: {} };
  },
  config: {}, // Will be loaded dynamically
  
  // Module metadata for FeatureRegistry
  metadata: {
    type: 'security-dashboard',
    category: 'security',
    description: 'Comprehensive audit log viewer and security dashboard',
    author: '1001.mask.services',
    dependencies: ['SecurityService', 'i18n'],
    permissions: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
    routes: ['/audit', '/security-logs', '/dashboard/security'],
    tags: ['security', 'audit', 'monitoring', 'dashboard'],
    industrial: true,
    display79Compatible: true
  },

  // Route handling capability
  canHandleRoute(route) {
    const routes = ['/audit', '/security-logs', '/dashboard/security', '/logs'];
    return routes.includes(route) || route.startsWith('/audit/');
  },

  // Vue component registration
  install(app) {
    app.component('AuditLogViewer', AuditLogViewerComponent);
  },

  // Module initialization
  async init(context = {}) {
    console.log('✓ AuditLogViewer module initialized v0.1.0');
    return true;
  },

  // Health check for monitoring
  async healthCheck() {
    try {
      // Basic health checks
      const hasSecurityService = typeof window !== 'undefined' && 
                               typeof window.getSecurityService === 'function';
      
      return {
        status: 'healthy',
        version: '0.1.0',
        securityServiceAvailable: hasSecurityService,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};
