#!/usr/bin/env node

/**
 * Generate README.md files for components based on unified structure
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

class ComponentReadmeGenerator {
  constructor() {
    this.featuresDir = './js/features';
    this.generated = 0;
    this.errors = [];
  }

  async generateAll() {
    console.log(chalk.blue('📖 Generating README.md files for all components...'));
    
    try {
      const components = await this.findComponents();
      
      for (const component of components) {
        await this.generateReadme(component);
      }
      
      console.log(chalk.green(`\n✓ Generated ${this.generated} README files`));
      
      if (this.errors.length > 0) {
        console.log(chalk.red(`\n❌ Errors: ${this.errors.length}`));
        this.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      }
      
    } catch (error) {
      console.error(chalk.red('README generation failed:'), error.message);
      process.exit(1);
    }
  }

  async findComponents() {
    const components = [];
    
    if (!await fs.pathExists(this.featuresDir)) {
      throw new Error(`Features directory not found: ${this.featuresDir}`);
    }
    
    const componentDirs = await fs.readdir(this.featuresDir);
    
    for (const componentName of componentDirs) {
      const componentPath = path.join(this.featuresDir, componentName);
      const stat = await fs.stat(componentPath);
      
      if (stat.isDirectory()) {
        // Look for version directories
        const versions = await fs.readdir(componentPath);
        for (const version of versions) {
          const versionPath = path.join(componentPath, version);
          const configDir = path.join(versionPath, 'config');
          
          if (await fs.pathExists(configDir)) {
            components.push({
              name: componentName,
              version,
              path: versionPath,
              configDir
            });
          }
        }
      }
    }
    
    return components;
  }

  async generateReadme(component) {
    const { name, version, path: componentPath, configDir } = component;
    console.log(chalk.blue(`  Generating README for ${name}@${version}...`));
    
    try {
      // Load component metadata
      const metadata = await this.loadComponentMetadata(component);
      
      // Generate README content
      const readmeContent = this.generateReadmeContent(component, metadata);
      
      // Write README.md
      const readmePath = path.join(componentPath, 'README.md');
      await fs.writeFile(readmePath, readmeContent);
      
      console.log(chalk.green(`    ✓ Generated README.md`));
      this.generated++;
      
    } catch (error) {
      const errorMsg = `Failed to generate README for ${name}@${version}: ${error.message}`;
      this.errors.push(errorMsg);
      console.log(chalk.red(`    ❌ ${error.message}`));
    }
  }

  async loadComponentMetadata(component) {
    const { configDir, path: componentPath } = component;
    const metadata = {
      config: null,
      packageJson: null,
      hasVueComponent: false,
      hasTests: false,
      hasIndex: false
    };
    
    try {
      // Load config
      const configPath = path.join(configDir, 'config.json');
      if (await fs.pathExists(configPath)) {
        metadata.config = await fs.readJson(configPath);
      }
      
      // Load package.json
      const packagePath = path.join(componentPath, 'package.json');
      if (await fs.pathExists(packagePath)) {
        metadata.packageJson = await fs.readJson(packagePath);
      }
      
      // Check for files
      const files = await fs.readdir(componentPath);
      metadata.hasVueComponent = files.some(f => f.endsWith('.js') && f.includes(component.name));
      metadata.hasTests = files.some(f => f.endsWith('.test.js'));
      metadata.hasIndex = files.includes('index.js');
      
    } catch (error) {
      console.log(chalk.yellow(`    ⚠ Could not load all metadata: ${error.message}`));
    }
    
    return metadata;
  }

  generateReadmeContent(component, metadata) {
    const { name, version } = component;
    const config = metadata.config || {};
    const packageJson = metadata.packageJson || {};
    
    const displayName = config.component?.displayName || 
                       packageJson.displayName || 
                       this.toTitleCase(name);
    
    const description = config.component?.description || 
                       packageJson.description || 
                       `${displayName} component for MASKSERVICE system`;
    
    const componentType = config.component?.type || 'component';
    const category = config.component?.category || 'ui-component';

    return `# ${displayName}

${description}

## 📋 Component Information

- **Name**: \`${name}\`
- **Version**: \`${version}\`
- **Type**: \`${componentType}\`
- **Category**: \`${category}\`
- **Status**: ${this.getComponentStatus(component, metadata)}

## 🚀 Quick Start

### Development Server
Run this component in isolation for development and testing:

\`\`\`bash
# Start dev server for this component
npm run component:dev:${name}

# Or manually with custom port
node tools/dev/componentDevServer.js js/features/${name}/${version} 3001
\`\`\`

**Available URLs:**
- 🏠 Component: http://localhost:3001
- 🎮 Demo: http://localhost:3001/demo  
- ⚙️ Admin: http://localhost:3001/admin
- 📊 API: http://localhost:3001/api/info

### Integration Usage
\`\`\`javascript
import ${this.toCamelCase(name)} from './js/features/${name}/${version}/index.js';

// Initialize component
const result = await ${this.toCamelCase(name)}.init(context);

// Use component
if (${this.toCamelCase(name)}.component) {
  // Vue component available
  const VueComponent = ${this.toCamelCase(name)}.component;
}

// Handle actions
const response = ${this.toCamelCase(name)}.handle({
  action: 'render',
  data: { /* your data */ }
});
\`\`\`

## 📁 Project Structure

\`\`\`
${name}/
├── ${version}/
│   ├── index.js                 # Main module export
│   ├── ${name}.js              # Vue component${metadata.hasVueComponent ? ' ✅' : ' ❌'}
│   ├── ${name}.test.js         # Component tests${metadata.hasTests ? ' ✅' : ' ❌'}
│   ├── package.json            # Module metadata
│   ├── config/                 # Configuration directory
│   │   ├── config.json         # Main configuration
│   │   ├── data.json           # Runtime data
│   │   ├── schema.json         # Validation schema  
│   │   └── crud.json           # Edit rules
│   ├── CHANGELOG.md            # Version history
│   ├── TODO.md                 # Development tasks
│   └── README.md               # This file
\`\`\`

## ⚙️ Configuration

### Main Config (\`config/config.json\`)
${this.generateConfigDocumentation(config)}

### Runtime Data (\`config/data.json\`)
Editable runtime values that can be modified without code changes.

### Schema (\`config/schema.json\`)
JSON Schema for configuration validation - auto-generated from config structure.

### CRUD Rules (\`config/crud.json\`)
Defines which fields are editable, readonly, or protected in admin interfaces.

## 🔧 Development

### Local Testing
\`\`\`bash
# Run component tests
npm test -- ${name}.test.js

# Validate configuration
npm run module:validate ${name}

# Update schemas after config changes
npm run config:generate-components
\`\`\`

### Configuration Updates
1. Edit \`config/config.json\` for structural changes
2. Edit \`config/data.json\` for runtime value updates  
3. Run \`npm run config:generate-components\` to update schemas
4. Test changes with \`npm run component:dev:${name}\`

### Manual Schema Edits
To preserve manual schema changes:
\`\`\`json
{
  "_manual": true,
  "_modified": "2025-01-27T10:00:00Z",
  "_comment": "Custom validation rules",
  // your manual schema...
}
\`\`\`

## 🎛️ Admin Interface

Access the admin interface at http://localhost:3001/admin when running dev server:

- **Config Editor**: Edit runtime data with live validation
- **Schema Viewer**: View current validation rules  
- **Reset Tools**: Restore default configurations
- **Export/Import**: Backup and restore configurations

## 📊 API Endpoints

When running the dev server, these API endpoints are available:

| Endpoint | Method | Description |
|----------|---------|-------------|
| \`/api/info\` | GET | Component information |
| \`/api/config\` | GET | Full configuration |
| \`/api/data\` | GET | Runtime data only |
| \`/api/data\` | POST | Update runtime data |
| \`/api/reset\` | POST | Reset to defaults |

### API Usage Examples
\`\`\`javascript
// Get component info
const info = await fetch('http://localhost:3001/api/info').then(r => r.json());

// Get current data
const data = await fetch('http://localhost:3001/api/data').then(r => r.json());

// Update data
const updated = await fetch('http://localhost:3001/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'newValue' })
}).then(r => r.json());
\`\`\`

## 🧪 Testing

${metadata.hasTests ? `
### Running Tests
\`\`\`bash
npm test -- ${name}.test.js
\`\`\`

### Test Coverage
- ✅ Component initialization
- ✅ Configuration validation  
- ✅ API response handling
- ✅ Error scenarios
` : `
### Tests Status
❌ Tests not yet implemented

To add tests:
1. Create \`${name}.test.js\`
2. Use Vitest framework
3. Test component initialization, config validation, and API responses
`}

