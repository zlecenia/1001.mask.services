# SystemSettings Component 0.1.0

Comprehensive system configuration and settings management component for industrial Vue.js applications.

## Overview

The SystemSettings component provides a complete interface for managing all aspects of system configuration including network settings, system parameters, device configuration, and security settings. Designed specifically for 7.9" industrial touch displays with enterprise-grade security integration.

## Features

### 🔧 **Core Functionality**
- **Network Configuration**: IP settings, DHCP, gateway, DNS configuration
- **System Parameters**: Update intervals, logging, backup, monitoring settings
- **Device Management**: Device naming, location, timezone, language preferences
- **Security Settings**: Session management, authentication, audit logging controls
- **Real-time Validation**: Input validation with immediate feedback
- **Settings Import/Export**: JSON-based configuration backup and restore
- **Network Testing**: Built-in connection testing and diagnostics

### 🏭 **Industrial Features**
- **7.9" Display Optimization**: Designed for 1280x400px landscape orientation
- **Touch Interface**: Large buttons and controls optimized for touch interaction
- **Multi-tab Interface**: Organized settings categories with tabbed navigation
- **Status Indicators**: Real-time system status and connection monitoring
- **Validation Feedback**: Clear error messages and validation indicators

### 🔒 **Security Integration**
- **SecurityService Integration**: Comprehensive audit logging for all operations
- **Role-based Access**: Granular permissions for different user roles
- **Input Sanitization**: Protection against XSS and injection attacks
- **Audit Trail**: Complete logging of all configuration changes
- **Session Monitoring**: Integration with security session management

### 🌐 **Multi-language Support**
- **i18n Integration**: Complete Polish, English, German translation support
- **Reactive Language Switching**: Instant language updates without reload
- **Localized Validation**: Language-specific error messages and formatting

## Installation

### Direct Import
```javascript
import { SystemSettingsComponent } from './js/features/systemSettings/0.1.0/systemSettings.js';
```

### FeatureRegistry Integration
```javascript
import systemSettingsModule from './js/features/systemSettings/0.1.0/index.js';

// Initialize the module
await systemSettingsModule.initialize(app, {
  development: true // Enable dev utilities
});
```

### Vue Router Setup
```javascript
const routes = [
  {
    path: '/settings',
    name: 'systemSettings',
    component: SystemSettingsComponent,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'SUPERUSER', 'SERWISANT']
    }
  }
];
```

## Usage

### Basic Component Usage
```vue
<template>
  <SystemSettingsComponent
    :user="currentUser"
    :language="currentLanguage"
    @settings-changed="handleSettingsChanged"
    @navigate="handleNavigation"
    @back="handleBack"
  />
</template>

<script>
import { SystemSettingsComponent } from './js/features/systemSettings/0.1.0/systemSettings.js';

export default {
  components: {
    SystemSettingsComponent
  },
  data() {
    return {
      currentUser: {
        username: 'admin',
        role: 'ADMIN'
      },
      currentLanguage: 'pl'
    };
  },
  methods: {
    handleSettingsChanged(settings) {
      console.log('Settings changed:', settings);
    },
    handleNavigation(route) {
      this.$router.push(route.path);
    },
    handleBack() {
      this.$router.go(-1);
    }
  }
};
</script>
```

### Vuex Store Integration
```javascript
// Register the store module
this.$store.registerModule('systemSettings', systemSettingsModule.storeModule);

// Access settings state
const networkSettings = this.$store.state.systemSettings.networkSettings;
const hasUnsavedChanges = this.$store.getters['systemSettings/hasUnsavedChanges'];

// Dispatch actions
await this.$store.dispatch('systemSettings/saveSettings');
await this.$store.dispatch('systemSettings/testNetworkConnection');
```

## API Reference

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | Object | `{}` | Current user object with username and role |
| `language` | String | `'pl'` | Current interface language (pl/en/de) |
| `activeTab` | String | `'network'` | Initially active settings tab |

### Component Events

| Event | Payload | Description |
|-------|---------|-------------|
| `settings-changed` | `{ network, system, device, security }` | Emitted when settings are saved |
| `navigate` | `{ path }` | Emitted for navigation requests |
| `back` | - | Emitted when back button is clicked |

