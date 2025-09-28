/**
 * SystemIntegration Module - FeatureRegistry v0.1.0
 * External system integrations management (SAP ERP, databases, QMS)
 * Migrated from c201001.mask.services/js/components/SystemIntegrationTemplate.js
 * Contract Version: 2.0
 */

class SystemIntegrationModule {
    constructor() {
        this.metadata = {
            name: 'systemIntegration',
            version: '0.1.0',
            description: 'External system integrations management component for industrial applications',
            author: 'MASKTRONIC C20 Team',
            contractVersion: '2.0',
            tags: ['integration', 'external-systems', 'api', 'database', 'erp', 'qms'],
            category: 'system',
            requiredPermissions: ['ADMIN', 'SUPERUSER'],
            dependencies: {
                vue: '^3.0.0'
            },
            exports: {
                component: 'SystemIntegrationComponent',
                config: 'systemIntegrationConfig',
                actions: ['GET_INTEGRATIONS', 'ADD_INTEGRATION', 'TEST_CONNECTION', 'SYNC_DATA', 'DELETE_INTEGRATION']
            },
            migrationInfo: {
                sourceFile: 'c201001.mask.services/js/components/SystemIntegrationTemplate.js',
                migratedAt: new Date().toISOString(),
                changes: [
                    'Converted to FeatureRegistry modular architecture',
                    'Added config management with schema validation',
                    'Implemented CRUD operations for integrations',
                    'Added standalone demo capability',
                    'Enhanced error handling and logging'
                ]
            }
        };
        
        this.component = null;
        this.config = null;
        this.isInitialized = false;
    }

    async init(options = {}) {
        try {
            console.log(`🔧 Initializing ${this.metadata.name} module v${this.metadata.version}`);
            
            // Load configuration
            await this.loadConfig();
            
            // Load component
            await this.loadComponent();
            
            this.isInitialized = true;
            console.log(`✅ ${this.metadata.name} module initialized successfully`);
            
            return {
                success: true,
                message: `${this.metadata.name} module ready`,
                metadata: this.metadata
            };
        } catch (error) {
            console.error(`❌ Failed to initialize ${this.metadata.name} module:`, error);
            throw error;
        }
    }

    async loadComponent() {
        try {
            // Load the main component file
            if (typeof window !== 'undefined') {
                // Browser environment - load via script or import
                const response = await fetch('./systemIntegration.js');
                const componentCode = await response.text();
                eval(componentCode);
                this.component = window.SystemIntegrationComponent;
            } else {
                // Node environment - require the component
                const componentPath = require.resolve('./systemIntegration.js');
                delete require.cache[componentPath];
                this.component = require('./systemIntegration.js');
            }
            
            if (!this.component) {
                throw new Error('Component failed to load');
            }
            
            console.log(`📦 ${this.metadata.name} component loaded`);
        } catch (error) {
            console.error(`❌ Failed to load ${this.metadata.name} component:`, error);
            throw error;
        }
    }

    async loadConfig() {
        try {
            const configFiles = ['schema.json', 'data.json', 'crud.json'];
            this.config = {};
            
            for (const file of configFiles) {
                const configName = file.replace('.json', '');
                try {
                    if (typeof window !== 'undefined') {
                        // Browser environment
                        const response = await fetch(`./config/${file}`);
                        this.config[configName] = await response.json();
                    } else {
                        // Node environment
                        this.config[configName] = require(`./config/${file}`);
                    }
                } catch (err) {
                    console.warn(`⚠️ Could not load ${file}, using defaults`);
                    this.config[configName] = this.getDefaultConfig(configName);
                }
            }
            
            // Store config in localStorage for persistence
            if (typeof window !== 'undefined' && window.localStorage) {
                const storageKey = `systemIntegration_config_v${this.metadata.version}`;
                const existingConfig = localStorage.getItem(storageKey);
                
                if (existingConfig) {
                    try {
                        const parsedConfig = JSON.parse(existingConfig);
                        this.config.data = { ...this.config.data, ...parsedConfig };
                    } catch (err) {
                        console.warn('⚠️ Could not parse stored config, using defaults');
                    }
                }
            }
            
            console.log(`⚙️ ${this.metadata.name} configuration loaded`);
        } catch (error) {
            console.error(`❌ Failed to load ${this.metadata.name} config:`, error);
            this.config = {
                schema: this.getDefaultConfig('schema'),
                data: this.getDefaultConfig('data'),
                crud: this.getDefaultConfig('crud')
            };
        }
    }

