# RealtimeSensors Component 0.1.0

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
