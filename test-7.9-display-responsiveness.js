#!/usr/bin/env node

/**
 * 7.9" Industrial Display Responsiveness Validation Test
 * 
 * Tests all 6 modular Vue components for optimal display on:
 * - Resolution: 1280x400px (landscape orientation)
 * - Target: 7.9" industrial LCD touch displays
 * - Browser: Chrome/Firefox/Safari compatibility
 * 
 * Components tested:
 * 1. pageTemplate (0.1.0)
 * 2. mainMenu (0.1.0) 
 * 3. loginForm (0.1.0)
 * 4. appHeader (0.1.0)
 * 5. appFooter (0.1.0)
 * 6. pressurePanel (0.1.0)
 */

import { launch } from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';

// 7.9" Display specifications
const DISPLAY_CONFIG = {
  width: 1280,
  height: 400,
  deviceScaleFactor: 1,
  hasTouch: true,
  isLandscape: true,
  name: '7.9" Industrial LCD'
};

// Test server configuration
const SERVER_URL = 'http://localhost:3000';
const VIEWPORT_CONFIG = {
  width: DISPLAY_CONFIG.width,
  height: DISPLAY_CONFIG.height,
  deviceScaleFactor: DISPLAY_CONFIG.deviceScaleFactor,
  hasTouch: DISPLAY_CONFIG.hasTouch,
  isLandscape: DISPLAY_CONFIG.isLandscape
};

// Component test configurations
const COMPONENT_TESTS = [
  {
    name: 'pageTemplate',
    version: '0.1.0',
    selector: '.page-template',
    criticalElements: ['.header-section', '.main-content', '.footer-section'],
    requirements: {
      maxHeight: 400,
      minWidth: 1280,
      touchTargetSize: 44, // minimum 44px for touch targets
      fontSize: 12 // minimum readable font size
    }
  },
  {
    name: 'mainMenu',
    version: '0.1.0', 
    selector: '.main-menu',
    criticalElements: ['.menu-item', '.menu-button', '.virtual-keyboard'],
    requirements: {
      maxHeight: 400,
      buttonHeight: 60, // large enough for touch
      spacing: 8, // adequate spacing between elements
      fontSize: 14
    }
  },
  {
    name: 'loginForm',
    version: '0.1.0',
    selector: '.login-form',
    criticalElements: ['.login-input', '.login-button', '.virtual-keyboard'],
    requirements: {
      inputHeight: 48,
      buttonHeight: 48,
      fontSize: 14,
      keyboardHeight: 240 // virtual keyboard height
    }
  },
  {
    name: 'appHeader',
    version: '0.1.0',
    selector: '.app-header',
    criticalElements: ['.header-left', '.header-right', '.lang-btn'],
    requirements: {
      maxHeight: 60,
      minHeight: 40,
      fontSize: 12,
      logoSize: 32
    }
  },
  {
    name: 'appFooter',
    version: '0.1.0',
    selector: '.app-footer',
    criticalElements: ['.footer-left', '.footer-center', '.footer-right'],
    requirements: {
      maxHeight: 40,
      minHeight: 30,
      fontSize: 10,
      compactLayout: true
    }
  },
  {
    name: 'pressurePanel',
    version: '0.1.0',
    selector: '.pressure-panel',
    criticalElements: ['.pressure-sensors', '.pressure-item', '.refresh-btn'],
    requirements: {
      sensorItemHeight: 80,
      refreshButtonSize: 44,
      fontSize: 11,
      barHeight: 8
    }
  }
];

class DisplayResponsivenessValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      components: {},
      summary: {}
    };
  }

  async initialize() {
    console.log(`🔧 Initializing 7.9" Display Responsiveness Validator...`);
    console.log(`📱 Target Display: ${DISPLAY_CONFIG.width}x${DISPLAY_CONFIG.height}px`);
    
    this.browser = await launch({
      headless: false, // Show browser for visual validation
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-running-insecure-content',
        `--window-size=${DISPLAY_CONFIG.width},${DISPLAY_CONFIG.height + 100}` // +100 for browser chrome
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(VIEWPORT_CONFIG);
    
    // Set user agent to simulate industrial device
    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 Industrial-Display/7.9');
    
    console.log(`✅ Browser initialized with 7.9" display simulation`);
  }

  async testComponent(componentConfig) {
    const { name, version, selector, criticalElements, requirements } = componentConfig;
    
    console.log(`\n🧪 Testing ${name} v${version} responsiveness...`);
    
    const testResult = {
      component: name,
      version: version,
      passed: 0,
      failed: 0,
      tests: [],
      issues: [],
      recommendations: []
    };

    try {
      // Navigate to test page for component
      await this.page.goto(`${SERVER_URL}`, { waitUntil: 'networkidle0' });
      
      // Wait for component to load
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      // Test 1: Component visibility and basic layout
      const isVisible = await this.page.isVisible(selector);
      this.addTest(testResult, 'Component Visibility', isVisible, 'Component should be visible on 7.9" display');
      
      // Test 2: Component fits within display bounds
      const componentBounds = await this.page.boundingBox(selector);
      const fitsHorizontally = componentBounds.width <= DISPLAY_CONFIG.width;
      const fitsVertically = componentBounds.height <= DISPLAY_CONFIG.height;
      
      this.addTest(testResult, 'Horizontal Fit', fitsHorizontally, `Component width (${componentBounds.width}px) should fit in ${DISPLAY_CONFIG.width}px`);
      this.addTest(testResult, 'Vertical Fit', fitsVertically, `Component height (${componentBounds.height}px) should fit in ${DISPLAY_CONFIG.height}px`);
      
      // Test 3: Critical elements presence and sizing
      for (const elementSelector of criticalElements) {
        try {
          const elementExists = await this.page.$(elementSelector) !== null;
          this.addTest(testResult, `Critical Element: ${elementSelector}`, elementExists, `Element ${elementSelector} should exist`);
          
          if (elementExists) {
            const elementBounds = await this.page.boundingBox(elementSelector);
            if (elementBounds) {
              const isAccessible = elementBounds.height >= 44; // Touch target minimum
              this.addTest(testResult, `Touch Accessibility: ${elementSelector}`, isAccessible, `Element should be at least 44px high for touch`);
            }
          }
        } catch (error) {
          this.addTest(testResult, `Critical Element: ${elementSelector}`, false, `Error testing element: ${error.message}`);
        }
      }
      
      // Test 4: Font size readability
      const fontSize = await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          return parseInt(window.getComputedStyle(element).fontSize);
        }
        return null;
      }, selector);
      
      if (fontSize) {
        const readableFont = fontSize >= requirements.fontSize;
        this.addTest(testResult, 'Font Readability', readableFont, `Font size (${fontSize}px) should be at least ${requirements.fontSize}px`);
      }
      
      // Test 5: Landscape orientation optimization
      const hasLandscapeClass = await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element && element.classList.contains('landscape-7-9');
      }, selector);
      
      this.addTest(testResult, 'Landscape Optimization', hasLandscapeClass, 'Component should have landscape-7-9 CSS class');
      
      // Test 6: Touch interaction zones
      if (name === 'mainMenu' || name === 'loginForm' || name === 'pressurePanel') {
        const touchElements = await this.page.$$('button, .btn, [role="button"]');
        let touchAccessible = true;
        
        for (const element of touchElements) {
          const bounds = await element.boundingBox();
          if (bounds && (bounds.height < 44 || bounds.width < 44)) {
            touchAccessible = false;
            testResult.issues.push(`Touch target too small: ${bounds.width}x${bounds.height}px`);
          }
        }
        
        this.addTest(testResult, 'Touch Interaction Zones', touchAccessible, 'All interactive elements should be at least 44x44px');
      }
      
      // Test 7: No horizontal scrolling
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      this.addTest(testResult, 'No Horizontal Scroll', !hasHorizontalScroll, 'Component should not cause horizontal scrolling');
      
      // Test 8: Performance on industrial hardware simulation
      const performanceMetrics = await this.page.metrics();
      const memoryUsage = performanceMetrics.JSHeapUsedSize / 1024 / 1024; // MB
      const lowMemoryUsage = memoryUsage < 50; // Under 50MB
      
      this.addTest(testResult, 'Memory Efficiency', lowMemoryUsage, `Memory usage (${memoryUsage.toFixed(2)}MB) should be under 50MB`);
      
    } catch (error) {
      testResult.issues.push(`Component test failed: ${error.message}`);
      this.addTest(testResult, 'Component Loading', false, error.message);
    }
    
    this.results.components[name] = testResult;
    this.results.totalTests += testResult.tests.length;
    this.results.passedTests += testResult.passed;
    this.results.failedTests += testResult.failed;
    
    console.log(`   ✅ Passed: ${testResult.passed}/${testResult.tests.length} tests`);
    if (testResult.failed > 0) {
      console.log(`   ❌ Failed: ${testResult.failed} tests`);
      testResult.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    return testResult;
  }

  addTest(testResult, testName, passed, description) {
    testResult.tests.push({
      name: testName,
      passed: passed,
      description: description
    });
    
    if (passed) {
      testResult.passed++;
    } else {
      testResult.failed++;
      testResult.issues.push(`${testName}: ${description}`);
    }
  }

  async runAllTests() {
    console.log(`\n🚀 Starting comprehensive 7.9" display responsiveness validation...`);
    console.log(`📋 Testing ${COMPONENT_TESTS.length} components with 221 existing tests\n`);
    
    for (const componentConfig of COMPONENT_TESTS) {
      await this.testComponent(componentConfig);
      
      // Brief pause between components
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.generateSummary();
  }

  generateSummary() {
    console.log(`\n📊 7.9" DISPLAY RESPONSIVENESS VALIDATION RESULTS`);
    console.log(`================================================================`);
    console.log(`📱 Display: ${DISPLAY_CONFIG.width}x${DISPLAY_CONFIG.height}px (7.9" Industrial LCD)`);
    console.log(`🧪 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passedTests}`);
    console.log(`❌ Failed: ${this.results.failedTests}`);
    console.log(`📈 Success Rate: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 Component Results:`);
    for (const [componentName, result] of Object.entries(this.results.components)) {
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`  ${status} ${componentName} v${result.version}: ${result.passed}/${result.tests.length} tests passed`);
      
      if (result.failed > 0) {
        console.log(`     Issues found:`);
        result.issues.slice(0, 3).forEach(issue => {
          console.log(`     - ${issue}`);
        });
        if (result.issues.length > 3) {
          console.log(`     - ... and ${result.issues.length - 3} more issues`);
        }
      }
    }
    
    // Generate recommendations
    console.log(`\n💡 Recommendations for 7.9" Display Optimization:`);
    
    const criticalIssues = Object.values(this.results.components)
      .filter(comp => comp.failed > 0)
      .length;
    
    if (criticalIssues === 0) {
      console.log(`🎉 EXCELLENT! All components are optimized for 7.9" displays!`);
      console.log(`   - All touch targets meet 44px minimum size requirement`);
      console.log(`   - Font sizes are readable on industrial displays`);
      console.log(`   - Components fit within 1280x400px landscape orientation`);
      console.log(`   - No horizontal scrolling issues detected`);
      console.log(`   - Memory usage is optimized for industrial hardware`);
    } else {
      console.log(`⚠️  ${criticalIssues} components need optimization for 7.9" displays`);
      console.log(`   - Review touch target sizes (minimum 44px)`);
      console.log(`   - Verify font sizes for readability`);
      console.log(`   - Ensure landscape-7-9 CSS classes are applied`);
      console.log(`   - Test with actual 7.9" hardware when available`);
    }
    
    console.log(`\n🔗 Next Steps:`);
    console.log(`   1. Open browser at ${SERVER_URL} with 1280x400 viewport`);
    console.log(`   2. Test touch interactions manually`);
    console.log(`   3. Validate with real 7.9" industrial display hardware`);
    console.log(`   4. Run automated tests: npm run test`);
    
    this.results.summary = {
      displayConfig: DISPLAY_CONFIG,
      totalComponents: COMPONENT_TESTS.length,
      passRate: (this.results.passedTests / this.results.totalTests) * 100,
      criticalIssues: criticalIssues,
      timestamp: new Date().toISOString()
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log(`\n🧹 Cleanup completed`);
  }

  async run() {
    try {
      await this.initialize();
      await this.runAllTests();
      return this.results;
    } catch (error) {
      console.error(`❌ Validation failed:`, error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DisplayResponsivenessValidator();
  
  validator.run()
    .then(results => {
      console.log(`\n🎯 Validation completed successfully!`);
      process.exit(results.failedTests === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error(`❌ Validation failed:`, error);
      process.exit(1);
    });
}

export default DisplayResponsivenessValidator;
