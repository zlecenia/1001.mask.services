/**
 * Audit Log Viewer Component 0.1.0 
 * Comprehensive security dashboard for monitoring authentication events, user actions, sensor access
 * Enhanced with filtering, search, export capabilities for industrial security compliance
 */

import { getSecurityService } from '../../../services/securityService.js';

const template = `
<div class="audit-log-viewer landscape-7-9">
  <div class="viewer-header">
    <h3 class="viewer-title">{{ $t('audit.security_dashboard') || 'Security Dashboard' }}</h3>
    <div class="header-controls">
      <button @click="refreshLogs" :disabled="isLoading" class="refresh-btn">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
        {{ $t('audit.refresh') || 'Refresh' }}
      </button>
      <button @click="exportLogs" :disabled="filteredLogs.length === 0" class="export-btn">
        <i class="fas fa-download"></i>
        {{ $t('audit.export') || 'Export' }}
      </button>
    </div>
  </div>

  <div class="viewer-filters">
    <div class="filter-group">
      <label>{{ $t('audit.search') || 'Search' }}:</label>
      <input 
        v-model="searchTerm" 
        type="text" 
        :placeholder="$t('audit.search_placeholder') || 'Search logs...'"
        class="search-input"
      />
    </div>
    
    <div class="filter-group">
      <label>{{ $t('audit.event_type') || 'Event Type' }}:</label>
      <select v-model="selectedEventType" class="filter-select">
        <option value="">{{ $t('audit.all_events') || 'All Events' }}</option>
        <option v-for="type in eventTypes" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label>{{ $t('audit.component') || 'Component' }}:</label>
      <select v-model="selectedComponent" class="filter-select">
        <option value="">{{ $t('audit.all_components') || 'All Components' }}</option>
        <option v-for="component in components" :key="component" :value="component">{{ component }}</option>
      </select>
    </div>

    <div class="filter-group">
      <label>{{ $t('audit.time_range') || 'Time Range' }}:</label>
      <select v-model="selectedTimeRange" class="filter-select">
        <option value="1h">{{ $t('audit.last_hour') || 'Last Hour' }}</option>
        <option value="24h">{{ $t('audit.last_24h') || 'Last 24 Hours' }}</option>
        <option value="7d">{{ $t('audit.last_week') || 'Last 7 Days' }}</option>
        <option value="30d">{{ $t('audit.last_month') || 'Last 30 Days' }}</option>
        <option value="all">{{ $t('audit.all_time') || 'All Time' }}</option>
      </select>
    </div>
  </div>

  <div class="viewer-stats">
    <div class="stat-item">
      <span class="stat-label">{{ $t('audit.total_events') || 'Total Events' }}:</span>
      <span class="stat-value">{{ totalEvents }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">{{ $t('audit.filtered_events') || 'Filtered' }}:</span>
      <span class="stat-value">{{ filteredLogs.length }}</span>
    </div>
    <div class="stat-item security-alerts" v-if="securityAlerts > 0">
      <span class="stat-label">{{ $t('audit.security_alerts') || 'Security Alerts' }}:</span>
      <span class="stat-value alert">{{ securityAlerts }}</span>
    </div>
  </div>

  <div class="viewer-content">
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      {{ $t('audit.loading') || 'Loading logs...' }}
    </div>

    <div v-else-if="filteredLogs.length === 0" class="empty-state">
      <i class="fas fa-shield-alt"></i>
      <p>{{ $t('audit.no_logs') || 'No audit logs found for the selected criteria.' }}</p>
    </div>

    <div v-else class="logs-table-container">
      <table class="logs-table">
        <thead>
          <tr>
            <th @click="sortBy('timestamp')" class="sortable">
              {{ $t('audit.timestamp') || 'Timestamp' }}
              <i class="fas fa-sort" v-if="sortField !== 'timestamp'"></i>
              <i class="fas fa-sort-up" v-else-if="sortDirection === 'asc'"></i>
              <i class="fas fa-sort-down" v-else></i>
            </th>
            <th @click="sortBy('eventType')" class="sortable">
              {{ $t('audit.event') || 'Event' }}
              <i class="fas fa-sort" v-if="sortField !== 'eventType'"></i>
              <i class="fas fa-sort-up" v-else-if="sortDirection === 'asc'"></i>
              <i class="fas fa-sort-down" v-else></i>
            </th>
            <th>{{ $t('audit.component') || 'Component' }}</th>
            <th>{{ $t('audit.user') || 'User' }}</th>
            <th>{{ $t('audit.details') || 'Details' }}</th>
            <th>{{ $t('audit.severity') || 'Severity' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="log in paginatedLogs" 
            :key="log.id" 
            :class="getLogRowClass(log)"
            @click="selectLog(log)"
          >
            <td class="timestamp">{{ formatTimestamp(log.timestamp) }}</td>
            <td class="event-type">{{ log.eventType }}</td>
            <td class="component">{{ getComponentName(log.eventType) }}</td>
            <td class="user">{{ log.data?.currentUser || log.data?.username || 'System' }}</td>
            <td class="details">{{ formatLogDetails(log) }}</td>
            <td class="severity">
              <span :class="'severity-' + getLogSeverity(log)">
                {{ getLogSeverity(log) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage = 1" :disabled="currentPage === 1">First</button>
      <button @click="currentPage--" :disabled="currentPage === 1">Previous</button>
      <span class="page-info">{{ currentPage }} of {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
      <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">Last</button>
    </div>
  </div>

  <div v-if="selectedLog" class="log-detail-modal" @click="selectedLog = null">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h4>{{ $t('audit.log_details') || 'Log Details' }}</h4>
        <button @click="selectedLog = null" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-row">
          <strong>{{ $t('audit.timestamp') || 'Timestamp' }}:</strong>
          {{ formatTimestamp(selectedLog.timestamp, true) }}
        </div>
        <div class="detail-row">
          <strong>{{ $t('audit.event_type') || 'Event Type' }}:</strong>
          {{ selectedLog.eventType }}
        </div>
        <div class="detail-row">
          <strong>{{ $t('audit.severity') || 'Severity' }}:</strong>
          <span :class="'severity-' + getLogSeverity(selectedLog)">
            {{ getLogSeverity(selectedLog) }}
          </span>
        </div>
        <div class="detail-row">
          <strong>{{ $t('audit.raw_data') || 'Raw Data' }}:</strong>
          <pre class="json-data">{{ JSON.stringify(selectedLog.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</div>`;

