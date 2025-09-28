# 🏛️ System Architecture - MASKSERVICE C20 1001

Complete architectural overview of the modular MASKSERVICE system with visual configuration management.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Security Model](#security-model)
5. [Integration Patterns](#integration-patterns)
6. [Performance Considerations](#performance-considerations)
7. [Scalability Design](#scalability-design)

---

## 🌐 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MASKSERVICE C20 1001                    │
│                   Industrial Control System                 │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼────┐            ┌─────▼─────┐          ┌─────▼─────┐
   │   UI    │            │   Core    │          │  Config   │
   │ Layer   │            │  System   │          │ Management│
   └─────────┘            └───────────┘          └───────────┘
        │                       │                       │
┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
│ 16 Components │       │ FeatureRegistry│       │  JSON Editor  │
│ - appHeader   │◄──────┤ - Discovery   │◄──────┤ - Visual Edit │
│ - mainMenu    │       │ - Lifecycle   │       │ - Validation  │
│ - loginForm   │       │ - State Mgmt  │       │ - Schema Sys  │
│ - jsonEditor  │       │ - Event Bus   │       │ - Safety      │
│ - ... 12 more │       └───────────────┘       └───────────────┘
└───────────────┘
```

### Core Principles

1. **Modularity** - Independent, versioned components
2. **Configuration-Driven** - Behavior controlled by JSON configs
3. **Visual Management** - JSON Editor for safe configuration
4. **Industrial Focus** - 7.9" display optimization
5. **Security First** - Role-based access and protected settings
6. **Quality Assurance** - Automated health monitoring

---

## 🧩 Component Architecture

### Component Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Discovery  │───▶│Initialization│───▶│  Operation  │
│             │    │             │    │             │
│ - Scan dirs │    │ - Load config│    │ - User int. │
│ - Validate  │    │ - Setup state│    │ - Events    │
│ - Register  │    │ - Mount Vue  │    │ - Updates   │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │            ┌─────────────┐    ┌─────────────┐
       └────────────│  Cleanup    │◄───│ Config Edit │
                    │             │    │             │
                    │ - Unmount   │    │ - JSON Edit │
                    │ - Save state│    │ - Validate  │
                    │ - Release   │    │ - Apply     │
                    └─────────────┘    └─────────────┘
```

### Standard Component Structure

```javascript
// Component Interface Contract
interface MaskServiceComponent {
  // Required exports
  component: VueComponent;          // Vue 3 component
  metadata: ComponentMetadata;      // Information & capabilities
  init(context): Promise<Result>;   // Initialization logic
  handle(action, params): Promise<Result>; // Action handling
  lifecycle: LifecycleHooks;        // Mount/unmount hooks
  
  // Optional exports
  validate?(config): ValidationResult;     // Config validation
  migrate?(oldVersion): MigrationResult;   // Version migration
  cleanup?(): void;                        // Resource cleanup
}

// Metadata Structure
interface ComponentMetadata {
  name: string;           // Component identifier
  version: string;        // Semantic version
  description: string;    // Purpose description
  author: string;         // Component author
  tags: string[];         // Classification tags
  category: ComponentCategory; // Functional category
  
  capabilities: {
    standalone: boolean;    // Can run independently
    configurable: boolean;  // Has configuration
    testable: boolean;      // Has test suite
    mockable: boolean;      // Supports mocking
  };
  
  dependencies: {         // External dependencies
    vue?: string;
    vuex?: string;
    [key: string]: string;
  };
  
  endpoints?: EndpointDefinition[]; // API endpoints
  configSchema?: JSONSchema;        // Configuration schema
}
```

### Component Categories

```
Layout Components:
├── pageTemplate    # Main grid layout system
├── appHeader       # Top navigation bar
├── appFooter       # Status information footer
└── mainMenu        # Role-based sidebar navigation

Data Components:
├── deviceData      # Device management and status
├── deviceHistory   # Historical device logs
├── realtimeSensors # Live sensor data display
└── auditLogViewer  # Security and audit logs

Interface Components:
├── loginForm       # Authentication with virtual keyboard
├── systemSettings  # System configuration UI
├── userMenu        # User management interface
├── serviceMenu     # Service operations interface
└── testMenu        # Testing and diagnostics UI

Monitoring Components:
├── pressurePanel   # Pressure gauge visualization
├── reportsViewer   # Report generation and display
└── [future]        # Additional monitoring tools

Utility Components:
└── jsonEditor      # Visual configuration management
```

---

## 🔄 Data Flow

### Configuration Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│JSON Editor  │───▶│ Component   │
│ Interface   │    │             │    │ Config      │
│             │    │ - Visual    │    │             │
│ - Select    │    │ - Validate  │    │ - Apply     │
│ - Edit      │    │ - Schema    │    │ - Reload    │
│ - Save      │    │ - Safety    │    │ - Update    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │            ┌─────────────┐           │
       └────────────│   Backup    │◄──────────┘
                    │  System     │
                    │             │
                    │ - Auto save │
                    │ - Versioning│
                    │ - Recovery  │
                    └─────────────┘
```

### Event System

```javascript
// Component Event Bus Architecture

class EventBus {
  // Global events
  emit(event, payload) {
    // Broadcast to all components
    this.subscribers[event]?.forEach(callback => {
      callback(payload);
    });
  }
  
  // Component-specific events
  emitToComponent(componentName, event, payload) {
    // Direct component communication
    const component = this.components[componentName];
    component?.handleEvent(event, payload);
  }
}

// Event Types
const EventTypes = {
  // System events
  SYSTEM_READY: 'system:ready',
  CONFIG_CHANGED: 'config:changed',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  
  // Component events
  COMPONENT_MOUNTED: 'component:mounted',
  COMPONENT_ERROR: 'component:error',
  
  // Data events
  SENSOR_UPDATE: 'sensor:update',
  DEVICE_STATUS: 'device:status',
  ALARM_TRIGGERED: 'alarm:triggered'
};
```

### State Management

```javascript
// Vuex Store Structure
const store = {
  modules: {
    system: {
      state: {
        currentUser: null,
        deviceStatus: 'ONLINE',
        language: 'pl'
      }
    },
    
    // Dynamic component modules
    [componentName]: {
      namespaced: true,
      state: componentState,
      mutations: componentMutations,
      actions: componentActions
    }
  }
};

// Component State Pattern
const componentState = {
  config: {},           // Component configuration
  data: {},             // Runtime data
  ui: {                 // UI state
    loading: false,
    error: null,
    lastUpdate: null
  },
  cache: {}             // Cached data
};
```

---

## 🔒 Security Model

### Role-Based Access Control (RBAC)

```
Security Hierarchy:
┌─────────────┐
│ SERWISANT   │ ◄── Full technical access
├─────────────┤
│ SUPERUSER   │ ◄── System administration
├─────────────┤
│ ADMIN       │ ◄── User management
├─────────────┤
│ OPERATOR    │ ◄── Basic operations
└─────────────┘

Permission Matrix:
                │ OPERATOR │ ADMIN │ SUPERUSER │ SERWISANT │
Component View  │    ✓     │   ✓   │     ✓     │     ✓     │
Config Edit     │    ✗     │   △   │     ✓     │     ✓     │
User Management │    ✗     │   ✓   │     ✓     │     ✓     │
System Settings │    ✗     │   ✗   │     ✓     │     ✓     │
Hardware Access │    ✗     │   ✗   │     ✗     │     ✓     │

△ = Limited access
```

### Configuration Security

```javascript
// Protected Configuration Fields
const ProtectedFields = {
  SYSTEM_CRITICAL: [
    'system.security_keys',
    'system.api_endpoints',
    'system.database_config'
  ],
  
  USER_RESTRICTED: [
    'user.roles',
    'user.permissions',
    'auth.secret_keys'
  ],
  
  READONLY: [
    'component.name',
    'component.version',
    'system.hardware_id'
  ]
};

// Security Validation
function validateConfigChange(field, value, userRole) {
  if (ProtectedFields.SYSTEM_CRITICAL.includes(field)) {
    return userRole === 'SERWISANT';
  }
  
  if (ProtectedFields.USER_RESTRICTED.includes(field)) {
    return ['ADMIN', 'SUPERUSER', 'SERWISANT'].includes(userRole);
  }
  
  if (ProtectedFields.READONLY.includes(field)) {
    return false; // Never editable
  }
  
  return true; // Public field
}
```

### Input Validation & Sanitization

```javascript
// Schema-Based Validation
const ValidationEngine = {
  validateJSON(data, schema) {
    // JSON Schema validation
    const validator = new JSONSchemaValidator(schema);
    return validator.validate(data);
  },
  
  sanitizeInput(input, type) {
    switch(type) {
      case 'string':
        return input.toString().trim().slice(0, 1000);
      case 'number':
        return parseFloat(input) || 0;
      case 'boolean':
        return Boolean(input);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
};
```

---

## 🔌 Integration Patterns

### Component Communication

```javascript
// 1. Direct Component Communication
class ComponentA {
  async communicateWithB(data) {
    const componentB = this.registry.getComponent('componentB');
    return await componentB.handle('processData', data);
  }
}

// 2. Event-Based Communication
class ComponentA {
  sendEvent(data) {
    this.eventBus.emit('data:processed', data);
  }
}

class ComponentB {
  mounted() {
    this.eventBus.on('data:processed', this.handleProcessedData);
  }
}

// 3. Store-Based Communication
class ComponentA {
  updateSharedData(data) {
    this.$store.commit('shared/UPDATE_DATA', data);
  }
}

class ComponentB {
  computed: {
    sharedData() {
      return this.$store.state.shared.data;
    }
  }
}
```

### API Integration

```javascript
// REST API Integration Pattern
class APIService {
  constructor(baseURL, authToken) {
    this.baseURL = baseURL;
    this.authToken = authToken;
  }
  
  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${this.authToken}` }
    });
    return await response.json();
  }
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}

// WebSocket Integration for Real-time Data
class WebSocketService {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.eventBus = new EventBus();
  }
  
  connect() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.eventBus.emit(data.type, data.payload);
    };
  }
}
```

---

## ⚡ Performance Considerations

### Component Loading Strategy

```javascript
// Lazy Loading Implementation
class ComponentLoader {
  async loadComponent(name) {
    // Check if already loaded
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name);
    }
    
    // Dynamic import
    const module = await import(`./features/${name}/0.1.0/index.js`);
    
    // Initialize and cache
    const initialized = await module.default.init(this.context);
    this.loadedComponents.set(name, initialized);
    
    return initialized;
  }
}

// Resource Optimization
const OptimizationStrategies = {
  // Minimize DOM updates
  batchDOMUpdates() {
    requestAnimationFrame(() => {
      // Batch all DOM changes here
    });
  },
  
  // Debounce expensive operations
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Virtual scrolling for large lists
  virtualScroll(items, viewport) {
    const visibleStart = Math.floor(viewport.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(viewport.height / this.itemHeight),
      items.length
    );
    return items.slice(visibleStart, visibleEnd);
  }
};
```

### Memory Management

```javascript
// Component Cleanup Pattern
class ComponentLifecycle {
  mounted() {
    // Setup event listeners
    this.eventListeners = [];
    this.timers = [];
    this.observers = [];
  }
  
  beforeUnmount() {
    // Cleanup event listeners
    this.eventListeners.forEach(cleanup => cleanup());
    
    // Clear timers
    this.timers.forEach(timer => clearTimeout(timer));
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
  }
}
```

---

## 📈 Scalability Design

### Horizontal Scaling

```
Load Balancer
      │
      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Instance 1 │    │  Instance 2 │    │  Instance 3 │
│             │    │             │    │             │
│ Components  │    │ Components  │    │ Components  │
│ Config Sync │    │ Config Sync │    │ Config Sync │
└─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │
      └───────────────────┼───────────────────┘
                          ▼
                ┌─────────────────┐
                │  Shared Config  │
                │    Storage      │
                └─────────────────┘
```

### Component Versioning Strategy

```javascript
// Version Management
const VersionManager = {
  // Support multiple versions simultaneously
  supportedVersions: ['0.1.0', '0.2.0', '1.0.0'],
  
  // Migration between versions
  async migrateComponent(name, fromVersion, toVersion) {
    const oldComponent = await this.loadComponent(name, fromVersion);
    const newComponent = await this.loadComponent(name, toVersion);
    
    // Migrate configuration
    const migratedConfig = await newComponent.migrate?.(oldComponent.config);
    
    // Update references
    await this.updateComponentReferences(name, toVersion);
    
    return { success: true, config: migratedConfig };
  }
};
```

### Future Extension Points

```javascript
// Plugin Architecture for Extensions
class PluginManager {
  registerPlugin(plugin) {
    // Validate plugin interface
    this.validatePlugin(plugin);
    
    // Register hooks and extensions
    this.plugins.set(plugin.name, plugin);
    
    // Initialize plugin
    plugin.init(this.context);
  }
  
  // Extension points
  extensionPoints: {
    'component:beforeInit': [],
    'component:afterInit': [],
    'config:beforeSave': [],
    'config:afterSave': [],
    'ui:beforeRender': [],
    'ui:afterRender': []
  }
}
```

---

## 🎯 Design Patterns Used

### 1. Module Pattern
- Each component is a self-contained module
- Clear public/private interface separation
- Dependency injection support

### 2. Observer Pattern  
- Event-driven component communication
- State change notifications
- UI update propagation

### 3. Strategy Pattern
- Pluggable validation strategies
- Configurable rendering approaches
- Adaptive loading strategies

### 4. Factory Pattern
- Dynamic component instantiation
- Configuration-driven component creation
- Version-specific component loading

### 5. Facade Pattern
- Simplified API for complex operations
- JSON Editor as facade for configuration
- Component registry as system facade

---

## 🛠️ Development Considerations

### Code Organization

```
Separation of Concerns:
├── Presentation Layer     # Vue components, templates, styles
├── Business Logic Layer   # Component logic, validation, processing
├── Data Access Layer      # Configuration loading, API calls
└── Infrastructure Layer   # Event bus, registry, utilities
```

### Testing Strategy

```
Testing Pyramid:
├── Unit Tests (70%)       # Component logic, utilities
├── Integration Tests (20%) # Component interactions
└── E2E Tests (10%)        # User workflows
```

### Documentation Standards

```
Documentation Requirements:
├── Architecture Overview   # This document
├── API Reference          # Component interfaces
├── User Guides            # JSON Editor usage
├── Developer Guides       # Development workflows
└── Deployment Guides      # Installation & setup
```

---

## 🔮 Future Architecture Evolution

### Planned Enhancements

1. **Microservices Architecture** - Split into smaller, independent services
2. **Cloud Integration** - Support for cloud-based configuration and monitoring
3. **AI-Powered Configuration** - Intelligent configuration suggestions
4. **Advanced Security** - Multi-factor authentication, encryption at rest
5. **Performance Monitoring** - Real-time performance metrics and alerts

### Migration Path

```
Current (v3.0) → v4.0 → v5.0
     │             │      │
Monolithic    → Modular → Distributed
Components      Services   Microservices
```

---

## 📊 Architecture Metrics

### Current System Statistics

- **16 Components** - Fully functional modules
- **84.4/100** - Average health score
- **81.3%** - Production readiness
- **~50,000 LOC** - Total codebase size
- **87.5%** - Test success rate

### Performance Targets

- **< 2s** - Component initialization time
- **< 100ms** - Configuration save time  
- **< 50ms** - UI response time
- **< 1MB** - Memory per component
- **99.9%** - System availability

---

**MASKSERVICE C20 1001 Architecture v3.0**  
*Scalable, secure, and maintainable industrial control system*