### Settings Data Structure

#### Network Settings
```javascript
{
  ipAddress: '192.168.1.10',      // Device IP address
  port: 8080,                     // Communication port
  dhcpEnabled: false,             // DHCP enable/disable
  gateway: '192.168.1.1',         // Gateway IP
  dnsServer: '8.8.8.8',          // DNS server IP
  connectionTimeout: 30           // Connection timeout (seconds)
}
```

#### System Configuration
```javascript
{
  updateInterval: 5,              // Data update interval (seconds)
  debugMode: false,               // Debug mode enable/disable
  logLevel: 'INFO',               // Logging level
  maxLogFiles: 10,                // Maximum log files to keep
  autoBackup: true,               // Automatic backup enable/disable
  backupInterval: 24,             // Backup interval (hours)
  dataRetention: 365,             // Data retention period (days)
  enableMonitoring: true          // System monitoring enable/disable
}
```

#### Device Settings
```javascript
{
  deviceName: 'MASKTRONIC-001',   // Device identifier
  location: 'Production Floor',   // Physical location
  timezone: 'Europe/Warsaw',      // Timezone setting
  language: 'pl',                 // Interface language
  units: 'metric',                // Measurement units
  precision: 2                    // Decimal precision
}
```

#### Security Settings
```javascript
{
  sessionTimeout: 30,             // Session timeout (minutes)
  maxLoginAttempts: 3,            // Maximum login attempts
  passwordExpiry: 90,             // Password expiry (days)
  lockoutDuration: 15,            // Account lockout duration (minutes)
  enableTwoFactor: false,         // Two-factor authentication
  encryptionLevel: 'AES256',      // Encryption standard
  auditLogging: true,             // Audit logging enable/disable
  forcePasswordChange: true,      // Force password change on first login
  enableSessionMonitoring: true   // Session monitoring enable/disable
}
```

### Validation Rules

#### Network Validation
- **IP Address**: Must be valid IPv4 format (xxx.xxx.xxx.xxx)
- **Port**: Must be integer between 1-65535
- **Gateway**: Must be valid IPv4 format
- **DNS Server**: Must be valid IPv4 format
- **Connection Timeout**: Must be integer between 5-300 seconds

#### System Validation
- **Update Interval**: Must be integer between 1-3600 seconds
- **Data Retention**: Must be integer between 1-3650 days
- **Log Level**: Must be one of: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Max Log Files**: Must be integer between 1-100

#### Device Validation
- **Device Name**: Alphanumeric with dashes, max 50 characters
- **Location**: String, max 100 characters
- **Language**: Must be supported language code (pl/en/de)
- **Precision**: Must be integer between 0-6

#### Security Validation
- **Session Timeout**: Must be integer between 5-480 minutes
- **Max Login Attempts**: Must be integer between 1-10
- **Password Expiry**: Must be integer between 30-365 days
- **Lockout Duration**: Must be integer between 5-60 minutes

## Security

### Audit Events
The component logs the following security events:
- `system_settings_component_init` - Component initialization
- `system_settings_component_cleanup` - Component cleanup
- `network_connection_test` - Network test initiated
- `network_test_completed` - Network test completed
- `network_test_error` - Network test error
- `system_settings_save` - Settings save initiated
- `system_settings_saved` - Settings successfully saved
- `system_settings_save_error` - Settings save error
- `system_settings_reset` - Settings reset to defaults
- `settings_export` - Settings export initiated
- `settings_exported` - Settings successfully exported
- `settings_export_error` - Settings export error
- `settings_import` - Settings import initiated
- `settings_imported` - Settings successfully imported
- `settings_import_error` - Settings import error
- `security_report_generated` - Security report generated
- `audit_logs_cleared` - Audit logs cleared

### Role-based Permissions
- **VIEW**: OPERATOR, ADMIN, SUPERUSER, SERWISANT
- **MODIFY**: ADMIN, SUPERUSER, SERWISANT
- **EXPORT**: ADMIN, SUPERUSER, SERWISANT  
- **IMPORT**: SUPERUSER, SERWISANT
- **SECURITY_REPORT**: ADMIN, SUPERUSER, SERWISANT
- **CLEAR_LOGS**: SUPERUSER, SERWISANT

