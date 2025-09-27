# MASKSERVICE C20 1001 - Components Specification
tree -I 'node_modules'
tree -d -I 'node_modules'
```bash
├── backups
│   ├── backup-20250926-201225
│   │   ├── dist
│   │   │   └── assets
│   │   ├── docs
│   │   ├── js
│   │   │   ├── features
│   │   │   │   ├── appFooter
│   │   │   │   │   └── 0.1.0
│   │   │   │   ├── appHeader
│   │   │   │   │   └── 0.1.0
│   │   │   │   ├── auditLogViewer
│   │   │   │   │   └── 0.1.0
│   │   │   │   ├── loginForm
│   │   │   │   │   └── 0.1.0
│   │   │   │   ├── mainMenu
│   │   │   │   │   └── 0.1.0
│   │   │   │   ├── pageTemplate
│   │   │   │   │   └── 0.1.0
│   │   │   │   └── pressurePanel
│   │   │   │       └── 0.1.0
│   │   │   ├── services
│   │   │   └── store
│   │   │       └── modules
│   │   └── scripts
│   └── backup-20250926-203426
│       └── assets
├── config
│   ├── app
│   ├── menu
│   ├── router
│   ├── system
│   ├── test-scenarios
│   └── workshop
├── configs
│   ├── _backups
│   ├── _generated
│   ├── _schemas
│   └── _templates
├── css
├── deployed
│   └── assets
├── dist
│   └── assets
├── docs
├── js
│   ├── features
│   │   ├── appFooter
│   │   │   └── 0.1.0
│   │   ├── appHeader
│   │   │   └── 0.1.0
│   │   ├── auditLogViewer
│   │   │   └── 0.1.0
│   │   ├── deviceData
│   │   │   └── 0.1.0
│   │   ├── loginForm
│   │   │   └── 0.1.0
│   │   ├── mainMenu
│   │   │   └── 0.1.0
│   │   ├── pageTemplate
│   │   │   └── 0.1.0
│   │   ├── pressurePanel
│   │   │   └── 0.1.0
│   │   ├── realtimeSensors
│   │   │   └── 0.1.0
│   │   └── systemSettings
│   │       └── 0.1.0
│   ├── services
│   └── store
│       └── modules
├── locales
├── modules
├── scripts
└── tools
    ├── generators
    ├── init
    ├── sync
    └── validators

```
## Overview

This document provides a comprehensive specification of all Vue 3 components in the MASKSERVICE industrial monitoring system, optimized for 7.9" LCD IPS displays (1280x400px landscape). The system uses a modular architecture with versioned components, role-based access control, and real-time sensor monitoring.

## System Architecture

### Core Principles
- **Modular Design**: Each component is self-contained with its own configuration, styles, and logic
- **Version Control**: All components are versioned using semantic versioning (0.1.0)
- **Role-Based Access**: Four distinct user roles with specific permissions
- **Real-Time Monitoring**: WebSocket-based live data updates
- **Touch Optimization**: Designed for industrial touch interfaces
- **Accessibility**: Full ARIA support and keyboard navigation

### Technology Stack
- **Framework**: Vue 3 with Composition API
- **State Management**: Vuex 4
- **Routing**: Vue Router 4
- **Internationalization**: Vue-i18n
- **Testing**: Vitest + Vue Test Utils
- **Build Tool**: Vite

## Component Categories

### Layout Components
Components that define the overall application structure and page organization.

### Navigation Components
Components responsible for user navigation and menu systems.

### Authentication Components
Components handling user authentication and role management.

### Monitoring Components
Components for real-time data visualization and sensor monitoring.

---

## Component Specifications

## 1. pageTemplate

**Category**: Layout  
**Type**: Container Component  
**Version**: 0.1.0

### Purpose
The main layout container that defines the grid structure for the entire application, orchestrating the positioning of header, sidebar, content area, footer, and pressure panel.

### Structure
```
┌─────────────────────────────────────────┐
│                 appHeader               │
├─────────┬─────────────────┬─────────────┤
│mainMenu │   content-area  │pressurePanel│
│         │                 │             │
│         │                 │             │
├─────────┴─────────────────┴─────────────┤
│               appFooter                 │
└─────────────────────────────────────────┘
```

