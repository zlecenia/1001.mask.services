/**
 * MainMenu Component JavaScript Module
 * Main navigation menu for the industrial control system
 * 
 * @version 0.1.0
 * @author MASKSERVICE System
 */

import MainMenu from './MainMenu.vue';

// Export the Vue component
export default MainMenu;

// Export additional utilities if needed
export { MainMenu };

// Component metadata for registry
export const metadata = {
  name: 'mainMenu',
  version: '0.1.0',
  description: 'Role-based main navigation menu',
  author: 'MASKSERVICE System',
  category: 'layout',
  tags: ['menu', 'navigation', 'layout', 'role-based'],
  
  capabilities: {
    standalone: true,
    configurable: true,
    testable: true,
    mockable: true
  },
  
  dependencies: {
    vue: '^3.0.0',
    vuex: '^4.0.0'
  }
};
