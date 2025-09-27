# MASKSERVICE C20 Components - Complete Documentation

## Project Structure (Unified)
```
js/features/[component]/[version]/
├── index.js              # Module export
├── [component].js        # Vue component
├── [component].test.js   # Tests
├── package.json          # Component scripts
├── standalone.html       # Standalone preview
├── dev-server.js        # Component dev server
├── config/              # All configs here
│   ├── config.json      # Source config
│   ├── data.json        # Runtime values
│   ├── schema.json      # Validation
│   └── crud.json        # Edit rules
└── locales/             # Translations (optional)

### Component Locations
All components in: `js/features/[name]/0.1.0/`

| Component | Type | Purpose | Health Score | Status | Issues |
|-----------|------|---------|-------------|--------|--------|
| **pageTemplate** | Layout | Main grid container | 100/100 🟢 | ✅ Excellent | None |
| **appHeader** | Layout | Top bar with status | 100/100 🟢 | ✅ Excellent | None |
| **mainMenu** | Navigation | Role-based sidebar | 100/100 🟢 | ✅ Excellent | None |
| **loginForm** | Auth | Login + virtual keyboard | 100/100 🟢 | ✅ Excellent | None |
| **appFooter** | Layout | System info footer | 100/100 🟢 | ✅ Excellent | None |
| **pressurePanel** | Monitoring | Pressure gauges | 100/100 🟢 | ✅ Excellent | None |
| **auditLogViewer** | Security | Audit logs | 90/100 🟢 | ✅ Excellent | Missing package.json |
| **realtimeSensors** | Monitoring | WebSocket data | 80/100 🟢 | ✅ Good | Index.js structure |
| **systemSettings** | Config | Settings UI | 80/100 🟢 | ✅ Good | Index.js structure |
| **deviceData** | Data | Device management | 80/100 🟢 | ✅ Good | Index.js structure |
| **testMenu** | Testing | Test interface | 85/100 🟢 | ✅ Good | Config structure |
| **reportsViewer** | Reports | Report display | 75/100 🟢 | ✅ Good | Missing tests, config issues |
| **serviceMenu** | Service | Service interface | 60/100 🟡 | ⚠️ Needs Work | Tests, schema, index.js |
| **userMenu** | Users | User management | 65/100 🟡 | ⚠️ Needs Work | Tests, index.js, config |
| **jsonEditor** | Tools | Visual JSON config editor | 100/100 🟢 | ✅ Excellent | None |

### Overall Health Summary
- **🟢 Production Ready**: 13/15 components (86.7%)
- **📊 Average Score**: 88.5/100
- **🔧 Common Issues**: Index.js structure (5), Missing tests (3), Config structure (4)
- **🆕 New Component**: jsonEditor - Visual JSON configuration editor

## Component Management & Development

### Essential Commands
```bash
# Component Analysis & Health Check
npm run analyze                  # Full component health analysis

# Component Management  
npm run module:init              # Create new component
npm run module:init-all          # Initialize all components
npm run module:migrate           # Migrate to unified structure
npm run module:list              # List all components

# Development Servers (Individual Components)
npm run component:dev:appFooter     # Port 3001
npm run component:dev:appHeader     # Port 3002  
npm run component:dev:mainMenu      # Port 3003
npm run component:dev:loginForm     # Port 3004
npm run component:dev:pageTemplate  # Port 3005
npm run component:dev:jsonEditor    # Port 3009 - JSON Configuration Editor

# Screenshot Generation (Visual Documentation)
npm run screenshots             # Generate all screenshots automatically
npm run screenshot              # Interactive single component
npm run screenshots:update      # Generate + git add

