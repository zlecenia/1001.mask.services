# 🔌 API Reference - MASKSERVICE C20 1001

Complete API reference for MASKSERVICE component system interfaces and endpoints.

## 📋 Table of Contents

1. [Component API Interface](#component-api-interface)
2. [JSON Editor API](#json-editor-api)
3. [System APIs](#system-apis)
4. [HTTP Endpoints](#http-endpoints)
5. [WebSocket API](#websocket-api)
6. [Configuration API](#configuration-api)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## 🧩 Component API Interface

### Standard Component Interface

Every MASKSERVICE component must implement this interface:

```typescript
interface MaskServiceComponent {
  // Required exports
  component: VueComponent;
  metadata: ComponentMetadata;
  init(context: ComponentContext): Promise<InitResult>;
  handle(action: string, params?: any): Promise<ActionResult>;
  lifecycle: LifecycleHooks;
  
  // Optional exports
  validate?(config: any): ValidationResult;
  migrate?(oldVersion: string): MigrationResult;
  cleanup?(): void;
}
```

### ComponentMetadata

```typescript
interface ComponentMetadata {
  name: string;                    // Component identifier
  version: string;                 // Semantic version (e.g., "0.1.0")
  description: string;             // Purpose description
  author: string;                  // Component author
  tags: string[];                  // Classification tags
  category: ComponentCategory;     // Functional category
  
  capabilities: {
    standalone: boolean;           // Can run independently
    configurable: boolean;         // Has configuration files
    testable: boolean;            // Has test suite
    mockable: boolean;            // Supports mock data
    themable?: boolean;           // Supports themes
    responsive?: boolean;         // Responsive design
  };
  
  dependencies: {
    vue?: string;                 // Vue.js version requirement
    vuex?: string;                // Vuex version requirement
    [key: string]: string;        // Other dependencies
  };
  
  endpoints?: EndpointDefinition[]; // API endpoints
  configSchema?: JSONSchema;        // Configuration schema
}
```

### ComponentContext

```typescript
interface ComponentContext {
  store?: VuexStore;              // Vuex store instance
  router?: VueRouter;             // Vue router instance
  eventBus?: EventBus;            // Global event bus
  config?: SystemConfig;          // System configuration
  user?: UserContext;             // Current user context
  device?: DeviceContext;         // Device information
}
```

### InitResult

```typescript
interface InitResult {
  success: boolean;
  component?: VueComponent;       // Initialized component
  state?: ComponentState;         // Component state
  metadata?: ComponentMetadata;   // Updated metadata
  error?: string;                 // Error message if failed
}
```

### ActionResult

```typescript
interface ActionResult {
  success: boolean;
  data?: any;                     // Response data
  message?: string;               // Success/info message
  error?: string;                 // Error message if failed
}
```

---

## 🛠️ JSON Editor API

### Core Methods

#### loadComponentConfig(component, file)
Load configuration file for a component.

```javascript
// Load component configuration
const result = await JsonEditor.loadComponentConfig('appFooter', 'config.json');

// Response
{
  success: true,
  data: {
    component: { name: "appFooter", version: "0.1.0" },
    settings: { showTimestamp: true, theme: "dark" }
  }
}
```

#### saveComponentConfig(component, file, data)
Save configuration data to component file.

```javascript
// Save component configuration
const result = await JsonEditor.saveComponentConfig(
  'appFooter', 
  'config.json', 
  configData
);

// Response
{
  success: true,
  message: "Configuration saved successfully"
}
```

#### validateJSON(data, schema)
Validate JSON data against schema.

```javascript
// Validate configuration
const result = JsonEditor.validateJSON(data, schema);

// Success response
{
  success: true,
  message: "JSON is valid"
}

// Error response
{
  success: false,
  error: "Missing required field: component.name"
}
```

#### exportJSON(data, filename)
Export JSON data to downloadable file.

```javascript
// Export configuration
const result = JsonEditor.exportJSON(configData, 'my-config.json');

// Response
{
  success: true,
  message: "File exported successfully"
}
```

#### importJSON(file)
Import JSON data from file.

```javascript
// Import configuration
const result = await JsonEditor.importJSON(fileObject);

// Success response
{
  success: true,
  data: { /* parsed JSON data */ }
}

// Error response
{
  success: false,
  error: "Invalid JSON file"
}
```

### Schema Types

JSON Editor supports these built-in schemas:

```javascript
const SupportedSchemas = {
  app: {
    type: "object",
    properties: {
      API_URL: { type: "string", format: "uri" },
      WS_URL: { type: "string", format: "uri" },
      MOCK_MODE: { type: "boolean" }
    },
    required: ["API_URL"]
  },
  
  menu: {
    type: "object",
    patternProperties: {
      "^(OPERATOR|ADMIN|SUPERUSER|SERWISANT)$": {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            label: { type: "string" },
            icon: { type: "string" },
            route: { type: "string" }
          },
          required: ["key", "label"]
        }
      }
    }
  },
  
  system: {
    type: "object",
    properties: {
      authentication: {
        type: "object",
        properties: {
          session_timeout: { type: "number", minimum: 300 },
          max_login_attempts: { type: "number", minimum: 1 }
        }
      },
      sensors: {
        type: "object",
        properties: {
          update_interval: { type: "number", minimum: 100 },
          alarm_thresholds: {
            type: "object",
            properties: {
              pressure_high: { type: "number" },
              pressure_low: { type: "number" }
            }
          }
        }
      }
    }
  }
};
```

---

## 🌐 System APIs

### FeatureRegistry API

#### getComponent(name)
Retrieve a component by name.

```javascript
const component = FeatureRegistry.getComponent('jsonEditor');

// Returns: ComponentInstance or null
{
  component: VueComponent,
  metadata: ComponentMetadata,
  state: ComponentState
}
```

#### listComponents()
Get list of all registered components.

```javascript
const components = FeatureRegistry.listComponents();

// Returns: ComponentInfo[]
[
  {
    name: "jsonEditor",
    version: "0.1.0",
    status: "loaded",
    health: 100
  },
  // ... more components
]
```

#### registerComponent(component)
Register a new component.

```javascript
const result = await FeatureRegistry.registerComponent(componentModule);

// Response
{
  success: true,
  name: "newComponent",
  version: "0.1.0"
}
```

### SystemHealth API

#### analyzeComponent(name)
Analyze health of specific component.

```javascript
const health = await SystemHealth.analyzeComponent('jsonEditor');

// Response
{
  name: "jsonEditor",
  version: "0.1.0",
  score: 100,
  status: "excellent",
  checks: {
    hasIndex: true,
    hasComponent: true,
    hasTests: true,
    hasConfig: true
  },
  issues: [],
  recommendations: []
}
```

#### generateReport()
Generate full system health report.

```javascript
const report = await SystemHealth.generateReport();

// Response
{
  timestamp: "2024-12-28T12:00:00Z",
  summary: {
    excellent: 8,
    good: 5,
    needs-work: 3,
    broken: 0
  },
  averageScore: 84.4,
  productionReady: 13,
  total: 16,
  components: [/* detailed component info */]
}
```

### ConfigValidator API

#### validate(component, config)
Validate component configuration.

```javascript
const result = await ConfigValidator.validate('appFooter', config);

// Success response
{
  success: true,
  message: "Configuration is valid"
}

// Error response
{
  success: false,
  errors: [
    { field: "component.name", message: "Required field missing" }
  ]
}
```

#### validateAll()
Validate all component configurations.

```javascript
const results = await ConfigValidator.validateAll();

// Response
{
  success: true,
  validComponents: 13,
  invalidComponents: 3,
  results: {
    "appFooter": { success: true },
    "brokenComponent": { 
      success: false, 
      errors: [/* validation errors */] 
    }
  }
}
```

---

## 🌐 HTTP Endpoints

### Development Server Endpoints

Each component development server provides these endpoints:

#### GET /
Main component interface.

```bash
curl http://localhost:3009/
# Returns: HTML page with component
```

#### GET /api/config
Get component configuration.

```bash
curl http://localhost:3009/api/config
# Returns: JSON configuration object
```

#### POST /api/config
Update component configuration.

```bash
curl -X POST http://localhost:3009/api/config \
  -H "Content-Type: application/json" \
  -d '{"setting": "value"}'
# Returns: Success/error response
```

#### GET /api/health
Get component health status.

```bash
curl http://localhost:3009/api/health
# Returns: Health information
{
  "status": "healthy",
  "uptime": 3600,
  "memory": 45.2,
  "version": "0.1.0"
}
```

#### GET /admin
Component administration interface.

```bash
curl http://localhost:3009/admin
# Returns: Admin HTML interface
```

### System Endpoints

#### GET /health
System health check.

```bash
curl http://localhost:8080/health
# Returns: System status
{
  "status": "healthy",
  "uptime": 86400,
  "components": 16,
  "version": "3.0.0"
}
```

#### GET /api/components
List all components.

```bash
curl http://localhost:8080/api/components
# Returns: Component list
[
  {
    "name": "jsonEditor",
    "version": "0.1.0",
    "status": "running",
    "url": "http://localhost:3009"
  }
]
```

#### GET /api/components/:name/health
Get specific component health.

```bash
curl http://localhost:8080/api/components/jsonEditor/health
# Returns: Component health details
```

#### POST /api/components/:name/action
Execute component action.

```bash
curl -X POST http://localhost:8080/api/components/jsonEditor/action \
  -H "Content-Type: application/json" \
  -d '{"action": "resetEditor", "params": {}}'
# Returns: Action result
```

---

## 🔄 WebSocket API

### Real-time Events

Connect to WebSocket for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:9000');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  handleEvent(data.type, data.payload);
};
```

### Event Types

#### system:ready
System initialization complete.

```json
{
  "type": "system:ready",
  "payload": {
    "components": 16,
    "version": "3.0.0",
    "timestamp": "2024-12-28T12:00:00Z"
  }
}
```

#### component:mounted
Component successfully mounted.

```json
{
  "type": "component:mounted",
  "payload": {
    "name": "jsonEditor",
    "version": "0.1.0",
    "timestamp": "2024-12-28T12:00:01Z"
  }
}
```

#### config:changed
Configuration changed.

```json
{
  "type": "config:changed",
  "payload": {
    "component": "appFooter",
    "file": "config.json",
    "changes": ["theme", "showTimestamp"],
    "timestamp": "2024-12-28T12:00:02Z"
  }
}
```

#### sensor:update
Sensor data update.

```json
{
  "type": "sensor:update",
  "payload": {
    "sensor": "pressure1",
    "value": 5.2,
    "unit": "bar",
    "timestamp": "2024-12-28T12:00:03Z"
  }
}
```

#### alarm:triggered
System alarm triggered.

```json
{
  "type": "alarm:triggered",
  "payload": {
    "type": "pressure_high",
    "sensor": "pressure1",
    "value": 6.5,
    "threshold": 6.0,
    "severity": "warning",
    "timestamp": "2024-12-28T12:00:04Z"
  }
}
```

---

## ⚙️ Configuration API

### Configuration Structure

```typescript
interface ComponentConfig {
  component: {
    name: string;                 // Component name
    version: string;              // Component version
    title: string;                // Display title
    description?: string;         // Description
    category?: string;            // Component category
  };
  
  settings: {
    [key: string]: any;          // Component-specific settings
  };
  
  ui?: {
    [key: string]: any;          // UI configuration
  };
  
  security?: {
    readOnly?: string[];         // Read-only fields
    protected?: string[];        // Protected fields
    roles?: string[];            // Required roles
  };
}
```

### Configuration Loading

```javascript
// Load configuration from file
async function loadConfig(component, file = 'config.json') {
  const path = `js/features/${component}/0.1.0/config/${file}`;
  const response = await fetch(path);
  return await response.json();
}

// Save configuration to file
async function saveConfig(component, file, data) {
  const path = `/api/components/${component}/config/${file}`;
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}
```

### Schema Validation

```javascript
// Validate against schema
function validateConfig(data, schemaName) {
  const schema = schemas[schemaName];
  const validator = new JSONSchemaValidator(schema);
  return validator.validate(data);
}

// Get validation schema
function getSchema(schemaName) {
  return schemas[schemaName];
}
```

---

## ❌ Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;                 // Error message
  code?: string;                 // Error code
  details?: any;                 // Additional error details
  timestamp?: string;            // Error timestamp
}
```

### Common Error Codes

```javascript
const ErrorCodes = {
  // Component errors
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  COMPONENT_INIT_FAILED: 'COMPONENT_INIT_FAILED',
  COMPONENT_INVALID: 'COMPONENT_INVALID',
  
  // Configuration errors
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_READ_ONLY: 'CONFIG_READ_ONLY',
  CONFIG_SAVE_FAILED: 'CONFIG_SAVE_FAILED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR'
};
```

### Error Handling Examples

```javascript
// Handle API errors
async function handleAPICall() {
  try {
    const result = await JsonEditor.saveComponentConfig(/* params */);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  } catch (error) {
    console.error('API call failed:', error.message);
    // Handle specific error types
    switch (error.code) {
      case 'CONFIG_READ_ONLY':
        showError('This configuration field cannot be modified');
        break;
      case 'VALIDATION_FAILED':
        showValidationErrors(error.details);
        break;
      default:
        showError('An unexpected error occurred');
    }
  }
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Report to monitoring system
  reportError(event.reason);
});
```

---

## 📝 Examples

### Complete Component Implementation

```javascript
// Component: myComponent/0.1.0/index.js
import MyComponent from './myComponent.js';

const metadata = {
  name: 'myComponent',
  version: '0.1.0',
  description: 'Example component implementation',
  author: 'MASKSERVICE System',
  tags: ['example', 'demo'],
  category: 'utility',
  
  capabilities: {
    standalone: true,
    configurable: true,
    testable: true,
    mockable: true
  },
  
  dependencies: {
    vue: '^3.0.0'
  }
};

async function init(context = {}) {
  try {
    // Load configuration
    const config = await loadConfig();
    
    // Setup component state
    const componentState = {
      config,
      isInitialized: true,
      lastUpdate: new Date().toISOString()
    };
    
    // Register with store if available
    if (context.store) {
      context.store.registerModule('myComponent', {
        namespaced: true,
        state: () => componentState,
        mutations: {
          UPDATE_CONFIG(state, newConfig) {
            state.config = { ...state.config, ...newConfig };
          }
        }
      });
    }
    
    console.log('MyComponent initialized successfully');
    
    return {
      success: true,
      component: MyComponent,
      state: componentState,
      metadata
    };
    
  } catch (error) {
    console.error('MyComponent initialization failed:', error);
    return {
      success: false,
      error: error.message,
      component: MyComponent,
      metadata
    };
  }
}

async function handle(action, params = {}) {
  switch (action) {
    case 'loadConfig':
      return await loadConfig();
      
    case 'updateConfig':
      return await updateConfig(params.config);
      
    case 'reset':
      return await resetComponent();
      
    default:
      return {
        success: false,
        error: `Unknown action: ${action}`
      };
  }
}

const lifecycle = {
  async beforeMount(instance) {
    console.log('MyComponent: Before mount');
  },
  
  async mounted(instance) {
    console.log('MyComponent: Mounted');
  },
  
  async beforeUnmount(instance) {
    console.log('MyComponent: Before unmount');
  }
};

export default {
  component: MyComponent,
  metadata,
  init,
  handle,
  lifecycle
};
```

### JSON Editor Integration

```javascript
// Using JSON Editor to manage component configuration
class ComponentManager {
  async editComponentConfig(componentName) {
    try {
      // Load current configuration
      const config = await JsonEditor.loadComponentConfig(
        componentName, 
        'config.json'
      );
      
      if (!config.success) {
        throw new Error(config.error);
      }
      
      // Allow user to edit visually
      const editedConfig = await this.showEditor(config.data);
      
      // Validate edited configuration
      const validation = JsonEditor.validateJSON(
        editedConfig, 
        this.getSchemaForComponent(componentName)
      );
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error}`);
      }
      
      // Save updated configuration
      const saveResult = await JsonEditor.saveComponentConfig(
        componentName,
        'config.json',
        editedConfig
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
      
      console.log('Configuration updated successfully');
      return editedConfig;
      
    } catch (error) {
      console.error('Configuration edit failed:', error);
      throw error;
    }
  }
  
  getSchemaForComponent(componentName) {
    const schemaMap = {
      'appFooter': 'app',
      'mainMenu': 'menu',
      'systemSettings': 'system',
      'realtimeSensors': 'system'
    };
    return schemaMap[componentName] || 'app';
  }
}
```

### WebSocket Event Handling

```javascript
// Real-time event handling
class EventManager {
  constructor() {
    this.ws = new WebSocket('ws://localhost:9000');
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data.type, data.payload);
    };
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.subscribe(['config:changed', 'sensor:update']);
    };
  }
  
  handleEvent(type, payload) {
    switch (type) {
      case 'config:changed':
        this.onConfigChanged(payload);
        break;
        
      case 'sensor:update':
        this.onSensorUpdate(payload);
        break;
        
      case 'alarm:triggered':
        this.onAlarmTriggered(payload);
        break;
        
      default:
        console.log('Unknown event type:', type);
    }
  }
  
  onConfigChanged(payload) {
    console.log(`Configuration changed for ${payload.component}`);
    // Refresh component if needed
    this.refreshComponent(payload.component);
  }
  
  onSensorUpdate(payload) {
    // Update sensor display
    this.updateSensorValue(payload.sensor, payload.value);
  }
  
  onAlarmTriggered(payload) {
    // Show alarm notification
    this.showAlarm(payload);
  }
  
  subscribe(eventTypes) {
    this.ws.send(JSON.stringify({
      action: 'subscribe',
      events: eventTypes
    }));
  }
}
```

---

## 🔗 Related Documentation

- **[Component Development](./DEVELOPER_GUIDE.md#component-development)** - Creating components
- **[JSON Editor Usage](../EXAMPLE_JSON_EDITOR_USAGE.md)** - Configuration management
- **[System Architecture](./ARCHITECTURE.md)** - Overall system design
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production setup

---

**MASKSERVICE C20 1001 API Reference v3.0**  
*Complete API documentation for industrial control system*
