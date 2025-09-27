# DeviceData Component v0.1.0

Industrial device monitoring and sensor data management component for 1001.mask.services Vue.js application.

## Overview

The DeviceData component provides comprehensive monitoring and management capabilities for industrial IoT devices and their associated sensors. It offers real-time data visualization, battery monitoring, connection status tracking, data export functionality, and comprehensive security integration.

## Features

### 🏭 Industrial Device Monitoring
- **Real-time device status monitoring** - Online/Offline/Warning/Error states
- **Battery level tracking** with visual indicators and alerts
- **Firmware version display** and update notifications
- **Device uptime tracking** with formatted display
- **Connection status monitoring** with automatic reconnection
- **Device identification** and metadata management

### 📊 Sensor Data Management
- **Multi-sensor support** - Temperature, Humidity, Pressure, Air Quality, Noise, Vibration
- **Real-time data updates** with configurable refresh intervals
- **Sensor status classification** - Good/Warning/Critical states
- **Trend analysis** - Rising/Falling/Stable indicators
- **Threshold-based alerting** with customizable limits
- **Data validation** and range checking

### 📤 Data Export & Analytics
- **CSV data export** with comprehensive sensor history
- **Batch data processing** and filtering
- **Export scheduling** and automation support
- **Data format customization** and templating
- **Historical data retention** and archival

### 🔒 Security Integration
- **SecurityService integration** for audit logging
- **Role-based access control** (OPERATOR, ADMIN, SUPERUSER, SERWISANT)
- **Input validation** and sanitization
- **Session monitoring** and activity tracking
- **Comprehensive audit trail** for all operations
- **Data integrity protection** and validation

### 🌐 Multi-language Support
- **i18n integration** with Polish, English, German translations
- **Reactive language switching** with instant UI updates
- **Localized date/time formatting** and number formats
- **Cultural adaptations** for industrial terminology
- **RTL language support** preparation

### 📱 7.9" Display Optimization
- **Landscape orientation** optimization (1280x400px)
- **Touch-friendly interface** with large touch targets
- **Compact layout** for industrial displays
- **Responsive grid system** with automatic scaling
- **High contrast themes** for industrial environments
- **Gesture support** for navigation and controls

## Installation

### Prerequisites
- Vue.js 3.0+
- SecurityService v1.0+
- i18nService v1.0+
- FeatureRegistry system

### Setup
```javascript
// 1. Import the module
import deviceDataModule from './js/features/deviceData/0.1.0/index.js';

// 2. Register with FeatureRegistry
await FeatureRegistry.register('deviceData', deviceDataModule);

// 3. Component is now available at /device-data route
```

## Usage

### Basic Component Usage
```vue
<template>
  <DeviceDataComponent
    :user="currentUser"
    :language="currentLanguage"
    @navigate="handleNavigation"
    @device-status-changed="handleDeviceStatusChange"
    @back="handleBack"
  />
</template>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | Object | `{}` | Current user object with authentication info |
| `language` | String | `'pl'` | Current UI language (pl/en/de) |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `navigate` | `{ path: string }` | Navigation request |
| `device-status-changed` | `{ deviceId, status, batteryLevel }` | Device status update |
| `back` | - | Back navigation request |

### Device API Integration
```javascript
// Optional: Integrate with real device hardware
window.DeviceAPI = {
  async getDeviceStatus() {
    // Return device status object
    return {
      deviceId: 'DEVICE_001',
      status: 'ONLINE',
      batteryLevel: 85,
      firmwareVersion: '2.1.4',
      uptime: 3600,
      isConnected: true
    };
  },
  
  async getSensorData() {
    // Return sensor readings
    return {
      temperature: 22.5,
      humidity: 45,
      pressure: 1013.25,
      airQuality: 95,
      noise: 35.2,
      vibration: 0.08
    };
  }
};
```

## Configuration

### Component Configuration
```json
{
  "data": {
    "defaults": {
      "deviceId": "DEVICE_001",
      "updateFrequency": 2,
      "sensorThresholds": {
        "temperature": { "min": 18, "max": 25 },
        "humidity": { "min": 40, "max": 70 },
        "pressure": { "min": 1000, "max": 1020 }
      }
    }
  }
}
```

### Environment Configuration
```javascript
// Development mode with simulation
window.deviceDataConfig = {
  enableRealTimeUpdates: true,
  updateInterval: 2000,
  enableSimulation: true,
  enableAuditLogging: true,
  maxHistorySize: 1000
};
```

## API Reference

### Methods

#### `updateDeviceData()`
Manually refresh device and sensor data.
```javascript
await this.$refs.deviceData.updateDeviceData();
```

#### `exportDeviceData()`
Export current device data to CSV file.
```javascript
await this.$refs.deviceData.exportDeviceData();
```

#### `startDataUpdates()`
Begin automatic data updates at configured interval.
```javascript
this.$refs.deviceData.startDataUpdates();
```

#### `stopDataUpdates()`
Stop automatic data updates.
```javascript
this.$refs.deviceData.stopDataUpdates();
```

### Computed Properties

#### `sensorCards`
Array of sensor objects with current readings and status.
```javascript
[
  {
    id: 'temperature',
    name: 'Temperatura',
    value: '22.5°C',
    icon: '🌡️',
    status: 'good',
    trend: 'stable'
  }
  // ... more sensors
]
```

#### `sensorStats`
Statistics about sensor status distribution.
```javascript
{
  normal: 4,
  warning: 1,
  critical: 1
}
```

## Security

### Audit Events
The component logs the following security events:
- `device_data_component_init` - Component initialization
- `device_data_refresh` - Manual data refresh
- `device_data_updated` - Successful data update
- `device_data_export` - Data export attempt
- `device_data_exported` - Successful export
- `device_auto_update_started` - Auto-update enabled
- `device_auto_update_stopped` - Auto-update disabled

### Permissions
| Action | Required Roles |
|--------|---------------|
| View device data | OPERATOR, ADMIN, SUPERUSER, SERWISANT |
| Export data | ADMIN, SUPERUSER, SERWISANT |
| Modify settings | ADMIN, SUPERUSER |
| Configure thresholds | SUPERUSER |

### Input Validation
- Device ID format validation (alphanumeric + underscore)
- Sensor value range checking
- Update frequency limits (1-60 seconds)
- Battery level bounds (0-100%)

## Performance

### Optimization Features
- **Lazy loading** - Component loads on demand
- **Data caching** - 5-minute TTL for sensor readings
- **Throttled updates** - Prevents excessive API calls
- **Memory management** - Automatic cleanup of old data
- **Efficient rendering** - Virtual scrolling for large datasets

### Memory Usage
- Base component: ~2MB
- Sensor data history: ~100KB per 1000 readings
- Export cache: ~50KB per export session

### Update Frequencies
- Real-time updates: 2-second intervals (configurable)
- Battery level: 30-second intervals
- Connection status: 10-second intervals
- Sensor thresholds: On-demand validation

## Testing

### Unit Tests
```bash
# Run component tests
npm test js/features/deviceData/0.1.0/deviceData.test.js

