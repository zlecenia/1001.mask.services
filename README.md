# MASKSERVICE C20 1001 v3.0

**Modular MASKSERVICE system with FeatureRegistry and automated module generation**

## 🎯 Project Overview

This is a complete migration and modernization of the `c201001.mask.services` system to a new modular architecture. The system is optimized for **7.9" LCD displays in landscape mode (400x1280px)** with touch interface support.

### Key Features

- 🏗️ **Modular Architecture**: FeatureRegistry system with versioned modules
- 🔧 **Automated Module Generation**: Create new modules from prompts
- 🧪 **Comprehensive Testing**: Vitest with rollback capabilities
- 👆 **Touch Optimized**: Virtual keyboard for 7.9" displays
- 🔐 **Role-Based Access**: OPERATOR, ADMIN, SUPERUSER, SERWISANT roles
- 🌐 **Multi-Language**: PL/EN/DE support
- 📊 **Real-time Monitoring**: Pressure sensors and system status

## 📁 Project Structure

```
1001.mask.services/
├── README.md                    # This file
├── package.json                 # Dependencies and scripts
├── vitest.config.js            # Testing configuration
├── index.html                  # Main application entry point
├── js/
│   ├── FeatureRegistry.js      # Core module management system
│   ├── registerAllModules.js  # Auto-discovery and registration
│   ├── moduleManagerWithPackageJson.js # Automated module generation
│   ├── test-setup.js          # Testing utilities
│   └── features/              # All versioned modules
│       ├── pageTemplate/0.1.0/   # Page layout template
│       ├── mainMenu/0.1.0/       # Role-based menu system
│       └── loginForm/0.1.0/      # Login with virtual keyboard
├── config/                    # Application configuration
├── css/                      # Stylesheets
├── docs/                     # Documentation
├── locales/                  # Translation files
└── scripts/                  # Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ (for testing and development)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- HTTP server for development

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📱 Display Optimization

### 7.9" Landscape Display (400x1280px)

The system is specifically optimized for industrial 7.9" LCD displays:

- **Header**: 40px height (35px on smaller screens)
- **Footer**: 30px height (25px on smaller screens)  
- **Sidebar**: 180px width (150px on smaller screens)
- **Content**: Remaining space with 4px padding
- **Virtual Keyboard**: Up to 60% of screen height

## 👥 User Roles & Access Control

### OPERATOR (2 menu options)
- Tests execution and viewing
- Reports viewing and basic export

### ADMIN (4 menu options)  
- User management and system configuration
- Advanced reporting and backup operations

### SUPERUSER (4 advanced options)
- System integration and API management
- Advanced analytics and security audits

### SERWISANT (5 technical options)
- Hardware diagnostics and maintenance
- Workshop management and documentation
- Quality control and certification

## 📊 Current Modules

### pageTemplate@0.1.0
- Base page layout for 7.9" landscape display
- Header, sidebar, content area, footer structure
- Touch-friendly responsive design

### mainMenu@0.1.0  
- Role-based menu system with hierarchical structure
- Permission validation for all 4 user roles
- Unique menu items per role (no overlap)

### loginForm@0.1.0
- Login form with virtual keyboard for touch displays
- Role selection and credential validation
- Prevents native keyboard on mobile devices

## 📈 Migration Status

### ✅ Completed Core Architecture
- [x] Modular FeatureRegistry system
- [x] Automated module generation from prompts
- [x] Three core modules (pageTemplate, mainMenu, loginForm)
- [x] Testing framework with Vitest and rollback
- [x] Main application entry point with Vue 3
- [x] 7.9" display optimization
- [x] Role-based access control system
- [x] Virtual keyboard for touch interface

### 🔄 Next Steps
- [ ] End-to-end testing of module system
- [ ] Convert existing .vue components to .js format
- [ ] Integrate real-time sensor monitoring
- [ ] Complete multi-language implementation

---

**MASKSERVICE C20 1001 v3.0** - Modular Industrial Testing System