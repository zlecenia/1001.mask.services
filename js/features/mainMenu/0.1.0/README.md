# MainMenu Module v0.1.0

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
