/**
 * Register All Modules
 * Automatically discover and register all modules in the features directory
 */
import fs from 'fs';
import path from 'path';
import { registry } from './FeatureRegistry.js';

const FEATURES_DIR = path.join(process.cwd(), 'js/features');

/**
 * Check if a path is a valid module directory
 * @param {string} dirPath - Directory path to check
 * @returns {boolean} True if it's a valid module directory
 */
function isValidModuleDirectory(dirPath) {
  const indexPath = path.join(dirPath, 'index.js');
  const packagePath = path.join(dirPath, 'package.json');
  
  return fs.existsSync(indexPath) || fs.existsSync(packagePath);
}

/**
 * Load package.json metadata if it exists
 * @param {string} modulePath - Path to module version directory
 * @returns {object|null} Package.json content or null
 */
function loadPackageMetadata(modulePath) {
  const packagePath = path.join(modulePath, 'package.json');
  
  try {
    if (fs.existsSync(packagePath)) {
      const content = fs.readFileSync(packagePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠ Failed to load package.json for ${modulePath}:`, error.message);
  }
  
  return null;
}

/**
 * Register a single module version
 * @param {string} moduleName - Name of the module
 * @param {string} version - Version string (e.g., 'v1')
 * @param {string} modulePath - Full path to module version directory
 */
async function registerSingleModule(moduleName, version, modulePath) {
  try {
    const indexPath = path.join(modulePath, 'index.js');
    
    if (!fs.existsSync(indexPath)) {
      console.log(`⚠ No index.js found for ${moduleName}@${version}, skipping`);
      return;
    }
    
    // Load module
    const moduleUrl = `file://${indexPath}`;
    const mod = await import(moduleUrl);
    const moduleExport = mod.default || mod;
    
    // Load metadata from package.json
    const packageMetadata = loadPackageMetadata(modulePath);
    
    // Register in FeatureRegistry
    registry.register(
      moduleName, 
      version, 
      moduleExport, 
      packageMetadata?.moduleMetadata || {}
    );
    
    console.log(`✓ Registered ${moduleName}@${version}`);
    
  } catch (error) {
    console.error(`✗ Failed to register ${moduleName}@${version}:`, error.message);
  }
}

/**
 * Create package.json for legacy modules that don't have one
 * @param {string} modulePath - Path to module version directory
 * @param {string} moduleName - Module name
 * @param {string} version - Version string
 */
function createLegacyPackageJson(modulePath, moduleName, version) {
  const packagePath = path.join(modulePath, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    return; // Already exists
  }
  
  const versionNumber = parseInt(version.replace('v', ''));
  const packageJson = {
    name: moduleName,
    version: `${versionNumber}.0.0`,
    description: `Legacy ${moduleName} module migrated from c201001.mask.services`,
    main: 'index.js',
    scripts: {
      test: `vitest run ${moduleName}.spec.js`
    },
    dependencies: {
      vue: "^3.4.0"
    },
    devDependencies: {
      vitest: "^1.0.0"
    },
    moduleMetadata: {
      contracts: [],
      rollbackConditions: {
        errorRate: ">10%",
        testFailures: ">2"
      },
      migrated: {
        from: "c201001.mask.services",
        timestamp: new Date().toISOString(),
        legacyModule: true
      }
    }
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`✓ Created package.json for legacy module ${moduleName}@${version}`);
}

/**
 * Discover and register all modules in the features directory
 */
export async function registerExistingModules() {
  console.log('🔍 Discovering modules in features directory...\n');
  
  if (!fs.existsSync(FEATURES_DIR)) {
    console.log('📁 Features directory does not exist, creating...');
    fs.mkdirSync(FEATURES_DIR, { recursive: true });
    return;
  }
  
  const modules = fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (modules.length === 0) {
    console.log('📭 No modules found in features directory');
    return;
  }
  
  let registeredCount = 0;
  let skippedCount = 0;
  
  for (const moduleName of modules) {
    const modulePath = path.join(FEATURES_DIR, moduleName);
    console.log(`\n📦 Processing module: ${moduleName}`);
    
    // Get all version directories
    const versions = fs.readdirSync(modulePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))
      .map(dirent => dirent.name)
      .sort((a, b) => {
        const aNum = parseInt(a.replace('v', ''));
        const bNum = parseInt(b.replace('v', ''));
        return aNum - bNum;
      });
    
    if (versions.length === 0) {
      console.log(`⚠ No version directories found for ${moduleName}`);
      skippedCount++;
      continue;
    }
    
    // Register each version
    for (const version of versions) {
      const versionPath = path.join(modulePath, version);
      
      if (!isValidModuleDirectory(versionPath)) {
        console.log(`⚠ Invalid module directory: ${moduleName}@${version} (missing index.js)`);
        skippedCount++;
        continue;
      }
      
      // Create package.json for legacy modules
      createLegacyPackageJson(versionPath, moduleName, version);
      
      // Register the module
      await registerSingleModule(moduleName, version, versionPath);
      registeredCount++;
    }
  }
  
  console.log(`\n📊 Registration Summary:`);
  console.log(`   ✅ Registered: ${registeredCount} modules`);
  console.log(`   ⚠  Skipped: ${skippedCount} modules`);
  console.log(`   📋 Total discovered: ${modules.length} module directories\n`);
}

/**
 * Register modules from a specific source directory (for migration)
 * @param {string} sourceDir - Source directory path
 * @param {string} targetModuleName - Target module name in new structure
 */
export async function registerModulesFromSource(sourceDir, targetModuleName = null) {
  console.log(`🔄 Migrating modules from: ${sourceDir}\n`);
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory does not exist: ${sourceDir}`);
    return;
  }
  
  // If it's a single module file, handle differently
  if (sourceDir.endsWith('.js')) {
    const fileName = path.basename(sourceDir, '.js');
    const moduleName = targetModuleName || fileName;
    
    console.log(`📄 Processing single file: ${sourceDir}`);
    // Single file processing would go here if needed
    return;
  }
  
  // Handle directory of modules
  const files = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.js')) {
      const fileName = path.basename(file.name, '.js');
      const moduleName = targetModuleName || fileName;
      const filePath = path.join(sourceDir, file.name);
      
      console.log(`📄 Processing file: ${filePath}`);
      // File processing would go here if needed
    }
  }
}

/**
 * Migrate a single JavaScript file to the new module structure
 * @param {string} filePath - Source file path
 * @param {string} moduleName - Target module name
 */
async function migrateSingleFile(filePath, moduleName) {
  try {
    console.log(`📄 Migrating file: ${path.basename(filePath)} -> ${moduleName}`);
    
    // Create module structure
    const version = 'v1';
    const targetDir = path.join(FEATURES_DIR, moduleName, version);
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Read source file
    const sourceContent = fs.readFileSync(filePath, 'utf8');
    
    // Create index.js wrapper
    const indexContent = `/**
 * ${moduleName} Module v1
 * Migrated from ${path.basename(filePath)}
 */

// Import original component
${sourceContent}

// Export as module
export default {
  name: '${moduleName}',
  version: 'v1',
  Component: (typeof ${moduleName}Component !== 'undefined') ? ${moduleName}Component : null,
  
  handle(request = {}) {
    return {
      status: 200,
      message: \`${moduleName}@v1 executed\`,
      data: { module: '${moduleName}', version: 'v1', request }
    };
  },
  
  init(config = {}) {
    console.log(\`Initializing ${moduleName}@v1\`, config);
  },
  
  cleanup() {
    console.log(\`Cleaning up ${moduleName}@v1\`);
  }
};`;
    
    // Write files
    fs.writeFileSync(path.join(targetDir, 'index.js'), indexContent);
    fs.writeFileSync(path.join(targetDir, `${moduleName}.js`), sourceContent);
    
    // Create package.json
    createLegacyPackageJson(targetDir, moduleName, version);
    
    // Register module
    await registerSingleModule(moduleName, version, targetDir);
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${filePath}:`, error.message);
  }
}

/**
 * List all registered modules in a formatted way
 */
export function listRegisteredModules() {
  console.log('\n📋 Currently Registered Modules:\n');
  
  const modules = registry.listModules();
  
  if (modules.length === 0) {
    console.log('   (No modules registered)');
    return;
  }
  
  modules.forEach(module => {
    console.log(`📦 ${module.name}`);
    console.log(`   Versions: ${module.versions.join(', ')}`);
    console.log(`   Latest: ${module.latestVersion}`);
    
    if (module.metadata?.description) {
      console.log(`   Description: ${module.metadata.description}`);
    }
    
    if (module.metadata?.migrated) {
      console.log(`   🔄 Migrated from: ${module.metadata.migrated.from}`);
    }
    
    console.log('');
  });
}

/**
 * Health check for all registered modules
 */
export async function healthCheckModules() {
  console.log('\n🏥 Running health check on all modules...\n');
  
  const modules = registry.listModules();
  let healthyCount = 0;
  let unhealthyCount = 0;
  
  for (const moduleInfo of modules) {
    try {
      const module = await registry.load(moduleInfo.name, 'latest');
      
      // Basic health checks
      const hasHandle = typeof module.handle === 'function';
      const hasInit = typeof module.init === 'function';
      const hasCleanup = typeof module.cleanup === 'function';
      
      if (hasHandle && hasInit && hasCleanup) {
        console.log(`✅ ${moduleInfo.name}@${moduleInfo.latestVersion} - Healthy`);
        healthyCount++;
      } else {
        console.log(`⚠️  ${moduleInfo.name}@${moduleInfo.latestVersion} - Missing methods`);
        console.log(`      handle: ${hasHandle}, init: ${hasInit}, cleanup: ${hasCleanup}`);
        unhealthyCount++;
      }
      
    } catch (error) {
      console.log(`❌ ${moduleInfo.name}@${moduleInfo.latestVersion} - Error: ${error.message}`);
      unhealthyCount++;
    }
  }
  
  console.log(`\n📊 Health Check Summary:`);
  console.log(`   ✅ Healthy: ${healthyCount} modules`);
  console.log(`   ⚠️  Issues: ${unhealthyCount} modules`);
}

// Export for CLI usage
export { FEATURES_DIR };
