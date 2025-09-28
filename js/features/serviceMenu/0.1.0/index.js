/**
 * Service Menu Module Entry Point
 * 
 * Advanced service management component with diagnostics, calibration, backup and maintenance
 * Migrated from ServiceMenuTemplate.js to modular FeatureRegistry architecture
 * 
 * @version 0.1.0
 * @author MASKTRONIC C20 Development Team
 * @created 2024-12-19
 */

import ServiceMenu from './serviceMenu.js';
import { ConfigLoader } from '../../../shared/configLoader.js';

// Module metadata
const metadata = {
    name: 'serviceMenu',
    version: '0.1.0',
    title: 'Service Menu',
    description: 'Advanced service management component with diagnostics, calibration, backup and maintenance capabilities',
    category: 'service',
    tags: ['service', 'diagnostics', 'calibration', 'backup', 'maintenance', 'security', 'monitoring'],
    
    // Migration info
    migrationInfo: {
        originalFile: 'ServiceMenuTemplate.js',
        migratedDate: '2024-12-19',
        migrationNotes: 'Converted from legacy Vue component to modular architecture with enhanced security, role-based access control and comprehensive audit logging'
    },
    
    // Dependencies
    dependencies: {
        vue: '^3.4.0',
        vuex: '^4.0.0',
        securityService: 'internal',
        store: 'internal'
    },
    
    // Supported user roles
    supportedRoles: ['ADMIN', 'SUPERUSER', 'SERWISANT'],
    
    // Feature flags
    features: {
        systemDiagnostics: true,
        sensorCalibration: true,
        dataBackup: true,
        maintenanceScheduling: true,
        systemLogs: true,
        advancedSettings: true,
        securityIntegration: true,
        auditLogging: true,
        multiLanguageSupport: true,
        roleBasedAccess: true,
        rateLimiting: true,
        realTimeMonitoring: true
    },
    
    // Module configuration
    config: {
        displayName: {
            pl: 'Menu Serwisowe',
            en: 'Service Menu',
            de: 'Service-Menü'
        },
        
        // LCD display optimization (7.9" landscape 1280x400)
        displayOptimization: {
            targetResolution: '1280x400',
            orientation: 'landscape',
            touchOptimized: true,
            serviceGridLayout: true,
            maxServicesPerRow: 3
        },
        
        // Performance settings
        performance: {
            lazyLoad: true,
            cacheServiceData: true,
            enableAutoRefresh: true,
            refreshInterval: 5000,
            executionTimeout: 30000,
            debounceDelay: 500
        },
        
        // Security settings
        security: {
            requireAuthentication: true,
            enforceRoleBasedAccess: true,
            auditServiceExecution: true,
            validateServicePermissions: true,
            rateLimitingEnabled: true,
            maxRequestsPerMinute: 10,
            sessionValidation: true
        }
    }
};

// Enhanced template with service management and security features
const template = `
    <div class="service-menu-module" :class="['theme-' + (theme || 'default'), 'role-' + (user.role || 'guest').toLowerCase()]">
        <ServiceMenu 
            :user="user"
            :language="language"
            :config="moduleConfig"
            @navigate="handleNavigate"
            @service-action="handleServiceAction"
            @security-event="handleSecurityEvent"
        />
    </div>
`;

