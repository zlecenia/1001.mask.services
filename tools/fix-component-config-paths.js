#!/usr/bin/env node

/**
 * Fix Component Config Paths Tool
 * Automatically updates config paths in all component index.js files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔧 Starting config path fix for all components...');

// Find all component index.js files
const componentsDir = path.join(rootDir, 'js/features');
const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`📁 Found ${componentDirs.length} components:`, componentDirs);

let fixedCount = 0;
let errorCount = 0;

for (const componentName of componentDirs) {
  const componentPath = path.join(componentsDir, componentName, '0.1.0');
  const indexPath = path.join(componentPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  No index.js found for ${componentName}`);
    continue;
  }
  
  try {
    console.log(`🔧 Fixing config paths for ${componentName}...`);
    
    // Read current index.js file
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check if it needs fixing (has old config paths)
    const needsFix = content.includes('./config/config.json') || 
                    content.includes('/config/config.json') ||
                    content.includes('/component/config/config.json');
    
    if (!needsFix) {
      console.log(`✅ ${componentName} already has correct config paths`);
      continue;
    }
    
    // Replace loadConfig method with correct paths
    const oldLoadConfigPattern = /async loadConfig\(\) \{[\s\S]*?\},/g;
    const newLoadConfig = `async loadConfig() {
    const possiblePaths = [
      'js/features/${componentName}/0.1.0/config/config.json',  // Correct component path
      './js/features/${componentName}/0.1.0/config/config.json', // Alternative
      '/js/features/${componentName}/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, '${componentName}');
        if (result.success) break;
      } catch (error) {
        continue; // Try next path
      }
    }
    
    this.config = result?.config || {};
    return result || { success: false, config: {} };
  },`;
    
    // Apply the fix
    content = content.replace(oldLoadConfigPattern, newLoadConfig);
    
    // Write back to file
    fs.writeFileSync(indexPath, content, 'utf8');
    
    console.log(`✅ Fixed config paths for ${componentName}`);
    fixedCount++;
    
  } catch (error) {
    console.error(`❌ Error fixing ${componentName}:`, error.message);
    errorCount++;
  }
}

console.log('\n📊 Fix Summary:');
console.log(`✅ Fixed: ${fixedCount} components`);
console.log(`❌ Errors: ${errorCount} components`);
console.log(`📁 Total: ${componentDirs.length} components processed`);

if (fixedCount > 0) {
  console.log('\n🔄 Please restart the dev server to apply changes:');
  console.log('npm run dev');
}
