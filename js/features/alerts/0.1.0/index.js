import AlertsComponent from './AlertsComponent.vue';
import { ConfigLoader } from '../../../shared/configLoader.js';

/**
 * Alerts Module 0.1.0
 * Real-time alert management and notifications for OPERATOR role
 * Displays system alerts, warnings, and notifications
 */

const componentModule = {
  metadata: {
    name: 'alerts',
    version: '0.1.0',
    type: 'component',
    contractVersion: '2.0',
    description: 'Real-time alerts and notifications system',
    author: 'MASKSERVICE System',
    roles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    initialized: false
  },

  // Initialize component
  async init(context = {}) {
    console.log('🚀 [Alerts] Starting initialization...', context);
    try {
      console.log('📋 [Alerts] Loading configuration...');
      await this.loadConfig();
      
      console.log('🔔 [Alerts] Loading alerts data...');
      await this.loadAlertsData();
      
      this.metadata.initialized = true;
      console.log('✅ [Alerts] Initialization completed successfully');
      return { success: true, message: 'Alerts component initialized successfully' };
    } catch (error) {
      console.error('❌ [Alerts] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Load component configuration
  async loadConfig() {
    const configPaths = [
      'js/features/alerts/0.1.0/config/config.json',
      './js/features/alerts/0.1.0/config/config.json'
    ];
    
    for (const path of configPaths) {
      try {
        const result = await ConfigLoader.loadConfig(path, 'alerts');
        if (result.success) {
          this.config = result.config;
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ [Alerts] Config load failed for ${path}:`, error);
      }
    }
    
    // Use default config
    this.config = this.getDefaultConfig();
    console.log('📋 [Alerts] Using default configuration');
    return { success: true, config: this.config };
  },

  // Load alerts data
  async loadAlertsData() {
    this.alertsData = {
      activeAlerts: [
        {
          id: 'ALT_001',
          type: 'warning',
          severity: 'medium',
          title: 'High Temperature Warning',
          message: 'Temperature sensor 2 reading above normal threshold (38.5°C)',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          source: 'Temperature Sensor 2',
          acknowledged: false,
          category: 'system'
        },
        {
          id: 'ALT_002',
          type: 'info',
          severity: 'low',
          title: 'Maintenance Reminder',
          message: 'Scheduled maintenance due for Main Pump in 2 days',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          source: 'Maintenance Scheduler',
          acknowledged: false,
          category: 'maintenance'
        },
        {
          id: 'ALT_003',
          type: 'critical',
          severity: 'high',
          title: 'Pressure System Alert',
          message: 'Pressure drop detected in main line (0.8 bar, threshold: 1.0 bar)',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          source: 'Pressure Sensor 1',
          acknowledged: false,
          category: 'safety'
        }
      ],
      alertHistory: [
        {
          id: 'ALT_004',
          type: 'warning',
          severity: 'medium',
          title: 'Network Latency High',
          message: 'Network response time exceeded 100ms (125ms recorded)',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          source: 'Network Monitor',
          acknowledged: true,
          resolvedAt: new Date(Date.now() - 45 * 60000).toISOString(),
          category: 'network'
        }
      ],
      statistics: {
        totalActive: 3,
        totalToday: 5,
        acknowledged: 1,
        critical: 1,
        warning: 1,
        info: 1
      }
    };
    
    return { success: true, data: this.alertsData };
  },

  // Get default configuration
  getDefaultConfig() {
    return {
      component: {
        name: 'alerts',
        displayName: 'Alerts & Notifications',
        type: 'alerts-dashboard',
        refreshInterval: 3000
      },
      ui: {
        layout: 'list',
        maxVisible: 50,
        autoRefresh: true,
        soundAlerts: true,
        colors: {
          critical: '#e74c3c',
          warning: '#f39c12',
          info: '#3498db',
          success: '#27ae60'
        }
      },
      alerts: {
        priorities: ['critical', 'warning', 'info'],
        categories: ['system', 'safety', 'maintenance', 'network'],
        autoAcknowledge: false,
        retentionDays: 30
      },
      permissions: {
        canAcknowledge: true,
        canDismiss: false,
        canConfigure: false
      }
    };
  },

  // Handle component actions
  handle(request = {}) {
    const { action = 'GET_ALERTS', data = {} } = request;
    
    switch (action) {
      case 'GET_ALERTS':
        return {
          success: true,
          data: this.alertsData?.activeAlerts || []
        };
        
      case 'GET_ALERT_STATS':
        return {
          success: true,
          data: this.alertsData?.statistics || {}
        };
        
      case 'ACKNOWLEDGE_ALERT':
        const alertId = data.alertId;
        const alert = this.alertsData.activeAlerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
          alert.acknowledgedAt = new Date().toISOString();
          return { success: true, message: `Alert ${alertId} acknowledged` };
        }
        return { success: false, error: 'Alert not found' };
        
      case 'REFRESH_ALERTS':
        this.loadAlertsData();
        return {
          success: true,
          message: 'Alerts data refreshed',
          timestamp: new Date().toISOString()
        };
        
      default:
        return {
          success: false,
          error: `Unknown action: ${action}`
        };
    }
  },

  // Get severity color
  getSeverityColor(severity) {
    const colors = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#3498db'
    };
    return colors[severity] || '#95a5a6';
  },

  // Get type icon
  getTypeIcon(type) {
    const icons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || '📋';
  },

  // Render component in container
  render(container, context = {}) {
    console.log('🎨 [Alerts] Starting render...');
    
    if (!container) {
      console.error('❌ [Alerts] No container provided');
      return;
    }

    const alerts = this.alertsData?.activeAlerts || [];
    const stats = this.alertsData?.statistics || {};
    
    // Create alerts dashboard HTML
    container.innerHTML = `
      <div class="alerts-dashboard" style="padding: 20px; background: #f8f9fa; border-radius: 8px; height: calc(100vh - 120px); overflow-y: auto;">
        <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">🔔 Alerts & Notifications</h2>
          <div class="header-actions" style="display: flex; gap: 10px;">
            <div class="alert-count" style="background: #e74c3c; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;">
              ${stats.totalActive || 0} Active
            </div>
            <div class="refresh-btn" style="background: #3498db; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              🔄 Refresh
            </div>
          </div>
        </div>
        
        <!-- Alert Statistics -->
        <div class="alert-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="stat-card critical" style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #e74c3c;">
            <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${stats.critical || 0}</div>
            <div style="color: #666; font-size: 12px;">Critical</div>
          </div>
          <div class="stat-card warning" style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #f39c12;">
            <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${stats.warning || 0}</div>
            <div style="color: #666; font-size: 12px;">Warning</div>
          </div>
          <div class="stat-card info" style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3498db;">
            <div style="font-size: 24px; font-weight: bold; color: #3498db;">${stats.info || 0}</div>
            <div style="color: #666; font-size: 12px;">Info</div>
          </div>
          <div class="stat-card acknowledged" style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #27ae60;">
            <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${stats.acknowledged || 0}</div>
            <div style="color: #666; font-size: 12px;">Acknowledged</div>
          </div>
        </div>
        
        <!-- Active Alerts List -->
        <div class="alerts-list" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div class="list-header" style="background: #34495e; color: white; padding: 15px; font-weight: bold;">
            🚨 Active Alerts (${alerts.length})
          </div>
          <div class="alerts-container" style="max-height: 400px; overflow-y: auto;">
            ${alerts.length === 0 ? `
              <div class="no-alerts" style="padding: 40px; text-align: center; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <div>No active alerts</div>
                <div style="font-size: 12px; margin-top: 5px;">System is operating normally</div>
              </div>
            ` : alerts.map(alert => `
              <div class="alert-item ${alert.acknowledged ? 'acknowledged' : ''}" 
                   style="padding: 15px; border-bottom: 1px solid #ecf0f1; border-left: 4px solid ${this.getSeverityColor(alert.severity)}; ${alert.acknowledged ? 'opacity: 0.6;' : ''}"
                   data-alert-id="${alert.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="alert-content" style="flex: 1;">
                    <div class="alert-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                      <span style="font-size: 16px;">${this.getTypeIcon(alert.type)}</span>
                      <span style="font-weight: bold; color: #2c3e50;">${alert.title}</span>
                      <span class="severity-badge" style="background: ${this.getSeverityColor(alert.severity)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase;">
                        ${alert.severity}
                      </span>
                    </div>
                    <div class="alert-message" style="color: #666; margin-bottom: 8px; line-height: 1.4;">
                      ${alert.message}
                    </div>
                    <div class="alert-meta" style="display: flex; gap: 15px; font-size: 12px; color: #95a5a6;">
                      <span>📍 ${alert.source}</span>
                      <span>⏰ ${new Date(alert.timestamp).toLocaleString()}</span>
                      <span class="category-tag" style="background: #ecf0f1; padding: 2px 6px; border-radius: 4px;">
                        ${alert.category}
                      </span>
                    </div>
                  </div>
                  <div class="alert-actions" style="display: flex; flex-direction: column; gap: 5px; margin-left: 15px;">
                    ${!alert.acknowledged ? `
                      <button class="ack-btn" style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer;"
                              onclick="acknowledgeAlert('${alert.id}')">
                        ✓ ACK
                      </button>
                    ` : `
                      <span style="color: #27ae60; font-size: 11px; font-weight: bold;">✓ ACKNOWLEDGED</span>
                    `}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="alerts-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
          ⏰ Last Update: ${new Date().toLocaleTimeString()} | 🔄 Auto-refresh: Every 3s | 🔔 Sound alerts: ${this.config?.ui?.soundAlerts ? 'ON' : 'OFF'}
        </div>
      </div>
      
      <script>
        function acknowledgeAlert(alertId) {
          console.log('Acknowledging alert:', alertId);
          // This would normally send a request to acknowledge the alert
          // For demo purposes, we'll just update the UI
          const alertElement = document.querySelector('[data-alert-id="' + alertId + '"]');
          if (alertElement) {
            alertElement.style.opacity = '0.6';
            const ackBtn = alertElement.querySelector('.ack-btn');
            if (ackBtn) {
              ackBtn.outerHTML = '<span style="color: #27ae60; font-size: 11px; font-weight: bold;">✓ ACKNOWLEDGED</span>';
            }
          }
        }
      </script>
    `;
    
    console.log('✅ [Alerts] Dashboard rendered successfully');
  }
};

// Lock the structure to prevent modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(componentModule.metadata);
}

export default componentModule;
