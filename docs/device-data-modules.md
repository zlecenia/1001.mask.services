# Device Data Modules Documentation

## Overview

The MASKTRONIC C20 device data system has been modularized into four specialized components coordinated by an orchestrator pattern. This architecture improves maintainability, scalability, and code organization.

## Architecture

### Orchestrator Pattern
- **Main File**: `js/device-data-enhanced.js`
- **Role**: Coordinates all modular components and provides unified API
- **Components**: Sensor monitoring, pressure visualization, device history, alarm management

### Module Loading Order
```javascript
// Load modules before orchestrator
sensor-monitoring.js      → Core sensor data collection
pressure-visualization.js → Real-time pressure charts  
device-history.js        → Device maintenance tracking
alarm-management.js      → Centralized alarm handling
device-data-enhanced.js  → Orchestrator coordination
```

## Module Documentation

### 1. Sensor Monitoring Module
**File**: `js/modules/sensor-monitoring.js`

#### Responsibilities
- Real-time sensor data collection (pressure, flow, temperature, humidity)
- Sensor reading simulation with realistic fluctuations
- Alarm threshold monitoring and detection
- Display updates for sensor panels

#### Key Methods
```javascript
startRealTimeMonitoring()  // Begin 1-second interval updates
stopRealTimeMonitoring()   // Stop monitoring
getSensorData()            // Get current sensor readings Map
getSensorPanel()           // Get sensor configuration object
updateSensorReadings()     // Simulate new sensor values
checkAlarms()              // Monitor threshold violations
```

#### Configuration
```javascript
sensorPanel = {
    pressure: {
        low: { min: 8, max: 12, unit: 'mbar', current: 10.0 },
        medium: { min: 18, max: 22, unit: 'bar', current: 20.0 },
        high: { min: 28, max: 32, unit: 'bar', current: 30.0 }
    },
    flow: {
        inlet: { current: 0, unit: 'l/min', max: 50 },
        outlet: { current: 0, unit: 'l/min', max: 45 }
    },
    temperature: { current: 22.5, unit: '°C', min: 18, max: 35 },
    humidity: { current: 45, unit: '%', min: 30, max: 70 }
}
```

### 2. Pressure Visualization Module
**File**: `js/modules/pressure-visualization.js`

#### Responsibilities
- Real-time pressure charts (60-second rolling window)
- Interactive chart rendering with tooltips
- Color-coded pressure range indicators
- Chart data export for reports

#### Key Methods
```javascript
updateCharts(sensorPanel)     // Update all pressure charts
renderPressureChart(type)     // Render individual chart (low/medium/high)
exportChartData(type)         // Export chart data for reports
getStatistics()               // Get current chart statistics
reset()                       // Clear all chart data
```

#### Features
- **60-second data history**: Rolling window of last 60 sensor readings
- **Color coding**: Green (normal), Orange (high), Red (low pressure)
- **Interactive tooltips**: Hover to see value and timestamp
- **Smooth animations**: CSS transitions for data updates

### 3. Device History Module
**File**: `js/modules/device-history.js`

#### Responsibilities
- Device operational history tracking
- Predictive maintenance scheduling
- Test count and operating hours monitoring
- Maintenance alerts and recommendations

#### Key Methods
```javascript
recordTest(deviceId, testData)     // Log new test execution
getDeviceStatus(deviceId)          // Get comprehensive device status
calculateMaintenanceSchedule()     // Predict maintenance needs
checkMaintenanceAlerts()           // Check overdue maintenance
exportHistory(deviceId)            // Export history for reports
```

#### Predictive Maintenance
```javascript
// Maintenance schedule calculation
routine: every 90 days           // Regular maintenance
calibration: every 180 days      // Sensor calibration
deepInspection: every 365 days   // Annual deep inspection
predictive: based on usage       // AI-driven predictions
```

#### Health Scoring
- **Operating hours impact**: Deducts points for high usage (>3000h)
- **Test count impact**: Monitors excessive test cycles (>1000)
- **Maintenance compliance**: Penalizes overdue maintenance
- **Recent maintenance bonus**: Rewards timely maintenance

### 4. Alarm Management Module
**File**: `js/modules/alarm-management.js`

#### Responsibilities
- Centralized alarm handling and notifications
- Visual and audio alarm presentation
- Alarm acknowledgment and history tracking
- Browser notifications (if permissions granted)

#### Key Methods
```javascript
handleAlarm(alarm)           // Process incoming alarm
acknowledgeAlarm(alarmId)    // Mark alarm as acknowledged
acknowledgeAllAlarms()       // Acknowledge all active alarms
clearAllAlarms()             // Clear all alarms
exportAlarmData()            // Export alarm data for reports
```

#### Alarm Types
```javascript
PRESSURE_LOW          // Low pressure detection
PRESSURE_HIGH         // High pressure detection
FLOW_ABNORMAL         // Abnormal flow rates
TEMPERATURE_OUT_OF_RANGE  // Temperature alerts
HUMIDITY_OUT_OF_RANGE     // Humidity alerts
CALIBRATION_DUE           // Calibration overdue
MAINTENANCE_OVERDUE       // Maintenance overdue
```

