# Dokumentacja Modułów - 1001.mask.services

Automatycznie wygenerowana dokumentacja wszystkich modułów w systemie.

## Spis treści

- [0.1.0 vappFooter](#0.1.0-vappFooter)
- [0.1.0 vappHeader](#0.1.0-vappHeader)
- [0.1.0 vauditLogViewer](#0.1.0-vauditLogViewer)
- [0.1.0 vloginForm](#0.1.0-vloginForm)
- [0.1.0 vmainMenu](#0.1.0-vmainMenu)
- [0.1.0 vpageTemplate](#0.1.0-vpageTemplate)
- [0.1.0 vpressurePanel](#0.1.0-vpressurePanel)
- [0.1.0 vrealtimeSensors](#0.1.0-vrealtimeSensors)

---

## 0.1.0 vappFooter

**Ścieżka:** `appFooter/0.1.0`  
**Wersja:** appFooter  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The AppFooter module provides a Vue 3 component for displaying application footer information, optimized for 7.9" industrial displays in landscape mode. It shows system information, build details, device status, current time, and user information.

## Features
- **System Information**: Version, build date, and environment status
- **Device Information**: Device name and model display
- **Build Information**: Version and build number tracking
- **Status Indicators**: Real-time device status with color-coded styling
- **User Information**: Current user name and role display
- **Time Display**: Live updating current time
- **Responsive Design**: Optimized for 7.9" landscape displays
- **Accessibility**: Proper ARIA labels and semantic HTML structure

## Component Structure
```
<footer class="app-footer">
  <div class="footer-left">
    - Copyright information
    - Device information (name, model)
    - System information (version, build date, environment)
  </div>
  <div class="footer-center">
    - Build information (version, build number)
    - Current time display
  </div>
  <div class="footer-right">
    - Device status indicator
    - User information (name, role)
  </div>
</footer>
```

## Props
- `systemInfo`: Object containing version, buildDate, and environment
- `currentUser`: Object containing name and role
- `deviceInfo`: Object containing device name and model
- `buildInfo`: Object containing version and buildNumber
- `deviceStatus`: String indicating device status (ONLINE, OFFLINE, CONNECTING, ERROR)

## CSS Classes
- `.app-footer`: Main footer container
- `.footer-copyright`: Copyright text styling
- `.footer-device-info`: Device information section
- `.footer-build-info`: Build information section
- `.footer-status`: Status indicator with dynamic classes
- `.footer-info`: User information styling
- `.status-online/offline/connecting/error`: Status-specific styling

## Usage
```javascript
const component = await registry.load('appFooter', '0.1.0');
await component.render({
  deviceInfo: { name: 'DEVICE_001', model: 'C20' },
  buildInfo: { version: '3.0.0', buildNumber: '2025.001' },
  deviceStatus: 'ONLINE',
  currentUser: { name: 'Operator', role: 'OPERATOR' }
});
```

## Testing
- 38 comprehensive unit tests covering all functionality
- Component rendering tests
- Props validation tests
- Reactivity and state management tests
- CSS styling and responsiveness tests
- Accessibility and UX tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `appFooter.js` (7880 bytes)
- `appFooter.test.js` (16037 bytes)
- `CHANGELOG.md` (2298 bytes)
- `config.json` (3041 bytes)
- `index.js` (2194 bytes)
- `package.json` (458 bytes)
- `README.md` (2662 bytes)
- `TODO.md` (2020 bytes)

### Zależności

```javascript
import appFooterComponent from './appFooter.js';
```

### Testy

- `appFooter.test.js` - 85 testów

### Konfiguracja

```json
{
  "component": {
    "name": "appFooter",
    "displayName": "App Footer",
    "type": "layout",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "height": 30,
      "position": "fixed",
      "background": "#2c3e50",
      "color": "#ffffff",
      "fontSize": "10px",
      "padding": "0 16px"
    },
    "sections": {
      "left": {
        "copyright": {
          "enabled": true,
          "text": "© 2025 MASKTRONIC",
          "fontSize": "10px"
        },
        "deviceInfo": {
          "enabled": true,
          "showName": true,
          "showModel": true,
          "defaultName": "TEST_DEVICE",
          "defaultModel": "C20"
        },
        "systemInfo": {
          "enabled": true,
          "showVersion": true,
          "showBuildDate": true,
          "showEnvironment": true
        }
      },
      "center": {
        "buildInfo": {
          "enabled": true,
          "showBuildNumber": true,
          "defaultVersion": "3.0.0",
          "defaultBuildNumber": "2025.001"
        },
        "currentTime": {
          "enabled": true,
          "format": "HH:mm:ss",
          "updateInterval": 1000
        }
      },
      "right": {
        "deviceStatus": {
          "enabled": true,
          "defaultStatus": "ONLINE",
          "statusColors": {
            "ONLINE": "#27ae60",
            "OFFLINE": "#e74c3c",
            "CONNECTING": "#f39c12",
            "ERROR": "#c0392b"
          }
        },
        "userInfo": {
          "enabled": true,
          "showName": true,
          "showRole": true,
          "defaultName": "Guest",
          "defaultRole": "OPERATOR"
        }
      }
    }
  },
  "data": {
    "systemInfo": {
      "version": "v3.0",
      "buildDate": "2025-01-26",
      "environment": "development"
    },
    "deviceInfo": {
      "name": "TEST_DEVICE",
      "model": "C20"
    },
    "buildInfo": {
      "version": "3.0.0",
      "buildNumber": "2025.001"
    },
    "currentUser": {
      "name": "Guest",
      "role": "OPERATOR"
    },
    "deviceStatus": "ONLINE"
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "maxHeight": "400px",
      "optimizations": ["compact-spacing", "reduced-padding"]
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "highContrast": false,
    "screenReader": true
  },
  "performance": {
    "updateInterval": 1000,
    "enableCaching": true,
    "lazyLoading": false,
    "memoryManagement": {
      "autoCleanup": true,
      "intervalCleanup": true,
      "cacheSize": "5MB"
    }
  },
  "security": {
    "validation": {
      "sanitizeUserInfo": true,
      "validateDeviceStatus": true,
      "allowedRoles": ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"]
    },
    "protection": {
      "xssProtection": true,
      "validateTimestamps": true,
      "sanitizeDisplayText": true
    },
    "audit": {
      "logUserActivity": true,
      "logStatusChanges": true,
      "retentionDays": 30
    }
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'appFooter',
    version: '0.1.0',
    type: 'component',
    displayName: 'App Footer',
    description: 'Footer component with system info, timestamps, and 7.9" display optimization',
    dependencies: ['vue', 'vuex', 'vue-i18n'],
    initialized: false
  },
  
  component: appFooterComponent,
  
  async init(context = {}) {
    this.metadata.initialized = true;
    return { success: true };
  },
  
  handle(request = {}) {
    const { action = 'render', systemInfo = {}, currentUser = {} } = request;
    
```

---

## 0.1.0 vappHeader

**Ścieżka:** `appHeader/0.1.0`  
**Wersja:** appHeader  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The AppHeader module provides a Vue 3 component for displaying the application header, optimized for 7.9" industrial displays. It shows device status, language selector, and system branding information.

## Features
- **Device Status Display**: Real-time device connection status
- **Language Selector**: Multi-language support with language switching
- **Device Information**: Device name, type, and URL display
- **System Branding**: Application logo and title
- **Responsive Design**: Optimized for 7.9" landscape displays
- **Status Indicators**: Color-coded connection status
- **User Interface**: Clean, professional industrial design

## Component Structure
```
<header class="app-header">
  <div class="header-left">
    - Application logo and branding
  </div>
  <div class="header-center">
    - Device information and status
  </div>
  <div class="header-right">
    - Language selector
    - User actions
  </div>
</header>
```

## Props
- `deviceStatus`: String indicating device connection status (ONLINE, OFFLINE, CONNECTING)
- `deviceInfo`: Object containing device name, type, and URL
- `currentLanguage`: String for current language selection (pl, en, de)

## CSS Classes
- `.app-header`: Main header container
- `.header-left`: Left section with branding
- `.header-center`: Center section with device info
- `.header-right`: Right section with controls
- `.device-status`: Status indicator styling
- `.language-selector`: Language dropdown styling

## Usage
```javascript
const component = await registry.load('appHeader', '0.1.0');
await component.render({
  deviceStatus: 'ONLINE',
  deviceInfo: { 
    name: 'CONNECT', 
    type: '500', 
    url: 'c201001.mask.services' 
  },
  currentLanguage: 'pl'
});
```

## Testing
- 26 comprehensive unit tests covering all functionality
- Component rendering tests
- Props validation tests
- Language switching tests
- Status indicator tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `appHeader.js` (6857 bytes)
- `appHeader.test.js` (11614 bytes)
- `CHANGELOG.md` (1478 bytes)
- `config.json` (2900 bytes)
- `index.js` (2109 bytes)
- `package.json` (467 bytes)
- `README.md` (2117 bytes)
- `TODO.md` (1701 bytes)

### Zależności

```javascript
import appHeaderComponent from './appHeader.js';
```

### Testy

- `appHeader.test.js` - 62 testów

### Konfiguracja

```json
{
  "component": {
    "name": "appHeader",
    "displayName": "App Header",
    "type": "layout",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "height": 40,
      "position": "fixed",
      "background": "#2c3e50",
      "color": "#ffffff",
      "fontSize": "13px",
      "padding": "0 16px"
    },
    "sections": {
      "left": {
        "logo": {
          "enabled": true,
          "text": "MASKSERVICE C20",
          "fontSize": "14px",
          "fontWeight": "bold"
        }
      },
      "center": {
        "deviceStatus": {
          "enabled": true,
          "showIcon": true,
          "showText": true,
          "defaultStatus": "OFFLINE",
          "statusColors": {
            "ONLINE": "#27ae60",
            "OFFLINE": "#e74c3c",
            "CONNECTING": "#f39c12"
          }
        },
        "deviceInfo": {
          "enabled": true,
          "showName": true,
          "showType": true,
          "showUrl": true,
          "format": "Device: {name}.{type}.{url}"
        }
      },
      "right": {
        "languageSelector": {
          "enabled": true,
          "availableLanguages": ["pl", "en", "de"],
          "defaultLanguage": "pl",
          "showFlags": true
        },
        "userActions": {
          "enabled": true,
          "showUserName": false,
          "showLogout": false
        }
      }
    }
  },
  "data": {
    "deviceStatus": "OFFLINE",
    "deviceInfo": {
      "name": "CONNECT",
      "type": "500",
      "url": "c201001.mask.services"
    },
    "currentLanguage": "pl",
    "connectionInfo": {
      "lastPing": null,
      "latency": null,
      "quality": "unknown"
    }
  },
  "languages": {
    "pl": {
      "name": "Polski",
      "flag": "🇵🇱",
      "code": "pl"
    },
    "en": {
      "name": "English", 
      "flag": "🇬🇧",
      "code": "en"
    },
    "de": {
      "name": "Deutsch",
      "flag": "🇩🇪", 
      "code": "de"
    }
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "maxHeight": "400px",
      "optimizations": ["compact-layout", "reduced-padding"]
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "highContrast": false,
    "screenReader": true
  },
  "performance": {
    "statusUpdateInterval": 5000,
    "enableCaching": true,
    "lazyLoading": false,
    "memoryManagement": {
      "autoCleanup": true,
      "cacheSize": "10MB"
    }
  },
  "security": {
    "validation": {
      "sanitizeInputs": true,
      "validateDeviceInfo": true,
      "allowedStatuses": ["ONLINE", "OFFLINE", "CONNECTING"]
    },
    "protection": {
      "xssProtection": true,
      "contentSecurityPolicy": true,
      "validateLanguageCodes": true
    },
    "audit": {
      "logLanguageChanges": true,
      "logStatusChanges": true,
      "retentionDays": 30
    }
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'appHeader',
    version: '0.1.0',
    displayName: 'App Header',
    description: 'Header component with device status, language selector, and 7.9" display optimization',
    initialized: false
  },
  
  component: appHeaderComponent,
  
  async init(context = {}) {
    this.metadata.initialized = true;
    return true;
  },
  
  handle(request = {}) {
    const { action = 'render', deviceStatus = 'OFFLINE', deviceInfo = {}, currentLanguage = 'pl' } = request;
    
    return { 
      success: true, 
```

---

## 0.1.0 vauditLogViewer

**Ścieżka:** `auditLogViewer/0.1.0`  
**Wersja:** auditLogViewer  
**Data generowania:** 2025-09-26 20:34:25

### Opis


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

### Struktura plików

- `auditLogViewer.integration.test.js` (17571 bytes)
- `auditLogViewer.js` (21238 bytes)
- `auditLogViewer.test.js` (17922 bytes)
- `CHANGELOG.md` (2651 bytes)
- `config.json` (1840 bytes)
- `index.js` (2206 bytes)
- `README.md` (5313 bytes)
- `TODO.md` (4898 bytes)

### Zależności

```javascript
import AuditLogViewerComponent from './auditLogViewer.js';
```

### Testy

- `auditLogViewer.test.js` - 189 testów
- `auditLogViewer.integration.test.js` - 157 testów

### Konfiguracja

```json
{
  "component": {
    "name": "auditLogViewer",
    "version": "0.1.0",
    "description": "Comprehensive security audit log viewer and dashboard for monitoring authentication events, user actions, and system security",
    "author": "1001.mask.services",
    "created": "2025",
    "type": "security-dashboard"
  },
  "ui": {
    "display": {
      "width": "100%",
      "height": "100%", 
      "responsive": true,
      "touchOptimized": true,
      "landscapeMode": true
    },
    "layout": {
      "header": true,
      "filters": true,
      "stats": true,
      "table": true,
      "pagination": true,
      "modal": true
    },
    "theme": {
      "colorScheme": "light",
      "primaryColor": "#007bff",
      "dangerColor": "#dc3545",
      "warningColor": "#ffc107",
      "successColor": "#28a745"
    }
  },
  "data": {
    "refreshInterval": 30000,
    "pageSize": 50,
    "maxDisplayLogs": 10000,
    "timeRanges": ["1h", "24h", "7d", "30d", "all"],
    "exportFormats": ["csv"],
    "autoRefresh": true
  },
  "responsive": {
    "breakpoints": {
      "small": "400px",
      "medium": "800px", 
      "large": "1280px"
    },
    "display79": {
      "width": "1280px",
      "height": "400px",
      "orientation": "landscape",
      "scaling": "optimized"
    }
  },
  "accessibility": {
    "keyboardNavigation": true,
    "screenReader": true,
    "highContrast": false,
    "focusManagement": true,
    "ariaLabels": true
  },
  "performance": {
    "virtualScrolling": false,
    "lazyLoading": false,
    "caching": true,
    "debounceSearch": 300,
    "maxMemoryUsage": "50MB"
  },
  "security": {
    "roleBasedAccess": true,
    "auditLogging": true,
    "dataValidation": true,
    "exportPermissions": true,
    "allowedRoles": ["ADMIN", "SUPERUSER", "SERWISANT"],
    "sensitiveDataMasking": false
  }
}
```

### Metadane

```javascript
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
```

---

## 0.1.0 vloginForm

**Ścieżka:** `loginForm/0.1.0`  
**Wersja:** loginForm  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The LoginForm module provides a Vue 3 component for user authentication with validation and virtual keyboard support, optimized for 7.9" touchscreen displays. It handles user login, role assignment, and security validation.

## Features
- **User Authentication**: Secure login with username/password validation
- **Virtual Keyboard**: Touch-friendly on-screen keyboard for 7.9" displays
- **Role-Based Login**: Support for multiple user roles (OPERATOR, SUPERVISOR, ADMINISTRATOR)
- **Input Validation**: Real-time validation with error messaging
- **Security Features**: Password masking, attempt limiting, session management
- **Responsive Design**: Optimized for industrial touchscreen interfaces
- **Accessibility**: Screen reader support and keyboard navigation
- **Multi-language Support**: Localized interface and error messages

## Component Structure
```
<form class="login-form">
  <div class="login-header">
    <h2 class="login-title">System Login</h2>
  </div>
  <div class="login-fields">
    <div class="field-group">
      <input class="username-input" type="text" />
      <label class="field-label">Username</label>
    </div>
    <div class="field-group">
      <input class="password-input" type="password" />
      <label class="field-label">Password</label>
    </div>
    <div class="role-selector">
      <select class="role-select">
        <option value="OPERATOR">Operator</option>
        <option value="SUPERVISOR">Supervisor</option>
        <option value="ADMINISTRATOR">Administrator</option>
      </select>
    </div>
  </div>
  <div class="login-actions">
    <button class="login-button">Login</button>
    <button class="clear-button">Clear</button>
  </div>
  <div class="virtual-keyboard" v-if="showKeyboard">
    <!-- Virtual keyboard layout -->
  </div>
</form>
```

## Props
- `showVirtualKeyboard`: Boolean to enable/disable virtual keyboard
- `allowedRoles`: Array of permitted user roles
- `maxAttempts`: Number of allowed login attempts before lockout
- `sessionTimeout`: Session timeout duration in minutes

## Authentication Flow
1. User enters credentials and selects role
2. Real-time validation of input fields
3. Form submission triggers authentication
4. Backend validation (simulated in this version)
5. Success: User session created and redirect
6. Failure: Error message displayed, attempt counted

## Role System
- **OPERATOR**: Basic system operations and monitoring
- **SUPERVISOR**: OPERATOR permissions + advanced operations and oversight
- **ADMINISTRATOR**: Full system access, configuration, and user management

## CSS Classes
- `.login-form`: Main form container
- `.login-header`: Header section with title
- `.login-fields`: Input fields container
- `.field-group`: Individual field wrapper
- `.username-input`, `.password-input`: Input field styling
- `.role-selector`: Role selection dropdown
- `.login-actions`: Button container
- `.virtual-keyboard`: On-screen keyboard
- `.error-message`: Validation error styling

## Usage
```javascript
const component = await registry.load('loginForm', '0.1.0');
const authResult = await component.handle({
  action: 'authenticate',
  data: {
    username: 'operator1',
    password: 'password123',
    role: 'OPERATOR'
  }
});

await component.render({
  showVirtualKeyboard: true,
  allowedRoles: ['OPERATOR', 'SUPERVISOR'],
  maxAttempts: 3,
  sessionTimeout: 30
});
```

## Security Features
- Password field masking
- Input sanitization and validation
- Attempt limiting with lockout
- Session timeout management
- Secure credential handling
- CSRF protection ready

## Testing
- 43 comprehensive unit tests covering all functionality
- Authentication flow tests
- Input validation tests
- Virtual keyboard interaction tests
- Security and edge case tests
- Accessibility tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)
- Crypto-js (for password hashing)

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `CHANGELOG.md` (2249 bytes)
- `config.json` (3763 bytes)
- `index.js` (11709 bytes)
- `loginForm.js` (21713 bytes)
- `loginForm.test.js` (25467 bytes)
- `package.json` (1247 bytes)
- `README.md` (4038 bytes)
- `TODO.md` (2550 bytes)

### Zależności

```javascript
import Component from './loginForm.js';
```

### Testy

- `loginForm.test.js` - 167 testów

### Konfiguracja

```json
{
  "component": {
    "name": "loginForm",
    "displayName": "Login Form",
    "type": "authentication",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "maxWidth": "400px",
      "background": "#ffffff",
      "borderRadius": "8px",
      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.1)",
      "padding": "24px",
      "margin": "auto"
    },
    "form": {
      "fieldSpacing": "16px",
      "labelFontSize": "12px",
      "inputHeight": "40px",
      "inputFontSize": "14px",
      "borderRadius": "4px"
    },
    "virtualKeyboard": {
      "enabled": true,
      "layout": "qwerty",
      "keyHeight": "40px",
      "keySpacing": "2px",
      "backgroundColor": "#f8f9fa",
      "keyColor": "#495057",
      "activeKeyColor": "#007bff"
    },
    "buttons": {
      "height": "44px",
      "fontSize": "14px",
      "borderRadius": "4px",
      "primaryColor": "#007bff",
      "primaryHover": "#0056b3",
      "secondaryColor": "#6c757d",
      "secondaryHover": "#545b62"
    }
  },
  "authentication": {
    "roles": {
      "OPERATOR": {
        "permissions": ["view_sensors", "view_alerts"],
        "defaultRoute": "/monitoring",
        "color": "#27ae60"
      },
      "ADMIN": {
        "permissions": ["manage_tests", "manage_reports", "manage_users"],
        "defaultRoute": "/dashboard",
        "color": "#f39c12"
      },
      "SUPERUSER": {
        "permissions": ["full_system_access", "config_edit"],
        "defaultRoute": "/system",
        "color": "#e74c3c"
      },
      "SERWISANT": {
        "permissions": ["service_mode", "calibration", "diagnostics"],
        "defaultRoute": "/service",
        "color": "#3498db"
      }
    },
    "validation": {
      "minPasswordLength": 3,
      "maxAttempts": 3,
      "lockoutDuration": 300000,
      "sessionTimeout": 1800000
    },
    "defaultCredentials": {
      "username": "",
      "password": "",
      "role": "OPERATOR"
    }
  },
  "data": {
    "formState": {
      "username": "",
      "password": "",
      "selectedRole": "OPERATOR",
      "showVirtualKeyboard": false,
      "activeInput": null,
      "errors": {},
      "isSubmitting": false
    },
    "authState": {
      "isAuthenticated": false,
      "currentUser": null,
      "loginAttempts": 0,
      "lastLoginTime": null
    }
  },
  "virtualKeyboard": {
    "layouts": {
      "qwerty": {
        "rows": [
          ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
          ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
          ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
          ["z", "x", "c", "v", "b", "n", "m"],
          ["SPACE", "BACKSPACE", "ENTER"]
        ]
      },
      "numeric": {
        "rows": [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["0", "BACKSPACE", "ENTER"]
        ]
      }
    },
    "specialKeys": {
      "SPACE": " ",
      "BACKSPACE": "⌫",
      "ENTER": "↵",
      "SHIFT": "⇧",
      "CAPS": "⇪"
    }
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "maxHeight": "400px",
      "optimizations": ["touch-friendly", "large-buttons", "virtual-keyboard"]
    },
    "breakpoints": {
      "mobile": "400px",
      "tablet": "768px",
      "desktop": "1024px"
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "highContrast": false,
    "screenReader": true,
    "focusManagement": true,
    "announcements": true
  },
  "performance": {
    "enableCaching": false,
    "lazyLoading": false,
    "debounceInput": 300
  },
  "security": {
    "encryptPassword": true,
    "validateInput": true,
    "preventBruteForce": true,
    "auditLogging": true,
    "csrfProtection": true
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'loginForm',
    version: '1.0.0',
    description: 'Login form with virtual keyboard optimized for 7.9" touch displays',
    author: 'Industrial Systems Team',
    initialized: false,
    dependencies: ['vue'],
    tags: ['authentication', 'virtual-keyboard', '7.9-inch', 'touch-optimized'],
    features: [
      'virtual-keyboard',
      'role-based-authentication',
      'touch-optimizations',
      'validation',
      'landscape-7.9-inch-display'
    ]
  }
};
```

---

## 0.1.0 vmainMenu

**Ścieżka:** `mainMenu/0.1.0`  
**Wersja:** mainMenu  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The MainMenu module provides a Vue 3 component for the main navigation menu with role-based access control, optimized for 7.9" industrial displays. It manages menu items, permissions, and navigation flow based on user roles.

## Features
- **Role-Based Access Control**: Menu items filtered by user roles (OPERATOR, ADMINISTRATOR, SUPERVISOR)
- **Dynamic Menu Generation**: Menu structure adapts to user permissions
- **Navigation Management**: Handles routing and page transitions
- **Responsive Design**: Optimized for 7.9" landscape displays
- **Multi-level Navigation**: Support for nested menu structures
- **Visual Indicators**: Active state and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## Component Structure
```
<nav class="main-menu">
  <ul class="menu-list">
    <li class="menu-item" v-for="item in menuItems">
      <a class="menu-link" :class="{ active: isActive }">
        <i class="menu-icon"></i>
        <span class="menu-text">{{ item.label }}</span>
      </a>
      <ul class="submenu" v-if="item.children">
        <!-- Nested menu items -->
      </ul>
    </li>
  </ul>
</nav>
```

## Props
- `currentUser`: Object containing user information and role
- `currentRoute`: String indicating the current active route
- `menuConfig`: Object containing menu structure and permissions

## Menu Configuration
The menu supports hierarchical structure with role-based visibility:

```javascript
{
  "dashboard": {
    "label": "Dashboard",
    "icon": "dashboard",
    "route": "/dashboard",
    "roles": ["OPERATOR", "ADMINISTRATOR", "SUPERVISOR"]
  },
  "management": {
    "label": "Management",
    "icon": "settings",
    "roles": ["ADMINISTRATOR", "SUPERVISOR"],
    "children": {
      "users": { "label": "Users", "route": "/users" },
      "system": { "label": "System", "route": "/system" }
    }
  }
}
```

## Role Hierarchy
- **OPERATOR**: Basic operations and monitoring
- **SUPERVISOR**: OPERATOR permissions + advanced operations
- **ADMINISTRATOR**: Full system access and configuration

## CSS Classes
- `.main-menu`: Main menu container
- `.menu-list`: Menu items list
- `.menu-item`: Individual menu item
- `.menu-link`: Menu item link
- `.menu-icon`: Icon styling
- `.menu-text`: Text label styling
- `.submenu`: Nested menu styling
- `.active`: Active menu item state

## Usage
```javascript
const component = await registry.load('mainMenu', '0.1.0');
const menuData = await component.handle({
  action: 'getMenu',
  role: 'OPERATOR'
});
await component.render({
  currentUser: { name: 'User', role: 'OPERATOR' },
  currentRoute: '/dashboard'
});
```

## Testing
- 42 comprehensive unit tests covering all functionality
- Role-based access control tests
- Menu generation and filtering tests
- Navigation and routing tests
- Accessibility and interaction tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)
- Vue-router (for navigation)

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `CHANGELOG.md` (2018 bytes)
- `config.json` (3805 bytes)
- `index.js` (8186 bytes)
- `mainMenu.js` (13545 bytes)
- `mainMenu.test.js` (17174 bytes)
- `package.json` (1049 bytes)
- `README.md` (3077 bytes)
- `TODO.md` (2072 bytes)

### Zależności

```javascript
import Component from './mainMenu.js';
```

### Testy

- `mainMenu.test.js` - 113 testów

### Konfiguracja

```json
{
  "component": {
    "name": "mainMenu",
    "displayName": "Main Menu",
    "type": "navigation",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "width": 180,
      "background": "#ffffff",
      "borderRight": "1px solid #ddd",
      "fontSize": "11px",
      "padding": "8px"
    },
    "menuItem": {
      "padding": "8px",
      "fontSize": "11px",
      "hoverBackground": "#f0f0f0",
      "activeBackground": "#3498db",
      "activeColor": "#ffffff",
      "iconSpacing": "8px"
    },
    "accessibility": {
      "focusVisible": true,
      "keyboardNavigation": true,
      "ariaLabels": true
    }
  },
  "roleBasedAccess": {
    "OPERATOR": {
      "menuItems": 2,
      "permissions": ["view_sensors", "view_alerts"],
      "color": "#27ae60",
      "allowedRoutes": ["/monitoring", "/alerts"]
    },
    "ADMIN": {
      "menuItems": 4,
      "permissions": ["manage_tests", "manage_reports", "manage_users"],
      "color": "#f39c12",
      "allowedRoutes": ["/tests", "/reports", "/users", "/system"]
    },
    "SUPERUSER": {
      "menuItems": 4,
      "permissions": ["full_system_access", "config_edit"],
      "color": "#e74c3c",
      "allowedRoutes": ["*"]
    },
    "SERWISANT": {
      "menuItems": 5,
      "permissions": ["service_mode", "calibration", "diagnostics"],
      "color": "#3498db",
      "allowedRoutes": ["/service", "/calibration", "/diagnostics", "/workshop", "/maintenance"]
    }
  },
  "menuStructure": {
    "dashboard": {
      "label": "Dashboard",
      "icon": "dashboard",
      "route": "/dashboard",
      "roles": ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"],
      "order": 1
    },
    "monitoring": {
      "label": "Monitoring",
      "icon": "monitor",
      "route": "/monitoring",
      "roles": ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"],
      "order": 2
    },
    "tests": {
      "label": "Tests",
      "icon": "test-tube",
      "route": "/tests",
      "roles": ["ADMIN", "SUPERUSER"],
      "order": 3
    },
    "reports": {
      "label": "Reports",
      "icon": "chart",
      "route": "/reports",
      "roles": ["ADMIN", "SUPERUSER"],
      "order": 4
    },
    "users": {
      "label": "Users",
      "icon": "users",
      "route": "/users",
      "roles": ["ADMIN", "SUPERUSER"],
      "order": 5
    },
    "system": {
      "label": "System",
      "icon": "settings",
      "route": "/system",
      "roles": ["SUPERUSER"],
      "order": 6
    },
    "service": {
      "label": "Service",
      "icon": "wrench",
      "route": "/service",
      "roles": ["SERWISANT"],
      "order": 7
    },
    "calibration": {
      "label": "Calibration",
      "icon": "adjust",
      "route": "/calibration",
      "roles": ["SERWISANT"],
      "order": 8
    },
    "diagnostics": {
      "label": "Diagnostics",
      "icon": "stethoscope",
      "route": "/diagnostics",
      "roles": ["SERWISANT"],
      "order": 9
    },
    "workshop": {
      "label": "Workshop",
      "icon": "tools",
      "route": "/workshop",
      "roles": ["SERWISANT"],
      "order": 10
    }
  },
  "data": {
    "currentUser": {
      "role": "OPERATOR"
    },
    "currentRoute": "/dashboard",
    "menuState": {
      "collapsed": false,
      "activeItem": null
    }
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "compactMode": true,
      "collapsible": true
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "highContrast": false,
    "screenReader": true,
    "focusManagement": true
  },
  "performance": {
    "enableCaching": true,
    "lazyLoading": false,
    "virtualScrolling": false
  },
  "security": {
    "validatePermissions": true,
    "auditAccess": true,
    "sessionTimeout": 1800000
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'mainMenu',
    version: '1.0.0',
    description: 'role-based main menu system with hierarchical access control for industrial applications',
    author: 'Industrial Systems Team',
    initialized: false,
    dependencies: ['vue'],
    tags: ['menu', 'navigation', 'role-based', 'access-control'],
    features: [
      'role-based-access-control',
      'hierarchical-menu-structure',
      'permission-validation',
      'theme-customization',
      'submenu-support'
    ]
  }
};
```

---

## 0.1.0 vpageTemplate

**Ścieżka:** `pageTemplate/0.1.0`  
**Wersja:** pageTemplate  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The PageTemplate module provides a Vue 3 base template component for the MASKSERVICE system, specifically designed for 7.9" displays (400x1280px landscape). It serves as the foundation layout for all application pages with configurable sections and responsive design.

## Features
- **Base Layout Structure**: Standardized page layout with header, sidebar, content, and footer areas
- **Responsive Design**: Optimized for 7.9" landscape displays (400x1280px)
- **Configurable Sections**: Toggle visibility of sidebar, pressure panel, and other components
- **Menu Integration**: Support for dynamic menu items and navigation
- **User Context**: Display current user information and device details
- **Layout Modes**: Support for different layout configurations
- **Component Slots**: Flexible content areas for different page types
- **Professional Styling**: Industrial-grade interface design

## Component Structure
```
<div class="page-template" :class="layoutClass">
  <header class="page-header">
    <!-- App header component -->
  </header>
  
  <div class="page-body">
    <aside class="page-sidebar" v-if="showSidebar">
      <!-- Navigation menu -->
    </aside>
    
    <main class="page-content">
      <div class="content-header">
        <h1 class="page-title">{{ title }}</h1>
      </div>
      <div class="content-body">
        <!-- Dynamic content slot -->
      </div>
    </main>
    
    <aside class="pressure-panel" v-if="showPressurePanel">
      <!-- Pressure monitoring panel -->
    </aside>
  </div>
  
  <footer class="page-footer">
    <!-- App footer component -->
  </footer>
</div>
```

## Props
- `title`: String for page title display
- `showSidebar`: Boolean to toggle sidebar visibility (default: true)
- `showPressurePanel`: Boolean to toggle pressure panel visibility (default: false)
- `menuItems`: Array of menu items for navigation
- `currentUser`: Object containing current user information
- `deviceId`: String identifying the current device
- `layout`: String defining layout mode ('landscape', 'portrait')

## Layout Configuration
The template supports flexible configuration for different page types:

```javascript
{
  title: "Dashboard",
  showSidebar: true,
  showPressurePanel: false,
  menuItems: [...],
  currentUser: { name: "Operator", role: "OPERATOR" },
  deviceId: "MASK-001",
  layout: "landscape"
}
```

## CSS Classes
- `.page-template`: Main template container
- `.page-header`: Header section
- `.page-body`: Main body container
- `.page-sidebar`: Sidebar navigation area
- `.page-content`: Main content area
- `.content-header`: Content header with title
- `.content-body`: Dynamic content area
- `.pressure-panel`: Pressure monitoring sidebar
- `.page-footer`: Footer section
- `.layout-landscape`: Landscape mode styling

## Usage
```javascript
const component = await registry.load('pageTemplate', '0.1.0');
await component.handle({
  action: 'show',
  data: {
    title: 'System Dashboard',
    showSidebar: true,
    showPressurePanel: false,
    menuItems: [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Settings', route: '/settings' }
    ],
    currentUser: { name: 'Operator', role: 'OPERATOR' },
    deviceId: 'MASK-001'
  }
});
```

## Responsive Behavior
- **7.9" Landscape (400x1280px)**: Optimized primary layout
- **Sidebar**: Collapsible on smaller screens
- **Content Area**: Flexible width based on sidebar state
- **Pressure Panel**: Optional right sidebar for monitoring data
- **Header/Footer**: Fixed height, responsive content

## Testing
- 25 comprehensive unit tests covering all functionality
- Layout configuration tests
- Responsive behavior tests
- Component integration tests
- Accessibility and navigation tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)
- appHeader module
- appFooter module
- mainMenu module

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `CHANGELOG.md` (2299 bytes)
- `config.json` (3893 bytes)
- `index.js` (4735 bytes)
- `package.json` (1004 bytes)
- `pageTemplate.js` (18068 bytes)
- `pageTemplate.test.js` (11695 bytes)
- `README.md` (4001 bytes)
- `TODO.md` (2166 bytes)

### Zależności

```javascript
import Component from './pageTemplate.js';
```

### Testy

- `pageTemplate.test.js` - 65 testów

### Konfiguracja

```json
{
  "component": {
    "name": "pageTemplate",
    "displayName": "Page Template",
    "type": "layout",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "type": "grid",
      "areas": {
        "header": "app-header",
        "sidebar": "main-menu", 
        "content": "content-area",
        "footer": "app-footer",
        "pressurePanel": "pressure-panel"
      },
      "gridTemplate": {
        "rows": "40px 1fr 30px",
        "columns": "180px 1fr 120px",
        "areas": [
          "header header header",
          "sidebar content pressurePanel",
          "footer footer footer"
        ]
      }
    },
    "contentArea": {
      "background": "#f8f9fa",
      "padding": "16px",
      "overflow": "auto",
      "minHeight": "calc(100vh - 70px)"
    },
    "transitions": {
      "enabled": true,
      "duration": "0.3s",
      "easing": "ease-in-out"
    }
  },
  "components": {
    "header": {
      "component": "appHeader",
      "enabled": true,
      "props": {
        "showDeviceStatus": true,
        "showLanguageSelector": true
      }
    },
    "sidebar": {
      "component": "mainMenu", 
      "enabled": true,
      "props": {
        "collapsible": false,
        "showIcons": true
      }
    },
    "content": {
      "component": "dynamic",
      "enabled": true,
      "props": {
        "routeContent": true,
        "errorBoundary": true
      }
    },
    "footer": {
      "component": "appFooter",
      "enabled": true,
      "props": {
        "showSystemInfo": true,
        "showUserInfo": false,
        "showDeviceStatus": true
      }
    },
    "pressurePanel": {
      "component": "pressurePanel",
      "enabled": true,
      "props": {
        "realTimeUpdates": true,
        "showAlerts": true
      }
    }
  },
  "routing": {
    "defaultRoute": "/dashboard",
    "errorRoute": "/error",
    "loginRoute": "/login",
    "routes": {
      "/": "/dashboard",
      "/dashboard": "dashboard-view",
      "/monitoring": "monitoring-view",
      "/tests": "tests-view",
      "/reports": "reports-view",
      "/users": "users-view",
      "/system": "system-view",
      "/service": "service-view",
      "/calibration": "calibration-view",
      "/diagnostics": "diagnostics-view",
      "/workshop": "workshop-view"
    }
  },
  "data": {
    "currentRoute": "/dashboard",
    "layoutState": {
      "sidebarCollapsed": false,
      "pressurePanelVisible": true,
      "fullscreenMode": false
    },
    "contentProps": {},
    "errorState": {
      "hasError": false,
      "errorMessage": null,
      "errorCode": null
    }
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "maxHeight": "400px",
      "optimizations": ["fixed-layout", "touch-friendly", "compact-spacing"]
    },
    "breakpoints": {
      "mobile": {
        "maxWidth": "400px",
        "layout": "mobile-stack"
      },
      "tablet": {
        "maxWidth": "768px", 
        "layout": "tablet-responsive"
      },
      "desktop": {
        "minWidth": "1024px",
        "layout": "desktop-grid"
      }
    },
    "adaptiveLayout": {
      "enabled": true,
      "autoCollapse": true,
      "touchOptimization": true
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "skipLinks": true,
    "landmarks": true,
    "highContrast": false,
    "screenReader": true,
    "focusManagement": true
  },
  "performance": {
    "enableCaching": true,
    "lazyLoading": true,
    "prefetchRoutes": false,
    "componentCaching": true,
    "virtualScrolling": false
  },
  "security": {
    "validateRoutes": true,
    "requireAuthentication": true,
    "roleBasedAccess": true,
    "auditNavigation": true
  },
  "errorHandling": {
    "enableErrorBoundary": true,
    "fallbackComponent": "error-fallback",
    "logErrors": true,
    "retryAttempts": 3
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'pageTemplate',
    version: '1.0.0',
    description: 'Base page template optimized for 7.9" landscape industrial displays with pressure panel support',
    author: 'Industrial Systems Team',
    initialized: false,
    displayOptimization: '7.9inch-landscape-400x1280px',
    dependencies: ['vue'],
    tags: ['layout', 'template', '7.9-inch', 'landscape', 'pressure-panel'],
    features: [
      'responsive-layout',
      'role-based-menu',
      'pressure-panel-support',
      'multi-language',
      'real-time-clock'
    ],
    compatibility: {
      vue: '^3.4.0',
      browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+']
    }
```

---

## 0.1.0 vpressurePanel

**Ścieżka:** `pressurePanel/0.1.0`  
**Wersja:** pressurePanel  
**Data generowania:** 2025-09-26 20:34:25

### Opis


## Overview
The PressurePanel module provides a Vue 3 component for real-time pressure sensor monitoring with critical alerts, optimized for 7.9" industrial displays. It displays pressure readings from multiple sensors with color-coded status indicators and threshold-based alerting.

## Features
- **Real-time Monitoring**: Live pressure sensor data display and updates
- **Multi-sensor Support**: Monitor low, medium, and high pressure ranges
- **Alert System**: Color-coded status indicators with critical threshold alerts
- **Unit Flexibility**: Support for multiple pressure units (mbar, bar, psi, kPa)
- **Responsive Design**: Optimized for 7.9" landscape displays
- **Data Visualization**: Graphical pressure trend displays and gauges
- **Threshold Configuration**: Customizable alert thresholds for different pressure levels
- **Professional Interface**: Industrial-grade monitoring panel design

## Component Structure
```
<div class="pressure-panel">
  <div class="panel-header">
    <h3 class="panel-title">Pressure Monitoring</h3>
    <div class="panel-controls">
      <button class="refresh-button">Refresh</button>
    </div>
  </div>
  
  <div class="pressure-sensors">
    <div class="sensor-group" v-for="sensor in sensors">
      <div class="sensor-header">
        <span class="sensor-label">{{ sensor.label }}</span>
        <span class="sensor-status" :class="sensor.status">{{ sensor.status }}</span>
      </div>
      <div class="sensor-reading">
        <span class="pressure-value">{{ sensor.value }}</span>
        <span class="pressure-unit">{{ sensor.unit }}</span>
      </div>
      <div class="sensor-gauge">
        <!-- Pressure gauge visualization -->
      </div>
    </div>
  </div>
  
  <div class="alert-section" v-if="hasAlerts">
    <div class="alert-item" v-for="alert in activeAlerts">
      <i class="alert-icon"></i>
      <span class="alert-message">{{ alert.message }}</span>
    </div>
  </div>
</div>
```

## Props
- `pressureData`: Object containing sensor readings (low, medium, high pressure)
- `alertThresholds`: Object defining critical pressure thresholds
- `updateInterval`: Number defining data refresh interval in milliseconds
- `units`: Object specifying pressure units for each sensor

## Pressure Data Structure
```javascript
{
  low: { value: 150, unit: 'mbar', status: 'normal' },
  medium: { value: 2.5, unit: 'bar', status: 'warning' },
  high: { value: 8.2, unit: 'bar', status: 'critical' }
}
```

## Alert Thresholds
```javascript
{
  low: { min: 100, max: 200, critical: 50 },
  medium: { min: 1.0, max: 5.0, critical: 0.5 },
  high: { min: 5.0, max: 10.0, critical: 12.0 }
}
```

## Status Indicators
- **Normal**: Green - Pressure within acceptable range
- **Warning**: Yellow - Pressure approaching threshold limits
- **Critical**: Red - Pressure outside safe operating range
- **Error**: Gray - Sensor communication failure or invalid reading

## CSS Classes
- `.pressure-panel`: Main panel container
- `.panel-header`: Header with title and controls
- `.pressure-sensors`: Sensors display area
- `.sensor-group`: Individual sensor container
- `.sensor-reading`: Pressure value display
- `.sensor-gauge`: Pressure gauge visualization
- `.alert-section`: Alert messages area
- `.status-normal/warning/critical/error`: Status-specific styling

## Usage
```javascript
const component = await registry.load('pressurePanel', '0.1.0');
await component.handle({
  action: 'render',
  pressureData: {
    low: { value: 150, unit: 'mbar', status: 'normal' },
    medium: { value: 2.5, unit: 'bar', status: 'warning' },
    high: { value: 8.2, unit: 'bar', status: 'normal' }
  },
  alertThresholds: {
    low: { min: 100, max: 200, critical: 50 },
    medium: { min: 1.0, max: 5.0, critical: 0.5 },
    high: { min: 5.0, max: 10.0, critical: 12.0 }
  }
});
```

## Real-time Updates
The panel supports automatic data refresh with configurable intervals:
- Default update interval: 1000ms (1 second)
- Configurable refresh rates from 100ms to 10s
- Manual refresh button for immediate updates
- Automatic reconnection on data source failures

## Testing
- Comprehensive unit tests covering all functionality
- Sensor data validation tests
- Alert threshold and status tests
- Real-time update mechanism tests
- User interaction and control tests

## Dependencies
- Vue 3.x
- Vuex (for state management)
- Vue-i18n (for internationalization)
- Chart.js (for pressure trend visualization)

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Struktura plików

- `CHANGELOG.md` (2275 bytes)
- `config.json` (4344 bytes)
- `index.js` (2336 bytes)
- `package.json` (482 bytes)
- `pressurePanel.js` (21902 bytes)
- `pressurePanel.test.js` (18613 bytes)
- `README.md` (4559 bytes)
- `TODO.md` (2286 bytes)

### Zależności

```javascript
import pressurePanelComponent from './pressurePanel.js';
```

### Testy

- `pressurePanel.test.js` - 150 testów

### Konfiguracja

```json
{
  "component": {
    "name": "pressurePanel",
    "displayName": "Pressure Panel",
    "type": "monitoring",
    "category": "ui-component"
  },
  "ui": {
    "layout": {
      "width": 120,
      "background": "#ffffff",
      "borderLeft": "1px solid #ddd",
      "fontSize": "10px",
      "padding": "8px"
    },
    "gauges": {
      "size": "80px",
      "strokeWidth": 4,
      "backgroundColor": "#f8f9fa",
      "textColor": "#212529",
      "spacing": "12px"
    },
    "alerts": {
      "fontSize": "9px",
      "padding": "4px 6px",
      "borderRadius": "3px",
      "colors": {
        "normal": "#28a745",
        "warning": "#ffc107",
        "critical": "#dc3545",
        "unknown": "#6c757d"
      }
    },
    "indicators": {
      "size": "12px",
      "blinkDuration": "1s",
      "spacing": "4px"
    }
  },
  "sensors": {
    "pressure1": {
      "label": "P1",
      "unit": "bar",
      "minValue": 0,
      "maxValue": 10,
      "normalRange": {
        "min": 2,
        "max": 8
      },
      "warningRange": {
        "min": 1.5,
        "max": 9
      },
      "criticalRange": {
        "min": 0,
        "max": 10
      },
      "enabled": true,
      "position": 1
    },
    "pressure2": {
      "label": "P2",
      "unit": "bar",
      "minValue": 0,
      "maxValue": 5,
      "normalRange": {
        "min": 1,
        "max": 4
      },
      "warningRange": {
        "min": 0.5,
        "max": 4.5
      },
      "criticalRange": {
        "min": 0,
        "max": 5
      },
      "enabled": true,
      "position": 2
    },
    "pressure3": {
      "label": "P3",
      "unit": "mbar",
      "minValue": 0,
      "maxValue": 1000,
      "normalRange": {
        "min": 200,
        "max": 800
      },
      "warningRange": {
        "min": 100,
        "max": 900
      },
      "criticalRange": {
        "min": 0,
        "max": 1000
      },
      "enabled": true,
      "position": 3
    }
  },
  "alerting": {
    "enabled": true,
    "soundAlerts": false,
    "visualAlerts": true,
    "blinkingAlerts": true,
    "alertLevels": {
      "normal": {
        "color": "#28a745",
        "priority": 0,
        "sound": false
      },
      "warning": {
        "color": "#ffc107",
        "priority": 1,
        "sound": false,
        "blink": true
      },
      "critical": {
        "color": "#dc3545",
        "priority": 2,
        "sound": true,
        "blink": true
      }
    },
    "acknowledgment": {
      "required": true,
      "timeout": 300000
    }
  },
  "data": {
    "sensorValues": {
      "pressure1": {
        "value": 0,
        "status": "unknown",
        "lastUpdate": null,
        "trend": "stable"
      },
      "pressure2": {
        "value": 0,
        "status": "unknown",
        "lastUpdate": null,
        "trend": "stable"
      },
      "pressure3": {
        "value": 0,
        "status": "unknown",
        "lastUpdate": null,
        "trend": "stable"
      }
    },
    "alerts": [],
    "connectionStatus": "disconnected",
    "lastDataUpdate": null
  },
  "realTime": {
    "enabled": true,
    "updateInterval": 1000,
    "websocketUrl": "ws://localhost:5000/ws/pressure",
    "reconnectAttempts": 5,
    "reconnectDelay": 2000,
    "dataRetention": {
      "enabled": true,
      "maxPoints": 1000,
      "timeWindow": 3600000
    }
  },
  "responsive": {
    "display79": {
      "enabled": true,
      "maxWidth": "1280px",
      "maxHeight": "400px",
      "optimizations": ["compact-layout", "small-gauges", "minimal-text"]
    },
    "adaptiveLayout": {
      "enabled": true,
      "stackOnSmallScreen": true,
      "hideLabelsOnTinyScreen": true
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "announceAlerts": true,
    "highContrast": false,
    "screenReader": true,
    "colorBlindFriendly": true
  },
  "performance": {
    "enableCaching": false,
    "lazyLoading": false,
    "throttleUpdates": true,
    "maxUpdateFrequency": 10
  },
  "calibration": {
    "enabled": false,
    "coefficients": {
      "pressure1": { "offset": 0, "scale": 1 },
      "pressure2": { "offset": 0, "scale": 1 },
      "pressure3": { "offset": 0, "scale": 1 }
    },
    "lastCalibration": null
  },
  "logging": {
    "enabled": true,
    "logLevel": "info",
    "logAlerts": true,
    "logValues": false,
    "maxLogSize": 1000
  }
}
```

### Metadane

```javascript
  metadata: {
    name: 'pressurePanel',
    version: '0.1.0',
    displayName: 'Pressure Panel',
    description: 'Real-time pressure sensor monitoring panel with critical alerts for 7.9" display',
    initialized: false
  },
  
  component: pressurePanelComponent,
  
  async init(context = {}) {
    this.metadata.initialized = true;
    return true;
  },
  
  handle(request = {}) {
    const { action = 'render', pressureData = {}, alertThresholds = {} } = request;
    
    return { 
      success: true, 
```

---

## 0.1.0 vrealtimeSensors

**Ścieżka:** `realtimeSensors/0.1.0`  
**Wersja:** realtimeSensors  
**Data generowania:** 2025-09-26 20:34:25

### Opis


Advanced real-time industrial sensor monitoring dashboard with comprehensive data recording, alert system, and export capabilities.

## Overview

The RealtimeSensors component provides real-time monitoring of industrial sensors with visual dashboard, alert management, data recording, and export functionality. Optimized for 7.9" industrial displays with touch interface support.

## Features

### 🌊 Real-time Monitoring
- **Live sensor data updates** with configurable refresh rates (100ms - 2s)
- **6 sensor types**: Pressure, Flow Rate, Resistance, Leak Rate, CO₂ Level, Particle Count
- **Status indicators**: Normal, Warning, Critical with color-coded alerts
- **Trend analysis**: Rising, Falling, Stable trends with visual indicators

### 📊 Data Management
- **Data recording** with configurable history retention (max 500 points)
- **Export functionality** for JSON data with timestamp and user tracking
- **System status monitoring** with aggregated sensor statistics
- **Alert history** with timestamp tracking for troubleshooting

### 🚨 Alert System
- **Real-time alerts** for threshold violations and status changes
- **Visual feedback** with blinking animations for critical states
- **Alert acknowledgment** system with user tracking
- **Comprehensive logging** of all sensor events

### 🔒 Security Integration
- **SecurityService integration** with comprehensive audit logging
- **Role-based access control** (OPERATOR, ADMIN, SUPERUSER, SERWISANT)
- **Input validation** and sanitization for all user inputs
- **Session tracking** and activity monitoring

### 🌍 Multi-language Support
- **i18n integration** with Polish, English, German translations
- **Reactive language switching** without page reload
- **Localized date/time formatting** based on language settings
- **Cultural adaptation** for industrial terminology

### 📱 Industrial Display Optimization
- **7.9" landscape display** optimization (1280x400px)
- **Touch interface** with appropriate touch target sizes
- **Responsive grid layout** adapting to different screen sizes
- **High contrast mode** support for industrial environments

## Installation

```javascript
import { initializeRealtimeSensors } from './js/features/realtimeSensors/0.1.0/index.js';

// Initialize module
const realtimeSensors = initializeRealtimeSensors(app, {
  services: {
    securityService,
    i18nService
  },
  global: true,
  eventBus
});
```

## Usage

### Basic Component Usage
```vue
<template>
  <RealtimeSensorsComponent
    :user="currentUser"
    :language="currentLanguage"
    @navigate="handleNavigation"
    @sensor-alert="handleSensorAlert"
    @back="handleBack"
  />
</template>
```

### Props
- `user` (Object): Current user information with username, role, authentication status
- `language` (String): Current language setting ('pl', 'en', 'de')

### Events
- `navigate`: Navigation event to other components
- `sensor-alert`: Emitted when sensor status changes to warning/critical
- `back`: Emitted when user wants to return to previous component

### Sensor Configuration
```javascript
const sensorConfig = {
  id: 'pressure1',
  name: 'Pressure Sensor 1',
  value: 15.2,
  unit: 'kPa',
  min: 10,
  max: 25,
  status: 'normal', // 'normal', 'warning', 'critical'
  icon: '🌬️',
  color: 'blue',
  trend: 'stable' // 'stable', 'rising', 'falling'
};
```

## API Reference

### Methods
- `startRealtimeUpdates()`: Begin live sensor monitoring
- `stopRealtimeUpdates()`: Stop live sensor monitoring  
- `toggleRecording()`: Toggle data recording on/off
- `exportSensorData()`: Export current sensor data and history
- `changeRefreshRate(rate)`: Update monitoring refresh rate
- `formatSensorValue(value)`: Format numeric values for display
- `getStatusText(status)`: Get localized status text

### Computed Properties
- `pageTitle`: Localized component title
- `sensorStats`: Aggregated sensor statistics (normal/warning/critical counts)
- `systemStatus`: Overall system status based on worst sensor condition
- `systemStatusText`: Localized system status text

### Data Properties
- `sensorState`: Current monitoring state and configuration
- `sensors`: Array of sensor objects with current values
- `securityService`: Reference to SecurityService instance

## Security Features

### Audit Events
- `REALTIME_SENSORS_INIT`: Component initialization
- `REALTIME_SENSORS_MONITORING_STARTED`: Real-time monitoring started
- `REALTIME_SENSORS_MONITORING_STOPPED`: Real-time monitoring stopped
- `REALTIME_SENSORS_RECORDING_TOGGLED`: Data recording toggled
- `REALTIME_SENSORS_DATA_EXPORT`: Data export operation
- `REALTIME_SENSORS_ALERT`: Sensor alert triggered
- `REALTIME_SENSORS_CLEANUP`: Component cleanup

### Access Control
- **OPERATOR**: View sensors, basic controls
- **ADMIN**: All operator features + data export
- **SUPERUSER**: All admin features + system configuration
- **SERWISANT**: All features + maintenance access

## Performance Considerations

### Optimization Features
- **Configurable refresh rates** to balance responsiveness vs. performance
- **Data history limits** to prevent memory growth (max 500 points)
- **Efficient rendering** with Vue 3 reactivity system
- **Lazy loading** support for large sensor arrays

### Memory Management
- **Automatic cleanup** of intervals on component unmount
- **Circular buffer** for data history to maintain constant memory usage
- **Throttled updates** to prevent excessive re-renders
- **Event listener cleanup** to prevent memory leaks

## Testing

Component includes comprehensive test suite:
- **Unit tests** for all methods and computed properties
- **Integration tests** with SecurityService and i18n
- **Mock data** generation for development and testing
- **Event testing** for user interactions and alerts

Run tests:
```bash
npm test realtimeSensors
```

## Development

### Sample Data Generation
```javascript
import { devTools } from './index.js';

// Generate sample sensors
const sampleSensors = devTools.generateSampleData(6);

// Simulate data updates
const updatedSensors = devTools.simulateDataUpdate(sampleSensors);
```

### Event Handling
```javascript
// Listen for sensor alerts
this.$on('sensor-alert', (alert) => {
  console.log('Sensor Alert:', alert.sensor, alert.newStatus);
});

// Handle data export
this.$on('data-exported', (data) => {
  console.log('Data exported:', data.timestamp);
});
```

## Troubleshooting

### Common Issues

1. **Sensors not updating**
   - Check `sensorState.isLive` status
   - Verify `refreshRate` setting
   - Check console for JavaScript errors

2. **Export not working**
   - Verify user has export permissions
   - Check browser's download settings
   - Monitor console for security errors

3. **Alerts not firing**
   - Check `sensorState.alertsEnabled` setting
   - Verify threshold configurations
   - Check SecurityService integration

### Debug Mode
```javascript
// Enable debug logging
window.sensorDebug = true;

// Manual sensor data update
component.updateSensorData();

// Check sensor state
console.log(component.sensorState);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

## TODO

See [TODO.md](./TODO.md) for planned features and improvements.

## License

Part of 1001.mask.services industrial Vue.js application suite.

### Struktura plików

- `CHANGELOG.md` (7528 bytes)
- `config.json` (4222 bytes)
- `index.js` (7069 bytes)
- `README.md` (7342 bytes)
- `realtimeSensors.js` (23105 bytes)
- `TODO.md` (8267 bytes)

### Zależności

```javascript
import RealtimeSensorsComponent from './realtimeSensors.js';
import config from './config.json' assert { type: 'json' };
```

### Testy

*Brak testów*

### Konfiguracja

```json
{
  "component": {
    "name": "realtimeSensors",
    "displayName": "Realtime Sensors Monitor",
    "version": "0.1.0",
    "description": "Advanced real-time industrial sensor monitoring dashboard with data recording, alerts, and export capabilities",
    "author": "1001.mask.services Development Team",
    "category": "monitoring",
    "tags": ["sensors", "realtime", "monitoring", "industrial", "alerts", "data-export"],
    "dependencies": {
      "vue": "^3.0.0",
      "securityService": "^1.0.0",
      "i18nService": "^1.0.0"
    },
    "permissions": ["sensor_read", "data_export", "system_monitoring"],
    "roles": ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"]
  },
  "ui": {
    "responsive": {
      "breakpoints": {
        "mobile": "480px",
        "tablet": "768px", 
        "desktop": "1024px",
        "industrial_79": "1280x400"
      },
      "layout": "grid-adaptive",
      "orientation": "landscape-optimized"
    },
    "display": {
      "primaryColor": "#42b883",
      "backgroundGradient": "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      "cardShadow": "0 2px 8px rgba(0,0,0,0.1)",
      "borderRadius": "8px",
      "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    "animation": {
      "enableTransitions": true,
      "pulseAnimation": "pulse 1s infinite",
      "hoverEffects": true,
      "alertBlink": "alertBlink 2s infinite"
    },
    "touch": {
      "minTouchTarget": "44px",
      "swipeEnabled": false,
      "hapticFeedback": true
    }
  },
  "data": {
    "defaults": {
      "refreshRate": 500,
      "alertsEnabled": true,
      "recordingEnabled": false,
      "maxHistoryPoints": 500,
      "sensorCount": 6
    },
    "sensors": {
      "defaultTypes": ["pressure", "flow_rate", "resistance", "leak_rate", "co2_level", "particle_count"],
      "statusLevels": ["normal", "warning", "critical"],
      "trendTypes": ["stable", "rising", "falling"],
      "refreshRates": [100, 250, 500, 1000, 2000]
    },
    "validation": {
      "valueRange": {
        "min": -1000,
        "max": 100000
      },
      "refreshRateRange": {
        "min": 100,
        "max": 10000
      }
    }
  },
  "security": {
    "auditEvents": [
      "REALTIME_SENSORS_INIT",
      "REALTIME_SENSORS_MONITORING_STARTED", 
      "REALTIME_SENSORS_MONITORING_STOPPED",
      "REALTIME_SENSORS_RECORDING_TOGGLED",
      "REALTIME_SENSORS_DATA_EXPORT",
      "REALTIME_SENSORS_ALERT",
      "REALTIME_SENSORS_CLEANUP"
    ],
    "inputSanitization": true,
    "dataValidation": true,
    "sessionTracking": true,
    "exportLimits": {
      "maxExportSize": "10MB",
      "dailyExportLimit": 50
    }
  },
  "performance": {
    "caching": {
      "enabled": true,
      "cacheDuration": 300000,
      "maxCacheSize": "5MB"
    },
    "optimization": {
      "lazyLoading": true,
      "componentBundling": true,
      "assetOptimization": true
    },
    "monitoring": {
      "memoryUsage": true,
      "renderTime": true,
      "updateFrequency": true
    }
  },
  "accessibility": {
    "ariaLabels": true,
    "keyboardNavigation": true,
    "screenReaderSupport": true,
    "highContrast": true,
    "focusManagement": true,
    "semanticElements": true
  },
  "i18n": {
    "defaultLanguage": "pl",
    "supportedLanguages": ["pl", "en", "de"],
    "translationKeys": {
      "title": "sensors.realtime_title",
      "controls": "sensors.controls",
      "status": "sensors.status", 
      "alerts": "sensors.alerts",
      "export": "sensors.export",
      "recording": "sensors.recording"
    },
    "dateTimeFormat": {
      "pl": "DD.MM.YYYY HH:mm:ss",
      "en": "MM/DD/YYYY HH:mm:ss", 
      "de": "DD.MM.YYYY HH:mm:ss"
    }
  },
  "testing": {
    "unitTests": true,
    "integrationTests": true,
    "e2eTests": false,
    "coverageThreshold": 90,
    "mockData": true,
    "testEnvironments": ["jsdom", "happy-dom"]
  },
  "deployment": {
    "buildTarget": "es2020",
    "moduleFormat": "esm",
    "bundleSize": {
      "target": "50KB",
      "warning": "75KB",
      "error": "100KB"
    },
    "compatibility": {
      "browsers": ["Chrome >= 88", "Firefox >= 78", "Safari >= 14", "Edge >= 88"],
      "node": ">=16.0.0"
    }
  }
}
```

### Metadane

*Brak metadanych*

---


## Statystyki

- **Łączna liczba modułów:** 8
- **Data generowania:** 2025-09-26 20:34:25
- **Wygenerowane przez:** scripts/generate-docs.sh

---

*Ta dokumentacja została wygenerowana automatycznie. Aby ją zaktualizować, uruchom `make docs`.*
