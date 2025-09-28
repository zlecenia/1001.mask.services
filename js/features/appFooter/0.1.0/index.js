import appFooterComponent from './appFooter.js';
import { ConfigLoader } from '../../../shared/configLoader.js';


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
  config: null,
  
  async loadConfig() {
    const result = await ConfigLoader.loadConfig('./config/config.json', 'appFooter');
    this.config = result.config;
    return result;
  },
  
  async init(context = {}) {
    console.log('🚀 [appFooter] Initializing component...');
    console.log('📋 [appFooter] Context received:', context);
    
    try {
      // Load configuration
      await this.loadConfig();
      
      this.metadata.initialized = true;
      console.log('✅ [appFooter] Component initialized successfully');
      
      return { 
        success: true, 
        metadata: this.metadata,
        config: this.config 
      };
    } catch (error) {
      console.error('❌ [appFooter] Initialization failed:', error);
      return { 
        success: false, 
        error: error.message,
        metadata: this.metadata 
      };
    }
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
    console.log('🎨 [appFooter] Starting render process...');
    console.log('📦 [appFooter] Container:', container);
    console.log('🔧 [appFooter] Render context:', context);
    
    if (!container) {
      console.error('❌ [appFooter] No container provided for rendering');
      return;
    }
    
    const { systemInfo = {}, currentUser = {} } = context;
    console.log('👤 [appFooter] User info:', currentUser);
    console.log('⚙️ [appFooter] System info:', systemInfo);
    
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