const styles = `
<style scoped>
.audit-log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid #eee;
  background: #f8f9fa;
}

.viewer-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.header-controls {
  display: flex;
  gap: 8px;
}

.refresh-btn, .export-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.export-btn {
  background: #28a745;
  color: white;
}

.refresh-btn:hover { background: #0056b3; }
.export-btn:hover { background: #1e7e34; }
.refresh-btn:disabled, .export-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.viewer-filters {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background: #ffffff;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: #495057;
}

.search-input, .filter-select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 12px;
  min-width: 120px;
}

.viewer-stats {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background: #f1f3f4;
  border-bottom: 1px solid #ddd;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stat-label {
  font-weight: 500;
  color: #495057;
}

.stat-value {
  font-weight: 600;
  color: #007bff;
}

.stat-value.alert {
  color: #dc3545;
  background: #f8d7da;
  padding: 2px 6px;
  border-radius: 3px;
}

.viewer-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
  font-size: 14px;
}

.logs-table-container {
  overflow: auto;
  height: 100%;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.logs-table th, .logs-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
}

.logs-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
}

.logs-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.logs-table th.sortable:hover {
  background: #e9ecef;
}

.logs-table tbody tr:hover {
  background: #f5f5f5;
  cursor: pointer;
}

.logs-table tbody tr.security-alert {
  background: #fff5f5;
}

.logs-table tbody tr.warning {
  background: #fffbf0;
}

.timestamp {
  font-family: monospace;
  white-space: nowrap;
  min-width: 120px;
}

.event-type {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.severity-info { color: #17a2b8; }
.severity-warning { color: #ffc107; background: #fff3cd; padding: 2px 4px; border-radius: 2px; }
.severity-error { color: #dc3545; background: #f8d7da; padding: 2px 4px; border-radius: 2px; }
.severity-critical { color: white; background: #dc3545; padding: 2px 4px; border-radius: 2px; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #ddd;
}

.pagination button {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  background: white;
  cursor: pointer;
  border-radius: 3px;
  font-size: 11px;
}

.pagination button:hover:not(:disabled) {
  background: #f8f9fa;
}

.pagination button:disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: #495057;
}

.log-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-header h4 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #aaa;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 16px;
  overflow: auto;
}

.detail-row {
  margin-bottom: 12px;
  font-size: 13px;
}

.json-data {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  font-size: 10px;
  overflow: auto;
  max-height: 200px;
}

/* 7.9" display optimizations */
@media (max-height: 450px) {
  .viewer-header {
    padding: 8px 12px;
  }
  
  .viewer-title {
    font-size: 14px;
  }
  
  .logs-table {
    font-size: 10px;
  }
  
  .logs-table th, .logs-table td {
    padding: 4px 6px;
  }
}
</style>`;

