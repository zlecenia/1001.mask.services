# 📚 Documentation Index - MASKSERVICE C20 1001

Complete documentation overview for the MASKSERVICE industrial control system.

## 🎯 Quick Navigation

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](../README.md) | Project overview & quick start | Everyone |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Development workflows | Developers |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & patterns | Architects |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Installation & deployment | DevOps |
| [API_REFERENCE.md](./API_REFERENCE.md) | Component APIs | Developers |
| [COMPONENTS.md](../components.md) | Component health & overview | Everyone |

---

## 📖 Documentation Categories

### 🚀 Getting Started

#### For New Users
1. **[Project README](../README.md)** - Start here for project overview
2. **[Component Overview](../components.md)** - Understand the 16 components
3. **[JSON Editor Usage](../EXAMPLE_JSON_EDITOR_USAGE.md)** - Configuration management

#### For Developers
1. **[Developer Guide](./DEVELOPER_GUIDE.md)** - Complete development workflows
2. **[Architecture Guide](./ARCHITECTURE.md)** - System design principles
3. **[API Reference](./API_REFERENCE.md)** - Component interfaces

#### For DevOps
1. **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Installation & production setup
2. **[Configuration Guide](#configuration)** - System configuration
3. **[Monitoring Guide](#monitoring)** - Health & maintenance

---

## 🏗️ System Architecture

### Core Documentation
- **[Architecture Overview](./ARCHITECTURE.md)** - Complete system design
- **[Component Structure](./ARCHITECTURE.md#component-architecture)** - Component patterns
- **[Data Flow](./ARCHITECTURE.md#data-flow)** - Information flow patterns
- **[Security Model](./ARCHITECTURE.md#security-model)** - RBAC and protection

### Component Documentation
Each component has its own README.md with:
- Purpose and features
- Configuration options
- API interface
- Usage examples
- Testing information

```bash
# Component documentation locations:
js/features/[component]/0.1.0/README.md

# Example paths:
js/features/jsonEditor/0.1.0/README.md
js/features/appHeader/0.1.0/README.md
js/features/mainMenu/0.1.0/README.md
```

---

## 🛠️ Development

### Development Workflows
- **[Component Development](./DEVELOPER_GUIDE.md#component-development)** - Creating new components
- **[Testing Strategy](./DEVELOPER_GUIDE.md#testing-strategy)** - Unit & integration testing
- **[Debugging Guide](./DEVELOPER_GUIDE.md#debugging-guide)** - Troubleshooting issues
- **[Best Practices](./DEVELOPER_GUIDE.md#best-practices)** - Code quality standards

### JSON Editor - Configuration Management
- **[Usage Guide](../EXAMPLE_JSON_EDITOR_USAGE.md)** - Visual configuration editing
- **[Component Integration](../EXAMPLE_JSON_EDITOR_USAGE.md#component-integration)** - Editing other components
- **[Schema Validation](../EXAMPLE_JSON_EDITOR_USAGE.md#schema-validation)** - Safety features

### Tools & Scripts
```bash
# Development
npm run component:dev:[name]     # Individual component servers
npm run playground               # Component selector
npm run dev                      # Main application

# Analysis & Quality
npm run analyze                  # Component health check
npm run screenshots              # Visual documentation
npm run config:validate          # Configuration validation

# Testing
npm test                         # Run all tests
npm run test:[component]         # Component-specific tests
```

---

## 🚀 Deployment

### Environment Setup
- **[Prerequisites](./DEPLOYMENT_GUIDE.md#prerequisites)** - Hardware & software requirements
- **[Development Setup](./DEPLOYMENT_GUIDE.md#development-deployment)** - Local development
- **[Production Setup](./DEPLOYMENT_GUIDE.md#production-deployment)** - Industrial deployment
- **[Docker Setup](./DEPLOYMENT_GUIDE.md#docker-deployment)** - Containerized deployment

### Configuration Management
- **[System Configuration](./DEPLOYMENT_GUIDE.md#system-configuration)** - Core system setup
- **[Component Configuration](../EXAMPLE_JSON_EDITOR_USAGE.md)** - Using JSON Editor
- **[Security Configuration](./DEPLOYMENT_GUIDE.md#security-considerations)** - Access control

### Monitoring & Maintenance
- **[Health Monitoring](./DEPLOYMENT_GUIDE.md#monitoring--maintenance)** - System health
- **[Log Management](./DEPLOYMENT_GUIDE.md#log-management)** - Logging configuration  
- **[Backup Strategy](./DEPLOYMENT_GUIDE.md#backup-strategy)** - Data protection
- **[Update Procedures](./DEPLOYMENT_GUIDE.md#update-procedure)** - System updates

---

## 🔧 Component Reference

### Component Health Status

Current system status (run `npm run analyze` for latest):

```
🏆 Perfect Score (100/100): 8 components
🟢 Excellent (90-99): 1 component  
🟢 Good (70-89): 4 components
🟡 Needs Work (50-69): 3 components
📊 System Average: 84.4/100
```

### Component Categories

#### Layout Components
- **[pageTemplate](../js/features/pageTemplate/0.1.0/README.md)** - Main grid layout
- **[appHeader](../js/features/appHeader/0.1.0/README.md)** - Top navigation bar
- **[appFooter](../js/features/appFooter/0.1.0/README.md)** - Status footer
- **[mainMenu](../js/features/mainMenu/0.1.0/README.md)** - Role-based menu

#### Utility Components
- **[jsonEditor](../js/features/jsonEditor/0.1.0/README.md)** - Visual config editor ⭐
- **[loginForm](../js/features/loginForm/0.1.0/README.md)** - Authentication with virtual keyboard

#### Data Components
- **[deviceData](../js/features/deviceData/0.1.0/README.md)** - Device management
- **[deviceHistory](../js/features/deviceHistory/0.1.0/README.md)** - Device logs
- **[auditLogViewer](../js/features/auditLogViewer/0.1.0/README.md)** - Security logs

#### Monitoring Components
- **[realtimeSensors](../js/features/realtimeSensors/0.1.0/README.md)** - Live sensor data
- **[pressurePanel](../js/features/pressurePanel/0.1.0/README.md)** - Pressure monitoring

#### Interface Components
- **[systemSettings](../js/features/systemSettings/0.1.0/README.md)** - System configuration
- **[userMenu](../js/features/userMenu/0.1.0/README.md)** - User management
- **[serviceMenu](../js/features/serviceMenu/0.1.0/README.md)** - Service operations
- **[testMenu](../js/features/testMenu/0.1.0/README.md)** - Testing interface
- **[reportsViewer](../js/features/reportsViewer/0.1.0/README.md)** - Report generation

---

## 🔍 API Reference

### Component API Interface

Every component must implement:

```javascript
export default {
  component: VueComponent,        // Vue 3 component
  metadata: ComponentMetadata,    // Component information
  init: async (context) => {...}, // Initialize component
  handle: async (action, params) => {...}, // Handle actions
  lifecycle: LifecycleHooks       // Mount/unmount hooks
};
```

### JSON Editor API

Configuration management interface:

```javascript
// Load component configuration
await JsonEditor.loadComponentConfig(component, file);

// Save component configuration  
await JsonEditor.saveComponentConfig(component, file, data);

// Validate JSON against schema
const result = JsonEditor.validateJSON(data, schema);

// Export/Import JSON files
JsonEditor.exportJSON(data, filename);
const data = await JsonEditor.importJSON(file);
```

### System APIs

```javascript
// Component registry
const component = FeatureRegistry.getComponent(name);
const components = FeatureRegistry.listComponents();

// Health monitoring
const health = await SystemHealth.analyzeComponent(name);
const report = await SystemHealth.generateReport();

// Configuration validation
const result = await ConfigValidator.validate(component, config);
```

---

## 📊 Quality Assurance

### Testing Documentation
- **[Testing Strategy](./DEVELOPER_GUIDE.md#testing-strategy)** - Testing approach
- **[Component Tests](./DEVELOPER_GUIDE.md#component-testing)** - Unit testing
- **[Integration Tests](./DEVELOPER_GUIDE.md#integration-testing)** - System testing

### Quality Metrics
- **[Health Analysis](../component-health-report.json)** - Automated health report
- **[Test Results](./DEVELOPER_GUIDE.md#test-results)** - Test success rates
- **[Performance Metrics](./ARCHITECTURE.md#performance-considerations)** - System performance

### Visual Documentation
- **[Screenshot System](../tools/screenshots/)** - Automated visual docs
- **[Component Screenshots](../js/features/*/0.1.0/*.png)** - Visual references
- **[Error Detection](../tools/screenshots/generateScreenshots.js)** - Visual validation

---

## 🔧 Tools & Utilities

### Development Tools
```bash
# Component Development
npm run component:dev:jsonEditor    # JSON Editor (Port 3009)
npm run component:dev:appHeader     # AppHeader (Port 3002)
npm run playground                  # Component selector

# Analysis Tools
npm run analyze                     # Component health analysis
npm run screenshots                 # Generate visual documentation
npm run config:validate             # Validate all configurations

# Migration Tools
npm run module:init                 # Create new component
npm run module:migrate              # Migrate component structure
npm run readme:generate             # Update documentation
```

### Configuration Tools
- **[JSON Editor](../js/features/jsonEditor/0.1.0/)** - Visual configuration management
- **[Schema Validator](../tools/validation/)** - Configuration validation
- **[Config Generator](../tools/generators/)** - Automated config creation

### Analysis Tools
- **[Component Analyzer](../tools/analysis/)** - Health assessment
- **[Screenshot Generator](../tools/screenshots/)** - Visual documentation
- **[Performance Monitor](../tools/monitoring/)** - System metrics

---

## 📝 Configuration

### Configuration Files Structure

```
config/
├── development.json    # Development environment
├── production.json     # Production environment
├── test.json          # Test environment
└── local.json         # Local overrides

js/features/[component]/0.1.0/config/
├── config.json        # Component settings
├── data.json          # Runtime data
├── schema.json        # Validation schema
└── crud.json          # Operations definition
```

### Schema Types

The system supports 6 built-in configuration schemas:

1. **app** - Application settings (API URLs, connection settings)
2. **menu** - Menu structure for user roles
3. **router** - Navigation and routing configuration
4. **system** - System security and operational settings
5. **test-scenarios** - Device testing parameters
6. **workshop** - Parts and tools management

### Configuration Management

**Recommended**: Use [JSON Editor](../EXAMPLE_JSON_EDITOR_USAGE.md) for all configuration changes:

```bash
# Launch JSON Editor
npm run component:dev:jsonEditor

# Safe configuration process:
# 1. Select component
# 2. Select configuration file
# 3. Apply appropriate schema
# 4. Edit values visually
# 5. Validate changes
# 6. Save configuration
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Component Issues
- **Component not loading**: Run `npm run analyze` to check health
- **Configuration errors**: Use JSON Editor to fix validation issues
- **Missing files**: Run `npm run module:init-all` to regenerate

#### Development Issues
- **Server won't start**: Check port availability and permissions
- **Tests failing**: Verify component structure and dependencies
- **Build errors**: Check Node.js version and clean install

#### Production Issues
- **Service not starting**: Check logs with `journalctl -u maskservice`
- **Performance issues**: Monitor resources and check component health
- **Configuration issues**: Validate configs and restore from backup

### Debug Resources
- **[Debugging Guide](./DEVELOPER_GUIDE.md#debugging-guide)** - Complete debugging workflow
- **[Troubleshooting](./DEPLOYMENT_GUIDE.md#troubleshooting)** - Production issues
- **[Error Recovery](./DEPLOYMENT_GUIDE.md#emergency-recovery)** - Emergency procedures

---

## 📞 Support & Contributing

### Getting Help
1. Check relevant documentation section
2. Run `npm run analyze` for system diagnostics
3. Review component-specific README files
4. Check browser console for client-side errors
5. Review logs for server-side issues

### Contributing
- Follow [development workflows](./DEVELOPER_GUIDE.md#development-workflow)
- Use [JSON Editor](../EXAMPLE_JSON_EDITOR_USAGE.md) for configuration changes
- Run tests and health checks before submitting
- Update documentation for new features

### Documentation Updates
- Documentation is automatically updated with component changes
- Screenshots are regenerated with `npm run screenshots`
- Health reports refresh with `npm run analyze`
- README files are updated with `npm run readme:generate`

---

## 🔄 Version History

### v3.0.0 (Current)
- ✨ **NEW**: JSON Editor component for visual configuration
- 📊 **Enhanced**: Component health monitoring system
- 📸 **Improved**: Screenshot generation with error detection
- 🧪 **Enhanced**: Testing framework with 87.5%+ success rate
- 📖 **Complete**: Documentation overhaul with guides

### Previous Versions
- **v2.x** - Component migration and modularization
- **v1.x** - Initial system development

---

## 📋 Quick References

### Essential Commands
```bash
# Get Started
npm install && npm run analyze

# Development
npm run component:dev:jsonEditor    # Configuration editor
npm run playground                  # Component selector

# Maintenance  
npm run analyze                     # Health check
npm run screenshots                 # Update visuals
npm run config:validate             # Validate configs
```

### Key Files
```
README.md                    # Project overview
components.md                # Component health status
EXAMPLE_JSON_EDITOR_USAGE.md # Configuration guide
component-health-report.json # Detailed health metrics
```

### Important URLs
```
JSON Editor:     http://localhost:3009
Component Dev:   http://localhost:300X (X = component specific)
Main App:        http://localhost:8080 (production)
```

---

**MASKSERVICE C20 1001 Documentation v3.0**  
*Complete reference for industrial control system development and deployment*

**📚 Documentation Last Updated**: 2024-12-28  
**🏥 System Health**: 84.4/100 (Excellent)  
**🔧 Components**: 16 total, 13 production ready
