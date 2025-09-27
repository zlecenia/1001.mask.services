import { reactive, computed, onMounted, inject } from 'vue';

/**
 * MASKTRONIC C20 - Test Menu Module
 * Advanced test menu with wizard, scenarios, history and templates
 * Migrated from TestMenuTemplate.js to modular architecture
 */
const TestMenu = {
    name: 'TestMenu',
    
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false })
        },
        language: {
            type: String,
            default: 'pl'
        }
    },
    
    emits: ['navigate', 'test-selected', 'export-data', 'test-created'],
    
    setup(props, { emit }) {
        // Inject services
        const store = inject('$store', null);
        const securityService = inject('securityService', null);
        const config = inject('moduleConfig', {});
        
        // Reactive state
        const testState = reactive({
            selectedOption: null,
            exportInProgress: false,
            exportFormat: null,
            testData: [],
            
            // Test Wizard state (4-step process)
            wizardActive: false,
            wizardStep: 1,
            wizardData: {
                step1: { deviceType: null, deviceModel: null },
                step2: { testType: null, testStandard: null, pressureRange: null },
                step3: { duration: config.testWizard?.defaultDuration || 300, cycles: 1, tolerance: 5, alerts: true },
                step4: { name: '', description: '', saveAsTemplate: false }
            },
            
            // Custom Scenarios state
            scenariosActive: false,
            customScenarios: [],
            selectedScenario: null,
            
            // Test History state
            historyActive: false,
            testHistory: [],
            historyFilter: 'all',
            
            // Test Templates state
            templatesActive: false,
            testTemplates: [],
            selectedTemplate: null
        });

        // Enhanced test menu options with advanced features
        const testOptions = computed(() => [
            {
                id: 'wizard',
                icon: '🪄',
                title: props.language === 'pl' ? 'Kreator Testów' : 'Test Wizard',
                description: props.language === 'pl' ? 'Guided 4-step test creation process' : '4-step guided test setup',
                color: 'blue',
                advanced: true,
                requiredRole: 'OPERATOR'
            },
            {
                id: 'scenarios',
                icon: '📈',
                title: props.language === 'pl' ? 'Własne Scenariusze' : 'Custom Scenarios',
                description: props.language === 'pl' ? 'Manage custom test scenarios' : 'Create and manage test scenarios',
                color: 'green',
                advanced: true,
                requiredRole: 'ADMIN'
            },
            {
                id: 'history',
                icon: '📅',
                title: props.language === 'pl' ? 'Historia Testów' : 'Test History',
                description: props.language === 'pl' ? 'View previous test results' : 'Browse test execution history',
                color: 'purple',
                advanced: true,
                requiredRole: 'OPERATOR'
            },
            {
                id: 'templates',
                icon: '📋',
                title: props.language === 'pl' ? 'Szablony Testów' : 'Test Templates',
                description: props.language === 'pl' ? 'Pre-configured test templates' : 'Ready-to-use test configurations',
                color: 'orange',
                advanced: true,
                requiredRole: 'OPERATOR'
            },
            {
                id: 'device',
                icon: '🛡️',
                title: props.language === 'pl' ? 'Rodzaj urządzenia' : 'Kind of Device',
                description: props.language === 'pl' ? 'Wybierz rodzaj urządzenia' : 'Select device type',
                color: 'blue',
                requiredRole: 'OPERATOR'
            },
            {
                id: 'type',
                icon: '🔧',
                title: props.language === 'pl' ? 'Typ urządzenia' : 'Device Type',
                description: props.language === 'pl' ? 'Wybierz typ urządzenia' : 'Select device model',
                color: 'green',
                requiredRole: 'OPERATOR'
            },
            {
                id: 'test',
                icon: '🧪',
                title: props.language === 'pl' ? 'Rodzaj testu' : 'Kind of Test',
                description: props.language === 'pl' ? 'Wybierz rodzaj testu' : 'Select test type',
                color: 'purple',
                requiredRole: 'OPERATOR'
            },
            {
                id: 'flow',
                icon: '🎯',
                title: props.language === 'pl' ? 'Przepływ testu' : 'Test Flow',
                description: props.language === 'pl' ? 'Scenariusz testowy' : 'Test scenario',
                color: 'orange',
                requiredRole: 'ADMIN'
            }
        ]);

        // Export formats from config
        const exportFormats = computed(() => config.exportFormats || [
            { id: 'json', label: 'JSON', icon: '📄', color: 'blue', description: 'JavaScript Object Notation' },
            { id: 'xml', label: 'XML', icon: '📋', color: 'green', description: 'Extensible Markup Language' },
            { id: 'csv', label: 'CSV', icon: '📊', color: 'purple', description: 'Comma Separated Values' },
            { id: 'pdf', label: 'PDF', icon: '📑', color: 'red', description: 'Portable Document Format' }
        ]);

        // Device types from config
        const deviceTypes = computed(() => config.deviceTypes || []);
        const testTypes = computed(() => config.testTypes || []);
        const testStandards = computed(() => config.testStandards || []);
        const pressureRanges = computed(() => config.pressureRanges || []);

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Menu Testów',
                en: 'Test Menu',
                de: 'Testmenü'
            };
            return titleMap[props.language] || 'Menu Testów';
        });

        const exportTitle = computed(() => {
            const titleMap = {
                pl: 'Eksport danych testowych',
                en: 'Export Test Data',
                de: 'Testdaten exportieren'
            };
            return titleMap[props.language] || 'Eksport danych testowych';
        });

        // Validation for wizard steps
        const canProceedToNextStep = computed(() => {
            switch (testState.wizardStep) {
                case 1:
                    return testState.wizardData.step1.deviceType && testState.wizardData.step1.deviceModel;
                case 2:
                    return testState.wizardData.step2.testType && testState.wizardData.step2.testStandard;
                case 3:
                    return testState.wizardData.step3.duration >= 60 && testState.wizardData.step3.cycles >= 1;
                case 4:
                    return testState.wizardData.step4.name.trim().length >= 3;
                default:
                    return false;
            }
        });

        // Security validation
        const hasPermission = (requiredRole) => {
            if (!securityService) return true; // Fallback if security service not available
            return securityService.hasRole(props.user.role, requiredRole);
        };

        // Methods
        const selectTestOption = async (option) => {
            console.log(`🔶 Vue TestMenu: Test option selected: ${option.id}`);
            
            // Security check
            if (!hasPermission(option.requiredRole)) {
                console.warn(`Access denied for option ${option.id}. Required role: ${option.requiredRole}`);
                if (securityService) {
                    securityService.logSecurityEvent('access_denied', {
                        resource: `test_menu_option_${option.id}`,
                        requiredRole: option.requiredRole,
                        userRole: props.user.role
                    });
                }
                return;
            }

            testState.selectedOption = option;
            
            // Handle advanced features
            switch (option.id) {
                case 'wizard':
                    startTestWizard();
                    break;
                case 'scenarios':
                    showCustomScenarios();
                    break;
                case 'history':
                    showTestHistory();
                    break;
                case 'templates':
                    showTestTemplates();
                    break;
                default:
                    // Legacy test options - integrate with store if available
                    if (store) {
                        store.dispatch('tests/selectOption', option);
                    }
                    break;
            }
            
            // Audit logging
            if (securityService) {
                securityService.logSecurityEvent('test_option_selected', {
                    optionId: option.id,
                    optionTitle: option.title,
                    user: props.user.username,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Emit event to parent
            emit('test-selected', { option, timestamp: new Date().toISOString() });
            
            // Navigate after delay
            setTimeout(() => {
                emit('navigate', 'device-select', props.language, option.id);
            }, 500);
        };
        
        // Test Wizard Methods
        const startTestWizard = () => {
            console.log('🪄 Starting Test Wizard (4-step process)');
            testState.wizardActive = true;
            testState.wizardStep = 1;
            resetWizardData();
            
            if (securityService) {
                securityService.logSecurityEvent('test_wizard_started', {
                    user: props.user.username,
                    timestamp: new Date().toISOString()
                });
            }
        };
        
        const resetWizardData = () => {
            testState.wizardData = {
                step1: { deviceType: null, deviceModel: null },
                step2: { testType: null, testStandard: null, pressureRange: null },
                step3: { 
                    duration: config.testWizard?.defaultDuration || 300, 
                    cycles: 1, 
                    tolerance: 5, 
                    alerts: true 
                },
                step4: { name: '', description: '', saveAsTemplate: false }
            };
        };
        
        const nextWizardStep = () => {
            if (testState.wizardStep < 4 && canProceedToNextStep.value) {
                testState.wizardStep++;
                console.log(`🪄 Test Wizard: Step ${testState.wizardStep}`);
                
                if (securityService) {
                    securityService.logSecurityEvent('wizard_step_advanced', {
                        step: testState.wizardStep,
                        user: props.user.username
                    });
                }
            }
        };
        
        const prevWizardStep = () => {
            if (testState.wizardStep > 1) {
                testState.wizardStep--;
                console.log(`🪄 Test Wizard: Step ${testState.wizardStep}`);
            }
        };
        
        const finishTestWizard = async () => {
            console.log('🪄 Finishing Test Wizard with data:', testState.wizardData);
            
            try {
                // Create test configuration
                const testConfig = {
                    id: `test_${Date.now()}`,
                    name: testState.wizardData.step4.name || 'New Test',
                    description: testState.wizardData.step4.description,
                    device: testState.wizardData.step1,
                    test: testState.wizardData.step2,
                    parameters: testState.wizardData.step3,
                    created: new Date().toISOString(),
                    status: 'configured',
                    createdBy: props.user.username
                };
                
                // Save as template if requested
                if (testState.wizardData.step4.saveAsTemplate) {
                    const template = {
                        ...testConfig,
                        isTemplate: true,
                        templateName: testConfig.name
                    };
                    testState.testTemplates.push(template);
                    console.log('📋 Test saved as template');
                    
                    // Update store if available
                    if (store) {
                        store.dispatch('tests/addTemplate', template);
                    }
                }
                
                // Add to history
                testState.testHistory.unshift(testConfig);
                
                // Update store if available
                if (store) {
                    store.dispatch('tests/addToHistory', testConfig);
                }
                
                // Security logging
                if (securityService) {
                    securityService.logSecurityEvent('test_wizard_completed', {
                        testId: testConfig.id,
                        testName: testConfig.name,
                        user: props.user.username,
                        saveAsTemplate: testState.wizardData.step4.saveAsTemplate
                    });
                }
                
                // Close wizard
                testState.wizardActive = false;
                
                // Emit test creation event
                emit('test-created', testConfig);
                
                // Success message
                const message = props.language === 'pl' ? 
                    'Test został skonfigurowany pomyślnie!' : 
                    'Test configured successfully!';
                alert(message);
                
            } catch (error) {
                console.error('Error finishing test wizard:', error);
                if (securityService) {
                    securityService.logSecurityEvent('test_wizard_error', {
                        error: error.message,
                        user: props.user.username
                    });
                }
            }
        };
        
        const cancelTestWizard = () => {
            testState.wizardActive = false;
            testState.wizardStep = 1;
            resetWizardData();
            
            if (securityService) {
                securityService.logSecurityEvent('test_wizard_cancelled', {
                    user: props.user.username
                });
            }
        };
        
        // Custom Scenarios Methods
        const showCustomScenarios = async () => {
            console.log('📈 Showing Custom Scenarios');
            testState.scenariosActive = true;
            await loadCustomScenarios();
        };
        
        const loadCustomScenarios = async () => {
            try {
                // Try to load from store or API
                if (store && store.getters['tests/customScenarios']) {
                    testState.customScenarios = store.getters['tests/customScenarios'];
                } else {
                    // Mock data for demonstration
                    testState.customScenarios = [
                        {
                            id: 'sc1',
                            name: 'Pressure Test Standard',
                            description: 'Standard pressure test with 5 cycles',
                            device: 'RPD',
                            testType: 'pressure',
                            parameters: { cycles: 5, duration: 300 },
                            created: '2024-01-15',
                            createdBy: props.user.username
                        },
                        {
                            id: 'sc2', 
                            name: 'Extended Durability Test',
                            description: 'Long-duration test for device validation',
                            device: 'SCSR',
                            testType: 'durability',
                            parameters: { cycles: 20, duration: 1800 },
                            created: '2024-01-10',
                            createdBy: props.user.username
                        }
                    ];
                }
            } catch (error) {
                console.error('Error loading custom scenarios:', error);
                testState.customScenarios = [];
            }
        };
        
        const createNewScenario = () => {
            // Start wizard with scenario mode
            startTestWizard();
            testState.wizardData.step4.saveAsTemplate = true;
        };
        
        // Test History Methods
        const showTestHistory = async () => {
            console.log('📅 Showing Test History');
            testState.historyActive = true;
            await loadTestHistory();
        };
        
        const loadTestHistory = async () => {
            try {
                // Try to load from store
                if (store && store.getters['tests/history']) {
                    testState.testHistory = store.getters['tests/history'];
                } else {
                    // Mock historical data
                    testState.testHistory = [
                        {
                            id: 'test_001',
                            name: 'RPD Pressure Test',
                            device: { deviceType: 'RPD', deviceModel: 'Model-A' },
                            status: 'completed',
                            result: 'PASS',
                            duration: '05:23',
                            date: '2024-01-20 14:30',
                            createdBy: props.user.username
                        },
                        {
                            id: 'test_002', 
                            name: 'SCSR Durability Test',
                            device: { deviceType: 'SCSR', deviceModel: 'Model-B' },
                            status: 'completed',
                            result: 'FAIL',
                            duration: '12:45',
                            date: '2024-01-19 09:15',
                            createdBy: 'admin'
                        },
                        {
                            id: 'test_003',
                            name: 'Quick Validation Test', 
                            device: { deviceType: 'RPD', deviceModel: 'Model-C' },
                            status: 'in_progress',
                            result: null,
                            duration: null,
                            date: '2024-01-21 11:00',
                            createdBy: props.user.username
                        }
                    ];
                }
            } catch (error) {
                console.error('Error loading test history:', error);
                testState.testHistory = [];
            }
        };
        
        // Test Templates Methods
        const showTestTemplates = async () => {
            console.log('📋 Showing Test Templates');
            testState.templatesActive = true;
            await loadTestTemplates();
        };
        
        const loadTestTemplates = async () => {
            try {
                // Try to load from store
                if (store && store.getters['tests/templates']) {
                    testState.testTemplates = store.getters['tests/templates'];
                } else {
                    // Mock template data
                    testState.testTemplates = [
                        {
                            id: 'tpl_001',
                            name: 'Standard RPD Test',
                            description: 'Basic pressure test for RPD devices',
                            device: { deviceType: 'RPD', deviceModel: 'Any' },
                            test: { testType: 'pressure', testStandard: 'PN-EN-149' },
                            parameters: { duration: 300, cycles: 3, tolerance: 5 },
                            category: 'standard',
                            popular: true
                        },
                        {
                            id: 'tpl_002',
                            name: 'SCSR Durability Test',
                            description: 'Extended durability test for SCSR devices',
                            device: { deviceType: 'SCSR', deviceModel: 'Any' },
                            test: { testType: 'durability', testStandard: 'PN-EN-402' },
                            parameters: { duration: 1800, cycles: 10, tolerance: 2 },
                            category: 'extended',
                            popular: false
                        },
                        {
                            id: 'tpl_003',
                            name: 'Quick Validation',
                            description: 'Fast validation test for any device',
                            device: { deviceType: 'Any', deviceModel: 'Any' },
                            test: { testType: 'validation', testStandard: 'Internal' },
                            parameters: { duration: 120, cycles: 1, tolerance: 10 },
                            category: 'quick',
                            popular: true
                        }
                    ];
                }
            } catch (error) {
                console.error('Error loading test templates:', error);
                testState.testTemplates = [];
            }
        };
        
        const useTemplate = (template) => {
            console.log('📋 Using template:', template.name);
            
            // Pre-fill wizard with template data
            testState.wizardData = {
                step1: { ...template.device },
                step2: { ...template.test },
                step3: { ...template.parameters, alerts: true },
                step4: { 
                    name: `${template.name} - ${new Date().toLocaleDateString()}`,
                    description: `Based on template: ${template.description}`,
                    saveAsTemplate: false 
                }
            };
            
            // Start wizard with pre-filled data
            testState.templatesActive = false;
            testState.wizardActive = true;
            testState.wizardStep = 4; // Skip to final step for review
            
            if (securityService) {
                securityService.logSecurityEvent('template_used', {
                    templateId: template.id,
                    templateName: template.name,
                    user: props.user.username
                });
            }
        };
        
        // Export functionality
        const exportTestData = async (format) => {
            console.log(`🔶 Vue TestMenu: Exporting test data as ${format.id}`);
            
            // Security validation
            if (!hasPermission('OPERATOR')) {
                console.warn('Access denied for export functionality');
                return;
            }
            
            testState.exportInProgress = true;
            testState.exportFormat = format;
            
            try {
                // Generate test data for export
                const exportData = {
                    timestamp: new Date().toISOString(),
                    user: props.user.username,
                    role: props.user.role,
                    selectedOption: testState.selectedOption?.id || 'none',
                    testHistory: testState.testHistory,
                    customScenarios: testState.customScenarios,
                    testTemplates: testState.testTemplates,
                    exportFormat: format.id,
                    language: props.language
                };
                
                // Simulate export process
                await simulateExport(exportData, format);
                
                // Security logging
                if (securityService) {
                    securityService.logSecurityEvent('data_exported', {
                        format: format.id,
                        user: props.user.username,
                        dataSize: JSON.stringify(exportData).length
                    });
                }
                
                // Emit event for parent component
                emit('export-data', { data: exportData, format });
                
                console.log(`✅ Vue TestMenu: Test data exported successfully as ${format.id}`);
                
            } catch (error) {
                console.error(`❌ Vue TestMenu: Export failed for ${format.id}:`, error);
                
                if (securityService) {
                    securityService.logSecurityEvent('export_error', {
                        format: format.id,
                        error: error.message,
                        user: props.user.username
                    });
                }
                
                const errorMsg = props.language === 'pl' ? 
                    `Eksport ${format.id} nieudany: ${error.message}` :
                    `Export ${format.id} failed: ${error.message}`;
                alert(errorMsg);
            } finally {
                testState.exportInProgress = false;
                testState.exportFormat = null;
            }
        };

        const simulateExport = async (data, format) => {
            // Simulate export delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let content = '';
            let mimeType = format.mimeType || 'application/json';
            let fileName = `test-data-${Date.now()}`;
            
            switch (format.id) {
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    fileName += '.json';
                    break;
                case 'xml':
                    content = generateXMLContent(data);
                    fileName += '.xml';
                    break;
                case 'csv':
                    content = generateCSVContent(data);
                    fileName += '.csv';
                    break;
                case 'pdf':
                    content = `PDF Export - Test Data\nUser: ${data.user}\nTimestamp: ${data.timestamp}`;
                    fileName += '.pdf';
                    break;
            }
            
            // Create and trigger download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const generateXMLContent = (data) => {
            return `<?xml version="1.0" encoding="UTF-8"?>
<testData>
    <timestamp>${data.timestamp}</timestamp>
    <user>${data.user}</user>
    <role>${data.role}</role>
    <testHistory>
        ${data.testHistory.map(t => `<test id="${t.id}" name="${t.name}" status="${t.status}"/>`).join('\n        ')}
    </testHistory>
</testData>`;
        };

        const generateCSVContent = (data) => {
            const headers = ['ID', 'Name', 'Device Type', 'Status', 'Result', 'Date'];
            const rows = data.testHistory.map(t => [
                t.id, t.name, t.device?.deviceType || 'N/A', t.status, t.result || 'N/A', t.date
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        };
        
        // Utility Methods
        const closeAllModals = () => {
            testState.wizardActive = false;
            testState.scenariosActive = false;
            testState.historyActive = false;
            testState.templatesActive = false;
        };

        const goBack = () => {
            console.log('🔶 Vue TestMenu: Returning to previous screen');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(async () => {
            console.log('🔶 Vue TestMenu: Component mounted');
            console.log(`🔶 Vue TestMenu: ${testOptions.value.length} test options available`);
            
            // Load initial data
            try {
                await Promise.all([
                    loadTestHistory(),
                    loadTestTemplates(),
                    loadCustomScenarios()
                ]);
                
                if (securityService) {
                    securityService.logSecurityEvent('test_menu_loaded', {
                        user: props.user.username,
                        optionsCount: testOptions.value.length
                    });
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        });

        return {
            // Reactive state
            testState,
            
            // Computed properties
            testOptions,
            exportFormats,
            deviceTypes,
            testTypes,
            testStandards,
            pressureRanges,
            pageTitle,
            exportTitle,
            canProceedToNextStep,
            
            // Basic methods
            selectTestOption,
            exportTestData,
            goBack,
            
            // Test Wizard methods
            startTestWizard,
            nextWizardStep,
            prevWizardStep,
            finishTestWizard,
            cancelTestWizard,
            
            // Custom Scenarios methods
            showCustomScenarios,
            createNewScenario,
            
            // Test History methods
            showTestHistory,
            
            // Test Templates methods
            showTestTemplates,
            useTemplate,
            
            // Utility methods
            closeAllModals,
            hasPermission
        };
    }
};

export default TestMenu;