// CSS styles with service-specific theming and LCD optimization
const styles = `
    .service-menu-module {
        width: 100%;
        height: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        
        /* LCD display optimization */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
    
    .service-menu-module .service-menu {
        min-height: 400px; /* Fit 7.9" LCD height */
        max-width: 1280px; /* Fit 7.9" LCD width */
        margin: 0 auto;
        padding: 12px;
    }
    
    .service-menu-module .template-container {
        max-width: 100%;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .service-menu-module .template-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
        min-height: 60px;
    }
    
    .service-menu-module .back-btn {
        padding: 6px 12px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9em;
        transition: all 0.2s;
        min-width: 44px; /* Touch target size */
        min-height: 44px;
    }
    
    .service-menu-module .back-btn:hover {
        background: #5a6268;
        transform: translateY(-1px);
    }
    
    .service-menu-module .template-title {
        margin: 0;
        color: #2c3e50;
        font-size: 1.4em;
        font-weight: 600;
    }
    
    .service-menu-module .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    
    .service-menu-module .system-status {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 0.8em;
        text-transform: uppercase;
    }
    
    .service-menu-module .system-status.status-operational {
        background: #d4edda;
        color: #155724;
    }
    
    .service-menu-module .system-status.status-warning {
        background: #fff3cd;
        color: #856404;
    }
    
    .service-menu-module .system-status.status-error {
        background: #f8d7da;
        color: #721c24;
    }
    
    .service-menu-module .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 2s infinite;
    }
    
    .service-menu-module .export-btn {
        padding: 6px 12px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9em;
        transition: all 0.2s;
        min-width: 44px; /* Touch target size */
        min-height: 44px;
    }
    
    .service-menu-module .export-btn:hover {
        background: #218838;
        transform: translateY(-1px);
    }
    
    .service-menu-module .vue-badge {
        background: #42b883;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75em;
        font-weight: 600;
    }
    
    .service-menu-module .service-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        padding: 16px;
        max-height: 240px; /* Fit remaining LCD height */
        overflow-y: auto;
    }
    
    .service-menu-module .service-card {
        background: white;
        padding: 16px;
        border-radius: 12px;
        border: 3px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
        min-height: 120px;
    }
    
    .service-menu-module .service-card:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    
    .service-menu-module .service-card:focus {
        outline: 2px solid #42b883;
        outline-offset: 2px;
    }
    
    .service-menu-module .service-card:disabled,
    .service-menu-module .service-card.inaccessible {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .service-menu-module .service-card.executing {
        border-color: #007bff;
        animation: executeGlow 1.5s infinite;
    }
    
    .service-menu-module .service-card.service-blue { border-left: 4px solid #007bff; }
    .service-menu-module .service-card.service-orange { border-left: 4px solid #fd7e14; }
    .service-menu-module .service-card.service-green { border-left: 4px solid #28a745; }
    .service-menu-module .service-card.service-purple { border-left: 4px solid #6f42c1; }
    .service-menu-module .service-card.service-teal { border-left: 4px solid #20c997; }
    .service-menu-module .service-card.service-red { border-left: 4px solid #dc3545; }
    
    .service-menu-module .service-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    }
    
    .service-menu-module .service-icon {
        font-size: 2em;
        line-height: 1;
    }
    
    .service-menu-module .service-badge {
        padding: 3px 6px;
        border-radius: 10px;
        font-size: 0.7em;
        font-weight: 600;
        white-space: nowrap;
    }
    
    .service-menu-module .badge-healthy { background: #d4edda; color: #155724; }
    .service-menu-module .badge-warning { background: #fff3cd; color: #856404; }
    .service-menu-module .badge-completed { background: #d4edda; color: #155724; }
    .service-menu-module .badge-scheduled { background: #e2e3e5; color: #383d41; }
    .service-menu-module .badge-available { background: #d1ecf1; color: #0c5460; }
    .service-menu-module .badge-expert { background: #f8d7da; color: #721c24; }
    
    .service-menu-module .service-content {
        margin-bottom: 12px;
    }
    
    .service-menu-module .service-title {
        margin: 0 0 6px 0;
        color: #2c3e50;
        font-size: 1.1em;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .service-menu-module .service-description {
        margin: 0;
        color: #6c757d;
        font-size: 0.8em;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .service-menu-module .service-status {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 24px;
    }
    
    .service-menu-module .executing-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #007bff;
        font-weight: 600;
        font-size: 0.8em;
    }
    
    .service-menu-module .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid #e9ecef;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .service-menu-module .status-indicator {
        font-size: 1.2em;
    }
    
    .service-menu-module .service-details {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin: 16px;
    }
    
    .service-menu-module .service-details h3 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 1.1em;
    }
    
    .service-menu-module .action-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .service-menu-module .action-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    
    .service-menu-module .action-time {
        font-size: 0.8em;
        color: #6c757d;
    }
    
    .service-menu-module .action-result {
        font-weight: 600;
        font-size: 0.9em;
    }
    
    .service-menu-module .result-success { color: #28a745; }
    .service-menu-module .result-error { color: #dc3545; }
    
    .service-menu-module .action-error {
        margin-top: 6px;
        padding: 6px;
        background: #f8d7da;
        color: #721c24;
        border-radius: 4px;
        font-size: 0.8em;
    }
    
    .service-menu-module .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        padding: 16px;
    }
    
    .service-menu-module .stat-card {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .service-menu-module .stat-card h4 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 1em;
        font-weight: 600;
    }
    
    .service-menu-module .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    
    .service-menu-module .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8em;
    }
    
    .service-menu-module .stat-label {
        color: #6c757d;
    }
    
    .service-menu-module .stat-value {
        font-weight: 600;
        color: #2c3e50;
    }
    
    .service-menu-module .sensor-list,
    .service-menu-module .backup-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .service-menu-module .sensor-item,
    .service-menu-module .backup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px;
        border-radius: 4px;
        font-size: 0.8em;
    }
    
    .service-menu-module .sensor-item.sensor-calibrated {
        background: #d4edda;
    }
    
    .service-menu-module .sensor-item.sensor-needs-calibration {
        background: #fff3cd;
    }
    
    .service-menu-module .sensor-name,
    .service-menu-module .backup-label {
        color: #6c757d;
    }
    
    .service-menu-module .backup-value {
        font-weight: 600;
        color: #2c3e50;
    }
    
    /* Role-based theme variations */
    .service-menu-module.role-admin .template-header {
        border-left: 4px solid #27ae60;
    }
    
    .service-menu-module.role-superuser .template-header {
        border-left: 4px solid #9b59b6;
    }
    
    .service-menu-module.role-serwisant .template-header {
        border-left: 4px solid #e67e22;
    }
    
    /* Animations */
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes executeGlow {
        0%, 100% { box-shadow: 0 0 16px rgba(0, 123, 255, 0.3); }
        50% { box-shadow: 0 0 24px rgba(0, 123, 255, 0.6); }
    }
    
    /* Responsive adjustments for smaller screens */
    @media (max-width: 768px) {
        .service-menu-module .service-grid {
            grid-template-columns: 1fr;
            gap: 12px;
        }
        
        .service-menu-module .service-card {
            padding: 12px;
        }
        
        .service-menu-module .template-title {
            font-size: 1.2em;
        }
    }
`;

