# AuditLogViewer Component 0.1.0

## Overview

The AuditLogViewer is a comprehensive security dashboard component that provides monitoring and analysis capabilities for authentication events, user actions, sensor access, and system security across all components of the 1001.mask.services industrial application.

## Features

### Core Functionality
- **Real-time Log Display**: Live monitoring of security events with auto-refresh
- **Advanced Filtering**: Filter by event type, component, time range, and search terms  
- **Sorting & Pagination**: Sortable columns with efficient pagination for large datasets
- **Export Capabilities**: CSV export functionality for compliance and reporting
- **Detailed Log Inspection**: Modal view for comprehensive log entry analysis
- **Security Alerting**: Visual indicators for critical security events and warnings

### Security Features
- **Role-Based Access**: Restricted to ADMIN, SUPERUSER, and SERWISANT roles
- **Audit Trail**: All viewer actions are logged for security compliance
- **Data Validation**: Input sanitization and validation for all user interactions
- **Export Permissions**: Controlled export capabilities with audit logging

### Industrial Optimization
- **7.9" Display Ready**: Optimized for 1280x400px landscape industrial displays
- **Touch Interface**: Touch-optimized controls and responsive design
- **Performance Optimized**: Efficient rendering for continuous monitoring
- **Multi-language**: Full i18n support (PL/EN/DE)

## Usage

### Basic Integration
```javascript
import AuditLogViewer from './js/features/auditLogViewer/0.1.0/auditLogViewer.js';

// Register component
Vue.component('AuditLogViewer', AuditLogViewer);
```

### Props
- None (self-contained component)

### Events
- `log-selected`: Emitted when a log entry is selected for detailed view
- `export-completed`: Emitted when log export operation completes

## Log Event Types

### Authentication Events
- `LOGIN_FORM_SUCCESS`: Successful user login
- `LOGIN_FORM_FAILED`: Failed login attempt
- `LOGIN_FORM_ERROR`: Login system error
- `AUTH_SESSION_TIMEOUT`: Session timeout event

### Navigation & Menu Events  
- `MENU_ACCESS_SUCCESS`: Menu item accessed successfully
- `MENU_ACCESS_DENIED`: Unauthorized menu access attempt
- `MENU_NAVIGATION`: Menu navigation event
- `PAGE_TEMPLATE_MENU_SELECT`: Menu selection from page template

### Sensor & Monitoring Events
- `PRESSURE_PANEL_SENSOR_REFRESH`: Sensor data refresh request
- `PRESSURE_PANEL_WEBSOCKET_CONNECT`: WebSocket connection established
- `PRESSURE_PANEL_DATA_VALIDATION_ERROR`: Sensor data validation failure
- `PRESSURE_PANEL_SUSPICIOUS_ACTIVITY`: Suspicious monitoring activity detected

### Security Events
- `SECURITY_INPUT_VALIDATION_ERROR`: Input validation failure
- `SECURITY_CSRF_TOKEN_GENERATED`: CSRF token generation
- `SECURITY_SESSION_EXTENDED`: Session timeout extended
- `SECURITY_EXCESSIVE_REQUESTS`: Rate limiting triggered

## Configuration

### Display Settings
```json
{
  "refreshInterval": 30000,
  "pageSize": 50,
  "maxDisplayLogs": 10000,
  "autoRefresh": true
}
```

### Time Range Options
- **1h**: Last hour
- **24h**: Last 24 hours  
- **7d**: Last 7 days
- **30d**: Last 30 days
- **all**: All available logs

### Export Options
- **Format**: CSV
- **Permissions**: Role-based export access
- **Audit Logging**: All exports are logged

## Security Implementation

### Access Control
- Integration with SecurityService for role validation
- Restricted access to authorized personnel only
- Session monitoring and timeout handling

### Data Protection
- Input sanitization for search and filter parameters
- Secure data handling and display
- Protected export functionality

### Audit Compliance
- All viewer actions are logged
- Export activities tracked
- Access attempts monitored

## Performance Optimization

### Efficient Rendering
- Virtual scrolling for large datasets
- Debounced search functionality (300ms)
- Optimized sorting and filtering algorithms

### Memory Management
- Configurable maximum log display limit
- Automatic cleanup of old log entries
- Efficient data structures for fast access

## Browser Compatibility

- Modern browsers with ES6+ support
- Vue 3 Composition API compatibility
- Touch interface support for industrial displays
- Responsive design for various screen sizes

## Testing

Comprehensive test suite covering:
- Component rendering and initialization
- SecurityService integration
- Filter and search functionality
- Export capabilities
- Error handling and edge cases
- Performance benchmarks

## Industrial Use Cases

1. **Security Monitoring**: Real-time monitoring of authentication and access events
2. **Compliance Reporting**: Export capabilities for regulatory compliance
3. **Incident Investigation**: Detailed log analysis for security incidents
4. **Operational Auditing**: Tracking of system and user activities
5. **Performance Monitoring**: Analysis of system performance and usage patterns

## Deployment Notes

- Requires SecurityService for audit log data access
- Needs proper role-based authentication setup
- Should be deployed with appropriate export permissions
- Recommended for secure network environments only

## Version History

- **0.1.0**: Initial implementation with core audit log viewing capabilities