### Input Sanitization
All user inputs are automatically sanitized to prevent:
- XSS attacks through HTML injection
- Script injection attacks
- SQL injection attempts
- Path traversal attacks

## Performance

### Optimization Features
- **Debounced Validation**: Input validation with 500ms debounce
- **Lazy State Updates**: Efficient reactive state management
- **Memory Management**: Automatic cleanup on component unmount
- **Caching**: Settings cache with 5-minute timeout
- **Efficient Rendering**: Optimized Vue reactivity patterns

### Display Optimization
- **7.9" Display**: Optimized for 1280x400px landscape orientation
- **Touch Interface**: Large touch targets (minimum 44px)
- **Responsive Layout**: Adapts to different screen orientations
- **Performance Monitoring**: Built-in performance metrics

## Testing

### Unit Tests
```bash
npm test -- systemSettings
```

### Test Coverage
- **Functions**: 95% coverage target
- **Lines**: 90% coverage target
- **Statements**: 90% coverage target

### Test Categories
- **Component Rendering**: Template and styling tests
- **User Interactions**: Click, input, and navigation tests
- **Validation Logic**: Input validation and error handling
- **SecurityService Integration**: Audit logging and security tests
- **State Management**: Vuex store mutations and actions
- **i18n Integration**: Translation and localization tests

## Development

### Development Utilities
Access development utilities via browser console:
```javascript
// Reset settings to defaults
systemSettingsDevUtils.resetToDefaults();

// Simulate network test
systemSettingsDevUtils.simulateNetworkTest(true, 'Connection successful');

// Export current settings
const settings = systemSettingsDevUtils.exportCurrentSettings();

// Validate current settings
const validation = systemSettingsDevUtils.validateCurrentSettings();
```

### Configuration Override
```javascript
// Override default configuration
import systemSettingsModule from './index.js';
systemSettingsModule.config.ui.theme.primaryColor = '#custom-color';
```

## Troubleshooting

### Common Issues

#### Settings Not Saving
**Problem**: Settings changes are not persisted
**Solution**: 
1. Check SecurityService integration
2. Verify user permissions (ADMIN/SUPERUSER/SERWISANT required)
3. Ensure validation passes before saving
4. Check browser console for errors

#### Network Test Failing
**Problem**: Network connection test always fails
**Solution**:
1. Verify IP address format (xxx.xxx.xxx.xxx)
2. Check port range (1-65535)
3. Ensure network connectivity
4. Check SystemManager API availability

#### Validation Errors
**Problem**: Input validation showing incorrect errors
**Solution**:
1. Check input format against validation rules
2. Verify i18n translation keys exist
3. Check validation regex patterns
4. Ensure all required fields are filled

#### Import/Export Issues
**Problem**: Settings import/export not working
**Solution**:
1. Verify JSON file format
2. Check browser file access permissions
3. Ensure all required settings sections exist
4. Check for JSON syntax errors

### Debug Mode
Enable debug mode for additional logging:
```javascript
// Set debug mode in system config
systemConfig.debugMode = true;

// Enable console logging
localStorage.setItem('systemSettings_debug', 'true');
```

## Migration Notes

### From Legacy SystemSettingsTemplate
This component replaces the legacy `SystemSettingsTemplate.js` with:
- **Vue 3 Composition API**: Modern reactive patterns
- **Enhanced Security**: SecurityService integration
- **Improved Validation**: Real-time input validation
- **Better UX**: Optimized for industrial displays
- **Multi-language**: Complete i18n support

### Breaking Changes
- Component name changed from `SystemSettingsTemplate` to `SystemSettingsComponent`
- Props structure updated for better type safety
- Event names standardized with kebab-case
- Validation moved to reactive computed properties

### Migration Guide
1. Update component imports
2. Update event handlers for new event names
3. Verify prop structures match new API
4. Test all validation scenarios
5. Update any custom styling for new CSS classes

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## TODO

See [TODO.md](./TODO.md) for planned improvements and roadmap.

## License

Proprietary - 1001.mask.services Industrial Application

## Support

For technical support and bug reports, contact the development team.
