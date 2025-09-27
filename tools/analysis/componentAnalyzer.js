#!/usr/bin/env node

/**
 * Component analyzer - checks component health and generates status report
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ComponentAnalyzer {
  constructor() {
    this.featuresDir = './js/features';
    this.results = [];
  }

  async analyze() {
    console.log(chalk.blue('🔍 Analyzing component health...\n'));
    
    try {
      const components = await this.findComponents();
      
      for (const component of components) {
        const analysis = await this.analyzeComponent(component);
        this.results.push(analysis);
        
        this.printComponentStatus(analysis);
      }
      
      await this.generateSummaryReport();
      
    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error.message);
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
        const versions = await fs.readdir(componentPath);
        for (const version of versions) {
          if (/^\d+\.\d+\.\d+$/.test(version)) {
            components.push({
              name: componentName,
              version,
              path: path.join(componentPath, version)
            });
          }
        }
      }
    }
    
    return components;
  }

  async analyzeComponent(component) {
    const analysis = {
      name: component.name,
      version: component.version,
      path: component.path,
      status: 'unknown',
      score: 0,
      maxScore: 100,
      checks: {},
      issues: [],
      recommendations: []
    };

    try {
      // File existence checks
      analysis.checks.hasIndex = await this.checkFile(component.path, 'index.js');
      analysis.checks.hasComponent = await this.checkFile(component.path, `${component.name}.js`);
      analysis.checks.hasTests = await this.checkFile(component.path, `${component.name}.test.js`);
      analysis.checks.hasPackageJson = await this.checkFile(component.path, 'package.json');
      analysis.checks.hasReadme = await this.checkFile(component.path, 'README.md');
      analysis.checks.hasChangelog = await this.checkFile(component.path, 'CHANGELOG.md');
      analysis.checks.hasTodo = await this.checkFile(component.path, 'TODO.md');
      analysis.checks.hasScreenshot = await this.checkFile(component.path, `${component.name}.png`);
      
      // Config directory checks
      const configDir = path.join(component.path, 'config');
      analysis.checks.hasConfigDir = await fs.pathExists(configDir);
      if (analysis.checks.hasConfigDir) {
        analysis.checks.hasConfig = await this.checkFile(configDir, 'config.json');
        analysis.checks.hasData = await this.checkFile(configDir, 'data.json');
        analysis.checks.hasSchema = await this.checkFile(configDir, 'schema.json');
        analysis.checks.hasCrud = await this.checkFile(configDir, 'crud.json');
      }
      
      // Content quality checks
      if (analysis.checks.hasIndex) {
        analysis.checks.indexValid = await this.validateIndexJs(component);
      }
      
      if (analysis.checks.hasComponent) {
        analysis.checks.componentValid = await this.validateComponentJs(component);
      }
      
      if (analysis.checks.hasConfig) {
        analysis.checks.configValid = await this.validateConfig(component);
      }
      
      if (analysis.checks.hasPackageJson) {
        analysis.checks.packageValid = await this.validatePackageJson(component);
      }
      
      // Calculate score and status
      this.calculateScore(analysis);
      this.determineStatus(analysis);
      this.generateRecommendations(analysis);
      
    } catch (error) {
      analysis.issues.push(`Analysis error: ${error.message}`);
      analysis.status = 'error';
    }
    
    return analysis;
  }

  async checkFile(dir, filename) {
    return await fs.pathExists(path.join(dir, filename));
  }

  async validateIndexJs(component) {
    try {
      const indexPath = path.join(component.path, 'index.js');
      const content = await fs.readFile(indexPath, 'utf8');
      
      const checks = {
        hasExport: /export\s+default/.test(content),
        hasMetadata: /metadata\s*:/.test(content),
        hasInit: /init\s*\(/.test(content),
        hasHandle: /handle\s*\(/.test(content),
        hasConfigImport: /import.*config.*from/.test(content)
      };
      
      return Object.values(checks).filter(Boolean).length >= 3;
    } catch (error) {
      return false;
    }
  }

  async validateComponentJs(component) {
    try {
      const componentPath = path.join(component.path, `${component.name}.js`);
      const content = await fs.readFile(componentPath, 'utf8');
      
      const checks = {
        hasTemplate: /template\s*[:=]/.test(content),
        hasExport: /export\s+default/.test(content),
        hasVueStructure: /name\s*:/.test(content) || /setup\s*\(/.test(content),
        hasProps: /props\s*[:=]/.test(content),
        hasMethods: /methods\s*[:=]/.test(content) || /function/.test(content)
      };
      
      return Object.values(checks).filter(Boolean).length >= 2;
    } catch (error) {
      return false;
    }
  }

  async validateConfig(component) {
    try {
      const configPath = path.join(component.path, 'config', 'config.json');
      const config = await fs.readJson(configPath);
      
      const checks = {
        hasComponent: config.component !== undefined,
        hasName: config.component?.name === component.name,
        hasVersion: config.component?.version !== undefined,
        hasValidStructure: typeof config === 'object' && config !== null
      };
      
      return Object.values(checks).filter(Boolean).length >= 3;
    } catch (error) {
      return false;
    }
  }

  async validatePackageJson(component) {
    try {
      const packagePath = path.join(component.path, 'package.json');
      const pkg = await fs.readJson(packagePath);
      
      const checks = {
        hasName: pkg.name !== undefined,
        hasVersion: pkg.version !== undefined,
        hasDescription: pkg.description !== undefined,
        hasMaskservice: pkg.maskservice !== undefined
      };
      
      return Object.values(checks).filter(Boolean).length >= 2;
    } catch (error) {
      return false;
    }
  }

  calculateScore(analysis) {
    const weights = {
      // Essential files (40 points)
      hasIndex: 10,
      hasComponent: 10,
      hasConfigDir: 5,
      hasConfig: 5,
      hasData: 5,
      hasSchema: 5,
      
      // Quality indicators (30 points)
      indexValid: 10,
      componentValid: 10,
      configValid: 10,
      
      // Documentation & Testing (20 points)
      hasReadme: 5,
      hasTests: 10,
      hasScreenshot: 5,
      
      // Metadata (10 points)
      hasPackageJson: 5,
      packageValid: 5
    };
    
    let score = 0;
    for (const [check, weight] of Object.entries(weights)) {
      if (analysis.checks[check]) {
        score += weight;
      }
    }
    
    analysis.score = score;
  }

  determineStatus(analysis) {
    if (analysis.score >= 90) {
      analysis.status = 'excellent';
    } else if (analysis.score >= 70) {
      analysis.status = 'good';
    } else if (analysis.score >= 50) {
      analysis.status = 'needs-work';
    } else if (analysis.score >= 30) {
      analysis.status = 'incomplete';
    } else {
      analysis.status = 'broken';
    }
  }

  generateRecommendations(analysis) {
    const recs = [];
    
    if (!analysis.checks.hasTests) {
      recs.push('Add unit tests (.test.js file)');
    }
    
    if (!analysis.checks.hasScreenshot) {
      recs.push('Generate screenshot (run npm run screenshots)');
    }
    
    if (!analysis.checks.hasSchema) {
      recs.push('Generate schema (run npm run config:generate-components)');
    }
    
    if (!analysis.checks.indexValid) {
      recs.push('Fix index.js structure (add metadata, init, handle methods)');
    }
    
    if (!analysis.checks.componentValid) {
      recs.push('Fix component structure (add template, proper Vue export)');
    }
    
    if (!analysis.checks.configValid) {
      recs.push('Fix config.json structure (add component metadata)');
    }
    
    if (!analysis.checks.hasReadme) {
      recs.push('Generate README (run npm run readme:generate)');
    }
    
    analysis.recommendations = recs;
  }

  printComponentStatus(analysis) {
    const statusColors = {
      excellent: chalk.green,
      good: chalk.green,
      'needs-work': chalk.yellow,
      incomplete: chalk.yellow,
      broken: chalk.red,
      error: chalk.red
    };
    
    const statusEmojis = {
      excellent: '🟢',
      good: '🟢', 
      'needs-work': '🟡',
      incomplete: '🟡',
      broken: '🔴',
      error: '❌'
    };
    
    const color = statusColors[analysis.status] || chalk.gray;
    const emoji = statusEmojis[analysis.status] || '❓';
    
    console.log(color(`${emoji} ${analysis.name}@${analysis.version}`));
    console.log(color(`   Score: ${analysis.score}/${analysis.maxScore} (${analysis.status})`));
    
    if (analysis.recommendations.length > 0) {
      console.log(chalk.gray('   Recommendations:'));
      analysis.recommendations.slice(0, 2).forEach(rec => {
        console.log(chalk.gray(`   • ${rec}`));
      });
      if (analysis.recommendations.length > 2) {
        console.log(chalk.gray(`   • ... ${analysis.recommendations.length - 2} more`));
      }
    }
    
    console.log();
  }

  async generateSummaryReport() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('COMPONENT HEALTH SUMMARY'));
    console.log(chalk.blue('='.repeat(60) + '\n'));
    
    const statusCounts = {
      excellent: 0,
      good: 0,
      'needs-work': 0,
      incomplete: 0,
      broken: 0,
      error: 0
    };
    
    this.results.forEach(result => {
      statusCounts[result.status]++;
    });
    
    console.log(chalk.green(`🟢 Excellent: ${statusCounts.excellent} components (90-100 points)`));
    console.log(chalk.green(`🟢 Good: ${statusCounts.good} components (70-89 points)`));
    console.log(chalk.yellow(`🟡 Needs Work: ${statusCounts['needs-work']} components (50-69 points)`));
    console.log(chalk.yellow(`🟡 Incomplete: ${statusCounts.incomplete} components (30-49 points)`));
    console.log(chalk.red(`🔴 Broken: ${statusCounts.broken} components (<30 points)`));
    console.log(chalk.red(`❌ Error: ${statusCounts.error} components (analysis failed)`));
    
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
    console.log(chalk.cyan(`\n📊 Average Score: ${avgScore.toFixed(1)}/100`));
    
    const ready = statusCounts.excellent + statusCounts.good;
    console.log(chalk.cyan(`✅ Production Ready: ${ready}/${this.results.length} (${((ready/this.results.length)*100).toFixed(1)}%)`));
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: statusCounts,
      averageScore: avgScore,
      productionReady: ready,
      total: this.results.length,
      components: this.results
    };
    
    await fs.writeJson('./component-health-report.json', report, { spaces: 2 });
    console.log(chalk.cyan('\n📋 Detailed report saved to component-health-report.json'));
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ComponentAnalyzer();
  analyzer.analyze().catch(console.error);
}

export default ComponentAnalyzer;
