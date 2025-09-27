/**
 * User Menu Module Entry Point
 * 
 * Dynamic role-based user menu component with security integration
 * Migrated from UserMenuScreen.js to modular FeatureRegistry architecture
 * 
 * @version 0.1.0
 * @author MASKTRONIC C20 Development Team
 * @created 2024-12-19
 */

import UserMenu from './userMenu.js';
import config from './config.json' assert { type: 'json' };

// Module metadata
const metadata = {
    name: 'userMenu',
    version: '0.1.0',
    title: 'User Menu',
    description: 'Dynamic role-based user menu component with security integration and multi-language support',
    category: 'navigation',
    tags: ['menu', 'navigation', 'roles', 'security', 'auth'],
    
    // Migration info
    migrationInfo: {
        originalFile: 'UserMenuScreen.js',
        migratedDate: '2024-12-19',
        migrationNotes: 'Converted from legacy Vue component to modular architecture with SecurityService integration'
    },
    
    // Dependencies
    dependencies: {
        vue: '^3.4.0',
        vuex: '^4.0.0',
        securityService: 'internal',
        store: 'internal'
    },
    
    // Supported user roles
    supportedRoles: ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'],
    
    // Feature flags
    features: {
        roleBasedMenus: true,
        securityIntegration: true,
        auditLogging: true,
        multiLanguageSupport: true,
        sessionMonitoring: true,
        menuValidation: true,
        legacyIntegration: true
    },
    
    // Module configuration
    config: {
        displayName: {
            pl: 'Menu Użytkownika',
            en: 'User Menu',
            de: 'Benutzermenü'
        },
        
        // LCD display optimization (7.9" landscape 1280x400)
        displayOptimization: {
            targetResolution: '1280x400',
            orientation: 'landscape',
            touchOptimized: true,
            gridLayout: true,
            maxItemsPerRow: 4
        },
        
        // Performance settings
        performance: {
            lazyLoad: true,
            cacheMenuConfig: true,
            enableVirtualScrolling: false, // Not needed for menu items
            debounceDelay: 300
        },
        
        // Security settings
        security: {
            requireAuthentication: true,
            enforceRoleBasedAccess: true,
            auditMenuActions: true,
            validateMenuIds: true,
            sessionTimeout: 1800000 // 30 minutes
        }
    }
};

// Enhanced template with role-based styling and security features
const template = `
    <div class="user-menu-module" :class="['theme-' + (theme || 'default'), 'role-' + (user.role || 'guest').toLowerCase()]">
        <UserMenu 
            :user="user"
            :language="language"
            :config="moduleConfig"
            @navigate="handleNavigate"
            @logout="handleLogout"
            @menu-item-selected="handleMenuItemSelected"
            @security-event="handleSecurityEvent"
        />
    </div>
`;

// CSS styles with role-based theming and LCD optimization
const styles = `
    .user-menu-module {
        width: 100%;
        height: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        
        /* LCD display optimization */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
    
    .user-menu-module .user-menu {
        min-height: 400px; /* Fit 7.9" LCD height */
        max-width: 1280px; /* Fit 7.9" LCD width */
        margin: 0 auto;
        padding: 12px;
    }
    
    .user-menu-module .menu-container {
        max-width: 100%;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .user-menu-module .menu-header {
        background: white;
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 60px;
    }
    
    .user-menu-module .welcome-text {
        font-size: 1.2em;
        margin: 0;
        color: #2c3e50;
        font-weight: 600;
    }
    
    .user-menu-module .user-badge {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .user-menu-module .role-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
    }
    
    /* Role-based colors */
    .user-menu-module .role-badge.role-operator { background: #3498db; }
    .user-menu-module .role-badge.role-admin { background: #27ae60; }
    .user-menu-module .role-badge.role-superuser { background: #9b59b6; }
    .user-menu-module .role-badge.role-serwisant { background: #e67e22; }
    .user-menu-module .role-badge.role-serviceuser { background: #e67e22; }
    
    .user-menu-module .vue-indicator {
        background: #42b883;
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-size: 0.75em;
        font-weight: 600;
    }
    
    .user-menu-module .header-actions {
        display: flex;
        gap: 8px;
    }
    
    .user-menu-module .refresh-btn,
    .user-menu-module .logout-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9em;
        transition: all 0.2s;
        min-width: 44px; /* Touch target size */
        min-height: 44px;
    }
    
    .user-menu-module .refresh-btn {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #495057;
    }
    
    .user-menu-module .refresh-btn:hover:not(:disabled) {
        background: #e9ecef;
        transform: translateY(-1px);
    }
    
    .user-menu-module .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .user-menu-module .logout-btn {
        background: #dc3545;
        color: white;
    }
    
    .user-menu-module .logout-btn:hover {
        background: #c82333;
        transform: translateY(-1px);
    }
    
    .user-menu-module .menu-loading {
        text-align: center;
        padding: 40px 20px;
        background: white;
    }
    
    .user-menu-module .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #42b883;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .user-menu-module .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
        padding: 16px;
        max-height: 280px; /* Fit remaining LCD height */
        overflow-y: auto;
    }
    
    .user-menu-module .menu-item {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 2px solid transparent;
        min-height: 60px; /* Touch-friendly */
        position: relative;
    }
    
    .user-menu-module .menu-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        border-color: #42b883;
    }
    
    .user-menu-module .menu-item:focus {
        outline: 2px solid #42b883;
        outline-offset: 2px;
    }
    
    .user-menu-module .menu-item.active {
        border-color: #42b883;
        background: #f8fffe;
    }
    
    .user-menu-module .menu-icon {
        font-size: 1.5em;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border-radius: 50%;
        flex-shrink: 0;
    }
    
    .user-menu-module .menu-content {
        flex: 1;
        min-width: 0; /* Allow text truncation */
    }
    
    .user-menu-module .menu-title {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 1em;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .user-menu-module .menu-description {
        margin: 0;
        color: #6c757d;
        font-size: 0.8em;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .user-menu-module .menu-arrow {
        font-size: 1.1em;
        color: #42b883;
        opacity: 0;
        transition: opacity 0.2s;
        flex-shrink: 0;
    }
    
    .user-menu-module .menu-item:hover .menu-arrow {
        opacity: 1;
    }
    
    .user-menu-module .menu-stats {
        text-align: center;
        padding: 12px;
        background: rgba(248, 249, 250, 0.8);
        color: #6c757d;
        font-size: 0.85em;
        border-top: 1px solid #e9ecef;
    }
    
    /* Role-based theme variations */
    .user-menu-module.role-operator .menu-header {
        border-left: 4px solid #3498db;
    }
    
    .user-menu-module.role-admin .menu-header {
        border-left: 4px solid #27ae60;
    }
    
    .user-menu-module.role-superuser .menu-header {
        border-left: 4px solid #9b59b6;
    }
    
    .user-menu-module.role-serwisant .menu-header {
        border-left: 4px solid #e67e22;
    }
    
    /* Responsive adjustments for smaller screens */
    @media (max-width: 768px) {
        .user-menu-module .menu-grid {
            grid-template-columns: 1fr;
            gap: 8px;
        }
        
        .user-menu-module .menu-item {
            padding: 12px;
        }
        
        .user-menu-module .welcome-text {
            font-size: 1.1em;
        }
    }
`;

