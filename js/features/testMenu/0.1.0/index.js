import TestMenu from './testMenu.js';
import { ConfigLoader } from '../../../shared/configLoader.js';

/**
 * Test Menu Module - Entry Point
 * Advanced test menu with wizard, scenarios, history and templates
 */
export default {
    metadata: {
        name: 'testMenu',
        version: '0.1.0',
        type: 'component',
        dependencies: ['vue', 'vuex'],
        description: 'Advanced test menu with wizard, scenarios, history and templates',
        author: 'MASKTRONIC C20',
        created: '2024-01-21',
        migrated: true,
        originalFile: 'TestMenuTemplate.js'
    },
    
    component: {
        ...TestMenu,
        template: `
            <div class="test-menu-container vue-component">
                <div class="template-container">
                    
                    <!-- Header -->
                    <div class="template-header">
                        <button class="back-btn" @click="goBack">← {{ $t('common.back', 'Powrót') }}</button>
                        <h2 class="template-title">{{ pageTitle }}</h2>
                        <div class="vue-badge">Vue</div>
                    </div>

                    <!-- Test Options Grid -->
                    <div class="test-menu-section">
                        <div class="menu-grid">
                            <div 
                                v-for="option in testOptions" 
                                :key="option.id"
                                class="menu-card"
                                :class="[
                                    'card-' + option.color,
                                    { 
                                        active: testState.selectedOption?.id === option.id,
                                        disabled: !hasPermission(option.requiredRole)
                                    }
                                ]"
                                @click="hasPermission(option.requiredRole) && selectTestOption(option)"
                            >
                                <div class="card-icon">{{ option.icon }}</div>
                                <div class="card-content">
                                    <h3 class="card-title">{{ option.title }}</h3>
                                    <p class="card-description">{{ option.description }}</p>
                                    <div v-if="!hasPermission(option.requiredRole)" class="permission-badge">
                                        {{ $t('common.accessDenied', 'Brak uprawnień') }}
                                    </div>
                                </div>
                                <div class="card-arrow" v-if="hasPermission(option.requiredRole)">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Export Section -->
                    <div class="export-section">
                        <h3 class="export-title">{{ exportTitle }}</h3>
                        
                        <div class="export-buttons">
                            <button 
                                v-for="format in exportFormats" 
                                :key="format.id"
                                class="btn-export"
                                :class="[
                                    'btn-' + format.color,
                                    { 
                                        loading: testState.exportInProgress && testState.exportFormat?.id === format.id,
                                        disabled: testState.exportInProgress && testState.exportFormat?.id !== format.id
                                    }
                                ]"
                                @click="exportTestData(format)"
                                :disabled="testState.exportInProgress || !hasPermission('OPERATOR')"
                                :title="format.description"
                            >
                                <span class="btn-icon">{{ format.icon }}</span>
                                <span class="btn-label">{{ format.label }}</span>
                                <span v-if="testState.exportInProgress && testState.exportFormat?.id === format.id" 
                                      class="btn-spinner">⏳</span>
                            </button>
                        </div>
                        
                        <p class="export-description">
                            {{ $t('testMenu.exportDescription', 'Wybierz format eksportu danych testowych') }}
                        </p>
                    </div>

                    <!-- Status Display -->
                    <div v-if="testState.selectedOption" class="status-display">
                        <p><strong>{{ $t('common.selectedOption', 'Wybrana opcja') }}:</strong> {{ testState.selectedOption.title }}</p>
                        <p><strong>{{ $t('common.user', 'Użytkownik') }}:</strong> {{ user.username }} ({{ user.role }})</p>
                    </div>
                    
                    <!-- Test Wizard Modal -->
                    <div v-if="testState.wizardActive" class="modal-overlay" @click="cancelTestWizard">
                        <div class="modal-content wizard-modal" @click.stop>
                            <div class="modal-header">
                                <h3>🪄 {{ $t('testMenu.wizardTitle', 'Kreator Testów') }} - {{ $t('common.step', 'Krok') }} {{ testState.wizardStep }}/4</h3>
                                <button class="modal-close" @click="cancelTestWizard">×</button>
                            </div>
                            
                            <!-- Step Progress -->
                            <div class="step-progress">
                                <div v-for="step in 4" :key="step" 
                                     :class="['step-indicator', { active: step <= testState.wizardStep, completed: step < testState.wizardStep }]">
                                    {{ step }}
                                </div>
                            </div>
                            
                            <!-- Dynamic Step Content -->
                            <component :is="'wizard-step-' + testState.wizardStep" 
                                       :wizard-data="testState.wizardData"
                                       :device-types="deviceTypes"
                                       :test-types="testTypes"
                                       :test-standards="testStandards"
                                       :pressure-ranges="pressureRanges"
                                       :language="language"
                                       @update-data="(step, data) => Object.assign(testState.wizardData[step], data)">
                            </component>
                            
                            <!-- Navigation -->
                            <div class="modal-footer">
                                <button v-if="testState.wizardStep > 1" @click="prevWizardStep" class="btn btn-secondary">
                                    ← {{ $t('common.previous', 'Poprzedni') }}
                                </button>
                                <button v-if="testState.wizardStep < 4" @click="nextWizardStep" class="btn btn-primary" 
                                        :disabled="!canProceedToNextStep">
                                    {{ $t('common.next', 'Dalej') }} →
                                </button>
                                <button v-if="testState.wizardStep === 4" @click="finishTestWizard" class="btn btn-success">
                                    🏁 {{ $t('testMenu.finishTest', 'Zakończ test') }}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Other Modals (Scenarios, History, Templates) -->
                    <test-scenarios-modal v-if="testState.scenariosActive" 
                                         :scenarios="testState.customScenarios"
                                         :language="language"
                                         @close="testState.scenariosActive = false"
                                         @create-new="createNewScenario">
                    </test-scenarios-modal>
                    
                    <test-history-modal v-if="testState.historyActive"
                                       :history="testState.testHistory"
                                       :filter="testState.historyFilter"
                                       :language="language"
                                       @close="testState.historyActive = false"
                                       @filter-change="testState.historyFilter = $event">
                    </test-history-modal>
                    
                    <test-templates-modal v-if="testState.templatesActive"
                                         :templates="testState.testTemplates"
                                         :language="language"
                                         @close="testState.templatesActive = false"
                                         @use-template="useTemplate">
                    </test-templates-modal>
                </div>
            </div>
        `
    },
    
    config: null,
    
    async loadConfig() {
    const possiblePaths = [
      'js/features/testMenu/0.1.0/config/config.json',  // Correct component path
      './js/features/testMenu/0.1.0/config/config.json', // Alternative
      '/js/features/testMenu/0.1.0/config/config.json'   // Absolute from web root
    ];
    
    let result;
    for (const configPath of possiblePaths) {
      try {
        result = await ConfigLoader.loadConfig(configPath, 'testMenu');
        if (result.success) break;
      } catch (error) {
        continue; // Try next path
      }
    }
    
    this.config = result?.config || {};
    return result || { success: false, config: {} };
  },
    
    async init(context) {
        console.log('🔶 TestMenu Module: Initializing...');
        
        try {
            // Load configuration first
            await this.loadConfig();
            
            // Validate required dependencies (with fallbacks for dev server)
            const requiredServices = ['$store', 'securityService'];
            const missing = requiredServices.filter(service => !context[service]);
            
            if (missing.length > 0) {
                console.warn(`TestMenu: Missing services: ${missing.join(', ')}, creating mocks for dev server`);
                
                // Create mock services for dev server environment
                if (!context.$store) {
                    context.$store = {
                        getters: {},
                        dispatch: (action, payload) => Promise.resolve(),
                        commit: (mutation, payload) => {},
                        state: {}
                    };
                }
                
                if (!context.securityService) {
                    context.securityService = {
                        logSecurityEvent: (event, data) => console.log('Mock security event:', event, data)
                    };
                }
            }
            
            // Initialize module configuration
            if (context.moduleConfig) {
                context.moduleConfig.testMenu = this.config;
            }
            
            // Security check
            if (context.securityService) {
                context.securityService.logSecurityEvent('module_initialized', {
                    moduleName: 'testMenu',
                    version: '0.1.0',
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('✅ TestMenu Module: Initialized successfully');
            return { success: true, module: 'testMenu', version: '0.1.0' };
            
        } catch (error) {
            console.error('❌ TestMenu Module: Initialization failed:', error);
            return { success: false, error: error.message };
        }
    },
    
    async handle(request) {
        console.log('🔶 TestMenu Module: Handling request:', request.type);
        
        switch (request.type) {
            case 'export-data':
                return await this.handleExportData(request.data);
            case 'create-test':
                return await this.handleCreateTest(request.data);
            case 'load-templates':
                return await this.handleLoadTemplates();
            case 'load-history':
                return await this.handleLoadHistory();
            default:
                console.warn(`TestMenu: Unknown request type: ${request.type}`);
                return { success: false, error: 'Unknown request type' };
        }
    },
    
    async handleExportData(data) {
        console.log('🔶 TestMenu: Handling export data request');
        // Implementation for handling export requests
        return { success: true, exported: true };
    },
    
    async handleCreateTest(testConfig) {
        console.log('🔶 TestMenu: Handling create test request');
        // Implementation for handling test creation
        return { success: true, testId: `test_${Date.now()}` };
    },
    
    async handleLoadTemplates() {
        console.log('🔶 TestMenu: Loading test templates');
        // Implementation for loading templates
        return { success: true, templates: [] };
    },
    
    async handleLoadHistory() {
        console.log('🔶 TestMenu: Loading test history');
        // Implementation for loading history
        return { success: true, history: [] };
    },
    
    async destroy() {
        console.log('🔶 TestMenu Module: Cleaning up...');
        
        try {
            // Cleanup any active timers, websockets, etc.
            // Remove event listeners
            // Clear cached data
            
            console.log('✅ TestMenu Module: Cleanup completed');
            return { success: true };
            
        } catch (error) {
            console.error('❌ TestMenu Module: Cleanup failed:', error);
            return { success: false, error: error.message };
        }
    }
};