## 🔍 Dependencies

${this.generateDependenciesSection(packageJson, config)}

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Dev server won't start | Check port availability, run \`npm install\` |
| Config validation fails | Check \`config/schema.json\`, validate JSON syntax |
| Component not loading | Verify \`index.js\` exports, check browser console |
| API calls fail | Ensure dev server is running, check CORS settings |

### Debug Commands
\`\`\`bash
# Validate component structure
npm run module:validate ${name}

# Check configuration
npm run config:validate

# View component info
curl http://localhost:3001/api/info

# Test API endpoints
curl http://localhost:3001/api/data
\`\`\`

## 📝 Changelog

See \`CHANGELOG.md\` for version history and updates.

## 🎯 TODOs

See \`TODO.md\` for pending development tasks.

---

**Generated**: ${new Date().toISOString()}  
**Generator**: componentReadmeGenerator v1.0.0  
**Component**: ${name}@${version}
`;
  }

  generateConfigDocumentation(config) {
    if (!config || Object.keys(config).length === 0) {
      return 'No configuration available.';
    }

    let doc = 'Configuration sections:\n\n';
    
    for (const [section, data] of Object.entries(config)) {
      if (section.startsWith('_')) continue; // Skip metadata
      
      doc += `#### \`${section}\`\n`;
      
      switch (section) {
        case 'component':
          doc += 'Component metadata and identification\n';
          break;
        case 'ui':
          doc += 'User interface settings and styling\n';
          break;
        case 'data':
          doc += 'Default runtime data values\n';
          break;
        case 'api':
          doc += 'API connection configuration\n';
          break;
        case 'performance':
          doc += 'Performance and optimization settings\n';
          break;
        case 'security':
          doc += 'Security and validation rules\n';
          break;
        default:
          doc += `${section.charAt(0).toUpperCase() + section.slice(1)} configuration\n`;
      }
      
      if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data).slice(0, 3); // Show first 3 keys
        if (keys.length > 0) {
          doc += `- Key properties: \`${keys.join('`, `')}\`${keys.length < Object.keys(data).length ? ', ...' : ''}\n`;
        }
      }
      
      doc += '\n';
    }
    
    return doc;
  }

  generateDependenciesSection(packageJson, config) {
    let deps = [];
    
    if (packageJson.dependencies) {
      deps = deps.concat(Object.keys(packageJson.dependencies));
    }
    
    if (config.component?.dependencies) {
      deps = deps.concat(config.component.dependencies);
    }
    
    if (deps.length === 0) {
      return 'No external dependencies';
    }
    
    const uniqueDeps = [...new Set(deps)];
    return uniqueDeps.map(dep => `- \`${dep}\``).join('\n');
  }

  getComponentStatus(component, metadata) {
    const checks = [
      metadata.hasIndex,
      metadata.hasVueComponent, 
      metadata.config !== null,
      metadata.hasTests
    ];
    
    const passed = checks.filter(Boolean).length;
    const total = checks.length;
    
    if (passed === total) return '🟢 **Complete**';
    if (passed >= total * 0.75) return '🟡 **Nearly Complete**';
    if (passed >= total * 0.5) return '🟠 **In Development**';
    return '🔴 **Needs Work**';
  }

  toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ComponentReadmeGenerator();
  generator.generateAll().catch(console.error);
}

export default ComponentReadmeGenerator;
