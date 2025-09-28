/**
 * MASKTRONIC C20 - Vue.js Device Select Component
 * Migrated from DeviceSelectTemplate.js
 * Interactive device selection for testing
 */

const { reactive, computed, onMounted, onUnmounted } = Vue || window.Vue || {};

const DeviceSelectTemplate = {
    name: 'DeviceSelectTemplate',
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
    
    emits: ['navigate', 'device-selected'],
    
    setup(props, { emit }) {
        // Reactive state
        const deviceState = reactive({
            selectedDevice: null,
            searchQuery: '',
            showDetails: false,
            isLoading: false
        });

        // Available devices configuration
        const availableDevices = computed(() => [
            {
                id: 'PP_MASK',
                name: props.language === 'pl' ? 'Maska PP' : 'PP Mask',
                description: props.language === 'pl' ? 'Maska z filtrem cząsteczkowym' : 'Particle Protection Mask',
                icon: '😷',
                category: 'respiratory',
                color: 'blue',
                specifications: {
                    filterType: 'P3',
                    protection: props.language === 'pl' ? 'Cząsteczki, aerozole' : 'Particles, aerosols',
                    standards: ['EN 149:2001+A1:2009', 'CE'],
                    weight: '85g'
                }
            },
            {
                id: 'NP_MASK',
                name: props.language === 'pl' ? 'Maska NP' : 'NP Mask',
                description: props.language === 'pl' ? 'Maska z filtrem przeciwgazowym' : 'Gas Protection Mask',
                icon: '🎭',
                category: 'respiratory',
                color: 'green',
                specifications: {
                    filterType: 'A2P3',
                    protection: props.language === 'pl' ? 'Gazy, pary, cząsteczki' : 'Gases, vapors, particles',
                    standards: ['EN 14387:2004', 'CE'],
                    weight: '320g'
                }
            },
            {
                id: 'SCBA',
                name: props.language === 'pl' ? 'Aparat oddechowy SCBA' : 'SCBA',
                description: props.language === 'pl' ? 'Samodzielny aparat oddechowy' : 'Self-Contained Breathing Apparatus',
                icon: '🛡️',
                category: 'respiratory',
                color: 'purple',
                specifications: {
                    filterType: 'Independent',
                    protection: props.language === 'pl' ? 'Pełna ochrona dróg oddechowych' : 'Complete respiratory protection',
                    standards: ['EN 137:2006', 'CE'],
                    weight: '15.2kg'
                }
            },
            {
                id: 'CPS',
                name: props.language === 'pl' ? 'Kombinezon CPS' : 'CPS Protection Suit',
                description: props.language === 'pl' ? 'Kombinezon ochrony chemicznej' : 'Chemical Protection Suit',
                icon: '🧪',
                category: 'chemical',
                color: 'orange',
                specifications: {
                    filterType: 'None',
                    protection: props.language === 'pl' ? 'Ochrona przed substancjami chemicznymi' : 'Chemical substance protection',
                    standards: ['EN 14605:2005', 'EN 464:1994'],
                    weight: '1.8kg'
                }
            }
        ]);

        // Computed properties
        const pageTitle = computed(() => {
            const titleMap = {
                pl: 'Wybór Urządzenia',
                en: 'Device Selection',
                de: 'Geräteauswahl'
            };
            return titleMap[props.language] || 'Wybór Urządzenia';
        });

        const filteredDevices = computed(() => {
            if (!deviceState.searchQuery) return availableDevices.value;
            
            const query = deviceState.searchQuery.toLowerCase();
            return availableDevices.value.filter(device => 
                device.name.toLowerCase().includes(query) ||
                device.description.toLowerCase().includes(query) ||
                device.category.toLowerCase().includes(query)
            );
        });

        const deviceCategories = computed(() => {
            const categories = [...new Set(availableDevices.value.map(d => d.category))];
            return categories.map(cat => ({
                id: cat,
                name: cat === 'respiratory' ? 
                    (props.language === 'pl' ? 'Ochrona dróg oddechowych' : 'Respiratory Protection') :
                    (props.language === 'pl' ? 'Ochrona chemiczna' : 'Chemical Protection'),
                count: availableDevices.value.filter(d => d.category === cat).length
            }));
        });

        // Methods
        const selectDevice = async (device) => {
            console.log(`🔶 Vue: Device selected: ${device.id}`);
            deviceState.selectedDevice = device;
            deviceState.isLoading = true;
            
            try {
                // Integrate with existing device system if available
                if (window.DeviceManager && window.DeviceManager.selectDevice) {
                    await window.DeviceManager.selectDevice(device.id);
                } else if (window.selectDevice) {
                    // Fallback to existing vanilla function
                    await window.selectDevice(device.id);
                } else {
                    // Vue-only simulation
                    await simulateDeviceSelection(device);
                }
                
                // Emit event for parent component
                emit('device-selected', device);
                
                // Navigate to next step after short delay
                setTimeout(() => {
                    emit('navigate', 'test-menu', props.language, device.id);
                }, 1000);
                
                console.log(`✅ Vue: Device ${device.id} selected successfully`);
                
            } catch (error) {
                console.error(`❌ Vue: Device selection failed for ${device.id}:`, error);
                alert(`Błąd wyboru urządzenia: ${error.message}`);
            } finally {
                deviceState.isLoading = false;
            }
        };

        const simulateDeviceSelection = async (device) => {
            // Simulate device initialization delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Here would normally be device-specific initialization
            console.log(`🔶 Vue: Device ${device.id} initialized with specifications:`, device.specifications);
        };

        const toggleDeviceDetails = (device) => {
            if (deviceState.selectedDevice?.id === device.id && deviceState.showDetails) {
                deviceState.showDetails = false;
                deviceState.selectedDevice = null;
            } else {
                deviceState.selectedDevice = device;
                deviceState.showDetails = true;
            }
        };

        const clearSearch = () => {
            deviceState.searchQuery = '';
        };

        const backToMenu = () => {
            console.log('🔶 Vue: Returning to test menu');
            
            // Integrate with existing navigation if available
            if (window.backToMenu) {
                window.backToMenu();
            } else {
                emit('navigate', 'test-menu', props.language, 'default');
            }
        };

        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: DeviceSelectTemplate component mounted');
            console.log(`🔶 Vue: ${availableDevices.value.length} devices available for selection`);
        });

        return {
            deviceState,
            availableDevices,
            pageTitle,
            filteredDevices,
            deviceCategories,
            selectDevice,
            toggleDeviceDetails,
            clearSearch,
            backToMenu
        };
    },

    template: `
        <div class="device-select-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="backToMenu">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="vue-badge">Vue</div>
                </div>

                <!-- Search and Filters -->
                <div class="search-section">
                    <div class="search-input-group">
                        <input 
                            v-model="deviceState.searchQuery"
                            type="text"
                            class="search-input"
                            :placeholder="language === 'pl' ? 'Szukaj urządzeń...' : 'Search devices...'"
                        />
                        <button 
                            v-if="deviceState.searchQuery" 
                            class="clear-search-btn"
                            @click="clearSearch"
                        >
                            ❌
                        </button>
                    </div>
                    
                    <div class="category-filters">
                        <div 
                            v-for="category in deviceCategories" 
                            :key="category.id"
                            class="category-chip"
                        >
                            <span class="category-name">{{ category.name }}</span>
                            <span class="category-count">{{ category.count }}</span>
                        </div>
                    </div>
                </div>

                <!-- Device Grid -->
                <div class="device-selection-section">
                    <div class="device-grid">
                        <div 
                            v-for="device in filteredDevices" 
                            :key="device.id"
                            class="device-card"
                            :class="[
                                'device-' + device.color,
                                { 
                                    selected: deviceState.selectedDevice?.id === device.id,
                                    loading: deviceState.isLoading && deviceState.selectedDevice?.id === device.id
                                }
                            ]"
                        >
                            <div class="device-main" @click="selectDevice(device)">
                                <div class="device-icon">{{ device.icon }}</div>
                                <div class="device-info">
                                    <h3 class="device-name">{{ device.name }}</h3>
                                    <p class="device-description">{{ device.description }}</p>
                                    <span class="device-category">{{ device.category }}</span>
                                </div>
                                <div class="device-actions">
                                    <button 
                                        class="details-btn"
                                        @click.stop="toggleDeviceDetails(device)"
                                    >
                                        ℹ️
                                    </button>
                                </div>
                            </div>
                            
                            <div 
                                v-if="deviceState.selectedDevice?.id === device.id && deviceState.isLoading"
                                class="device-loading"
                            >
                                <div class="loading-spinner"></div>
                                <p>{{ language === 'pl' ? 'Przygotowywanie urządzenia...' : 'Preparing device...' }}</p>
                            </div>
                            
                            <!-- Device Details -->
                            <div 
                                v-if="deviceState.selectedDevice?.id === device.id && deviceState.showDetails"
                                class="device-details"
                            >
                                <h4>{{ language === 'pl' ? 'Specyfikacja:' : 'Specifications:' }}</h4>
                                <div class="spec-grid">
                                    <div class="spec-item">
                                        <span class="spec-label">{{ language === 'pl' ? 'Typ filtra:' : 'Filter Type:' }}</span>
                                        <span class="spec-value">{{ device.specifications.filterType }}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">{{ language === 'pl' ? 'Ochrona:' : 'Protection:' }}</span>
                                        <span class="spec-value">{{ device.specifications.protection }}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">{{ language === 'pl' ? 'Waga:' : 'Weight:' }}</span>
                                        <span class="spec-value">{{ device.specifications.weight }}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">{{ language === 'pl' ? 'Standardy:' : 'Standards:' }}</span>
                                        <span class="spec-value">{{ device.specifications.standards.join(', ') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Results Summary -->
                    <div class="results-summary">
                        <p>
                            {{ language === 'pl' ? 'Znaleziono' : 'Found' }} 
                            <strong>{{ filteredDevices.length }}</strong> 
                            {{ language === 'pl' ? 'urządzeń' : 'devices' }}
                            <span v-if="deviceState.searchQuery">
                                {{ language === 'pl' ? ' dla zapytania' : ' for query' }} 
                                "<strong>{{ deviceState.searchQuery }}</strong>"
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Inject styles function
function injectStyles() {
    if (document.getElementById('deviceSelect-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'deviceSelect-styles';
    styleElement.textContent = `
        .device-select-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .back-btn {
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .back-btn:hover {
            background: #5a6268;
        }
        
        .template-title {
            margin: 0;
            color: #333;
            font-size: 1.8em;
        }
        
        .vue-badge {
            background: #42b883;
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .search-section {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        
        .search-input-group {
            position: relative;
            margin-bottom: 16px;
        }
        
        .search-input {
            width: 100%;
            padding: 12px 40px 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #42b883;
        }
        
        .clear-search-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }
        
        .category-filters {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .category-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .category-count {
            background: #42b883;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .device-selection-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .device-card {
            border: 2px solid transparent;
            border-radius: 12px;
            background: #f8f9fa;
            overflow: hidden;
            transition: all 0.3s;
            position: relative;
        }
        
        .device-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .device-card.device-blue:hover { border-color: #007bff; }
        .device-card.device-green:hover { border-color: #28a745; }
        .device-card.device-purple:hover { border-color: #6f42c1; }
        .device-card.device-orange:hover { border-color: #fd7e14; }
        
        .device-card.selected {
            border-color: #42b883;
            background: #f0fff4;
        }
        
        .device-card.loading {
            opacity: 0.8;
        }
        
        .device-main {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            cursor: pointer;
        }
        
        .device-icon {
            font-size: 2.5em;
            width: 70px;
            text-align: center;
        }
        
        .device-info {
            flex: 1;
        }
        
        .device-name {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 1.2em;
        }
        
        .device-description {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        .device-category {
            display: inline-block;
            padding: 4px 8px;
            background: #e9ecef;
            color: #6c757d;
            border-radius: 12px;
            font-size: 0.8em;
            text-transform: capitalize;
        }
        
        .device-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .details-btn {
            padding: 8px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .details-btn:hover {
            background: #e9ecef;
        }
        
        .device-loading {
            padding: 20px;
            text-align: center;
            background: #e8f5e8;
            border-top: 1px solid #c3e6c3;
        }
        
        .loading-spinner {
            width: 30px;
            height: 30px;
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
        
        .device-details {
            padding: 20px;
            background: #f0f8ff;
            border-top: 1px solid #d6ebf5;
        }
        
        .device-details h4 {
            margin: 0 0 16px 0;
            color: #333;
        }
        
        .spec-grid {
            display: grid;
            gap: 12px;
        }
        
        .spec-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: white;
            border-radius: 6px;
        }
        
        .spec-label {
            font-weight: 600;
            color: #666;
        }
        
        .spec-value {
            color: #333;
            text-align: right;
            flex: 1;
            margin-left: 16px;
        }
        
        .results-summary {
            text-align: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #666;
        }
        
        .results-summary strong {
            color: #42b883;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Auto-inject styles when component loads
if (typeof window !== 'undefined') {
    injectStyles();
}

// Export component
export default DeviceSelectTemplate;
