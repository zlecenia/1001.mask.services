/**
 * Device History Component - Entry Point
 * Version: 0.1.0
 */

import DeviceHistory from './deviceHistory.js';
import packageInfo from './package.json' assert { type: 'json' };

const version = packageInfo.version;

// Component metadata
const metadata = {
    name: 'DeviceHistory',
    version: version,
    description: 'Advanced device history tracking with search, filters, and analytics',
    author: 'MASKSERVICE',
    tags: ['devices', 'history', 'analytics', 'tracking'],
    dependencies: {
        'vue': '^3.2.0'
    }
};

// Initialize the component
const init = async (options = {}) => {
    console.log(`Initializing DeviceHistory v${version}`, options);
    return {
        component: DeviceHistory,
        version,
        metadata
    };
};

// Export for both ES modules and CommonJS
export default {
    component: DeviceHistory,
    version,
    metadata,
    init
};

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        component: DeviceHistory,
        version,
        metadata,
        init
    };
}