# Configuration Management
npm run config:generate-components  # Generate schemas for all components
npm run config:validate            # Validate all configurations
npm run readme:generate            # Generate README for all components
```

### Error Detection & Diagnostics

The screenshot generator includes comprehensive error detection:

#### Detected Issues
- **HTTP Errors**: Server response failures (4xx, 5xx)
- **Console Errors**: JavaScript runtime errors  
- **Page Errors**: Unhandled exceptions
- **Vue Mount Issues**: Component initialization problems
- **Content Rendering**: Empty or failed component renders

#### Common Problems & Solutions

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **Missing Service Import** | `Cannot resolve module` | Check import paths in component files |
| **Vue Component Errors** | Console: `Component definition` | Fix export default structure |
| **Config Loading Failed** | `Cannot read properties` | Ensure config.json exists and is valid |
| **Index.js Structure** | Component not initializing | Add metadata, init, handle methods |
| **Missing Dependencies** | Module import errors | Add to package.json dependencies |

#### Health Check Results
Run `npm run analyze` to get detailed component health report:
- **File Structure Validation**: Required files present
- **Code Quality Checks**: Proper Vue/JS structure  
- **Configuration Validation**: Valid JSON and structure
- **Documentation Status**: README, tests, screenshots
- **Scoring System**: 0-100 points with recommendations
npm run playground              # Interactive component selector

# Testing
npm run test                    # Test all components
npm run test:component [name]   # Test specific component
npm run test:watch [name]       # Watch mode for component

# Building
npm run build                   # Build full application
npm run build:component [name]  # Build component standalone
npm run build:all-standalone    # Build all as widgets

# Configuration
npm run config:generate         # Generate schemas locally
npm run crud:generate           # Generate CRUD locally
npm run validate-all            # Validate everything
```

### Component-Level Commands (component package.json)
```bash
# From component directory: js/features/[name]/0.1.0/
npm run dev                      # Start component dev server
npm run build                    # Build as library
npm run preview                  # Preview build
npm run test                     # Run component tests
npm run serve                    # Custom dev server
```

## Standalone Component Setup

### 1. Standalone HTML Template
```html
<!-- js/features/[component]/0.1.0/standalone.html -->
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1280, height=400">
    <title>Component - Standalone</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        #preview-container {
            width: 1280px;
            height: 400px;
            background: #2c3e50;
        }
    </style>
</head>
<body>
    <div id="preview-container">
        <div id="app"></div>
    </div>
    <script type="module">
        import Component from './index.js';
        await Component.init();
        const { createApp } = Vue;
        const app = createApp({
            components: { 'my-component': Component.component },
            template: '<my-component />'
        });
        app.mount('#app');
    </script>
</body>
</html>
```

### 2. Component Vite Config
```javascript
// js/features/[component]/0.1.0/vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  root: __dirname,
  server: { port: 3001 },
  build: {
    lib: {
      entry: './index.js',
      name: 'ComponentName',
      formats: ['es', 'umd']
    }
  }
});
```

### 3. Component Package.json
```json
{
  "name": "@maskservice/component-name",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite serve",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "serve": "node ./dev-server.js"
  }
}
```

## Component Template

### Complete Component Structure
```javascript
// js/features/myComponent/0.1.0/index.js
import component from './myComponent.js';
import config from './config/config.json';

export default {
  metadata: {
    name: 'myComponent',
    version: '0.1.0',
    type: 'component',
    config: './config/'
  },
  
  component,
  
  async init(context) {
    const data = await import('./config/data.json');
    return { success: true, config: data };
  },
  
  async handle(request) {
    const { action, payload } = request;
    switch(action) {
      case 'GET_CONFIG':
        return this.getConfig(payload.section);
      case 'UPDATE_CONFIG':
        return this.updateConfig(payload);
      default:
        return { success: true, data: request };
    }
  },
  
  async getConfig(section) {
    const data = await import('./config/data.json');
    return section ? data[section] : data;
  },
  
  async updateConfig(updates) {
    const key = `config_${this.metadata.name}_${this.metadata.version}`;
    localStorage.setItem(key, JSON.stringify(updates));
    return updates;
  }
};
```

## Running Components

### Method 1: Quick Start
```bash
# From root directory
npm run dev:appFooter
npm run dev:mainMenu
npm run dev:loginForm
```

