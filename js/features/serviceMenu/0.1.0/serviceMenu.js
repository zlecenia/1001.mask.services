/**
 * Service Menu Module - Advanced service management component
 * Migrated from ServiceMenuTemplate.js to modular architecture
 * 
 * Features:
 * - System diagnostics with real-time monitoring
 * - Sensor calibration management
 * - Backup and restore operations
 * - Maintenance scheduling and tasks
 * - System logs viewer
 * - Advanced configuration access
 * - SecurityService integration for access control and audit logging
 * - Role-based service access control
 * - Multi-language support (PL/EN/DE)
 */

// Use global Vue from CDN (for component dev server)
const { reactive, computed, onMounted, inject } = Vue || window.Vue || {};

const ServiceMenu = {
    name: 'ServiceMenu',
    
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false }),
            validator: (user) => {
                return user && typeof user.username === 'string' && typeof user.role === 'string';
            }
        },
        language: {
            type: String,
            default: 'pl',
            validator: (lang) => ['pl', 'en', 'de'].includes(lang)
        },
        config: {
            type: Object,
            required: true
        }
    },
    
    emits: ['navigate', 'service-action', 'security-event'],
    
    setup(props, { emit }) {
        // Injected dependencies
        const store = inject('store');
        const securityService = inject('securityService');
        
        // Reactive state
        const serviceState = reactive({
            activeService: null,
            isExecuting: false,
            lastAction: null,
            systemStatus: 'operational',
            executionQueue: [],
            serviceAttempts: {},
            maxAttempts: 3,
            refreshTimer: null
        });

        const diagnosticsData = reactive({
            cpuUsage: 45,
            memoryUsage: 62,
            diskUsage: 38,
            networkStatus: 'connected',
            serviceHealth: 'healthy',
            lastCheck: null,
            isRefreshing: false
        });

        const calibrationData = reactive({
            sensors: [
                { 
                    name: 'Pressure Sensor', 
                    id: 'pressure_sensor',
                    status: 'calibrated', 
                    lastCalibration: '2024-09-20', 
                    nextDue: '2024-12-20',
                    type: 'pressure'
                },
                { 
                    name: 'Flow Sensor', 
                    id: 'flow_sensor',
                    status: 'needs_calibration', 
                    lastCalibration: '2024-08-15', 
                    nextDue: '2024-11-15',
                    type: 'flow'
                },
                { 
                    name: 'Temperature Sensor', 
                    id: 'temperature_sensor',
                    status: 'calibrated', 
                    lastCalibration: '2024-09-18', 
                    nextDue: '2024-12-18',
                    type: 'temperature'
                }
            ],
            autoCalibration: false,
            calibrationInProgress: false
        });

        const backupData = reactive({
            lastBackup: '2024-09-23T08:30:00Z',
            backupSize: '2.4 GB',
            autoBackup: true,
            backupLocation: '/backup/maskservice/',
            backupStatus: 'completed',
            compressionEnabled: true,
            retentionDays: 30
        });
        
        // Security and validation methods
        const validateServiceAccess = async (serviceId) => {
            try {
                if (!securityService) return true;
                
                const serviceConfig = props.config.services[serviceId];
                if (!serviceConfig) return false;
                
                // Check role-based access
                const hasRoleAccess = serviceConfig.requiredRole.includes(props.user.role);
                if (!hasRoleAccess) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_ACCESS_DENIED',
                        details: {
                            serviceId,
                            userRole: props.user.role,
                            requiredRoles: serviceConfig.requiredRole,
                            username: props.user.username
                        },
                        level: 'WARNING'
                    });
                    
                    emit('security-event', {
                        type: 'ACCESS_DENIED',
                        service: serviceId
                    });
                    
                    return false;
                }
                
                // Check permissions
                if (serviceConfig.permissions) {
                    for (const permission of serviceConfig.permissions) {
                        const hasPermission = await securityService.checkPermission(props.user.role, permission);
                        if (!hasPermission) {
                            await securityService.logAuditEvent({
                                type: 'SERVICE_PERMISSION_DENIED',
                                details: {
                                    serviceId,
                                    permission,
                                    userRole: props.user.role,
                                    username: props.user.username
                                },
                                level: 'WARNING'
                            });
                            return false;
                        }
                    }
                }
                
                return true;
            } catch (error) {
                console.error('ServiceMenu: Access validation failed:', error);
                return false;
            }
        };
        
        const rateLimitService = (serviceId) => {
            const now = Date.now();
            const attempts = serviceState.serviceAttempts[serviceId] || [];
            const recentAttempts = attempts.filter(time => now - time < 60000); // Last minute
            
            if (recentAttempts.length >= props.config.security.rateLimiting.maxRequestsPerMinute) {
                return false;
            }
            
            serviceState.serviceAttempts[serviceId] = [...recentAttempts, now];
            return true;
        };
        
        // Localization helpers
        const getLocalizedText = (key) => {
            try {
                const i18nKeys = props.config.localization?.i18nKeys;
                if (!i18nKeys || !key) return key;
                
                const keyParts = key.split('.');
                let value = i18nKeys;
                
                for (const part of keyParts) {
                    value = value[part];
                    if (!value) break;
                }
                
                if (typeof value === 'object') {
                    return value[props.language] || value.pl || key;
                }
                
                return value || key;
            } catch (error) {
                console.error('ServiceMenu: Localization error:', error);
                return key;
            }
        };
        
        // Computed properties
        const pageTitle = computed(() => {
            return getLocalizedText('pageTitle');
        });
        
        const serviceCards = computed(() => {
            const services = props.config.services;
            return Object.keys(services).map(serviceId => {
                const serviceConfig = services[serviceId];
                const needsCalibration = serviceId === 'calibration' 
                    ? calibrationData.sensors.filter(s => s.status === 'needs_calibration').length
                    : 0;
                
                return {
                    id: serviceId,
                    title: getLocalizedText(`services.${serviceConfig.titleKey}`),
                    description: getLocalizedText(`services.${serviceConfig.descriptionKey}`),
                    icon: getLocalizedText(`icons.${serviceConfig.iconKey}`),
                    color: serviceConfig.color,
                    status: getServiceStatus(serviceId),
                    badge: getServiceBadge(serviceId, needsCalibration),
                    executionTime: serviceConfig.executionTime,
                    requiredRole: serviceConfig.requiredRole,
                    accessible: serviceConfig.requiredRole.includes(props.user.role)
                };
            });
        });
        
        const getServiceStatus = (serviceId) => {
            switch (serviceId) {
                case 'diagnostics':
                    return diagnosticsData.serviceHealth;
                case 'calibration':
                    return calibrationData.sensors.some(s => s.status === 'needs_calibration') ? 'warning' : 'healthy';
                case 'backup':
                    return backupData.backupStatus;
                case 'maintenance':
                    return 'scheduled';
                case 'logs':
                    return 'available';
                case 'advanced':
                    return 'expert';
                default:
                    return 'available';
            }
        };
        
        const getServiceBadge = (serviceId, calibrationCount) => {
            switch (serviceId) {
                case 'diagnostics':
                    return `${diagnosticsData.cpuUsage}% CPU`;
                case 'calibration':
                    return calibrationCount > 0 
                        ? `${calibrationCount} ${getLocalizedText('badges.calibrationNeeded')}`
                        : '✅';
                case 'backup':
                    return backupData.backupSize;
                case 'maintenance':
                    return getLocalizedText('badges.scheduled');
                case 'logs':
                    return getLocalizedText('badges.available');
                case 'advanced':
                    return getLocalizedText('badges.expert');
                default:
                    return '';
            }
        };
        
        const systemStatusText = computed(() => {
            return getLocalizedText(`systemStatus.${serviceState.systemStatus}`);
        });
        
        const executingText = computed(() => {
            return getLocalizedText('executing');
        });
        
        const lastActionText = computed(() => {
            return getLocalizedText('lastAction');
        });
        
        // Service execution methods
        const executeService = async (serviceId) => {
            try {
                console.log(`ServiceMenu: Executing service: ${serviceId}`);
                
                // Validate access
                const hasAccess = await validateServiceAccess(serviceId);
                if (!hasAccess) {
                    console.warn(`ServiceMenu: Access denied for service: ${serviceId}`);
                    return;
                }
                
                // Rate limiting
                if (!rateLimitService(serviceId)) {
                    console.warn(`ServiceMenu: Rate limit exceeded for service: ${serviceId}`);
                    await securityService?.logAuditEvent({
                        type: 'SERVICE_RATE_LIMITED',
                        details: { serviceId, username: props.user.username },
                        level: 'WARNING'
                    });
                    return;
                }
                
                // Check if another service is executing
                if (serviceState.isExecuting && props.config.performance.maxConcurrentServices <= 1) {
                    console.warn('ServiceMenu: Another service is already executing');
                    return;
                }
                
                serviceState.activeService = serviceId;
                serviceState.isExecuting = true;
                
                // Log service execution start
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_EXECUTION_STARTED',
                        details: {
                            serviceId,
                            userRole: props.user.role,
                            username: props.user.username
                        },
                        level: props.config.services[serviceId].auditLevel
                    });
                }
                
                // Integration with existing service system
                if (window.ServiceManager && window.ServiceManager[serviceId]) {
                    await window.ServiceManager[serviceId]();
                } else {
                    await executeServiceAction(serviceId);
                }

                serviceState.lastAction = {
                    service: serviceId,
                    timestamp: new Date(),
                    result: 'success'
                };

                // Log successful execution
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_EXECUTION_COMPLETED',
                        details: {
                            serviceId,
                            result: 'success',
                            duration: Date.now() - (serviceState.lastAction.timestamp.getTime()),
                            username: props.user.username
                        },
                        level: 'INFO'
                    });
                }

                emit('service-action', { service: serviceId, status: 'completed' });
                console.log(`ServiceMenu: Service ${serviceId} completed successfully`);

            } catch (error) {
                console.error(`ServiceMenu: Service ${serviceId} failed:`, error);
                
                serviceState.lastAction = {
                    service: serviceId,
                    timestamp: new Date(),
                    result: 'error',
                    error: error.message
                };
                
                // Log error
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_EXECUTION_ERROR',
                        details: {
                            serviceId,
                            error: error.message,
                            username: props.user.username
                        },
                        level: 'ERROR'
                    });
                }
                
            } finally {
                serviceState.isExecuting = false;
                serviceState.activeService = null;
            }
        };

        const executeServiceAction = async (serviceId) => {
            const serviceConfig = props.config.services[serviceId];
            const executionTime = serviceConfig?.executionTime || 2000;
            
            // Simulate execution with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Service execution timeout')), 
                    props.config.performance.executionTimeout);
            });
            
            const executionPromise = new Promise(resolve => {
                setTimeout(resolve, executionTime);
            });
            
            await Promise.race([executionPromise, timeoutPromise]);

            // Update relevant data based on service
            switch (serviceId) {
                case 'diagnostics':
                    await updateDiagnosticsData();
                    break;
                    
                case 'calibration':
                    await performCalibration();
                    break;
                    
                case 'backup':
                    await createBackup();
                    break;
                    
                case 'maintenance':
                    await updateMaintenanceSchedule();
                    break;
                    
                case 'logs':
                    await refreshSystemLogs();
                    break;
                    
                case 'advanced':
                    await openAdvancedSettings();
                    break;
            }
        };
        
        const updateDiagnosticsData = async () => {
            diagnosticsData.isRefreshing = true;
            
            // Simulate system resource monitoring
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            diagnosticsData.cpuUsage = Math.max(20, Math.min(80, diagnosticsData.cpuUsage + (Math.random() - 0.5) * 10));
            diagnosticsData.memoryUsage = Math.max(30, Math.min(90, diagnosticsData.memoryUsage + (Math.random() - 0.5) * 8));
            diagnosticsData.diskUsage = Math.max(20, Math.min(70, diagnosticsData.diskUsage + (Math.random() - 0.5) * 5));
            diagnosticsData.lastCheck = new Date();
            
            // Update service health based on thresholds
            const cpuThreshold = props.config.systemHealth.thresholds.cpu;
            const memoryThreshold = props.config.systemHealth.thresholds.memory;
            
            if (diagnosticsData.cpuUsage > cpuThreshold.critical || 
                diagnosticsData.memoryUsage > memoryThreshold.critical) {
                diagnosticsData.serviceHealth = 'critical';
                serviceState.systemStatus = 'error';
            } else if (diagnosticsData.cpuUsage > cpuThreshold.warning || 
                       diagnosticsData.memoryUsage > memoryThreshold.warning) {
                diagnosticsData.serviceHealth = 'warning';
                serviceState.systemStatus = 'warning';
            } else {
                diagnosticsData.serviceHealth = 'healthy';
                serviceState.systemStatus = 'operational';
            }
            
            diagnosticsData.isRefreshing = false;
        };
        
        const performCalibration = async () => {
            calibrationData.calibrationInProgress = true;
            
            // Simulate calibration for sensors that need it
            const sensorsToCalibrate = calibrationData.sensors.filter(s => s.status === 'needs_calibration');
            
            for (const sensor of sensorsToCalibrate) {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate calibration time
                
                sensor.status = 'calibrated';
                sensor.lastCalibration = new Date().toISOString().split('T')[0];
                
                const nextDue = new Date();
                nextDue.setDate(nextDue.getDate() + (props.config.calibration.sensors.find(s => s.id === sensor.id)?.calibrationInterval || 90));
                sensor.nextDue = nextDue.toISOString().split('T')[0];
            }
            
            calibrationData.calibrationInProgress = false;
        };
        
        const createBackup = async () => {
            // Simulate backup creation
            backupData.backupStatus = 'in_progress';
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            backupData.lastBackup = new Date().toISOString();
            backupData.backupSize = `${(Math.random() * 2 + 2).toFixed(1)} GB`;
            backupData.backupStatus = 'completed';
        };
        
        const updateMaintenanceSchedule = async () => {
            // Simulate maintenance schedule update
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('ServiceMenu: Maintenance schedule updated');
        };
        
        const refreshSystemLogs = async () => {
            // Simulate log refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('ServiceMenu: System logs refreshed');
        };
        
        const openAdvancedSettings = async () => {
            // Simulate advanced settings access
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log('ServiceMenu: Advanced settings accessed');
        };

        // Export and utility methods
        const exportServiceReport = async () => {
            try {
                const reportData = {
                    timestamp: new Date().toISOString(),
                    user: {
                        username: props.user.username,
                        role: props.user.role
                    },
                    systemStatus: serviceState.systemStatus,
                    diagnostics: { ...diagnosticsData },
                    calibration: { ...calibrationData },
                    backup: { ...backupData },
                    lastAction: serviceState.lastAction ? { ...serviceState.lastAction } : null
                };

                const content = JSON.stringify(reportData, null, 2);
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `service-report-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Log export action
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_REPORT_EXPORTED',
                        details: {
                            filename: a.download,
                            username: props.user.username,
                            dataSize: content.length
                        },
                        level: 'INFO'
                    });
                }

                console.log('ServiceMenu: Service report exported successfully');
            } catch (error) {
                console.error('ServiceMenu: Export failed:', error);
            }
        };

        const goBack = () => {
            console.log('ServiceMenu: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };
        
        // Auto-refresh diagnostics
        const startAutoRefresh = () => {
            if (props.config.systemHealth.autoRefresh) {
                serviceState.refreshTimer = setInterval(() => {
                    if (!serviceState.isExecuting) {
                        updateDiagnosticsData();
                    }
                }, props.config.systemHealth.refreshInterval);
            }
        };
        
        const stopAutoRefresh = () => {
            if (serviceState.refreshTimer) {
                clearInterval(serviceState.refreshTimer);
                serviceState.refreshTimer = null;
            }
        };

        // Lifecycle hooks
        onMounted(async () => {
            try {
                console.log('ServiceMenu: Component mounted');
                
                // Log module access
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'SERVICE_MENU_ACCESSED',
                        details: {
                            userRole: props.user.role,
                            username: props.user.username,
                            availableServices: Object.keys(props.config.services),
                            language: props.language
                        },
                        level: 'INFO'
                    });
                }
                
                // Initial diagnostics check
                setTimeout(() => {
                    updateDiagnosticsData();
                }, 1000);
                
                // Start auto-refresh
                startAutoRefresh();
                
            } catch (error) {
                console.error('ServiceMenu: Initialization failed:', error);
            }
        });

        onUnmounted(() => {
            stopAutoRefresh();
            console.log('ServiceMenu: Component unmounted');
        });

        return {
            // State
            serviceState,
            diagnosticsData,
            calibrationData,
            backupData,
            
            // Computed
            pageTitle,
            serviceCards,
            systemStatusText,
            executingText,
            lastActionText,
            
            // Methods
            executeService,
            exportServiceReport,
            goBack,
            getLocalizedText
        };
    },

    template: `
        <div class="service-menu vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">
                        ← {{ getLocalizedText('backButton') }}
                    </button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <div class="system-status" :class="'status-' + serviceState.systemStatus">
                            <span class="status-dot"></span>
                            <span>{{ systemStatusText }}</span>
                        </div>
                        <button class="export-btn" @click="exportServiceReport">
                            📤 {{ getLocalizedText('exportReport') }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Service Grid -->
                <div class="service-grid">
                    <div 
                        v-for="service in serviceCards" 
                        :key="service.id"
                        class="service-card"
                        :class="[
                            'service-' + service.color,
                            'status-' + service.status,
                            { 
                                'active': serviceState.activeService === service.id,
                                'executing': serviceState.isExecuting && serviceState.activeService === service.id,
                                'inaccessible': !service.accessible
                            }
                        ]"
                        @click="executeService(service.id)"
                        :disabled="serviceState.isExecuting || !service.accessible"
                        :title="!service.accessible ? 'Niewystarczające uprawnienia' : ''"
                        tabindex="0"
                        role="button"
                        :aria-label="service.title + ': ' + service.description"
                    >
                        <div class="service-header">
                            <div class="service-icon">{{ service.icon }}</div>
                            <div class="service-badge" :class="'badge-' + service.status">
                                {{ service.badge }}
                            </div>
                        </div>
                        
                        <div class="service-content">
                            <h3 class="service-title">{{ service.title }}</h3>
                            <p class="service-description">{{ service.description }}</p>
                        </div>
                        
                        <div class="service-status">
                            <div v-if="serviceState.isExecuting && serviceState.activeService === service.id" class="executing-indicator">
                                <div class="spinner"></div>
                                <span>{{ executingText }}</span>
                            </div>
                            <div v-else class="status-indicator" :class="'indicator-' + service.status">
                                {{ service.status === 'healthy' ? '✅' : 
                                   service.status === 'warning' ? '⚠️' : 
                                   service.status === 'completed' ? '✅' : 
                                   service.status === 'scheduled' ? '📅' : 
                                   service.status === 'available' ? '📋' : 
                                   service.status === 'expert' ? '⚡' : '🔵' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Service Details -->
                <div v-if="serviceState.lastAction" class="service-details">
                    <h3>{{ lastActionText }}</h3>
                    <div class="action-summary">
                        <div class="action-info">
                            <strong>{{ serviceState.lastAction.service }}</strong>
                            <span class="action-time">{{ serviceState.lastAction.timestamp.toLocaleString() }}</span>
                        </div>
                        <div class="action-result" :class="'result-' + serviceState.lastAction.result">
                            {{ serviceState.lastAction.result === 'success' ? 
                               '✅ ' + getLocalizedText('success') : 
                               '❌ ' + getLocalizedText('error') }}
                        </div>
                    </div>
                    <div v-if="serviceState.lastAction.error" class="action-error">
                        {{ serviceState.lastAction.error }}
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stat-card">
                        <h4>{{ getLocalizedText('stats.diagnostics') }}</h4>
                        <div class="stat-grid">
                            <div class="stat-item">
                                <span class="stat-label">{{ getLocalizedText('stats.cpu') }}:</span>
                                <span class="stat-value">{{ diagnosticsData.cpuUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ getLocalizedText('stats.memory') }}:</span>
                                <span class="stat-value">{{ diagnosticsData.memoryUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ getLocalizedText('stats.disk') }}:</span>
                                <span class="stat-value">{{ diagnosticsData.diskUsage }}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">{{ getLocalizedText('stats.network') }}:</span>
                                <span class="stat-value">{{ diagnosticsData.networkStatus }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>{{ getLocalizedText('stats.calibration') }}</h4>
                        <div class="sensor-list">
                            <div 
                                v-for="sensor in calibrationData.sensors" 
                                :key="sensor.id"
                                class="sensor-item"
                                :class="'sensor-' + sensor.status.replace('_', '-')"
                            >
                                <span class="sensor-name">{{ sensor.name }}</span>
                                <span class="sensor-status">
                                    {{ sensor.status === 'calibrated' ? '✅' : '⚠️' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <h4>{{ getLocalizedText('stats.backup') }}</h4>
                        <div class="backup-info">
                            <div class="backup-item">
                                <span class="backup-label">{{ getLocalizedText('stats.last') }}:</span>
                                <span class="backup-value">{{ new Date(backupData.lastBackup).toLocaleDateString() }}</span>
                            </div>
                            <div class="backup-item">
                                <span class="backup-label">{{ getLocalizedText('stats.size') }}:</span>
                                <span class="backup-value">{{ backupData.backupSize }}</span>
                            </div>
                            <div class="backup-item">
                                <span class="backup-label">{{ getLocalizedText('stats.status') }}:</span>
                                <span class="backup-value">✅ {{ backupData.backupStatus }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

export default ServiceMenu;