// Module factory function
const createUserMenuModule = () => {
    return {
        // Module metadata
        ...metadata,
        
        // Main component
        component: UserMenu,
        
        // Module template
        template,
        
        // Module styles
        styles,
        
        // Module configuration
        moduleConfig: config,
        
        // Lifecycle hooks
        init: async function(params = {}) {
            try {
                console.log('UserMenu Module: Initializing...');
                
                // Validate required dependencies
                if (!params.user || !params.user.role) {
                    throw new Error('UserMenu Module: User with role is required for initialization');
                }
                
                // Setup security service integration
                if (params.securityService) {
                    await params.securityService.logAuditEvent({
                        type: 'MODULE_INITIALIZED',
                        details: {
                            module: 'userMenu',
                            userRole: params.user.role,
                            username: params.user.username,
                            timestamp: new Date().toISOString()
                        },
                        level: 'INFO'
                    });
                }
                
                console.log(`UserMenu Module: Initialized for role ${params.user.role}`);
                return { success: true, message: 'UserMenu module initialized successfully' };
                
            } catch (error) {
                console.error('UserMenu Module: Initialization failed:', error);
                return { success: false, error: error.message };
            }
        },
        
        handle: async function(action, params = {}) {
            try {
                console.log(`UserMenu Module: Handling action "${action}"`);
                
                switch (action) {
                    case 'refresh':
                        return { success: true, message: 'Menu refreshed' };
                        
                    case 'validateAccess':
                        const hasAccess = params.allowedRoles?.includes(params.userRole) || false;
                        return { success: true, hasAccess };
                        
                    case 'getMenuItems':
                        const roleConfig = config.roles[params.userRole] || config.roles.OPERATOR;
                        return { success: true, menuItems: roleConfig.menuItems };
                        
                    case 'logActivity':
                        if (params.securityService) {
                            await params.securityService.logAuditEvent({
                                type: 'USER_ACTIVITY',
                                details: params.activityDetails,
                                level: 'INFO'
                            });
                        }
                        return { success: true };
                        
                    default:
                        console.warn(`UserMenu Module: Unknown action "${action}"`);
                        return { success: false, error: `Unknown action: ${action}` };
                }
                
            } catch (error) {
                console.error(`UserMenu Module: Action "${action}" failed:`, error);
                return { success: false, error: error.message };
            }
        },
        
        destroy: async function(params = {}) {
            try {
                console.log('UserMenu Module: Destroying...');
                
                // Log destruction event
                if (params.securityService) {
                    await params.securityService.logAuditEvent({
                        type: 'MODULE_DESTROYED',
                        details: {
                            module: 'userMenu',
                            userRole: params.user?.role,
                            username: params.user?.username,
                            timestamp: new Date().toISOString()
                        },
                        level: 'INFO'
                    });
                }
                
                console.log('UserMenu Module: Destroyed successfully');
                return { success: true, message: 'UserMenu module destroyed successfully' };
                
            } catch (error) {
                console.error('UserMenu Module: Destruction failed:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Event handlers
        handleNavigate: function(route, language, params) {
            console.log(`UserMenu Module: Navigation requested to ${route}`);
            // Will be handled by parent application
        },
        
        handleLogout: function(reason = 'USER_INITIATED') {
            console.log(`UserMenu Module: Logout requested (${reason})`);
            // Will be handled by parent application
        },
        
        handleMenuItemSelected: function(menuItem) {
            console.log(`UserMenu Module: Menu item selected: ${menuItem.id}`);
            // Will be handled by parent application
        },
        
        handleSecurityEvent: function(event) {
            console.log(`UserMenu Module: Security event: ${event.type}`);
            // Will be handled by parent application
        }
    };
};

// Export module factory and metadata
export default createUserMenuModule;
export { metadata, config, UserMenu };
