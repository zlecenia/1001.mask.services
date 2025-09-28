# 🔧 Developer Guide - MASKSERVICE C20 1001

Complete guide for developers working with the MASKSERVICE component system.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Component Architecture](#component-architecture)
3. [Development Workflow](#development-workflow)
4. [JSON Editor Usage](#json-editor-usage)
5. [Testing Strategy](#testing-strategy)
6. [Debugging Guide](#debugging-guide)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required software
Node.js 18+
npm 9+
Modern browser (Chrome 90+, Firefox 88+)

# Recommended tools
VS Code with extensions:
- Vue Language Features (Volar)
- ES6 Modules
- JavaScript (ES6) code snippets
```

### Initial Setup

```bash
# Clone and setup
git clone https://github.com/maskservice/1001.mask.services
cd 1001.mask.services
npm install

# Verify installation
npm run analyze
npm run component:dev:jsonEditor
```

### Project Structure Understanding

```
js/features/[component]/0.1.0/
├── index.js              # Main export - REQUIRED
├── [component].js        # Vue component - REQUIRED  
├── [component].css       # Styles - REQUIRED
├── [component].test.js   # Tests - RECOMMENDED
├── package.json          # Metadata - REQUIRED
├── standalone.html       # Preview - RECOMMENDED
├── README.md             # Docs - REQUIRED
└── config/               # Configuration - REQUIRED
    ├── config.json       # Settings
    ├── data.json         # Runtime data
    ├── schema.json       # Validation rules
    └── crud.json         # Operations definition
```

---

## 🏗️ Component Architecture

### Component Lifecycle

1. **Registration** - Component discovered by FeatureRegistry
2. **Initialization** - `init()` function called with context
3. **Mounting** - Vue component mounted to DOM
4. **Operation** - Component handles user interactions
5. **Updates** - Configuration changes via JSON Editor
6. **Cleanup** - Component unmounted properly

### Required Exports

Every component must export:

```javascript
// index.js structure
export default {
  component: VueComponent,    // Vue 3 component
  metadata: {                 // Component information
    name: 'componentName',
    version: '0.1.0',
    description: 'Purpose',
    capabilities: {...}
  },
  init: async (context) => {...},      // Initialization
  handle: async (action, params) => {...}, // Action handler
  lifecycle: {...}            // Lifecycle hooks
};
```

### Vue Component Structure

```javascript
// componentName.js
const template = `...`;

export default {
  name: 'ComponentName',
  template,
  data() {
    return {
      // Component state
    };
  },
  methods: {
    // Component methods
  },
  mounted() {
    console.log('Component mounted');
  }
};
```

---

## 🔄 Development Workflow

### 1. Creating New Components

```bash
# Use the component generator (recommended)
npm run module:init

# Or manually create structure:
mkdir -p js/features/newComponent/0.1.0/config
cd js/features/newComponent/0.1.0
```

### 2. Component Development

```bash
# Start individual development server
npm run component:dev:newComponent

# This provides:
# - Hot reload during development
# - Isolated testing environment
# - Configuration API endpoint
# - Admin interface
```

### 3. Testing Your Component

```bash
# Run component tests
cd js/features/newComponent/0.1.0
npm test

# Run full system analysis
npm run analyze

# Generate visual documentation
npm run screenshots
```

### 4. Configuration Management

Use JSON Editor for safe configuration:

```bash
# Launch JSON Editor
npm run component:dev:jsonEditor

# Edit your component's config:
# 1. Select your component
# 2. Choose config file
# 3. Apply appropriate schema
# 4. Make changes visually
# 5. Validate and save
```

---

## 🛠️ JSON Editor Usage

### For Component Configuration

The JSON Editor is the **recommended way** to modify component settings:

#### Editing Component Settings

```javascript
// Instead of manually editing config.json:
{
  "component": {
    "name": "myComponent",
    "version": "0.1.0"
  },
  "settings": {
    "theme": "dark",
    "autoSave": true
  }
}

// Use JSON Editor:
// 1. Select component: "myComponent"
// 2. Select file: "config.json" 
// 3. Select schema: "App Configuration"
// 4. Click values to edit them
// 5. Validate and save
```

#### Available Schemas

- **app** - API URLs, connection settings
- **menu** - Role-based menu structure
- **router** - Navigation configuration  
- **system** - Security and system settings
- **test-scenarios** - Device testing parameters
- **workshop** - Parts and tools management

#### Safety Features

- **Protected Fields** - Critical settings cannot be changed
- **Validation Rules** - Ensures data integrity
- **Backup System** - Automatic backups before saves
- **Error Messages** - Clear feedback on issues

---

## 🧪 Testing Strategy

### Unit Testing

Each component should have comprehensive tests:

```javascript
// componentName.test.js
import ComponentModule from './index.js';

class ComponentTests {
  async testComponentStructure() {
    assert(ComponentModule.component, 'Component should exist');
    assert(ComponentModule.metadata, 'Metadata should exist');
    assert(ComponentModule.init, 'Init function should exist');
  }
  
  async testInitialization() {
    const result = await ComponentModule.init({});
    assert(result.success, 'Initialization should succeed');
  }
  
  async testConfiguration() {
    const config = await ComponentModule.handle('loadConfig');
    assert(config, 'Config should load');
  }
}
```

### Integration Testing

Test component interactions:

```bash
# Test component with others
npm run playground

# Test full system
npm run dev
```

### Visual Testing

Automated screenshot validation:

```bash
# Generate and compare screenshots
npm run screenshots

# Single component screenshot
npm run screenshot
```

---

## 🐛 Debugging Guide

### Common Issues

#### 1. Component Not Loading

**Symptoms**: Component doesn't appear in list
**Solution**:
```bash
# Check component structure
npm run analyze

# Verify required files exist
ls js/features/yourComponent/0.1.0/
```

#### 2. Configuration Errors

**Symptoms**: JSON Editor shows validation errors
**Solution**:
```bash
# Validate configuration files
npm run config:validate

# Use JSON Editor to fix issues
npm run component:dev:jsonEditor
```

#### 3. Development Server Issues

**Symptoms**: Dev server won't start
**Solution**:
```bash
# Check port availability
netstat -an | grep :3009

# Try different port
node tools/dev/componentDevServer.js js/features/component/0.1.0 3010
```

### Debug Tools

#### Browser DevTools

```javascript
// Enable debug mode in browser console
window.MASKSERVICE_DEBUG = true;

// Component-specific debugging
window.JSON_EDITOR_DEBUG = true;
```

#### Node.js Debugging

```bash
# Debug component tests
node --inspect js/features/component/0.1.0/component.test.js

# Debug development server
node --inspect tools/dev/componentDevServer.js
```

#### Health Analysis

```bash
# Detailed component analysis
npm run analyze > health-report.txt

# Check for specific issues
grep -i "error\|fail\|missing" health-report.txt
```

---

## ✅ Best Practices

### Component Design

1. **Single Responsibility** - Each component has one clear purpose
2. **Configuration Driven** - Use config files for customization
3. **Error Handling** - Graceful failure with clear messages
4. **Documentation** - Complete README with examples

### Code Quality

```javascript
// Good: Descriptive naming
const userAuthenticationResult = await validateCredentials(user);

// Bad: Unclear naming  
const result = await check(u);

// Good: Error handling
try {
  const config = await loadConfig();
  return { success: true, config };
} catch (error) {
  console.error('Config loading failed:', error);
  return { success: false, error: error.message };
}

// Bad: Silent failures
const config = await loadConfig();
return config; // What if it fails?
```

### Configuration Management

1. **Use JSON Editor** - Don't manually edit JSON files
2. **Schema Validation** - Always apply appropriate schemas
3. **Backup Strategy** - Let the system handle backups
4. **Testing** - Validate changes before deployment

### Performance

1. **Lazy Loading** - Load components when needed
2. **Efficient Updates** - Minimize DOM manipulation
3. **Memory Management** - Clean up event listeners
4. **Caching** - Cache configuration and data appropriately

---

## 🔧 Advanced Development

### Custom Schemas

Create custom validation schemas:

```javascript
// In component's schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "customSetting": {
      "type": "string",
      "enum": ["value1", "value2", "value3"]
    }
  },
  "required": ["customSetting"]
}
```

### Component Communication

Use the event system for component interaction:

```javascript
// Emit events
this.$emit('component-action', { data: 'value' });

// Listen for events
this.$on('component-action', (payload) => {
  console.log('Received:', payload);
});
```

### State Management

For complex state, use Vuex integration:

```javascript
// In component's init function
async function init(context) {
  if (context.store) {
    const storeModule = {
      namespaced: true,
      state: () => ({ componentData: null }),
      mutations: {
        SET_DATA(state, data) { state.componentData = data; }
      }
    };
    context.store.registerModule('myComponent', storeModule);
  }
}
```

---

## 📊 Development Metrics

### Quality Targets

- **Health Score**: 90+ points
- **Test Coverage**: 85%+ success rate
- **Documentation**: Complete README
- **Visual Documentation**: Screenshot available

### Monitoring Tools

```bash
# Regular health checks
npm run analyze

# Visual documentation updates
npm run screenshots

# Configuration validation
npm run config:validate

# Performance testing
npm run test -- --performance
```

---

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Health score 90+
- [ ] Documentation complete
- [ ] Screenshot generated
- [ ] Configuration validated
- [ ] No console errors

### Deployment Process

```bash
# Final validation
npm run analyze
npm run config:validate
npm run screenshots

# Build if needed
npm run build

# Deploy to target environment
# (deployment process depends on your infrastructure)
```

---

## 🔗 Additional Resources

### Documentation

- [Component Overview](../components.md)
- [JSON Editor Guide](../EXAMPLE_JSON_EDITOR_USAGE.md)
- [Architecture Documentation](./architecture.md)

### Tools and Scripts

```bash
# Development
npm run component:dev:[name]     # Individual component server
npm run playground               # Component selector
npm run dev                      # Main application

# Analysis
npm run analyze                  # Health check
npm run screenshots              # Visual docs
npm run config:validate          # Config validation

# Maintenance
npm run module:migrate           # Structure migration
npm run readme:generate          # Documentation update
```

### Getting Help

1. Check this developer guide
2. Review component-specific README files
3. Use `npm run analyze` for diagnostics
4. Check browser console for errors
5. Create issue in project repository

---

**Happy Coding! 🚀**

*MASKSERVICE C20 1001 Developer Guide v3.0*