### Method 2: Interactive Playground
```bash
npm run playground
# Select component from list
# Opens at http://localhost:3001
```

### Method 3: Direct Component
```bash
cd js/features/appFooter/0.1.0
npm run dev
```

### Method 4: All Components
```bash
npm run dev:all              # Run all in parallel
```

## Configuration System

### Config Files
- **config.json** - Full configuration (source)
- **data.json** - Runtime values only
- **schema.json** - JSON Schema validation
- **crud.json** - Edit permissions & UI hints

### Manual Changes Preservation
```json
{
  "_manual": true,
  "_modified": "2025-01-27T10:00:00Z",
  "_comment": "Custom validation rules"
}
```

## Development Workflows

### 1. Create New Component
```bash
npm run module:init
# Interactive prompts:
# - Name: myComponent
# - Type: component
# - Version: 0.1.0

cd js/features/myComponent/0.1.0
npm run dev
```

### 2. Test Component
```bash
# Unit tests
npm run test:component myComponent

# Visual test
npm run dev:myComponent
# Open browser at localhost:3001
```

### 3. Build for Production
```bash
# Build as widget
npm run build:component myComponent
# Output: dist/myComponent.umd.js

# Embed anywhere:
<script src="myComponent.umd.js"></script>
```

## Import Patterns

### Within Component
```javascript
import config from './config/config.json';
import schema from './config/schema.json';
import data from './config/data.json';
```

### Cross-Component
```javascript
import appFooter from '../appFooter/0.1.0/index.js';
const footerConfig = await appFooter.getConfig();
```

## Testing

### Unit Tests
```javascript
// [component].test.js
import { describe, it, expect } from 'vitest';
import module from './index.js';

describe('Component', () => {
  it('initializes', async () => {
    const result = await module.init();
    expect(result.success).toBe(true);
  });
});
```

### Run Tests
```bash
npm run test:component appFooter
npm run test:watch appFooter
npm run test:all
```

## Build & Deploy

### Build Component
```bash
npm run build:component appFooter
# Creates: dist/appFooter.umd.js
```

### Deploy as Widget
```html
<div id="footer-widget"></div>
<script src="https://cdn/appFooter.umd.js"></script>
<script>
  AppFooter.mount('#footer-widget');
</script>
```

## User Roles & Display

### Roles
| Role | Color | Access |
|------|-------|--------|
| OPERATOR | #27ae60 | Dashboard, Monitoring |
| ADMIN | #f39c12 | + Tests, Reports, Users |
| SUPERUSER | #e74c3c | + System Config |
| SERWISANT | #3498db | + Service, Calibration |

### Display
- **Target**: 7.9" LCD (1280x400px)
- **Touch**: Min 40px targets
- **Layout**: Fixed grid
- **Refresh**: 1s WebSocket

## Quick Reference

### Common Issues
| Issue | Solution |
|-------|----------|
| Config not found | Check `./config/data.json` |
| Component won't run | Check `vite.config.js` exists |
| Import errors | Use relative paths `./config/` |
| Standalone fails | Generate `standalone.html` |

### File Conventions
- Folders: camelCase (`appFooter`)
- Components: PascalCase (`AppFooter`)
- Files: camelCase (`appFooter.js`)
- CSS: kebab-case (`.app-footer`)

---

## For AI Assistants

### Key Points:
1. **All configs local** in `./config/` folder
2. **Each component standalone** with own dev server
3. **Use npm scripts** for all operations
4. **Check _manual flag** before regenerating
5. **Version format** always 0.1.0 style

### Quick Commands:
```bash
npm run dev:[component]      # Run standalone
npm run test:component       # Test component
npm run build:component      # Build widget
npm run playground           # Interactive mode
```

### Component Access:
```javascript
// Config access
const config = await import('./config/data.json');

// Update config
localStorage.setItem(`config_${name}_${version}`, JSON.stringify(data));

// Validate
const valid = ajv.validate(schema, data);
```