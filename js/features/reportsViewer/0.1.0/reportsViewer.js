// Use global Vue from CDN (for component dev server)
const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

/**
 * MASKTRONIC C20 - Reports Viewer Module
 * Advanced reports viewer with filters, data visualization and export capabilities
 * Migrated from ReportsViewTemplate.js to modular architecture
 */
const ReportsViewer = {
    name: 'ReportsViewer',
    
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
    
    emits: ['navigate', 'report-generated', 'report-exported'],
    
    setup(props, { emit }) {
        // Inject services
        const store = inject('$store', null);
        const securityService = inject('securityService', null);
        const config = inject('moduleConfig', {});
        
        // Reactive state
        const reportState = reactive({
            isGenerating: false,
            hasResults: false,
            currentReport: null,
            exportFormat: 'pdf',
            error: null,
            lastGeneratedAt: null
        });

        const filters = reactive({
            dateFrom: new Date(Date.now() - (config.reportFilters?.dateRange?.defaultDays || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
            deviceType: 'all',
            testStatus: 'all',
            operator: 'all'
        });

        const reportData = reactive({
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0
            },
            deviceBreakdown: [],
            recentTests: [],
            trends: [],
            operators: []
        });

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Przeglądanie Raportów',
                en: 'Reports View',
                de: 'Berichte Ansicht'
            };
            return titleMap[props.language] || 'Przeglądanie Raportów';
        });

        const deviceOptions = computed(() => {
            const configDevices = config.reportFilters?.deviceTypes || [];
            return configDevices.map(device => ({
                value: device.id,
                label: device.label[props.language] || device.label.pl || device.id
            }));
        });

        const testStatusOptions = computed(() => {
            const configStatuses = config.reportFilters?.testStatuses || [];
            return configStatuses.map(status => ({
                value: status.id,
                label: status.label[props.language] || status.label.pl || status.id
            }));
        });

        const exportFormats = computed(() => config.exportFormats || [
            { id: 'json', label: 'JSON', icon: '📄', mimeType: 'application/json' },
            { id: 'csv', label: 'CSV', icon: '📊', mimeType: 'text/csv' },
            { id: 'pdf', label: 'PDF', icon: '📑', mimeType: 'application/pdf' }
        ]);

        const filteredReportData = computed(() => {
            if (!reportState.hasResults) return reportData;
            
            let filtered = { ...reportData };
            
            // Apply device type filter
            if (filters.deviceType !== 'all') {
                filtered.deviceBreakdown = filtered.deviceBreakdown.filter(
                    d => d.type === filters.deviceType
                );
            }

            // Apply test status filter
            if (filters.testStatus !== 'all') {
                filtered.recentTests = filtered.recentTests.filter(
                    t => {
                        if (filters.testStatus === 'passed') return t.result === 'PASS';
                        if (filters.testStatus === 'failed') return t.result === 'FAIL';
                        return true;
                    }
                );
            }
            
            return filtered;
        });

        // Validation
        const isValidDateRange = computed(() => {
            const fromDate = new Date(filters.dateFrom);
            const toDate = new Date(filters.dateTo);
            const maxDays = config.security?.maxDateRange || 365;
            const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
            
            return fromDate <= toDate && daysDiff <= maxDays;
        });

        const canGenerateReport = computed(() => {
            return isValidDateRange.value && 
                   !reportState.isGenerating && 
                   hasPermission('OPERATOR');
        });

        // Security validation
        const hasPermission = (requiredRole) => {
            if (!securityService) return true;
            return securityService.hasRole(props.user.role, requiredRole);
        };

        // Methods
        const generateReport = async () => {
            console.log('🔶 Vue ReportsViewer: Generating report with filters:', filters);
            
            if (!canGenerateReport.value) {
                console.warn('Cannot generate report: insufficient permissions or invalid filters');
                return;
            }

            reportState.isGenerating = true;
            reportState.error = null;
            
            try {
                // Security logging
                if (securityService) {
                    securityService.logSecurityEvent('report_generation_started', {
                        filters: { ...filters },
                        user: props.user.username,
                        timestamp: new Date().toISOString()
                    });
                }

                // Try to load from store/API first
                let reportResult;
                if (store && store.dispatch) {
                    reportResult = await store.dispatch('reports/generateReport', filters);
                } else {
                    // Fallback to mock data generation
                    reportResult = await generateMockReportData();
                }
                
                // Update report data
                Object.assign(reportData, reportResult);
                
                reportState.hasResults = true;
                reportState.currentReport = {
                    id: `report_${Date.now()}`,
                    generatedAt: new Date(),
                    filters: { ...filters },
                    user: props.user.username,
                    dataPoints: reportResult.summary?.totalTests || 0
                };
                reportState.lastGeneratedAt = new Date();
                
                // Success logging
                if (securityService) {
                    securityService.logSecurityEvent('report_generated', {
                        reportId: reportState.currentReport.id,
                        dataPoints: reportState.currentReport.dataPoints,
                        user: props.user.username
                    });
                }
                
                emit('report-generated', reportState.currentReport);
                console.log('✅ Vue ReportsViewer: Report generated successfully');
                
            } catch (error) {
                console.error('❌ Vue ReportsViewer: Report generation failed:', error);
                reportState.error = error.message;
                
                if (securityService) {
                    securityService.logSecurityEvent('report_generation_error', {
                        error: error.message,
                        filters: filters,
                        user: props.user.username
                    });
                }
                
                const errorMsg = props.language === 'pl' ? 
                    'Błąd podczas generowania raportu: ' + error.message :
                    'Report generation failed: ' + error.message;
                alert(errorMsg);
                
            } finally {
                reportState.isGenerating = false;
            }
        };

        const generateMockReportData = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
            
            const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            
            const totalTests = random(200, 500);
            const failedTests = random(Math.floor(totalTests * 0.05), Math.floor(totalTests * 0.20));
            const passedTests = totalTests - failedTests;
            const inProgressTests = random(0, Math.floor(totalTests * 0.05));
            
            return {
                summary: {
                    totalTests,
                    passedTests,
                    failedTests,
                    inProgressTests,
                    successRate: Math.round((passedTests / (passedTests + failedTests)) * 100 * 10) / 10
                },
                deviceBreakdown: [
                    { type: 'PP_MASK', count: random(60, 120), passed: random(55, 110), failed: random(2, 10) },
                    { type: 'NP_MASK', count: random(50, 100), passed: random(48, 95), failed: random(1, 8) },
                    { type: 'SCBA', count: random(30, 80), passed: random(28, 75), failed: random(2, 8) },
                    { type: 'CPS', count: random(40, 90), passed: random(38, 85), failed: random(2, 10) }
                ],
                recentTests: generateRecentTests(),
                trends: generateTrendData(),
                operators: generateOperatorStats()
            };
        };

        const generateRecentTests = () => {
            const tests = [];
            const devices = ['PP_MASK', 'NP_MASK', 'SCBA', 'CPS'];
            const operators = ['Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski', 'Maria Kowalczyk'];
            const results = ['PASS', 'FAIL', 'IN_PROGRESS'];
            
            for (let i = 0; i < 50; i++) {
                const result = results[Math.floor(Math.random() * results.length)];
                tests.push({
                    id: `TEST_${Date.now()}_${i}`,
                    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    device: devices[Math.floor(Math.random() * devices.length)],
                    operator: operators[Math.floor(Math.random() * operators.length)],
                    result: result,
                    score: result === 'PASS' ? Math.round(Math.random() * 20 + 80) : 
                           result === 'FAIL' ? Math.round(Math.random() * 40 + 20) : null,
                    duration: result !== 'IN_PROGRESS' ? Math.round(Math.random() * 300 + 60) : null
                });
            }
            
            return tests.sort((a, b) => b.date - a.date);
        };

        const generateTrendData = () => {
            const trends = [];
            const days = 30;
            
            for (let i = days; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const totalTests = Math.floor(Math.random() * 20 + 5);
                const passedTests = Math.floor(totalTests * (0.8 + Math.random() * 0.15));
                
                trends.push({
                    date: date.toISOString().split('T')[0],
                    totalTests,
                    passedTests,
                    failedTests: totalTests - passedTests,
                    successRate: Math.round((passedTests / totalTests) * 100 * 10) / 10
                });
            }
            
            return trends;
        };

        const generateOperatorStats = () => {
            const operators = ['Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski', 'Maria Kowalczyk'];
            
            return operators.map(operator => {
                const totalTests = Math.floor(Math.random() * 100 + 50);
                const passedTests = Math.floor(totalTests * (0.85 + Math.random() * 0.1));
                
                return {
                    name: operator,
                    totalTests,
                    passedTests,
                    failedTests: totalTests - passedTests,
                    successRate: Math.round((passedTests / totalTests) * 100 * 10) / 10
                };
            });
        };

        const exportReport = async (format) => {
            console.log(`🔶 Vue ReportsViewer: Exporting report as ${format.id}`);
            
            if (!hasPermission('OPERATOR')) {
                console.warn('Access denied for export functionality');
                return;
            }

            if (!reportState.hasResults) {
                const message = props.language === 'pl' ? 
                    'Brak danych do eksportu. Wygeneruj raport najpierw.' :
                    'No data to export. Generate a report first.';
                alert(message);
                return;
            }
            
            try {
                const exportData = {
                    report: reportState.currentReport,
                    data: filteredReportData.value,
                    exportTime: new Date().toISOString(),
                    format: format.id,
                    user: props.user.username
                };
                
                await performExport(exportData, format);
                
                // Security logging
                if (securityService) {
                    securityService.logSecurityEvent('report_exported', {
                        format: format.id,
                        reportId: reportState.currentReport?.id,
                        dataSize: JSON.stringify(exportData).length,
                        user: props.user.username
                    });
                }
                
                emit('report-exported', { format: format.id, success: true });
                console.log(`✅ Vue ReportsViewer: Report exported as ${format.id}`);
                
            } catch (error) {
                console.error(`❌ Vue ReportsViewer: Export failed for ${format.id}:`, error);
                
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
            }
        };

        const performExport = async (exportData, format) => {
            let content, mimeType, fileName;
            
            switch (format.id) {
                case 'json':
                    content = JSON.stringify(exportData, null, 2);
                    mimeType = format.mimeType;
                    fileName = `report-${Date.now()}.json`;
                    break;
                case 'csv':
                    content = generateCSV(exportData.data);
                    mimeType = format.mimeType;
                    fileName = `report-${Date.now()}.csv`;
                    break;
                case 'xml':
                    content = generateXML(exportData.data);
                    mimeType = format.mimeType;
                    fileName = `report-${Date.now()}.xml`;
                    break;
                case 'pdf':
                default:
                    content = generateTextReport(exportData.data);
                    mimeType = 'text/plain';
                    fileName = `report-${Date.now()}.txt`;
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

        const generateCSV = (data) => {
            const headers = ['Device Type', 'Total Tests', 'Passed', 'Failed', 'Success Rate'];
            const rows = data.deviceBreakdown.map(d => [
                d.type,
                d.count,
                d.passed,
                d.failed,
                Math.round((d.passed / d.count) * 100) + '%'
            ]);
            
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        };

        const generateXML = (data) => {
            return `<?xml version="1.0" encoding="UTF-8"?>
<report>
    <summary>
        <totalTests>${data.summary.totalTests}</totalTests>
        <passedTests>${data.summary.passedTests}</passedTests>
        <failedTests>${data.summary.failedTests}</failedTests>
        <successRate>${data.summary.successRate}</successRate>
    </summary>
    <deviceBreakdown>
        ${data.deviceBreakdown.map(d => 
            `<device type="${d.type}" total="${d.count}" passed="${d.passed}" failed="${d.failed}"/>`
        ).join('\n        ')}
    </deviceBreakdown>
</report>`;
        };

        const generateTextReport = (data) => {
            return `MASKTRONIC C20 - Report Export
Generated: ${new Date().toLocaleString()}
User: ${props.user.username}

SUMMARY
=======
Total Tests: ${data.summary.totalTests}
Passed: ${data.summary.passedTests}
Failed: ${data.summary.failedTests}  
Success Rate: ${data.summary.successRate}%

DEVICE BREAKDOWN
================
${data.deviceBreakdown.map(d => 
    `${d.type}: ${d.count} total (${d.passed} passed, ${d.failed} failed)`
).join('\n')}`;
        };

        const clearResults = () => {
            reportState.hasResults = false;
            reportState.currentReport = null;
            reportState.error = null;
            
            // Clear report data
            Object.assign(reportData, {
                summary: { totalTests: 0, passedTests: 0, failedTests: 0, successRate: 0 },
                deviceBreakdown: [],
                recentTests: [],
                trends: [],
                operators: []
            });
        };

        const resetFilters = () => {
            filters.dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            filters.dateTo = new Date().toISOString().split('T')[0];
            filters.deviceType = 'all';
            filters.testStatus = 'all';
            filters.operator = 'all';
        };

        const goBack = () => {
            console.log('🔶 Vue ReportsViewer: Returning to previous screen');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        // Lifecycle
        onMounted(async () => {
            console.log('🔶 Vue ReportsViewer: Component mounted');
            
            try {
                // Load operators from store if available
                if (store && store.getters['system/operators']) {
                    const operators = store.getters['system/operators'];
                    // Use for operator filter options
                }
                
                if (securityService) {
                    securityService.logSecurityEvent('reports_viewer_loaded', {
                        user: props.user.username,
                        filters: filters
                    });
                }
                
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        });

        return {
            // Reactive state
            reportState,
            filters,
            reportData,
            
            // Computed properties
            pageTitle,
            deviceOptions,
            testStatusOptions,
            exportFormats,
            filteredReportData,
            isValidDateRange,
            canGenerateReport,
            
            // Methods
            generateReport,
            exportReport,
            clearResults,
            resetFilters,
            goBack,
            hasPermission
        };
    }
};

export default ReportsViewer;