# Test coverage
npm run test:coverage -- deviceData
```

### Integration Tests
- SecurityService integration
- i18n service integration
- Vuex store compatibility
- Real-time update handling
- Export functionality

### Manual Testing Scenarios
1. **Device Monitoring Workflow**
   - Load component with default device
   - Verify real-time sensor updates
   - Check battery level indicators
   - Validate connection status changes

2. **Data Export Process**
   - Export sensor data to CSV
   - Verify file download
   - Check data completeness
   - Validate CSV format

3. **Alert System**
   - Set sensor values outside thresholds
   - Verify alert notifications
   - Check status color changes
   - Test alert acknowledgment

4. **Multi-language Support**
   - Switch between PL/EN/DE languages
   - Verify all text translations
   - Check date/time formatting
   - Validate numeric formats

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Industrial Display Testing
- 7.9" landscape displays (1280x400px)
- Touch interface validation
- High contrast mode testing
- Ambient light adaptation

## Troubleshooting

### Common Issues

#### "No sensor data available"
**Cause**: DeviceAPI not configured or simulation disabled
**Solution**: 
```javascript
// Enable simulation mode
window.deviceDataConfig = { enableSimulation: true };
```

#### "Export fails silently"
**Cause**: Insufficient permissions or browser blocking downloads
**Solution**: Check user role and browser download settings

#### "Real-time updates stopped"
**Cause**: Component unmounted or interval cleared
**Solution**: 
```javascript
// Restart updates manually
this.$refs.deviceData.startDataUpdates();
```

#### "High memory usage"
**Cause**: Large sensor data history accumulation
**Solution**: 
```javascript
// Reduce history size
window.deviceDataConfig = { maxHistorySize: 500 };
```

### Debug Mode
```javascript
// Enable detailed logging
window.deviceDataConfig = {
  debugMode: true,
  verboseLogging: true
};
```

### Performance Monitoring
```javascript
// Monitor component performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('deviceData')) {
      console.log(`DeviceData ${entry.name}: ${entry.duration}ms`);
    }
  }
});
observer.observe({ entryTypes: ['measure'] });
```

## Development

### Local Development
```bash
# Start development server
npm run dev

# Navigate to component
http://localhost:3000/device-data
```

### Component Structure
```
deviceData/
├── 0.1.0/
│   ├── deviceData.js      # Main component
│   ├── config.json        # Configuration
│   ├── index.js          # FeatureRegistry integration
│   ├── README.md         # This documentation
│   ├── CHANGELOG.md      # Version history
│   ├── TODO.md           # Planned features
│   └── deviceData.test.js # Test suite
```

### Code Standards
- Vue 3 Composition API preferred
- ES6+ JavaScript features
- Comprehensive error handling
- Security-first development
- Accessibility compliance (WCAG 2.1 AA)

## Migration Notes

### From Legacy DeviceDataTemplate
This component replaces the legacy `DeviceDataTemplate.js` with:
- Vue 3 Composition API instead of Options API
- Modular architecture with FeatureRegistry
- Enhanced security with SecurityService
- Improved i18n integration
- Better performance optimizations
- 7.9" display optimization

### Breaking Changes from Legacy
- Component name changed from `DeviceDataTemplate` to `DeviceDataComponent`
- Props structure updated for Vue 3
- Event emission syntax updated
- SecurityService integration required
- Configuration moved to external config.json

### Migration Checklist
- [ ] Update component imports and registration
- [ ] Configure SecurityService integration
- [ ] Update i18n translation keys
- [ ] Test with real DeviceAPI if available
- [ ] Validate 7.9" display rendering
- [ ] Run comprehensive test suite
- [ ] Update routing configuration
- [ ] Configure audit logging

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## TODO

See [TODO.md](./TODO.md) for planned features and improvements.

## License

MIT License - Part of 1001.mask.services industrial monitoring system.

## Support

For technical support and bug reports:
- Create issue in project repository
- Contact development team
- Check troubleshooting section above
- Review component test suite for examples