#### Severity Levels
- **CRITICAL**: Requires immediate attention (red)
- **HIGH**: Important but not critical (orange)
- **MEDIUM**: Moderate priority (yellow)
- **LOW**: Informational (blue)

## Integration Points

### Orchestrator Coordination
```javascript
class DeviceDataEnhanced {
    constructor() {
        this.sensorMonitoring = new SensorMonitoring();
        this.pressureVisualization = new PressureVisualization();
        this.deviceHistory = new DeviceHistory();
        this.alarmManagement = new AlarmManagement();
        this.setupComponentIntegration();
    }
    
    setupComponentIntegration() {
        // Integrate pressure visualization with sensor updates
        // Route alarms to alarm management
        // Coordinate component lifecycle
    }
}
```

### Data Flow
1. **Sensor Monitoring** → Collects real-time data every second
2. **Pressure Visualization** → Updates charts with sensor data
3. **Alarm Management** → Processes threshold violations
4. **Device History** → Records test executions and maintenance

## Usage Examples

### Starting Real-time Monitoring
```javascript
const deviceData = window.deviceDataEnhanced;
deviceData.startRealTimeMonitoring();
```

### Recording a Test
```javascript
deviceData.recordDeviceTest('device_001', {
    type: 'QUICK_TEST',
    duration: 0.25, // hours
    result: 'PASSED',
    operator: 'OPERATOR_ID'
});
```

### Getting Pressure Statistics
```javascript
const stats = deviceData.getPressureStatistics();
console.log('Pressure stats:', stats);
// Output: { low: {current: 10.1, average: 10.0, min: 9.8, max: 10.3}, ... }
```

### Handling Alarms
```javascript
// Acknowledge specific alarm
deviceData.acknowledgeAlarm('alarm_id_123');

// Get active alarms
const activeAlarms = deviceData.getActiveAlarms();
```

## Configuration

### Sensor Thresholds
Modify `sensor-monitoring.js` to adjust alarm thresholds:
```javascript
setupAlarmThresholds() {
    this.alarmThresholds.set('pressure_low', { min: 8, max: 12 });
    this.alarmThresholds.set('pressure_medium', { min: 18, max: 22 });
    // ... additional thresholds
}
```

### Chart Settings
Modify `pressure-visualization.js` for chart customization:
```javascript
// Change data history length (default: 60 seconds)
this.pressureHistory[type] = new Array(120).fill(0); // 2 minutes

// Modify color schemes
getPressureColor(type, value) {
    // Custom color logic
}
```

### Maintenance Intervals
Modify `device-history.js` for maintenance scheduling:
```javascript
calculateMaintenanceSchedule(device) {
    return {
        routine: this.getNextMaintenanceDate(device.lastMaintenance, 60), // 2 months
        calibration: this.getNextMaintenanceDate(device.calibrationDate, 120), // 4 months
        // ... custom intervals
    };
}
```

## Performance Considerations

### Memory Management
- **Sensor data**: Limited to current readings (no historical storage)
- **Pressure charts**: Fixed 60-point rolling window
- **Alarm history**: Capped at 1000 entries
- **Device history**: Last 100 tests per device

### Update Frequency
- **Sensor monitoring**: 1-second intervals during active monitoring
- **Chart updates**: Synchronized with sensor updates
- **Alarm checks**: Every sensor update cycle
- **History persistence**: On test completion and periodic saves

### Browser Compatibility
- **ES6 Classes**: Modern browser support required
- **Local Storage**: Used for history persistence
- **Canvas/SVG**: Not used (pure CSS/HTML charts)
- **Web Workers**: Not implemented (single-threaded)

## Troubleshooting

### Common Issues

1. **Charts not updating**
   - Verify sensor monitoring is active: `deviceData.isMonitoringActive()`
   - Check DOM elements exist: `document.getElementById('pressure-low-dia')`

2. **Alarms not triggering**
   - Verify alarm thresholds: `sensorMonitoring.alarmThresholds`
   - Check sensor values: `sensorMonitoring.getSensorData()`

3. **History not saving**
   - Check localStorage permissions
   - Verify device IDs match expected format

### Debug Commands
```javascript
// Check orchestrator status
console.log(window.deviceDataEnhanced);

// Verify module loading
console.log(window.SensorMonitoring);
console.log(window.PressureVisualization);
console.log(window.DeviceHistory);
console.log(window.AlarmManagement);

// Get current sensor readings
console.log(deviceData.getSensorData());

// Export all data for analysis
console.log(deviceData.exportDeviceHistory());
console.log(deviceData.exportAlarmData());
```

## Future Enhancements

### Planned Features
- **WebSocket integration** for real sensor data
- **Machine learning** predictive maintenance
- **Advanced charting** with zoom and pan
- **Export to Excel/PDF** for reports
- **Multi-device support** for enterprise deployments

### Extension Points
- **Custom sensors**: Add new sensor types to `sensor-monitoring.js`
- **Chart types**: Extend `pressure-visualization.js` with line/bar charts  
- **Alarm rules**: Add complex alarm logic to `alarm-management.js`
- **Maintenance policies**: Customize scheduling in `device-history.js`

---

**Last Updated**: 2024-01-20  
**Version**: 1.0.4  
**Maintainer**: MASKTRONIC Development Team