// Module factory function
const createServiceMenuModule = () => {
    return {
        // Module metadata
        ...metadata,
        
        // Main component
        component: ServiceMenu,
        
        // Module template
        template,
        
        // Module styles
        styles,
        
        // Module configuration
        moduleConfig: null,
        
        async loadConfig() {
            const result = await ConfigLoader.loadConfig('./config/config.json', 'serviceMenu');
            this.moduleConfig = result.config;
            return result;
        },
        
        // Lifecycle hooks
        init: async function(params = {}) {
            try {
                console.log('ServiceMenu Module: Initializing...');
                
                // Load configuration first
                await this.loadConfig();
                
                // Validate required dependencies
                if (!params.user || !params.user.role) {
                    throw new Error('ServiceMenu Module: User with role is required for initialization');
                }
                
                // Check role permissions
                const allowedRoles = ['ADMIN', 'SUPERUSER', 'SERWISANT'];
                if (!allowedRoles.includes(params.user.role)) {
                    throw new Error(`ServiceMenu Module: User role ${params.user.role} not authorized for service menu access`);
                }
                
                // Setup security service integration
                if (params.securityService) {
                    await params.securityService.logAuditEvent({
                        type: 'SERVICE_MODULE_INITIALIZED',
                        details: {
                            module: 'serviceMenu',
                            userRole: params.user.role,
                            username: params.user.username,
                            timestamp: new Date().toISOString()
                        },
                        level: 'INFO'
                    });
                }
                
                console.log(`ServiceMenu Module: Initialized for role ${params.user.role}`);
                return { success: true, message: 'ServiceMenu module initialized successfully' };
                
            } catch (error) {
                console.error('ServiceMenu Module: Initialization failed:', error);
                return { success: false, error: error.message };
            }
        },
        
        handle: async function(action, params = {}) {
            try {
                console.log(`ServiceMenu Module: Handling action "${action}"`);
                
                switch (action) {
                    case 'executeService':
                        if (!params.serviceId) {
                            return { success: false, error: 'Service ID is required' };
                        }
                        return { success: true, message: `Service ${params.serviceId} execution initiated` };
                        
                    case 'validateAccess':
                        const allowedRoles = params.allowedRoles || ['ADMIN', 'SUPERUSER', 'SERWISANT'];
                        const hasAccess = allowedRoles.includes(params.userRole);
                        return { success: true, hasAccess };
                        
                    case 'getSystemHealth':
                        // Return mock system health data
                        return { 
                            success: true, 
                            data: {
                                cpu: Math.floor(Math.random() * 40 + 30),
                                memory: Math.floor(Math.random() * 30 + 50),
                                disk: Math.floor(Math.random() * 20 + 30),
                                network: 'connected'
                            }
                        };
                        
                    case 'getSensorStatus':
                        // Return mock sensor calibration status
                        return {
                            success: true,
                            sensors: this.moduleConfig?.calibration?.sensors?.map(sensor => ({
                                ...sensor,
                                status: Math.random() > 0.7 ? 'needs_calibration' : 'calibrated'
                            }))
                        };
                        
                    case 'getBackupInfo':
                        // Return mock backup information
                        return {
                            success: true,
                            backup: {
                                lastBackup: new Date().toISOString(),
                                size: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
                                status: 'completed'
                            }
                        };
                        
                    case 'logActivity':
                        if (params.securityService && params.activityDetails) {
                            await params.securityService.logAuditEvent({
                                type: 'SERVICE_ACTIVITY',
                                details: params.activityDetails,
                                level: 'INFO'
                            });
                        }
                        return { success: true };
                        
                    default:
                        console.warn(`ServiceMenu Module: Unknown action "${action}"`);
                        return { success: false, error: `Unknown action: ${action}` };
                }
                
            } catch (error) {
                console.error(`ServiceMenu Module: Action "${action}" failed:`, error);
                return { success: false, error: error.message };
            }
        },
        
        destroy: async function(params = {}) {
            try {
                console.log('ServiceMenu Module: Destroying...');
                
                // Log destruction event
                if (params.securityService) {
                    await params.securityService.logAuditEvent({
                        type: 'SERVICE_MODULE_DESTROYED',
                        details: {
                            module: 'serviceMenu',
                            userRole: params.user?.role,
                            username: params.user?.username,
                            timestamp: new Date().toISOString()
                        },
                        level: 'INFO'
                    });
                }
                
                console.log('ServiceMenu Module: Destroyed successfully');
                return { success: true, message: 'ServiceMenu module destroyed successfully' };
                
            } catch (error) {
                console.error('ServiceMenu Module: Destruction failed:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Event handlers
        handleNavigate: function(route, language, params) {
            console.log(`ServiceMenu Module: Navigation requested to ${route}`);
            // Will be handled by parent application
        },
        
        handleServiceAction: function(serviceData) {
            console.log(`ServiceMenu Module: Service action: ${serviceData.service} - ${serviceData.status}`);
            // Will be handled by parent application
        },
        
        handleSecurityEvent: function(event) {
            console.log(`ServiceMenu Module: Security event: ${event.type}`);
            // Will be handled by parent application
        }
    };
};

// Export module factory and metadata
export default createServiceMenuModule;
export { metadata, ServiceMenu };
