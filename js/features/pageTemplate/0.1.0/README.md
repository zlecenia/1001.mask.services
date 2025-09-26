# PageTemplate Module v0.1.0

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
