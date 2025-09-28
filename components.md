# 🛡️ MASKSERVICE C20 Components - Enhanced Documentation v2.0

## 🚨 **LLM SAFETY GUIDELINES**

### **CRITICAL: Before ANY Code Modification**

```bash
# 1. Create backup
cp -r js/features/[component] js/features/[component].backup

# 2. Run pre-modification tests
npm run test:component [component]

# 3. Document current state
npm run analyze > pre-modification-report.json
```

### **CRITICAL: Vue Import Pattern**
```javascript
// ✅ ALWAYS USE THIS PATTERN (works with CDN and ES modules):
const { reactive, computed, onMounted } = Vue || window.Vue || {};

// ❌ NEVER USE (causes CDN errors):
import { reactive, computed } from 'vue';
```

### **CRITICAL: Export Pattern**
```javascript
// ✅ ALWAYS EXPORT INSTANCE (not factory):
const componentModule = {
  metadata: { /* ... */ },
  init() { /* ... */ }
};
export default componentModule;

// ❌ NEVER EXPORT FACTORY:
export default createComponentModule; // This breaks init()
```

---

## 🏗️ **Standardized Component Structure**

### **Component Template v2.0**
```
js/features/[component]/0.1.0/
├── index.js              # Standardized export (NEVER modify pattern)
├── [component].js        # Vue component
├── [component].test.js   # Unit tests
├── [component].smoke.js  # Regression tests (NEW)
├── component.config.js   # Unified config (NEW)
├── package.json         
├── standalone.html      
├── CHANGELOG.md         # Track ALL changes (NEW)
├── .component-lock.json # Lock critical patterns (NEW)
├── config/              # All configs here
│   ├── config.json      # Source config
│   ├── data.json        # Runtime values
│   ├── schema.json      # Validation
│   └── crud.json        # Edit rules
└── locales/             # Translations (optional)
    ├── pl.json          # Polish translations
    ├── en.json          # English translations
    └── de.json          # German translations
```

