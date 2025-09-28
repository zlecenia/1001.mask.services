/**
 * Quick GUI Test - Essential functionality verification
 * Run this for fast smoke testing of critical features
 */

console.log('🧪 MaskService C20 - Quick GUI Test');
console.log('====================================');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 5000;

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    results: []
};

// Test runner function
async function runTest(testName, testFn) {
    testResults.total++;
    console.log(`🧪 Testing: ${testName}...`);
    
    try {
        await testFn();
        testResults.passed++;
        testResults.results.push({ name: testName, status: 'PASSED' });
        console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
        testResults.failed++;
        testResults.results.push({ name: testName, status: 'FAILED', error: error.message });
        console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
}

// Utility function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Application loads
async function testApplicationLoad() {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    if (!html.includes('MASKSERVICE C20 1001')) {
        throw new Error('Application title not found');
    }
    
    if (!html.includes('id="app"')) {
        throw new Error('Vue app container not found');
    }
}

// Test 2: Critical JavaScript files exist
async function testJavaScriptFiles() {
    const criticalFiles = [
        '/js/main.js',
        '/js/FeatureRegistry.js',
        '/js/OptimizedFeatureRegistry.js',
        '/js/registerAllModulesBrowser.js'
    ];
    
    for (const file of criticalFiles) {
        const response = await fetch(BASE_URL + file);
        if (!response.ok) {
            throw new Error(`Critical file missing: ${file}`);
        }
    }
}

// Test 3: CSS files exist
async function testCSSFiles() {
    const cssFiles = [
        '/css/style.css',
        '/css/vue.css',
        '/css/role-system.css'
    ];
    
    for (const file of cssFiles) {
        const response = await fetch(BASE_URL + file);
        if (!response.ok) {
            throw new Error(`CSS file missing: ${file}`);
        }
    }
}

// Test 4: Component files exist
async function testComponentFiles() {
    const componentPaths = [
        '/js/features/monitoring/0.1.0/index.js',
        '/js/features/alerts/0.1.0/index.js',
        '/js/features/diagnostics/0.1.0/index.js',
        '/js/features/calibration/0.1.0/index.js',
        '/js/features/maintenance/0.1.0/index.js',
        '/js/features/analytics/0.1.0/index.js',
        '/js/features/pressurePanel/0.1.0/index.js'
    ];
    
    for (const path of componentPaths) {
        const response = await fetch(BASE_URL + path);
        if (!response.ok) {
            throw new Error(`Component missing: ${path}`);
        }
    }
}

// Test 5: Config files exist for critical components
async function testConfigFiles() {
    const configFiles = [
        '/js/features/pressurePanel/0.1.0/config/config.json',
        '/js/features/monitoring/0.1.0/config/config.json',
        '/js/features/alerts/0.1.0/config/config.json'
    ];
    
    for (const file of configFiles) {
        const response = await fetch(BASE_URL + file);
        if (!response.ok) {
            console.warn(`⚠️ Config file missing (non-critical): ${file}`);
        }
    }
}

// Test 6: Application structure validation
async function testApplicationStructure() {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    const requiredElements = [
        'class="app-header"',
        'class="main-menu"', 
        'id="pressure-panel-container"',
        'class="app-footer"',
        'class="role-switcher"',
        'id="content-area"'
    ];
    
    for (const element of requiredElements) {
        if (!html.includes(element)) {
            throw new Error(`Required HTML element missing: ${element}`);
        }
    }
}

// Test 7: Vue.js availability
async function testVueAvailability() {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    if (!html.includes('vue@3') && !html.includes('vue.global')) {
        throw new Error('Vue.js library not found');
    }
    
    if (!html.includes('createApp')) {
        throw new Error('Vue 3 createApp not found');
    }
}

// Main test execution
async function runQuickTests() {
    console.log(`🔍 Testing application at: ${BASE_URL}`);
    console.log('');
    
    const startTime = Date.now();
    
    // Run all tests
    await runTest('Application Load', testApplicationLoad);
    await runTest('JavaScript Files', testJavaScriptFiles);
    await runTest('CSS Files', testCSSFiles);
    await runTest('Component Files', testComponentFiles);
    await runTest('Config Files', testConfigFiles);
    await runTest('Application Structure', testApplicationStructure);
    await runTest('Vue.js Availability', testVueAvailability);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Generate summary
    console.log('');
    console.log('📊 QUICK TEST SUMMARY');
    console.log('=====================');
    console.log(`⏱️ Duration: ${duration}s`);
    console.log(`📊 Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('');
    
    // Detailed results
    console.log('📋 DETAILED RESULTS:');
    testResults.results.forEach((result, index) => {
        const status = result.status === 'PASSED' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log('');
    
    // Final assessment
    if (testResults.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Application is ready for comprehensive testing.');
        console.log('👉 Next step: Run full GUI test suite with ./run-tests.sh');
    } else if (testResults.failed <= 2) {
        console.log('⚠️ MINOR ISSUES FOUND. Most functionality should work.');
        console.log('👉 Review failed tests and proceed with caution.');
    } else {
        console.log('🚨 CRITICAL ISSUES FOUND. Application may not function properly.');
        console.log('👉 Fix critical issues before proceeding with full testing.');
    }
    
    return testResults;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runQuickTests, testResults };
}

// Run tests if executed directly
if (typeof window === 'undefined' && require.main === module) {
    runQuickTests().catch(error => {
        console.error('❌ Quick test execution failed:', error);
        process.exit(1);
    });
}
