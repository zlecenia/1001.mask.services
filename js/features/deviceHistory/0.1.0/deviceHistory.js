/**
 * Device History Component 0.1.0
 * Advanced device history tracking with search, filters, and analytics
 * Migrated from c201001.mask.services to 1001.mask.services modular structure
 */

import { reactive, computed, onMounted, onUnmounted } from 'vue';

export default {
    name: 'DeviceHistory',
    
    props: {
        user: { 
            type: Object, 
            default: () => ({ 
                username: null, 
                role: null, 
                isAuthenticated: false 
            }) 
        },
        language: { 
            type: String, 
            default: 'pl' 
        }
    },
    
    emits: ['navigate', 'device-action'],
    
    setup(props, { emit }) {
        const historyState = reactive({
            searchQuery: '',
            filterType: 'all',
            sortBy: 'lastTest',
            sortDirection: 'desc',
            isLoading: false,
            currentPage: 1,
            itemsPerPage: 10
        });

        const devices = reactive([
            {
                id: 1,
                name: 'PP-MASK-001',
                type: 'PP_MASK',
                status: 'ACTIVE',
                lastTest: '2025-09-24T14:30:00Z',
                testResult: 'PASSED',
                testCount: 45,
                passRate: 95.6,
                operator: 'Jan Kowalski',
                nextTest: '2025-10-24',
                location: 'Station A-01'
            },
            {
                id: 2,
                name: 'NP-MASK-003',
                type: 'NP_MASK',
                status: 'MAINTENANCE',
                lastTest: '2025-09-22T09:15:00Z',
                testResult: 'FAILED',
                testCount: 32,
                passRate: 87.5,
                operator: 'Anna Nowak',
                nextTest: '2025-09-30',
                location: 'Station B-02'
            }
        ]);

        // Computed properties
        const filteredDevices = computed(() => {
            return devices.filter(device => {
                const matchesSearch = device.name.toLowerCase().includes(historyState.searchQuery.toLowerCase()) ||
                                    device.operator.toLowerCase().includes(historyState.searchQuery.toLowerCase());
                
                const matchesFilter = historyState.filterType === 'all' || 
                                    device.status === historyState.filterType;
                
                return matchesSearch && matchesFilter;
            }).sort((a, b) => {
                let result = 0;
                if (a[historyState.sortBy] < b[historyState.sortBy]) result = -1;
                if (a[historyState.sortBy] > b[historyState.sortBy]) result = 1;
                return historyState.sortDirection === 'asc' ? result : -result;
            });
        });

        const paginatedDevices = computed(() => {
            const start = (historyState.currentPage - 1) * historyState.itemsPerPage;
            const end = start + historyState.itemsPerPage;
            return filteredDevices.value.slice(start, end);
        });

        const totalPages = computed(() => {
            return Math.ceil(filteredDevices.value.length / historyState.itemsPerPage);
        });

        // Methods
        const sortBy = (column) => {
            if (historyState.sortBy === column) {
                historyState.sortDirection = historyState.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                historyState.sortBy = column;
                historyState.sortDirection = 'asc';
            }
        };

        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                historyState.currentPage = page;
            }
        };

        const refreshData = async () => {
            try {
                historyState.isLoading = true;
                // TODO: Implement actual data fetching
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error fetching device history:', error);
            } finally {
                historyState.isLoading = false;
            }
        };

        const exportToCSV = () => {
            // TODO: Implement CSV export
            console.log('Exporting to CSV:', filteredDevices.value);
        };

        // Lifecycle hooks
        onMounted(() => {
            refreshData();
        });

        return {
            historyState,
            devices: paginatedDevices,
            filteredDevices,
            totalPages,
            sortBy,
            changePage,
            refreshData,
            exportToCSV
        };
    },
    
    template: `
    <div class="device-history">
        <div class="history-header">
            <h2>Device History</h2>
            <div class="controls">
                <input 
                    type="text" 
                    v-model="historyState.searchQuery" 
                    placeholder="Search devices..."
                    class="search-input"
                >
                <select v-model="historyState.filterType" class="filter-select">
                    <option value="all">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <button @click="exportToCSV" class="export-btn">
                    Export CSV
                </button>
            </div>
        </div>

        <div class="history-table-container">
            <table class="history-table">
                <thead>
                    <tr>
                        <th @click="sortBy('name')">
                            Device Name
                            <span v-if="historyState.sortBy === 'name'">
                                {{ historyState.sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                        <th>Type</th>
                        <th>Status</th>
                        <th @click="sortBy('lastTest')">
                            Last Test
                            <span v-if="historyState.sortBy === 'lastTest'">
                                {{ historyState.sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                        <th>Result</th>
                        <th>Pass Rate</th>
                        <th>Operator</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="device in devices" :key="device.id" class="device-row">
                        <td>{{ device.name }}</td>
                        <td>{{ device.type }}</td>
                        <td>
                            <span :class="['status-badge', device.status.toLowerCase()]">
                                {{ device.status }}
                            </span>
                        </td>
                        <td>{{ new Date(device.lastTest).toLocaleString() }}</td>
                        <td>
                            <span :class="['result-badge', device.testResult.toLowerCase()]">
                                {{ device.testResult }}
                            </span>
                        </td>
                        <td>
                            <div class="progress-container">
                                <div 
                                    class="progress-bar" 
                                    :style="{ width: device.passRate + '%' }"
                                    :class="{ 'high': device.passRate > 90, 'medium': device.passRate > 70 && device.passRate <= 90, 'low': device.passRate <= 70 }"
                                ></div>
                                <span class="progress-text">{{ device.passRate }}%</span>
                            </div>
                        </td>
                        <td>{{ device.operator }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination" v-if="totalPages > 1">
            <button 
                @click="changePage(historyState.currentPage - 1)" 
                :disabled="historyState.currentPage === 1"
                class="page-btn"
            >
                Previous
            </button>
            
            <span class="page-info">
                Page {{ historyState.currentPage }} of {{ totalPages }}
            </span>
            
            <button 
                @click="changePage(historyState.currentPage + 1)" 
                :disabled="historyState.currentPage >= totalPages"
                class="page-btn"
            >
                Next
            </button>
        </div>
    </div>
    `
};

// For standalone usage
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.createApp(DeviceHistory).mount('#app');
}
