# MASKSERVICE C20 Components - LLM Guidelines

## Project Structure (Unified)
```
js/features/[component]/[version]/
├── index.js              # Module export
├── [component].js        # Vue component
├── [component].test.js   # Tests
├── package.json          # Metadata
├── config/               # All configs here
│   ├── config.json       # Source config
│   ├── data.json         # Runtime values
│   ├── schema.json       # Validation
│   └── crud.json         # Edit rules
└── locales/              # Translations (optional)
```

## Quick Reference

### Component Locations
All components in: `js/features/[name]/0.1.0/`

| Component | Type | Purpose | Status |
|-----------|------|---------|--------|
| **pageTemplate** | Layout | Main grid container | ✅ Active |
| **appHeader** | Layout | Top bar with status | ✅ Active |
| **mainMenu** | Navigation | Role-based sidebar | ✅ Active |
| **loginForm** | Auth | Login + virtual keyboard | ✅ Active |
| **appFooter** | Layout | System info footer | ✅ Active |
| **pressurePanel** | Monitoring | Pressure gauges | ✅ Active |
| **realtimeSensors** | Monitoring | WebSocket data | ✅ Active |
| **deviceData** | Data | Device management | ⚠️ Beta |
| **systemSettings** | Config | Settings UI | ⚠️ Beta |
| **auditLogViewer** | Security | Audit logs | ✅ Active |

### Config File Purposes
- **config.json** - Full component configuration (source of truth)
- **data.json** - Runtime changeable values only
- **schema.json** - JSON Schema validation rules
- **crud.json** - Field editability and UI hints

## Component Template

### Minimal Working Component
```javascript
// js/features/myComponent/0.1.0/index.js
import component from './myComponent.js';
import config from './config/config.json';

export default {
  metadata: {
    name: 'myComponent',
    version: '0.1.0',
    type: 'component', // component|service|layout
    config: './config/'
  },
  component,
  async init(context) {
    const data = await import('./config/data.json');
    return { success: true, config: data };
  },
  async handle(request) {
    return { success: true, data: request };
  }
};
```

### Vue Component Structure
```javascript
// myComponent.js
export default {
  name: 'MyComponent',
  template: `<div class="my-component">{{text}}</div>`,
  data: () => ({ text: 'Hello' }),
  mounted() {
    console.log('Component mounted');
  }
};
```

## NPM Scripts

### Essential Commands
```bash
# Component operations
npm run module:init              # Create new component
npm run module:init-all          # Initialize all
npm run module:migrate           # Migrate to unified structure

# Config management (works with local configs)
npm run config:generate          # Generate schemas locally
npm run crud:generate            # Generate CRUD locally
npm run validate-all             # Validate everything

# Development
npm run dev                      # Start dev server
npm run build                    # Production build
npm run test                     # Run all tests
```

### Component-specific Commands
```bash
# Work with single component
npm run component:update [name]     # Update schemas/CRUD
npm run component:validate [name]   # Validate component
npm run component:test [name]       # Test component
```

## Configuration System

### Config Hierarchy
```
config.json (source) → schema.json (validation) → data.json (runtime) → crud.json (UI)
```

### Manual Changes Flag
```json
// Add to any .json file to preserve manual edits
{
  "_manual": true,
  "_modified": "2025-01-27T10:00:00Z",
  "_comment": "Reason for manual change"
}
```

### Config Sections
```javascript
{
  "component": {      // Metadata (don't generate schema)
    "name": "componentName",
    "version": "0.1.0"
  },
  "ui": {             // UI settings (generate schema)
    "theme": "default",
    "responsive": true
  },
  "api": {            // API config (generate schema)
    "baseUrl": "http://localhost:3000",
    "timeout": 30000
  },
  "performance": {    // Performance (generate schema)
    "cache": true,
    "updateInterval": 1000
  }
}
```

## Import Patterns

### Within Component
```javascript
// All imports are relative to component folder
import config from './config/config.json';
import schema from './config/schema.json';
import crud from './config/crud.json';
import data from './config/data.json';
```

### From Other Components
```javascript
// Import from other components
import appFooter from '../appFooter/0.1.0/index.js';
const footerConfig = await appFooter.getConfig();
```

## Data Access Patterns

### Reading Config
```javascript
// In component
async loadConfig() {
  const data = await import('./config/data.json');
  return data.default || data;
}
```

### Updating Config (Browser)
```javascript
// Store in localStorage for browser
updateConfig(updates) {
  const key = `config_${this.metadata.name}_${this.metadata.version}`;
  localStorage.setItem(key, JSON.stringify(updates));
}
```

### Validation
```javascript
// Validate against schema
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);
```

## Development Workflow

### 1. Create Component
```bash
npm run module:init
# Name: myComponent
# Type: component
# Edit: js/features/myComponent/0.1.0/config/config.json
npm run config:generate
```

### 2. Update Existing
```bash
# Edit files in js/features/[name]/0.1.0/
npm run component:update [name]
npm run component:test [name]
git commit -am "Updated component"
```

### 3. Manual Config Edit
```bash
# Edit js/features/[name]/0.1.0/config/schema.json
# Add "_manual": true
npm run component:validate [name]
```

## User Roles

| Role | Color | Routes |
|------|-------|--------|
| OPERATOR | #27ae60 | /dashboard, /monitoring |
| ADMIN | #f39c12 | + /tests, /reports, /users |
| SUPERUSER | #e74c3c | + /system |
| SERWISANT | #3498db | + /service, /calibration |

## Display Specs
- **Target**: 7.9" LCD (1280x400px)
- **Touch**: Min 40px targets
- **Grid**: Fixed layout, no responsive
- **Refresh**: 1s intervals via WebSocket

## State Management
```javascript
// Vuex store
{
  auth: { user, role, permissions },
  navigation: { currentRoute, menuState },
  sensors: { pressure1, pressure2, pressure3 },
  system: { deviceStatus, language }
}
```

## Testing
```javascript
// Component test template
import { describe, it, expect } from 'vitest';
import module from './index.js';

describe('Component', () => {
  it('initializes', async () => {
    const result = await module.init();
    expect(result.success).toBe(true);
  });
});
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Config not found | Check path: `./config/data.json` |
| Schema validation fails | Remove `_manual` flag, regenerate |
| Import errors | Use relative paths `./config/` |
| Component not loading | Check `index.js` exports |

## File Validation Rules

### Required Files
```
index.js         # Main export
[name].js        # Vue component
package.json     # Dependencies
config/
  └── config.json # Configuration
```

### Naming Convention
- Folders: camelCase (`appFooter`)
- Components: PascalCase (`AppFooter`)
- Files: camelCase (`appFooter.js`)
- CSS: kebab-case (`.app-footer`)

---

## For AI Assistants

When working with this codebase:

1. **All configs are local** - Look in `js/features/[name]/0.1.0/config/`
2. **Use npm scripts** - Don't manually create/modify files
3. **Check _manual flag** - Preserve manual edits
4. **Import relatively** - Use `./config/` within components
5. **Test changes** - Run `npm run validate-all`
6. **Version format** - Always use semantic versioning (0.1.0)

### Quick Commands
```bash
npm run module:init          # New component
npm run config:generate      # Generate schemas
npm run validate-all         # Validate everything
npm run dev                  # Start development
```

### Component Access
```javascript
// Get component config
const config = await import('./config/data.json');

// Update config
localStorage.setItem(`config_${name}_${version}`, JSON.stringify(data));

// Validate
const valid = ajv.validate(schema, data);
```