### **Standardized index.js (DO NOT MODIFY)**
```javascript
// STANDARD COMPONENT INDEX.JS - v2.0
// DO NOT MODIFY WITHOUT TEAM REVIEW

const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const componentModule = {
  metadata: {
    name: 'componentName',
    version: '0.1.0',
    type: 'component',
    contractVersion: '2.0' // Component contract version
  },
  
  component: null,
  config: null,
  
  async init(context = {}) {
    try {
      // Standard initialization sequence
      await this.loadComponent();
      await this.loadConfig();
      await this.runSmokeTests();
      
      return { 
        success: true, 
        message: `${this.metadata.name} initialized`,
        contractVersion: this.metadata.contractVersion
      };
    } catch (error) {
      console.error(`[${this.metadata.name}] Init failed:`, error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  },
  
  async loadComponent() {
    const module = await import(`./${this.metadata.name}.js`);
    this.component = module.default || module[this.metadata.name];
    if (!this.component) {
      throw new Error('Component not found in module');
    }
  },
  
  async loadConfig() {
    const configPaths = [
      './component.config.js',     // Unified config (NEW)
      './config/config.json',      // Source config
      `/config/${this.metadata.name}.json`
    ];
    
    for (const path of configPaths) {
      try {
        if (path.endsWith('.js')) {
          const module = await import(path);
          this.config = module.default;
        } else {
          const response = await fetch(path);
          if (response.ok) {
            this.config = await response.json();
          }
        }
        if (this.config) {
          // Load validation schema if available
          await this.loadSchema();
          // Load runtime data if available
          await this.loadRuntimeData();
          // Load CRUD rules if available
          await this.loadCrudRules();
          return;
        }
      } catch (e) { 
        console.warn(`Config not found at ${path}`);
      }
    }
    
    // Default config fallback
    this.config = {
      component: this.metadata,
      settings: {}
    };
  },
  
  async loadSchema() {
    try {
      const response = await fetch('./config/schema.json');
      if (response.ok) {
        this.schema = await response.json();
        console.log(`✅ Schema loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`Schema not found for ${this.metadata.name}`);
    }
  },
  
  async loadRuntimeData() {
    try {
      const response = await fetch('./config/data.json');
      if (response.ok) {
        this.runtimeData = await response.json();
        console.log(`✅ Runtime data loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`Runtime data not found for ${this.metadata.name}`);
    }
  },
  
  async loadCrudRules() {
    try {
      const response = await fetch('./config/crud.json');
      if (response.ok) {
        this.crudRules = await response.json();
        console.log(`✅ CRUD rules loaded for ${this.metadata.name}`);
      }
    } catch (e) {
      console.warn(`CRUD rules not found for ${this.metadata.name}`);
    }
  },
  
  async loadLocales(language = 'pl') {
    try {
      const response = await fetch(`./locales/${language}.json`);
      if (response.ok) {
        this.translations = await response.json();
        console.log(`✅ Translations loaded for ${this.metadata.name} (${language})`);
        return this.translations;
      }
      
      // Fallback to Polish
      if (language !== 'pl') {
        return await this.loadLocales('pl');
      }
    } catch (e) {
      console.warn(`Translations not found for ${this.metadata.name} (${language})`);
    }
    return {};
  },
  
  async runSmokeTests() {
    if (typeof window !== 'undefined' && window.SKIP_SMOKE_TESTS) return;
    
    // Basic smoke tests
    if (!this.component) throw new Error('Component not loaded');
    if (!this.config) throw new Error('Config not loaded');
    if (typeof this.handle !== 'function') throw new Error('Handle method missing');
  },
  
  handle(request) {
    const { action, payload, language = 'pl' } = request;
    
    // Standard action handling
    switch(action) {
      case 'GET_CONFIG':
        return { success: true, data: this.config };
      case 'GET_METADATA':
        return { success: true, data: this.metadata };
      case 'GET_SCHEMA':
        return { success: true, data: this.schema };
      case 'GET_RUNTIME_DATA':
        return { success: true, data: this.runtimeData };
      case 'GET_CRUD_RULES':
        return { success: true, data: this.crudRules };
      case 'GET_TRANSLATIONS':
        return this.handleGetTranslations(language);
      case 'VALIDATE_DATA':
        return this.handleValidateData(payload);
      case 'UPDATE_DATA':
        return this.handleUpdateData(payload);
      case 'SAVE_CONFIG':
        return this.handleSaveConfig(payload);
      case 'HEALTH_CHECK':
        return { success: true, healthy: true };
      default:
        return { success: true, data: payload };
    }
  },
  
  async handleGetTranslations(language = 'pl') {
    try {
      const translations = await this.loadLocales(language);
      return { success: true, data: translations, language };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleValidateData(data) {
    if (!this.schema) {
      return { success: false, error: 'No validation schema available' };
    }
    
    try {
      // Basic validation - in real implementation use ajv or similar
      const errors = [];
      
      if (this.schema.required) {
        for (const field of this.schema.required) {
          if (!data[field]) {
            errors.push(`Field '${field}' is required`);
          }
        }
      }
      
      if (this.schema.properties) {
        for (const [field, rules] of Object.entries(this.schema.properties)) {
          if (data[field] !== undefined) {
            if (rules.type && typeof data[field] !== rules.type) {
              errors.push(`Field '${field}' must be of type ${rules.type}`);
            }
          }
        }
      }
      
      return {
        success: errors.length === 0,
        valid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleUpdateData(updates) {
    try {
      // Validate before updating
      const validation = this.handleValidateData(updates);
      if (!validation.valid) {
        return { success: false, error: 'Validation failed', details: validation.errors };
      }
      
      // Check CRUD permissions
      if (this.crudRules) {
        for (const field of Object.keys(updates)) {
          if (this.crudRules.readonly && this.crudRules.readonly.includes(field)) {
            return { success: false, error: `Field '${field}' is read-only` };
          }
          if (this.crudRules.editable && !this.crudRules.editable.includes(field)) {
            return { success: false, error: `Field '${field}' is not editable` };
          }
        }
      }
      
      // Update runtime data
      this.runtimeData = { ...this.runtimeData, ...updates };
      
      // Save to localStorage for persistence (SDK-independent)
      const storageKey = `config_${this.metadata.name}_${this.metadata.version}`;
      localStorage.setItem(storageKey, JSON.stringify(this.runtimeData));
      
      return { 
        success: true, 
        data: this.runtimeData,
        message: 'Data updated successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  handleSaveConfig(configData) {
    try {
      // Validate config data
      const validation = this.handleValidateData(configData);
      if (!validation.valid) {
        return { success: false, error: 'Config validation failed', details: validation.errors };
      }
      
      // Update config
      this.config = { ...this.config, ...configData };
      
      // Save to localStorage (SDK-independent storage)
      const storageKey = `config_${this.metadata.name}_${this.metadata.version}`;
      const backupKey = `config_backup_${this.metadata.name}_${this.metadata.version}`;
      
      // Create backup before saving
      if (localStorage.getItem(storageKey)) {
        localStorage.setItem(backupKey, localStorage.getItem(storageKey));
      }
      
      localStorage.setItem(storageKey, JSON.stringify(this.config));
      
      return { 
        success: true, 
        data: this.config,
        message: 'Configuration saved successfully',
        backup: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Lock the structure to prevent modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(componentModule.metadata);
}

export default componentModule;
```

---

## 📊 **Component Status & Health**

| Component | Health | Contract | Tests | Regression Risk | Action Required |
|-----------|---------|----------|-------|-----------------|----------------|
| **jsonEditor** | 100/100 ✅ | v2.0 | ✅ Full | Low | None |
| **pageTemplate** | 100/100 ✅ | v1.0 | ⚠️ Basic | Medium | Add smoke tests |
| **appHeader** | 100/100 ✅ | v1.0 | ⚠️ Basic | Medium | Update contract |
| **mainMenu** | 100/100 ✅ | v1.0 | ✅ Full | Low | Update contract |
| **loginForm** | 100/100 ✅ | v1.0 | ⚠️ Basic | Medium | Add smoke tests |
| **appFooter** | 100/100 ✅ | v1.0 | ⚠️ Basic | Medium | Add smoke tests |
| **pressurePanel** | 100/100 ✅ | v1.0 | ⚠️ Basic | High | Fix init pattern |
| **auditLogViewer** | 90/100 ✅ | v1.0 | ✅ Full | Low | Add package.json |
| **realtimeSensors** | 80/100 🟡 | v1.0 | ⚠️ Basic | High | Fix structure |
| **systemSettings** | 80/100 🟡 | v1.0 | ⚠️ Basic | High | Fix exports |
| **deviceData** | 80/100 🟡 | v1.0 | ⚠️ Basic | Medium | Update contract |
| **testMenu** | 85/100 🟡 | v1.0 | ⚠️ Issues | High | Fix 10 tests |
| **reportsViewer** | 75/100 🟡 | v1.0 | ❌ None | Very High | Add tests |
| **serviceMenu** | 60/100 🔴 | v1.0 | ❌ None | Very High | Major refactor |
| **userMenu** | 65/100 🔴 | v1.0 | ❌ None | Very High | Fix structure |
| **deviceHistory** | 75/100 🟡 | v1.0 | ❌ None | High | Add tests |
| **componentEditor** | 70/100 🟡 | v1.0 | ❌ None | High | Add tests |

---

## 🗂️ **Config & Data Management System**

### **SDK-Independent Validation & Storage**
Nowy system pozwala na walidację i zapisywanie danych bez względu na używane SDK:

```javascript
// Przykład użycia w komponencie
const component = await import('./index.js');
await component.init();

// Pobierz aktualne dane
const currentData = component.handle({ action: 'GET_RUNTIME_DATA' });

// Waliduj dane przed zapisem
const validation = component.handle({ 
  action: 'VALIDATE_DATA', 
  payload: { title: 'New Title', enabled: true } 
});

if (validation.valid) {
  // Zapisz dane (localStorage - niezależne od SDK)
  const result = component.handle({ 
    action: 'UPDATE_DATA', 
    payload: { title: 'New Title', enabled: true } 
  });
  console.log(result.message); // "Data updated successfully"
}

// Pobierz tłumaczenia
const translations = await component.handle({ 
  action: 'GET_TRANSLATIONS', 
  language: 'en' 
});
```

### **Config Structure Examples**

#### **config/schema.json** - Validation Rules
```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "enabled": { "type": "boolean" },
    "priority": { "type": "number", "minimum": 1, "maximum": 5 }
  },
  "required": ["title", "enabled"]
}
```

#### **config/data.json** - Runtime Values
```json
{
  "title": "Component Title",
  "enabled": true,
  "priority": 3,
  "lastModified": "2024-12-28T15:00:00Z"
}
```

#### **config/crud.json** - Edit Rules
```json
{
  "editable": ["title", "enabled", "priority"],
  "readonly": ["lastModified", "version"],
  "hidden": ["internal_id"]
}
```

#### **locales/pl.json** - Polish Translations
```json
{
  "title": "Tytuł Komponentu",
  "enabled": "Włączony",
  "priority": "Priorytet",
  "save": "Zapisz",
  "cancel": "Anuluj"
}
```

### **Available Actions**
```javascript
// Config & Data Management
component.handle({ action: 'GET_CONFIG' })           // Pobierz konfigurację
component.handle({ action: 'GET_SCHEMA' })           // Pobierz schemat walidacji
component.handle({ action: 'GET_RUNTIME_DATA' })     // Pobierz dane runtime
component.handle({ action: 'GET_CRUD_RULES' })       // Pobierz reguły CRUD

// Validation & Updates  
component.handle({ action: 'VALIDATE_DATA', payload: data })  // Waliduj dane
component.handle({ action: 'UPDATE_DATA', payload: updates }) // Aktualizuj dane
component.handle({ action: 'SAVE_CONFIG', payload: config })  // Zapisz konfigurację

// Translations
component.handle({ action: 'GET_TRANSLATIONS', language: 'en' }) // Pobierz tłumaczenia
```

### **Storage Strategy**
- **localStorage** - SDK-independent persistence
- **Automatic backup** - Before each save
- **CRUD validation** - Editable/readonly field checking
- **Schema validation** - Type and constraint checking

---

## 🔧 **Regression Prevention Tools**

### **1. Automated Validation**
```bash
# Run before any deployment
npm run validate:all

# Components structure validation
npm run validate:structure

# Contracts validation  
npm run validate:contracts

# Smoke tests (fast, <10s)
npm run test:smoke

# Full regression suite
npm run test:regression
```

### **2. Component Lock File**
```json
// .component-lock.json - Prevents breaking changes
{
  "componentName": {
    "version": "0.1.0",
    "contractVersion": "2.0",
    "criticalExports": ["init", "handle", "metadata"],
    "vueImportPattern": "global",
    "exportPattern": "instance",
    "lastValidated": "2024-12-28T10:00:00Z",
    "checksum": "sha256:abc123..."
  }
}
```

### **3. Pre-commit Hooks**
```json
// package.json
{
  "scripts": {
    "precommit": "npm run validate:changes && npm run test:smoke",
    "validate:changes": "node tools/validateChangedComponents.js",
    "test:smoke": "vitest run --reporter=dot tests/**/*.smoke.js"
  }
}
```

---

## 📋 **Safe Modification Checklist**

### **Before modifying ANY component:**
- [ ] Create backup: `cp -r component component.backup`
- [ ] Run current tests: `npm run test:component [name]`
- [ ] Check dependencies: `grep -r "componentName" js/`
- [ ] Review component lock file
- [ ] Verify Vue import pattern (global, not ES)
- [ ] Verify export pattern (instance, not factory)
- [ ] Document changes in CHANGELOG.md

### **After modification:**
- [ ] Run smoke tests: `npm run test:smoke`
- [ ] Run component dev server: `npm run component:dev:[name]`
- [ ] Check browser console for errors
- [ ] Verify UI renders correctly
- [ ] Run full test suite: `npm run test:component [name]`
- [ ] Update component lock file
- [ ] Commit with descriptive message

---

## 🚨 **Common LLM Mistakes to Avoid**

### **1. ❌ Changing Vue Import Pattern**
```javascript
// LLM often suggests (WRONG):
import { reactive } from 'vue';

// Must keep (CORRECT):
const { reactive } = Vue || window.Vue || {};
```

### **2. ❌ Converting to Factory Export**
```javascript
// LLM may suggest (WRONG):
export default createComponent;

// Must keep (CORRECT):
const component = createComponent();
export default component;
```

### **3. ❌ Removing "Unused" Functions**
```javascript
// LLM may remove (WRONG):
// Deleted: resetWizardData, loadCustomScenarios

// Must keep ALL exported functions (CORRECT):
return {
  resetWizardData,  // Used in tests!
  loadCustomScenarios,  // Used in tests!
  // ...
};
```

### **4. ❌ Modernizing Config Paths**
```javascript
// LLM suggests (WRONG):
import config from '@/config/component.json';

// Must keep relative (CORRECT):
import config from './config/config.json';
```

---

## Essential Commands
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

## 🎯 **Quick Commands Reference**

### **Development**
```bash
# Run specific component
npm run component:dev:userMenu    # Port 3010

# Run with auto-reload
npm run dev:watch userMenu

# Interactive selection
npm run playground
```

### **Testing**
```bash
# Quick validation (< 10s)
npm run test:smoke

# Component tests
npm run test:component userMenu

# Full regression (~ 2min)
npm run test:regression

# Watch mode
npm run test:watch userMenu
```

### **Analysis**
```bash
# Component health check
npm run analyze

# Dependency graph
npm run deps:graph

# Find broken imports
npm run deps:check
```

### **Building**
```bash
# Production build
npm run build

# Component widget
npm run build:component userMenu

# All widgets
npm run build:all-widgets
```

---

## 📝 **For AI Assistants**

### **CRITICAL RULES:**
- **NEVER** change Vue import patterns - Always use global Vue
- **NEVER** change export patterns - Always export instances
- **NEVER** remove functions - Even if they seem unused
- **ALWAYS** create backups - Before any modification
- **ALWAYS** run smoke tests - After changes
- **ALWAYS** preserve `_manual` flags - In config files

### **Before Making Changes:**
```javascript
// 1. Check current pattern
const currentFile = fs.readFileSync('index.js', 'utf8');
const usesGlobalVue = currentFile.includes('Vue || window.Vue');
const exportsInstance = !currentFile.includes('export default function');

// 2. Validate requirements
if (!usesGlobalVue) {
  console.warn('Component uses ES imports - needs migration');
}
if (!exportsInstance) {
  console.warn('Component exports factory - needs fix');
}

// 3. Create backup
fs.copyFileSync('index.js', 'index.js.backup');
```

### **After Making Changes:**
```javascript
// 1. Run smoke test
await import('./index.js').then(m => m.default.init());

// 2. Validate structure
const module = await import('./index.js');
assert(module.default.metadata);
assert(typeof module.default.init === 'function');
assert(typeof module.default.handle === 'function');

// 3. Update changelog
fs.appendFileSync('CHANGELOG.md', `
## [${new Date().toISOString().split('T')[0]}]
- Modified: [describe changes]
- Reason: [why changed]
- Risk: [low/medium/high]
`);
```

---

**Version**: 2.0.0  
**Last Updated**: 2024-12-28  
**Status**: Production Ready with Enhanced Safety  
**Components**: 17 total (15 production, 2 development)  
**Overall Health**: 86.2/100