import appFooterComponent from './appFooter.js';
import config from './config/config.json';


export default {
  metadata: {
    name: 'appFooter',
    version: '0.1.0',
    type: 'component',
    displayName: 'App Footer',
    description: 'Footer component with system info, timestamps, and 7.9" display optimization',
    dependencies: ['vue', 'vuex', 'vue-i18n'],
    initialized: false
  },
  
  component: appFooterComponent,
  
  async init(context = {}) {
    this.metadata.initialized = true;
    return { success: true };
  },
  
  handle(request = {}) {
    const { action = 'render', systemInfo = {}, currentUser = {} } = request;
    
    return { 
      success: true, 
      data: { 
        action, 
        systemInfo: {
          version: systemInfo.version || 'v3.0',
          buildDate: systemInfo.buildDate || new Date().toISOString().split('T')[0],
          environment: systemInfo.environment || 'development'
        },
        currentUser: {
          name: currentUser.name || 'Guest',
          role: currentUser.role || 'OPERATOR'
        },
        timestamp: new Date().toISOString() 
      }
    };
  },
  
  // Method for rendering footer in different contexts
  render(container, context = {}) {
    if (!container) return;
    
    const { systemInfo = {}, currentUser = {} } = context;
    
    // Create Vue app instance for this component
    const { createApp } = Vue;
    const footerApp = createApp({
      components: {
        AppFooter: this.component
      },
      data() {
        return {
          systemInfo: {
            version: systemInfo.version || 'v3.0',
            buildDate: systemInfo.buildDate || new Date().toISOString().split('T')[0],
            environment: systemInfo.environment || 'development'
          },
          currentUser: {
            name: currentUser.name || 'Guest',
            role: currentUser.role || 'OPERATOR'
          }
        };
      },
      template: '<AppFooter :system-info="systemInfo" :current-user="currentUser" />',
      methods: {
        handleFooterAction(action) {
          if (context.onFooterAction) {
            context.onFooterAction(action);
          }
        }
      }
    });
    
    footerApp.mount(container);
  }
};
