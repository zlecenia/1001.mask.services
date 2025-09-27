# MASKSERVICE C20 Components - LLM Guidelines


## Project Structure
```
maskservice-c20/
├── js/features/          # Vue 3 components (versioned)
├── config/              # JSON configurations
├── configs/             # Generated schemas & CRUD
├── tools/               # Generators & validators
└── package.json         # NPM scripts & config
```

### Key Paths
- **Components**: `js/features/[componentName]/0.1.0/`
- **Configs**: `config/[name].json` → `config/[name]/data.json|schema.json|crud.json`
- **Tools**: `tools/generators/`, `tools/validators/`, `tools/init/`

## Component Architecture

### Standard Component Structure
```javascript
// js/features/[componentName]/0.1.0/index.js
export default {
  metadata: {
    name: 'componentName',
    version: '0.1.0',
    type: 'component|service|layout',
    dependencies: ['vue', 'vuex']
  },
  component: VueComponent,      // Vue 3 component
  async init(context) {},       // Initialize
  async handle(request) {},     // Handle actions
  async destroy() {}           // Cleanup
}
```

### Configuration Files
Each component has:
1. **config.json** - Source configuration
2. **package.json** - Module metadata
3. **[name].js** - Vue component
4. **[name].test.js** - Tests

## Available Components

| Component | Path | Type | Purpose |
|-----------|------|------|---------|
| **pageTemplate** | `js/features/pageTemplate/0.1.0/` | Layout | Main grid container (header/menu/content/footer) |
| **appHeader** | `js/features/appHeader/0.1.0/` | Layout | Top bar with status & language |
| **mainMenu** | `js/features/mainMenu/0.1.0/` | Navigation | Role-based sidebar menu |
| **loginForm** | `js/features/loginForm/0.1.0/` | Auth | Login with virtual keyboard |
| **appFooter** | `js/features/appFooter/0.1.0/` | Layout | System info footer |
| **pressurePanel** | `js/features/pressurePanel/0.1.0/` | Monitoring | Real-time pressure gauges |
| **realtimeSensors** | `js/features/realtimeSensors/0.1.0/` | Monitoring | WebSocket sensor data |
| **deviceData** | `js/features/deviceData/0.1.0/` | Data | Device management |
| **systemSettings** | `js/features/systemSettings/0.1.0/` | Config | System configuration UI |
| **auditLogViewer** | `js/features/auditLogViewer/0.1.0/` | Security | Audit log display |

## Configuration System

### Config → Schema → CRUD Pipeline
```
config/app.json → config/app/
  ├── data.json    # Runtime values
  ├── schema.json  # Validation rules
  └── crud.json    # Edit permissions
```

### Manual Changes Preservation
```json
// Mark files as manual to preserve changes
{
  "_manual": true,
  "_comment": "Custom validation for API URLs",
  // your manual changes...
}
```

## NPM Scripts Reference

### Essential Commands
```bash
# Module Management
npm run module:init          # Create new component
npm run module:init-all      # Initialize all modules
npm run module:list          # List all components

# Configuration
npm run config:generate      # Generate schemas from configs
npm run crud:generate        # Generate CRUD rules
npm run validate-all         # Validate everything

# Development
npm run dev                  # Start dev server
npm run test                 # Run tests
npm run build               # Production build
```

## Development Workflow

### 1. Creating New Component
```bash
npm run module:init
# Follow interactive prompts
# Edit js/features/[name]/0.1.0/config.json
npm run config:generate
```

### 2. Modifying Existing Component
```bash
# Edit component files
npm run validate-all
npm run test
git commit
```

### 3. Manual Config Editing
```bash
# Edit config/[name]/schema.json
# Add "_manual": true
npm run crud:generate --preserve
```

## Key Technologies

- **Vue 3.4** - Composition API preferred
- **Vuex 4** - State management
- **Vite 5** - Build tool
- **Vitest** - Testing
- **Vue-i18n** - Translations (pl/en/de)

## Display Specifications

- **Target**: 7.9" LCD IPS (1280x400px)
- **Touch**: Min 40px targets
- **Layout**: Fixed grid, no responsive breakpoints
- **Performance**: 1s data refresh, WebSocket for real-time

## User Roles & Permissions

| Role | Color | Access |
|------|-------|--------|
| OPERATOR | Green | Dashboard, Monitoring |
| ADMIN | Orange | + Tests, Reports, Users |
| SUPERUSER | Red | + System config |
| SERWISANT | Blue | + Service, Calibration |

## Component Communication

### State Management
```javascript
// Vuex store structure
{
  auth: { user, role, permissions },
  navigation: { currentRoute, menuState },
  sensors: { pressure1, pressure2, pressure3 },
  system: { deviceStatus, language }
}
```

### Data Service Integration
```javascript
// Inject in component
const dataService = inject('dataService');
const config = await dataService.get('appFooter_ui');
dataService.watch('appFooter_ui', callback);
```

## Testing Requirements

- Unit tests for logic
- Integration tests for component interaction
- Min 80% coverage
- Test file: `[name].test.js`

## File Validation Rules

### Required Files
- `index.js` - Module export
- `config.json` - Configuration
- `package.json` - Dependencies
- `README.md` - Documentation

### Naming Conventions
- Components: PascalCase (`MainMenu`)
- Files: camelCase (`mainMenu.js`)
- CSS: kebab-case (`.main-menu`)
- Config sections: snake_case (`api_config`)

## Common Patterns

### Component Registration
```javascript
// js/registerAllModules.js
registry.register('componentName', '0.1.0', component);
```

### Config Access
```javascript
const config = await import('./config.json');
const { ui, api, performance } = config;
```

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.on('pressure:update', (data) => {
  store.commit('sensors/UPDATE', data);
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm run module:init-all` |
| Config validation fails | Check schema.json, run `npm run validate-all` |
| Manual changes lost | Add `"_manual": true` to preserved files |
| Tests failing | Check test setup in vitest.config.js |

## Quick Component Template

```javascript
// Minimal working component
export default {
  metadata: {
    name: 'myComponent',
    version: '0.1.0',
    type: 'component'
  },
  component: {
    name: 'MyComponent',
    template: '<div>{{text}}</div>',
    data: () => ({ text: 'Hello' })
  },
  async init() { return { success: true }; }
};
```

---

**For AI Assistants**: When working with this codebase:
1. Always check actual file paths in `js/features/`
2. Use npm scripts for operations, don't create files manually
3. Preserve `_manual` flags in configs
4. Follow versioning (0.1.0 format)
5. Test changes with `npm run validate-all`