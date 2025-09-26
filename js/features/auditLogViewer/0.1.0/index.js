/**
 * AuditLogViewer Module Index 0.1.0
 * Entry point for the comprehensive security audit log viewer component
 */

import AuditLogViewerComponent from './auditLogViewer.js';
import config from './config.json' assert { type: 'json' };

export default {
  name: 'auditLogViewer',
  version: '0.1.0',
  component: AuditLogViewerComponent,
  config: config,
  
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
  async initialize() {
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