    getDefaultConfig(type) {
        const defaults = {
            schema: {
                type: 'object',
                properties: {
                    integrations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                name: { type: 'string', minLength: 1 },
                                type: { type: 'string', enum: ['api', 'database', 'erp', 'qms', 'webhook'] },
                                url: { type: 'string', format: 'uri' },
                                status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
                                lastSync: { type: ['string', 'null'], format: 'date-time' },
                                apiKey: { type: 'string' }
                            },
                            required: ['id', 'name', 'type', 'url']
                        }
                    },
                    isLoading: { type: 'boolean' },
                    showAddForm: { type: 'boolean' }
                }
            },
            data: {
                integrations: [
                    {
                        id: 1,
                        name: 'SAP ERP Integration',
                        type: 'erp',
                        url: 'https://sap.company.com/api',
                        status: 'connected',
                        lastSync: '2025-09-24T10:30:00Z',
                        apiKey: '****-****-****-1234'
                    }
                ],
                isLoading: false,
                showAddForm: false
            },
            crud: {
                integrations: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    fields: {
                        id: { editable: false, required: true },
                        name: { editable: true, required: true, minLength: 1 },
                        type: { editable: true, required: true },
                        url: { editable: true, required: true },
                        status: { editable: false },
                        lastSync: { editable: false },
                        apiKey: { editable: true, sensitive: true }
                    }
                }
            }
        };
        return defaults[type] || {};
    }

    async handle(action, params = {}) {
        if (!this.isInitialized) {
            throw new Error(`${this.metadata.name} module not initialized`);
        }

        console.log(`🔄 ${this.metadata.name} handling action: ${action}`, params);

        try {
            switch (action) {
                case 'GET_INTEGRATIONS':
                    return {
                        success: true,
                        data: this.config.data.integrations || [],
                        message: 'Integrations retrieved successfully'
                    };

                case 'ADD_INTEGRATION':
                    if (!params.integration) {
                        throw new Error('Integration data required');
                    }
                    
                    const newIntegration = {
                        id: Date.now(),
                        ...params.integration,
                        status: 'disconnected',
                        lastSync: null
                    };
                    
                    this.config.data.integrations.push(newIntegration);
                    await this.saveConfig();
                    
                    return {
                        success: true,
                        data: newIntegration,
                        message: 'Integration added successfully'
                    };

                case 'TEST_CONNECTION':
                    const integrationId = params.integrationId;
                    const integration = this.config.data.integrations.find(i => i.id === integrationId);
                    
                    if (!integration) {
                        throw new Error('Integration not found');
                    }
                    
                    // Simulate connection test
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    integration.status = Math.random() > 0.3 ? 'connected' : 'error';
                    integration.lastSync = new Date().toISOString();
                    
                    await this.saveConfig();
                    
                    return {
                        success: true,
                        data: integration,
                        message: `Connection test ${integration.status === 'connected' ? 'passed' : 'failed'}`
                    };

                case 'SYNC_DATA':
                    const connectedIntegrations = this.config.data.integrations.filter(i => i.status === 'connected');
                    
                    for (const integration of connectedIntegrations) {
                        integration.lastSync = new Date().toISOString();
                    }
                    
                    await this.saveConfig();
                    
                    return {
                        success: true,
                        data: { synced: connectedIntegrations.length },
                        message: `Synchronized ${connectedIntegrations.length} integrations`
                    };

                case 'DELETE_INTEGRATION':
                    const deleteId = params.integrationId;
                    const index = this.config.data.integrations.findIndex(i => i.id === deleteId);
                    
                    if (index === -1) {
                        throw new Error('Integration not found');
                    }
                    
                    const deleted = this.config.data.integrations.splice(index, 1)[0];
                    await this.saveConfig();
                    
                    return {
                        success: true,
                        data: deleted,
                        message: 'Integration deleted successfully'
                    };

                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`❌ Error handling ${action}:`, error);
            return {
                success: false,
                error: error.message,
                message: `Failed to handle ${action}`
            };
        }
    }

    async saveConfig() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storageKey = `systemIntegration_config_v${this.metadata.version}`;
            try {
                localStorage.setItem(storageKey, JSON.stringify(this.config.data));
                console.log(`💾 ${this.metadata.name} configuration saved`);
            } catch (error) {
                console.warn(`⚠️ Could not save ${this.metadata.name} configuration:`, error);
            }
        }
    }

    getMetadata() {
        return { ...this.metadata };
    }

    isReady() {
        return this.isInitialized && this.component !== null;
    }
}

// Export the module instance
const systemIntegrationModule = new SystemIntegrationModule();

// Global registration for browser environment
if (typeof window !== 'undefined') {
    window.SystemIntegrationModule = systemIntegrationModule;
}

// CommonJS export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = systemIntegrationModule;
}

console.log('📋 SystemIntegration FeatureRegistry module v0.1.0 loaded');