### Grid Layout
- **Rows**: `40px 1fr 30px` (header, content, footer)
- **Columns**: `180px 1fr 120px` (sidebar, content, pressure panel)
- **Total Height**: 400px (7.9" display optimized)
- **Total Width**: 1280px

### Configuration Options
- Component enable/disable toggles
- Responsive breakpoints
- Route-based content loading
- Error boundary handling
- Transition animations

### Child Components
- `appHeader`: Application header with device status
- `mainMenu`: Role-based navigation sidebar
- `appFooter`: System information footer
- `pressurePanel`: Real-time pressure monitoring
- Dynamic content area based on routing

### Responsive Behavior
- **Mobile (≤400px)**: Stacked layout
- **Tablet (≤768px)**: Responsive grid adjustments
- **Desktop (≥1024px)**: Full grid layout
- **7.9" Display**: Fixed optimized layout

---

## 2. appHeader

**Category**: Layout  
**Type**: Navigation Component  
**Version**: 0.1.0

### Purpose
Fixed header component displaying application branding, device status, connection information, and language selection.

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ MASKSERVICE C20  │  Device Status  │  🇵🇱 PL ▼     │
│                  │  Connection Info │               │
└─────────────────────────────────────────────────────┘
```

### Sections
1. **Left Section**: Application logo and branding
2. **Center Section**: Device status and connection information
3. **Right Section**: Language selector and user actions

### Device Status States
- **ONLINE**: Green indicator (#27ae60)
- **OFFLINE**: Red indicator (#e74c3c)  
- **CONNECTING**: Orange indicator (#f39c12)

### Language Support
- **Polish** (pl): Default language
- **English** (en): Secondary language
- **German** (de): Additional language

### Configuration
- Customizable status colors
- Toggle visibility of sections
- Device information format
- Language selector options

---

## 3. mainMenu

**Category**: Navigation  
**Type**: Menu Component  
**Version**: 0.1.0

### Purpose
Role-based navigation sidebar providing access to different system areas based on user permissions.

### Role-Based Menu Structure

#### OPERATOR (Green #27ae60)
- Dashboard
- Monitoring
**Permissions**: view_sensors, view_alerts

#### ADMIN (Orange #f39c12)
- Dashboard
- Monitoring  
- Tests
- Reports
- Users
**Permissions**: manage_tests, manage_reports, manage_users

#### SUPERUSER (Red #e74c3c)
- Dashboard
- Monitoring
- Tests
- Reports
- Users
- System
**Permissions**: full_system_access, config_edit

#### SERWISANT (Blue #3498db)
- Dashboard
- Monitoring
- Service
- Calibration
- Diagnostics
- Workshop
**Permissions**: service_mode, calibration, diagnostics

### Menu Item Structure
```javascript
{
  label: "Display Name",
  icon: "icon-name", 
  route: "/route-path",
  roles: ["ROLE1", "ROLE2"],
  order: 1
}
```

### Interactive Features
- Hover effects with background color change
- Active state highlighting
- Keyboard navigation support
- ARIA labels for accessibility

---

## 4. loginForm

**Category**: Authentication  
**Type**: Form Component  
**Version**: 0.1.0

### Purpose
Secure authentication form with virtual keyboard support, role selection, and session management.

### Form Structure
```
┌─────────────────────┐
│   Login to System   │
├─────────────────────┤
│ Username: [_______] │
│ Password: [_______] │
│ Role:     [OPERATOR▼]│
├─────────────────────┤
│ [1][2][3][4][5][6]  │ ← Virtual Keyboard
│ [q][w][e][r][t][y]  │
│ [a][s][d][f][g][h]  │
│ [SPACE] [⌫] [↵]     │
├─────────────────────┤
│      [LOGIN]        │
└─────────────────────┘
```

### Virtual Keyboard
- **QWERTY Layout**: Standard keyboard layout
- **Numeric Layout**: Numbers and basic symbols
- **Special Keys**: Space, Backspace, Enter
- **Touch Optimized**: 40px key height for industrial use

### Security Features
- Password encryption
- Brute force protection (3 attempts)
- Session timeout (30 minutes)
- Input validation and sanitization
- CSRF protection

### Role Selection
- Dropdown with four available roles
- Color-coded role indicators
- Default route assignment per role
- Permission validation

### Validation Rules
- Minimum password length: 3 characters
- Maximum login attempts: 3
- Lockout duration: 5 minutes
- Session timeout: 30 minutes

---

## 5. appFooter

**Category**: Layout  
**Type**: Information Component  
**Version**: 0.1.0

### Purpose
Fixed footer displaying system information, user status, device status, and operational data.

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ System: v1.0.0 │ User: OPERATOR │ Status: ● ONLINE │
└─────────────────────────────────────────────────────┘
```

### Information Sections

#### System Information
- Application version
- Build information
- System uptime
- Memory usage

#### User Information  
- Current user role
- Login timestamp
- Session remaining time
- Last activity

#### Device Status
- Connection status indicator
- Last ping time
- Network latency
- Data quality metrics

### Status Indicators
- **Online**: Green circle (●)
- **Offline**: Red circle (●)
- **Warning**: Orange circle (●)
- **Unknown**: Gray circle (●)

### Configuration Options
- Toggle section visibility
- Custom status colors
- Information display format
- Update intervals

---

## 6. pressurePanel

**Category**: Monitoring  
**Type**: Data Visualization Component  
**Version**: 0.1.0

### Purpose
Real-time pressure monitoring panel with circular gauges, alerts, and trend indicators for industrial sensor data.

### Layout Structure
```
┌─────────────┐
│      P1     │
│   ╭─────╮   │
│  ╱  5.2  ╲  │
│ │   bar   │ │
│  ╲       ╱  │
│   ╰─────╯   │
├─────────────┤
│      P2     │
│   ╭─────╮   │
│  ╱  2.1  ╲  │
│ │   bar   │ │
│  ╲       ╱  │
│   ╰─────╯   │
├─────────────┤
│      P3     │
│   ╭─────╮   │
│  ╱  450  ╲  │
│ │  mbar  │ │
│  ╲       ╱  │
│   ╰─────╯   │
└─────────────┘
```

### Sensor Configuration

#### Pressure 1 (P1)
- **Range**: 0-10 bar
- **Normal**: 2-8 bar
- **Warning**: 1.5-9 bar
- **Critical**: <1.5 or >9 bar

#### Pressure 2 (P2)  
- **Range**: 0-5 bar
- **Normal**: 1-4 bar
- **Warning**: 0.5-4.5 bar
- **Critical**: <0.5 or >4.5 bar

#### Pressure 3 (P3)
- **Range**: 0-1000 mbar
- **Normal**: 200-800 mbar
- **Warning**: 100-900 mbar
- **Critical**: <100 or >900 mbar

### Alert System
- **Visual Alerts**: Color-coded indicators
- **Blinking Alerts**: Critical status blinking
- **Sound Alerts**: Configurable audio warnings
- **Alert Acknowledgment**: Required for critical alerts

### Real-Time Features
- **Update Interval**: 1 second
- **WebSocket Connection**: `ws://localhost:5000/ws/pressure`
- **Auto Reconnection**: 5 attempts with 2-second delay
- **Data Retention**: 1000 points / 1 hour window

### Gauge Visualization
- **Size**: 80px diameter
- **Stroke Width**: 4px
- **Color Coding**: Normal/Warning/Critical states
- **Text Display**: Value and unit
- **Trend Indicators**: Up/Down/Stable arrows

---

## State Management

### Vuex Store Structure
```javascript
{
  auth: {
    isAuthenticated: false,
    currentUser: null,
    role: null,
    permissions: []
  },
  navigation: {
    currentRoute: '/dashboard',
    menuState: 'collapsed'
  },
  sensors: {
    pressure1: { value: 0, status: 'unknown' },
    pressure2: { value: 0, status: 'unknown' },
    pressure3: { value: 0, status: 'unknown' }
  },
  system: {
    deviceStatus: 'OFFLINE',
    connectionInfo: {},
    language: 'pl'
  }
}
```

## Module-Based Architecture with Config Validation

The system now uses a comprehensive module-based architecture with automated configuration validation, schema generation, and CRUD management.

### Module Structure
```
modules/
├── [moduleName]/
│   └── [version]/
│       ├── config.json          # Source configuration
│       ├── package.json         # Module metadata
│       ├── index.js            # Module implementation
│       ├── [moduleName].vue    # Vue component (if applicable)
│       ├── [moduleName].test.js # Test suite
│       ├── README.md           # Documentation
│       ├── TODO.md             # Task tracking
│       └── CHANGELOG.md        # Version history
```

### Configuration System
```
configs/
├── _templates/                 # Configuration templates
├── _schemas/                   # Global schemas
├── _generated/                 # Generated configurations
├── _backups/                   # Automatic backups
└── [moduleName]_[section]/     # Module configurations
    ├── data.json              # Configuration data
    ├── schema.json            # JSON schema (generated/manual)
    └── crud.json              # CRUD rules (generated/manual)
```

### Standard Configuration Sections
1. **component**: Metadata and identification
2. **ui**: Visual styling and layout options  
3. **api**: API connection settings
4. **data**: Data management and caching
5. **accessibility**: ARIA and keyboard navigation
6. **performance**: Caching and optimization

### Example Module Configuration
```json
{
  "component": {
    "name": "componentName",
    "displayName": "Human Readable Name",
    "type": "component",
    "category": "ui-component",
    "version": "0.1.0",
    "enabled": true,
    "dependencies": ["vue"]
  },
  "ui": {
    "enabled": true,
    "theme": "default",
    "responsive": true,
    "touchOptimized": true,
    "accessibility": {
      "ariaLabels": true,
      "keyboardNavigation": true,
      "highContrast": false
    }
  },
  "api": {
    "baseUrl": "http://localhost:3000/api",
    "timeout": 30000,
    "retries": 3,
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### Development Workflow

#### 1. Module Creation
```bash
# Create a new module interactively
npm run module:init

# Initialize all existing modules
npm run module:init-all

# List all modules and their status
npm run module:list
```

#### 2. Configuration Management
```bash
# Generate schemas from data
npm run schema:generate

# Generate CRUD rules from schemas
npm run crud:generate

# Validate all configurations
npm run validate-all

# Update configurations after changes
npm run update
```

#### 3. Development Workflow
```bash
# Watch for configuration changes
npm run config:watch

# Sync module configs to centralized configs
npm run config:sync

# Clean generated files
npm run clean

# Create backup
npm run backup
```

#### 4. Manual Configuration Editing
To mark configurations as manually edited and preserve changes:

```json
{
  "_manual": true,
  "_modified": "2025-01-26T10:00:00Z",
  "_comment": "Manually adjusted validation rules",
  "type": "object",
  "properties": {
    // your manual changes...
  }
}
```

### Schema Validation
Each configuration section automatically generates:

- **JSON Schema**: Validates data structure and types
- **CRUD Rules**: Defines field editability and UI hints
- **Validation**: Runtime validation with detailed error reporting

### SDK Generation
Generate SDKs for different programming languages:

```bash
# JavaScript SDK
npm run sdk:js

# Python SDK  
npm run sdk:python

# Go SDK
npm run sdk:go

# All SDKs
npm run sdk:generate
```

### Development Tools

The system includes a comprehensive set of development tools:

#### Generators
- **schemaGenerator.js**: Generates JSON schemas from config data with type inference
- **crudGenerator.js**: Creates CRUD rules with field types, validation, and UI hints
- **sdkGenerator.js**: Generates SDKs for JavaScript, Python, and Go

#### Validators
- **configValidator.js**: Validates configurations against schemas
- **schemaValidator.js**: Validates JSON schema structure and best practices
- **crudValidator.js**: Validates CRUD rules for consistency and correctness

#### Initialization Tools
- **initComponent.js**: Interactive component creation wizard
- **initAll.js**: Batch initialization of all modules
- **listModules.js**: Module inventory and status reporting

#### Synchronization Tools
- **syncConfigs.js**: Synchronizes module configs with centralized configs
- **watchConfigs.js**: Watches for file changes and auto-regenerates

#### Utility Tools
- **clean.js**: Cleanup tool for generated files and backups
- **backup.js**: Backup and restore system for configurations

### Best Practices

1. **Always validate** configurations before committing:
   ```bash
   npm run validate-all
   ```

2. **Use manual markers** for custom edits:
   ```json
   { "_manual": true, "_comment": "Custom validation rules" }
   ```

3. **Keep backups** before major changes:
   ```bash
   npm run backup
   ```

4. **Watch during development**:
   ```bash
   npm run config:watch
   ```

5. **Generate SDKs** for external integrations:
   ```bash
   npm run sdk:generate
   ```

## Testing Strategy

### Test Coverage
- **Unit Tests**: Component logic and methods
- **Integration Tests**: Component interactions
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Performance Tests**: Rendering and update speed
- **Visual Tests**: Layout and responsive design

### Test Environment
- **Framework**: Vitest + Vue Test Utils
- **Mocking**: Reactive store mocking for Vue reactivity
- **Event Testing**: Specific `mousedown` events for virtual keyboard
- **DOM Testing**: Precise selector specificity

### Test Results
- **Total Tests**: 174 passing
- **appFooter**: 64/64 tests passing
- **appHeader**: Tests pending implementation
- **mainMenu**: 42/42 tests passing  
- **loginForm**: 43/43 tests passing
- **pageTemplate**: 25/25 tests passing
- **pressurePanel**: Tests pending implementation

## Performance Considerations

### 7.9" Display Optimization
- **Fixed Layout**: No responsive breakpoints needed
- **Touch Targets**: Minimum 40px height/width
- **Font Sizes**: Optimized for 1280x400 resolution
- **Contrast**: High contrast for industrial environments

### Performance Features
- **Component Caching**: Enabled where appropriate
- **Lazy Loading**: Route-based component loading
- **Throttling**: Real-time data update throttling
- **Memory Management**: Automatic cleanup and disposal

## Security Features

### Authentication & Authorization
- **Role-Based Access Control**: Four distinct roles
- **Session Management**: 30-minute timeout
- **Password Security**: Encryption and validation
- **Audit Logging**: User action tracking

### Input Validation
- **Form Validation**: Client and server-side
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based validation
- **SQL Injection Prevention**: Parameterized queries

## Internationalization

### Supported Languages
- **Polish (pl)**: Default system language
- **English (en)**: Secondary language  
- **German (de)**: Additional language support

### Translation Keys
```javascript
{
  "auth.login": "Zaloguj",
  "auth.username": "Nazwa użytkownika", 
  "auth.password": "Hasło",
  "auth.role": "Rola",
  "nav.dashboard": "Panel główny",
  "nav.monitoring": "Monitoring",
  "system.status": "Status",
  "alerts.critical": "Krytyczny"
}
```

## Deployment & Environment

### Production Configuration
- **API Base URL**: Configurable via environment
- **WebSocket URL**: Real-time data connection
- **Session Timeout**: 30 minutes default
- **Update Intervals**: Configurable per component

### Browser Support
- **Chrome**: v90+ (primary target)
- **Firefox**: v88+ (secondary)
- **Edge**: v90+ (secondary)
- **Safari**: v14+ (limited support)

### Hardware Requirements
- **Display**: 7.9" LCD IPS 1280x400px
- **Touch**: Capacitive touch support
- **Network**: WebSocket-capable connection
- **Memory**: 2GB RAM minimum

## Development Guidelines

### Code Style
- **Vue 3 Composition API**: Preferred approach
- **TypeScript**: Optional but recommended
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting

### Component Structure
```
component-name/
├── 0.1.0/
│   ├── index.js          # Module metadata
│   ├── componentName.js  # Vue component
│   ├── config.json       # Configuration
│   ├── package.json      # Manifest
│   ├── README.md         # Documentation
│   ├── TODO.md           # Task list
│   └── CHANGELOG.md      # Version history
```

### Naming Conventions
- **Components**: PascalCase (e.g., `MainMenu`)
- **Files**: camelCase (e.g., `mainMenu.js`)
- **CSS Classes**: kebab-case (e.g., `.main-menu`)
- **Variables**: camelCase (e.g., `currentUser`)

## Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time sensor data
- **Advanced Analytics**: Trend analysis and reporting
- **Mobile Responsiveness**: Tablet and phone support
- **Additional Languages**: Extended i18n support
- **Theme System**: Light/dark mode switching

### Technical Roadmap
- **Vue 3.4**: Upgrade to latest Vue version
- **Vite 5**: Build system improvements
- **TypeScript**: Full TypeScript migration
- **PWA**: Progressive Web App features
- **CI/CD**: Automated testing and deployment

---

## Conclusion

This component specification provides a comprehensive overview of the MASKSERVICE C20 1001 system architecture, individual component specifications, and development guidelines. The modular design ensures maintainability, scalability, and testability while meeting the specific requirements of industrial touch-screen applications.

For detailed implementation examples and API documentation, refer to the individual component README files in their respective directories.
