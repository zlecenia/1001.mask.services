import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TestMenu from './testMenu.js';
import config from './config/config.json';

describe('TestMenu Module', () => {
    let wrapper;
    let mockStore;
    let mockSecurityService;
    let mockUser;

    beforeEach(() => {
        // Mock user object
        mockUser = {
            username: 'testuser',
            role: 'OPERATOR',
            isAuthenticated: true
        };

        // Mock Vuex store
        mockStore = {
            dispatch: vi.fn(),
            getters: {
                'tests/customScenarios': [],
                'tests/history': [],
                'tests/templates': []
            }
        };

        // Mock security service
        mockSecurityService = {
            hasRole: vi.fn().mockReturnValue(true),
            logSecurityEvent: vi.fn(),
            sanitizeInput: vi.fn(input => input),
            validateInput: vi.fn().mockReturnValue(true)
        };

        // Mount component with mocks
        wrapper = mount(TestMenu, {
            props: {
                user: mockUser,
                language: 'pl'
            },
            global: {
                provide: {
                    $store: mockStore,
                    securityService: mockSecurityService,
                    moduleConfig: config
                }
            }
        });
    });

    describe('Component Initialization', () => {
        it('should mount successfully', () => {
            expect(wrapper.exists()).toBe(true);
            expect(wrapper.vm).toBeDefined();
        });

        it('should have correct component name', () => {
            expect(wrapper.vm.$options.name).toBe('TestMenu');
        });

        it('should initialize with default state', () => {
            expect(wrapper.vm.testState.selectedOption).toBeNull();
            expect(wrapper.vm.testState.wizardActive).toBe(false);
            expect(wrapper.vm.testState.exportInProgress).toBe(false);
        });

        it('should load test options from config', () => {
            expect(wrapper.vm.testOptions).toBeDefined();
            expect(Array.isArray(wrapper.vm.testOptions)).toBe(true);
            expect(wrapper.vm.testOptions.length).toBeGreaterThan(0);
        });
    });

    describe('Props and Computed Properties', () => {
        it('should use provided user prop', () => {
            expect(wrapper.vm.user).toEqual(mockUser);
        });

        it('should use provided language prop', () => {
            expect(wrapper.vm.language).toBe('pl');
        });

        it('should compute page title based on language', () => {
            expect(wrapper.vm.pageTitle).toBe('Menu Testów');
            
            // Test English
            wrapper.setProps({ language: 'en' });
            expect(wrapper.vm.pageTitle).toBe('Test Menu');
            
            // Test German  
            wrapper.setProps({ language: 'de' });
            expect(wrapper.vm.pageTitle).toBe('Testmenü');
        });

        it('should compute export title based on language', () => {
            expect(wrapper.vm.exportTitle).toBe('Eksport danych testowych');
        });

        it('should load export formats from config', () => {
            expect(wrapper.vm.exportFormats).toBeDefined();
            expect(wrapper.vm.exportFormats.length).toBe(4);
            expect(wrapper.vm.exportFormats[0].id).toBe('json');
        });
    });

    describe('Test Options and Security', () => {
        it('should show all test options for authorized user', () => {
            const options = wrapper.vm.testOptions;
            expect(options.length).toBe(8);
            expect(options.some(opt => opt.id === 'wizard')).toBe(true);
            expect(options.some(opt => opt.id === 'scenarios')).toBe(true);
        });

        it('should check permissions correctly', () => {
            expect(wrapper.vm.hasPermission('OPERATOR')).toBe(true);
            expect(mockSecurityService.hasRole).toHaveBeenCalledWith('OPERATOR', 'OPERATOR');
        });

        it('should handle permission denial', () => {
            mockSecurityService.hasRole.mockReturnValue(false);
            expect(wrapper.vm.hasPermission('ADMIN')).toBe(false);
        });
    });

    describe('Test Option Selection', () => {
        it('should select test option when authorized', async () => {
            const option = wrapper.vm.testOptions.find(opt => opt.id === 'device');
            await wrapper.vm.selectTestOption(option);
            
            expect(wrapper.vm.testState.selectedOption).toEqual(option);
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'test_option_selected',
                expect.objectContaining({
                    optionId: 'device',
                    user: 'testuser'
                })
            );
        });

        it('should deny access for unauthorized options', async () => {
            mockSecurityService.hasRole.mockReturnValue(false);
            const option = wrapper.vm.testOptions.find(opt => opt.id === 'scenarios');
            
            await wrapper.vm.selectTestOption(option);
            
            expect(wrapper.vm.testState.selectedOption).toBeNull();
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'access_denied',
                expect.objectContaining({
                    resource: 'test_menu_option_scenarios'
                })
            );
        });

        it('should emit test-selected event', async () => {
            const option = wrapper.vm.testOptions.find(opt => opt.id === 'device');
            await wrapper.vm.selectTestOption(option);
            
            expect(wrapper.emitted('test-selected')).toBeTruthy();
            expect(wrapper.emitted('test-selected')[0][0]).toMatchObject({
                option: option
            });
        });
    });

    describe('Test Wizard Functionality', () => {
        it('should start test wizard', () => {
            wrapper.vm.startTestWizard();
            
            expect(wrapper.vm.testState.wizardActive).toBe(true);
            expect(wrapper.vm.testState.wizardStep).toBe(1);
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'test_wizard_started',
                expect.objectContaining({
                    user: 'testuser'
                })
            );
        });

        it('should navigate wizard steps correctly', () => {
            wrapper.vm.startTestWizard();
            
            // Initially should be step 1
            expect(wrapper.vm.testState.wizardStep).toBe(1);
            
            // Fill step 1 data to enable next step
            wrapper.vm.testState.wizardData.step1.deviceType = 'RPD';
            wrapper.vm.testState.wizardData.step1.deviceModel = 'Model-A';
            
            // Next step should work
            wrapper.vm.nextWizardStep();
            expect(wrapper.vm.testState.wizardStep).toBe(2);
            
            // Previous step should work
            wrapper.vm.prevWizardStep();
            expect(wrapper.vm.testState.wizardStep).toBe(1);
        });

        it('should validate wizard step progression', () => {
            wrapper.vm.startTestWizard();
            
            // Step 1: Should not proceed without required data
            expect(wrapper.vm.canProceedToNextStep).toBe(false);
            
            // Add required data for step 1
            wrapper.vm.testState.wizardData.step1.deviceType = 'RPD';
            wrapper.vm.testState.wizardData.step1.deviceModel = 'Model-A';
            expect(wrapper.vm.canProceedToNextStep).toBe(true);
        });

        it('should reset wizard data properly', () => {
            wrapper.vm.startTestWizard();
            
            // Modify wizard data
            wrapper.vm.testState.wizardData.step1.deviceType = 'RPD';
            wrapper.vm.testState.wizardData.step4.name = 'Test Name';
            
            // Reset should clear all data
            wrapper.vm.resetWizardData();
            expect(wrapper.vm.testState.wizardData.step1.deviceType).toBeNull();
            expect(wrapper.vm.testState.wizardData.step4.name).toBe('');
        });

        it('should finish wizard and create test', async () => {
            wrapper.vm.startTestWizard();
            
            // Fill all required data
            wrapper.vm.testState.wizardData.step1.deviceType = 'RPD';
            wrapper.vm.testState.wizardData.step1.deviceModel = 'Model-A';
            wrapper.vm.testState.wizardData.step2.testType = 'pressure';
            wrapper.vm.testState.wizardData.step2.testStandard = 'PN-EN-149';
            wrapper.vm.testState.wizardData.step4.name = 'Test Name';
            
            await wrapper.vm.finishTestWizard();
            
            expect(wrapper.vm.testState.wizardActive).toBe(false);
            expect(wrapper.vm.testState.testHistory.length).toBeGreaterThan(0);
            expect(wrapper.emitted('test-created')).toBeTruthy();
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'test_wizard_completed',
                expect.objectContaining({
                    user: 'testuser'
                })
            );
        });

        it('should cancel wizard properly', () => {
            wrapper.vm.startTestWizard();
            wrapper.vm.testState.wizardStep = 3;
            
            wrapper.vm.cancelTestWizard();
            
            expect(wrapper.vm.testState.wizardActive).toBe(false);
            expect(wrapper.vm.testState.wizardStep).toBe(1);
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'test_wizard_cancelled',
                expect.objectContaining({
                    user: 'testuser'
                })
            );
        });
    });

    describe('Data Loading Functions', () => {
        it('should load custom scenarios', async () => {
            await wrapper.vm.loadCustomScenarios();
            expect(wrapper.vm.testState.customScenarios).toBeDefined();
            expect(Array.isArray(wrapper.vm.testState.customScenarios)).toBe(true);
        });

        it('should load test history', async () => {
            await wrapper.vm.loadTestHistory();
            expect(wrapper.vm.testState.testHistory).toBeDefined();
            expect(Array.isArray(wrapper.vm.testState.testHistory)).toBe(true);
        });

        it('should load test templates', async () => {
            await wrapper.vm.loadTestTemplates();
            expect(wrapper.vm.testState.testTemplates).toBeDefined();
            expect(Array.isArray(wrapper.vm.testState.testTemplates)).toBe(true);
        });

        it('should handle data loading errors gracefully', async () => {
            // Mock store to throw error
            const errorStore = {
                getters: {
                    'tests/customScenarios': (() => { throw new Error('Test error'); })()
                }
            };
            
            wrapper = mount(TestMenu, {
                props: { user: mockUser, language: 'pl' },
                global: {
                    provide: {
                        $store: errorStore,
                        securityService: mockSecurityService,
                        moduleConfig: config
                    }
                }
            });

            await wrapper.vm.loadCustomScenarios();
            expect(wrapper.vm.testState.customScenarios).toEqual([]);
        });
    });

    describe('Export Functionality', () => {
        it('should export data in JSON format', async () => {
            const format = { id: 'json', label: 'JSON', mimeType: 'application/json' };
            
            // Mock URL.createObjectURL and other DOM methods
            global.URL.createObjectURL = vi.fn(() => 'mock-url');
            global.URL.revokeObjectURL = vi.fn();
            
            const mockLink = {
                click: vi.fn(),
                href: '',
                download: ''
            };
            document.createElement = vi.fn(() => mockLink);
            document.body.appendChild = vi.fn();
            document.body.removeChild = vi.fn();

            await wrapper.vm.exportTestData(format);
            
            expect(wrapper.vm.testState.exportInProgress).toBe(false);
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'data_exported',
                expect.objectContaining({
                    format: 'json',
                    user: 'testuser'
                })
            );
        });

        it('should handle export errors', async () => {
            // Mock console.error to suppress error output
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock a failing export
            const format = { id: 'invalid', label: 'Invalid' };
            
            await wrapper.vm.exportTestData(format);
            
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'export_error',
                expect.objectContaining({
                    format: 'invalid',
                    user: 'testuser'
                })
            );
            
            consoleError.mockRestore();
        });

        it('should deny export for unauthorized users', async () => {
            mockSecurityService.hasRole.mockReturnValue(false);
            const format = { id: 'json', label: 'JSON' };
            
            await wrapper.vm.exportTestData(format);
            
            expect(wrapper.vm.testState.exportInProgress).toBe(false);
        });
    });

    describe('Template Functionality', () => {
        it('should use template to pre-fill wizard', () => {
            const template = {
                id: 'tpl_001',
                name: 'Test Template',
                description: 'Test description',
                device: { deviceType: 'RPD', deviceModel: 'Model-A' },
                test: { testType: 'pressure', testStandard: 'PN-EN-149' },
                parameters: { duration: 300, cycles: 3, tolerance: 5 }
            };
            
            wrapper.vm.useTemplate(template);
            
            expect(wrapper.vm.testState.wizardActive).toBe(true);
            expect(wrapper.vm.testState.wizardStep).toBe(4);
            expect(wrapper.vm.testState.wizardData.step1.deviceType).toBe('RPD');
            expect(wrapper.vm.testState.wizardData.step2.testType).toBe('pressure');
            expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith(
                'template_used',
                expect.objectContaining({
                    templateId: 'tpl_001',
                    user: 'testuser'
                })
            );
        });
    });

    describe('Modal Management', () => {
        it('should close all modals', () => {
            // Open all modals
            wrapper.vm.testState.wizardActive = true;
            wrapper.vm.testState.scenariosActive = true;
            wrapper.vm.testState.historyActive = true;
            wrapper.vm.testState.templatesActive = true;
            
            wrapper.vm.closeAllModals();
            
            expect(wrapper.vm.testState.wizardActive).toBe(false);
            expect(wrapper.vm.testState.scenariosActive).toBe(false);
            expect(wrapper.vm.testState.historyActive).toBe(false);
            expect(wrapper.vm.testState.templatesActive).toBe(false);
        });
    });

    describe('Navigation', () => {
        it('should emit navigation event on goBack', () => {
            wrapper.vm.goBack();
            
            expect(wrapper.emitted('navigate')).toBeTruthy();
            expect(wrapper.emitted('navigate')[0]).toEqual([
                'user-menu-screen',
                'pl',
                'default'
            ]);
        });
    });

    describe('CSV Generation', () => {
        it('should generate CSV content correctly', () => {
            const testData = {
                testHistory: [
                    { id: 'test1', name: 'Test 1', device: { deviceType: 'RPD' }, status: 'completed', result: 'PASS', date: '2024-01-01' },
                    { id: 'test2', name: 'Test 2', device: { deviceType: 'SCSR' }, status: 'failed', result: 'FAIL', date: '2024-01-02' }
                ]
            };
            
            const csvContent = wrapper.vm.generateCSVContent(testData);
            
            expect(csvContent).toContain('ID,Name,Device Type,Status,Result,Date');
            expect(csvContent).toContain('test1,Test 1,RPD,completed,PASS,2024-01-01');
            expect(csvContent).toContain('test2,Test 2,SCSR,failed,FAIL,2024-01-02');
        });
    });

    describe('XML Generation', () => {
        it('should generate XML content correctly', () => {
            const testData = {
                timestamp: '2024-01-01T00:00:00Z',
                user: 'testuser',
                role: 'OPERATOR',
                testHistory: [
                    { id: 'test1', name: 'Test 1', status: 'completed' }
                ]
            };
            
            const xmlContent = wrapper.vm.generateXMLContent(testData);
            
            expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xmlContent).toContain('<testData>');
            expect(xmlContent).toContain('<user>testuser</user>');
            expect(xmlContent).toContain('<test id="test1" name="Test 1" status="completed"/>');
        });
    });
});
