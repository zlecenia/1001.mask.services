# AppFooter Module v0.1.0

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