export default {
  name: 'AuditLogViewerComponent',
  template: template + styles,
  
  data() {
    return {
      auditLogs: [],
      isLoading: false,
      searchTerm: '',
      selectedEventType: '',
      selectedComponent: '',
      selectedTimeRange: '24h',
      sortField: 'timestamp',
      sortDirection: 'desc',
      currentPage: 1,
      pageSize: 50,
      selectedLog: null,
      securityService: null,
      refreshInterval: null
    };
  },
  
  computed: {
    eventTypes() {
      const types = new Set();
      this.auditLogs.forEach(log => types.add(log.eventType));
      return Array.from(types).sort();
    },
    
    components() {
      const components = new Set();
      this.auditLogs.forEach(log => {
        const component = this.getComponentName(log.eventType);
        if (component !== 'Unknown') components.add(component);
      });
      return Array.from(components).sort();
    },
    
    filteredLogs() {
      let logs = [...this.auditLogs];
      
      // Time range filter
      if (this.selectedTimeRange !== 'all') {
        const now = Date.now();
        const timeRanges = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        };
        const cutoff = now - timeRanges[this.selectedTimeRange];
        logs = logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
      }
      
      // Search filter
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        logs = logs.filter(log => 
          log.eventType.toLowerCase().includes(search) ||
          JSON.stringify(log.data).toLowerCase().includes(search)
        );
      }
      
      // Event type filter
      if (this.selectedEventType) {
        logs = logs.filter(log => log.eventType === this.selectedEventType);
      }
      
      // Component filter
      if (this.selectedComponent) {
        logs = logs.filter(log => this.getComponentName(log.eventType) === this.selectedComponent);
      }
      
      // Sort
      logs.sort((a, b) => {
        let aVal = a[this.sortField];
        let bVal = b[this.sortField];
        
        if (this.sortField === 'timestamp') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (this.sortDirection === 'asc') {
          return aVal < bVal ? -1 : 1;
        } else {
          return aVal > bVal ? -1 : 1;
        }
      });
      
      return logs;
    },
    
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredLogs.slice(start, start + this.pageSize);
    },
    
    totalPages() {
      return Math.ceil(this.filteredLogs.length / this.pageSize);
    },
    
    totalEvents() {
      return this.auditLogs.length;
    },
    
    securityAlerts() {
      return this.auditLogs.filter(log => 
        this.getLogSeverity(log) === 'critical' || 
        this.getLogSeverity(log) === 'error'
      ).length;
    }
  },
  
  methods: {
    async refreshLogs() {
      if (!this.securityService) return;
      
      this.isLoading = true;
      try {
        const logs = this.securityService.getAuditLogs();
        this.auditLogs = logs.map((log, index) => ({
          id: log.id || index,
          ...log
        }));
        
        // Log the audit viewer access
        this.securityService.logAuditEvent('AUDIT_LOG_VIEWER_REFRESH', {
          totalLogs: this.auditLogs.length,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'desc';
      }
      this.currentPage = 1;
    },
    
    selectLog(log) {
      this.selectedLog = log;
    },
    
    formatTimestamp(timestamp, detailed = false) {
      const date = new Date(timestamp);
      if (detailed) {
        return date.toLocaleString();
      }
      return date.toLocaleTimeString();
    },
    
    formatLogDetails(log) {
      const data = log.data || {};
      if (data.error) return `Error: ${data.error}`;
      if (data.item) return `Item: ${data.item}`;
      if (data.username) return `User: ${data.username}`;
      if (data.accessAttempts) return `Attempts: ${data.accessAttempts}`;
      return 'System event';
    },
    
    getComponentName(eventType) {
      if (eventType.includes('LOGIN_FORM')) return 'LoginForm';
      if (eventType.includes('MENU')) return 'MainMenu';
      if (eventType.includes('PAGE_TEMPLATE')) return 'PageTemplate';  
      if (eventType.includes('PRESSURE_PANEL')) return 'PressurePanel';
      if (eventType.includes('SECURITY')) return 'SecurityService';
      if (eventType.includes('AUTH')) return 'Authentication';
      return 'Unknown';
    },
    
    getLogSeverity(log) {
      if (log.eventType.includes('ERROR') || 
          log.eventType.includes('FAILED') ||
          log.eventType.includes('UNAUTHORIZED') ||
          log.eventType.includes('EXCESSIVE')) return 'error';
      if (log.eventType.includes('WARNING') || 
          log.eventType.includes('TIMEOUT') ||
          log.eventType.includes('SUSPICIOUS')) return 'warning';
      if (log.eventType.includes('CRITICAL') || 
          log.eventType.includes('SECURITY_BREACH')) return 'critical';
      return 'info';
    },
    
    getLogRowClass(log) {
      const severity = this.getLogSeverity(log);
      if (severity === 'error' || severity === 'critical') return 'security-alert';
      if (severity === 'warning') return 'warning';
      return '';
    },
    
    exportLogs() {
      if (this.filteredLogs.length === 0) return;
      
      const csvContent = [
        ['Timestamp', 'Event Type', 'Component', 'User', 'Severity', 'Details'],
        ...this.filteredLogs.map(log => [
          this.formatTimestamp(log.timestamp, true),
          log.eventType,
          this.getComponentName(log.eventType),
          log.data?.currentUser || log.data?.username || 'System',
          this.getLogSeverity(log),
          this.formatLogDetails(log)
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Log the export action
      this.securityService?.logAuditEvent('AUDIT_LOG_EXPORT', {
        exportedCount: this.filteredLogs.length,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  async mounted() {
    try {
      this.securityService = getSecurityService();
      await this.refreshLogs();
      
      // Auto-refresh every 30 seconds
      this.refreshInterval = setInterval(() => {
        this.refreshLogs();
      }, 30000);
      
      // Log viewer initialization
      this.securityService.logAuditEvent('AUDIT_LOG_VIEWER_INIT', {
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to initialize AuditLogViewer:', error);
    }
  },
  
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
