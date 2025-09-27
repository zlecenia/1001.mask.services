import ReportsViewer from './reportsViewer.js';
import config from './config.json';

/**
 * Reports Viewer Module - Entry Point
 * Advanced reports viewer with filters, data visualization and export capabilities
 */
export default {
    metadata: {
        name: 'reportsViewer',
        version: '0.1.0',
        type: 'component',
        dependencies: ['vue', 'vuex'],
        description: 'Advanced reports viewer with filters, data visualization and export capabilities',
        author: 'MASKTRONIC C20',
        created: '2024-01-21',
        migrated: true,
        originalFile: 'ReportsViewTemplate.js'
    },
    
    component: {
        ...ReportsViewer,
        template: `
            <div class="reports-viewer-container vue-component">
                <div class="template-container">
                    
                    <!-- Header -->
                    <div class="template-header">
                        <button class="back-btn" @click="goBack">← {{ $t('common.back', 'Powrót') }}</button>
                        <h2 class="template-title">{{ pageTitle }}</h2>
                        <div class="vue-badge">Vue</div>
                    </div>

                    <!-- Error Display -->
                    <div v-if="reportState.error" class="error-banner">
                        <span class="error-icon">⚠️</span>
                        <span class="error-message">{{ reportState.error }}</span>
                        <button class="error-close" @click="reportState.error = null">×</button>
                    </div>

                    <!-- Filters Section -->
                    <div class="report-filters">
                        <h3>{{ $t('reportsViewer.filtersTitle', 'Filtry raportu') }}</h3>
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label>{{ $t('reportsViewer.dateFrom', 'Data od:') }}</label>
                                <input 
                                    v-model="filters.dateFrom" 
                                    type="date" 
                                    class="date-input"
                                    :class="{ invalid: !isValidDateRange }"
                                />
                            </div>
                            <div class="filter-group">
                                <label>{{ $t('reportsViewer.dateTo', 'Data do:') }}</label>
                                <input 
                                    v-model="filters.dateTo" 
                                    type="date" 
                                    class="date-input"
                                    :class="{ invalid: !isValidDateRange }"
                                />
                            </div>
                            <div class="filter-group">
                                <label>{{ $t('reportsViewer.deviceType', 'Typ urządzenia:') }}</label>
                                <select v-model="filters.deviceType" class="filter-select">
                                    <option 
                                        v-for="option in deviceOptions" 
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>{{ $t('reportsViewer.testStatus', 'Status testu:') }}</label>
                                <select v-model="filters.testStatus" class="filter-select">
                                    <option 
                                        v-for="option in testStatusOptions" 
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button 
                                class="generate-btn"
                                :class="{ 
                                    loading: reportState.isGenerating,
                                    disabled: !canGenerateReport 
                                }"
                                @click="generateReport"
                                :disabled="!canGenerateReport"
                            >
                                <span v-if="reportState.isGenerating" class="loading-spinner">⏳</span>
                                {{ reportState.isGenerating ? 
                                    $t('reportsViewer.generating', 'Generowanie...') : 
                                    $t('reportsViewer.generateBtn', 'Generuj Raport') }}
                            </button>
                            
                            <button 
                                class="reset-btn"
                                @click="resetFilters"
                                :disabled="reportState.isGenerating"
                            >
                                {{ $t('common.reset', 'Resetuj') }}
                            </button>
                        </div>
                        
                        <div v-if="!isValidDateRange" class="validation-error">
                            {{ $t('reportsViewer.invalidDateRange', 'Nieprawidłowy zakres dat') }}
                        </div>
                    </div>

                    <!-- Results Section -->
                    <div v-if="reportState.hasResults" class="report-results">
                        <div class="results-header">
                            <div class="results-info">
                                <h3>{{ $t('reportsViewer.resultsTitle', 'Wyniki raportu') }}</h3>
                                <span v-if="reportState.lastGeneratedAt" class="generated-time">
                                    {{ $t('reportsViewer.generatedAt', 'Wygenerowano:') }} 
                                    {{ reportState.lastGeneratedAt.toLocaleString(language) }}
                                </span>
                            </div>
                            <div class="export-actions">
                                <button 
                                    v-for="format in exportFormats" 
                                    :key="format.id"
                                    class="export-btn"
                                    @click="exportReport(format)"
                                    :disabled="!hasPermission('OPERATOR')"
                                    :title="$t('reportsViewer.exportAs', 'Eksportuj jako') + ' ' + format.label"
                                >
                                    {{ format.icon }} {{ format.label }}
                                </button>
                                <button 
                                    class="clear-btn"
                                    @click="clearResults"
                                    :title="$t('reportsViewer.clearResults', 'Wyczyść wyniki')"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        <!-- Summary Cards -->
                        <div class="report-summary">
                            <div class="summary-card">
                                <h4>{{ $t('reportsViewer.totalTests', 'Wszystkie testy') }}</h4>
                                <span class="summary-number">{{ filteredReportData.summary.totalTests }}</span>
                                <div class="summary-trend">📊</div>
                            </div>
                            <div class="summary-card passed">
                                <h4>{{ $t('reportsViewer.passedTests', 'Udane') }}</h4>
                                <span class="summary-number">{{ filteredReportData.summary.passedTests }}</span>
                                <div class="summary-trend">✅</div>
                            </div>
                            <div class="summary-card failed">
                                <h4>{{ $t('reportsViewer.failedTests', 'Nieudane') }}</h4>
                                <span class="summary-number">{{ filteredReportData.summary.failedTests }}</span>
                                <div class="summary-trend">❌</div>
                            </div>
                            <div class="summary-card rate">
                                <h4>{{ $t('reportsViewer.successRate', 'Wskaźnik sukcesu') }}</h4>
                                <span class="summary-number">{{ filteredReportData.summary.successRate }}%</span>
                                <div class="summary-trend">📈</div>
                            </div>
                        </div>
                        
                        <!-- Device Breakdown -->
                        <div class="device-breakdown" v-if="filteredReportData.deviceBreakdown.length > 0">
                            <h4>{{ $t('reportsViewer.deviceBreakdown', 'Podział według urządzeń') }}</h4>
                            <div class="breakdown-grid">
                                <div 
                                    v-for="device in filteredReportData.deviceBreakdown" 
                                    :key="device.type"
                                    class="breakdown-card"
                                >
                                    <div class="breakdown-header">
                                        <h5>{{ device.type }}</h5>
                                        <div class="device-icon">🔧</div>
                                    </div>
                                    <div class="breakdown-stats">
                                        <div class="stat">
                                            <span class="stat-label">{{ $t('reportsViewer.total', 'Łącznie:') }}</span>
                                            <span class="stat-value">{{ device.count }}</span>
                                        </div>
                                        <div class="stat passed">
                                            <span class="stat-label">{{ $t('reportsViewer.passed', 'Udane:') }}</span>
                                            <span class="stat-value">{{ device.passed }}</span>
                                        </div>
                                        <div class="stat failed">
                                            <span class="stat-label">{{ $t('reportsViewer.failed', 'Nieudane:') }}</span>
                                            <span class="stat-value">{{ device.failed }}</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div 
                                                class="progress-fill"
                                                :style="{ 
                                                    width: Math.round((device.passed / device.count) * 100) + '%' 
                                                }"
                                            ></div>
                                        </div>
                                        <div class="success-rate">
                                            {{ Math.round((device.passed / device.count) * 100) }}% 
                                            {{ $t('reportsViewer.success', 'sukces') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Tests Table -->
                        <div class="recent-tests" v-if="filteredReportData.recentTests.length > 0">
                            <h4>{{ $t('reportsViewer.recentTests', 'Ostatnie testy') }}</h4>
                            <div class="tests-table-container">
                                <table class="tests-table">
                                    <thead>
                                        <tr>
                                            <th>{{ $t('reportsViewer.testId', 'ID testu') }}</th>
                                            <th>{{ $t('reportsViewer.date', 'Data') }}</th>
                                            <th>{{ $t('reportsViewer.device', 'Urządzenie') }}</th>
                                            <th>{{ $t('reportsViewer.operator', 'Operator') }}</th>
                                            <th>{{ $t('reportsViewer.result', 'Wynik') }}</th>
                                            <th>{{ $t('reportsViewer.score', 'Punkty') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="test in filteredReportData.recentTests.slice(0, 20)" :key="test.id">
                                            <td class="test-id">{{ test.id }}</td>
                                            <td class="test-date">{{ new Date(test.date).toLocaleDateString(language) }}</td>
                                            <td class="test-device">{{ test.device }}</td>
                                            <td class="test-operator">{{ test.operator }}</td>
                                            <td class="test-result" :class="test.result.toLowerCase()">
                                                {{ test.result }}
                                            </td>
                                            <td class="test-score">{{ test.score || '-' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>{{ $t('reportsViewer.noData', 'Brak danych raportu') }}</h3>
                        <p>{{ $t('reportsViewer.noDataDescription', 'Użyj filtrów powyżej i kliknij "Generuj Raport" aby zobaczyć wyniki.') }}</p>
                        <div class="empty-actions">
                            <button class="sample-btn" @click="generateReport" :disabled="!canGenerateReport">
                                {{ $t('reportsViewer.generateSample', 'Wygeneruj przykładowy raport') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    config: config,
    
    async init(context) {
        console.log('🔶 ReportsViewer Module: Initializing...');
        
        try {
            // Validate required dependencies
            const requiredServices = ['$store', 'securityService'];
            const missing = requiredServices.filter(service => !context[service]);
            
            if (missing.length > 0) {
                console.warn(`ReportsViewer: Missing services: ${missing.join(', ')}`);
            }
            
            // Initialize module configuration
            if (context.moduleConfig) {
                context.moduleConfig.reportsViewer = config;
            }
            
            // Security check
            if (context.securityService) {
                context.securityService.logSecurityEvent('module_initialized', {
                    moduleName: 'reportsViewer',
                    version: '0.1.0',
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('✅ ReportsViewer Module: Initialized successfully');
            return { success: true, module: 'reportsViewer', version: '0.1.0' };
            
        } catch (error) {
            console.error('❌ ReportsViewer Module: Initialization failed:', error);
            return { success: false, error: error.message };
        }
    },
    
    async handle(request) {
        console.log('🔶 ReportsViewer Module: Handling request:', request.type);
        
        switch (request.type) {
            case 'generate-report':
                return await this.handleGenerateReport(request.data);
            case 'export-report':
                return await this.handleExportReport(request.data);
            case 'get-device-stats':
                return await this.handleGetDeviceStats(request.data);
            case 'clear-cache':
                return await this.handleClearCache();
            default:
                console.warn(`ReportsViewer: Unknown request type: ${request.type}`);
                return { success: false, error: 'Unknown request type' };
        }
    },
    
    async handleGenerateReport(filters) {
        console.log('🔶 ReportsViewer: Handling generate report request');
        
        try {
            // Validate filters
            if (!filters.dateFrom || !filters.dateTo) {
                return { success: false, error: 'Missing required date filters' };
            }
            
            // Generate report data
            const reportData = {
                id: `report_${Date.now()}`,
                generatedAt: new Date().toISOString(),
                filters: filters,
                summary: { totalTests: 0, passedTests: 0, failedTests: 0, successRate: 0 }
            };
            
            return { success: true, data: reportData };
            
        } catch (error) {
            console.error('ReportsViewer: Report generation failed:', error);
            return { success: false, error: error.message };
        }
    },
    
    async handleExportReport(exportRequest) {
        console.log('🔶 ReportsViewer: Handling export report request');
        
        try {
            const { format, data } = exportRequest;
            
            if (!format || !data) {
                return { success: false, error: 'Missing export format or data' };
            }
            
            return { 
                success: true, 
                exported: true,
                format: format,
                size: JSON.stringify(data).length 
            };
            
        } catch (error) {
            console.error('ReportsViewer: Export failed:', error);
            return { success: false, error: error.message };
        }
    },
    
    async handleGetDeviceStats(filters) {
        console.log('🔶 ReportsViewer: Getting device statistics');
        
        try {
            // Mock device statistics
            const deviceStats = [
                { type: 'PP_MASK', count: 120, passed: 115, failed: 5 },
                { type: 'NP_MASK', count: 95, passed: 90, failed: 5 },
                { type: 'SCBA', count: 78, passed: 72, failed: 6 },
                { type: 'CPS', count: 65, passed: 60, failed: 5 }
            ];
            
            return { success: true, stats: deviceStats };
            
        } catch (error) {
            console.error('ReportsViewer: Failed to get device stats:', error);
            return { success: false, error: error.message };
        }
    },
    
    async handleClearCache() {
        console.log('🔶 ReportsViewer: Clearing cache');
        
        try {
            // Clear any cached report data
            return { success: true, cleared: true };
            
        } catch (error) {
            console.error('ReportsViewer: Failed to clear cache:', error);
            return { success: false, error: error.message };
        }
    },
    
    async destroy() {
        console.log('🔶 ReportsViewer Module: Cleaning up...');
        
        try {
            // Cleanup any active report generation processes
            // Clear cached data
            // Remove event listeners
            
            console.log('✅ ReportsViewer Module: Cleanup completed');
            return { success: true };
            
        } catch (error) {
            console.error('❌ ReportsViewer Module: Cleanup failed:', error);
            return { success: false, error: error.message };
        }
    }
};
