# AppHeader Module v0.1.0

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
