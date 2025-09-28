// STANDARD COMPONENT INDEX.JS - v2.0
// Components Template v2.0 COMPLIANT

const componentModule = {
  metadata: {
    name: 'pressurePanel',
    version: '0.1.0',
    type: 'component',
    contractVersion: '2.0' // Component contract version
  },
  
  component: null,
  config: null,
  schema: null,
  runtimeData: null, 
  crudRules: null,
  translations: null,
  
  async init(context = {}) {
    try {
      // Standard initialization sequence
      await this.loadComponent();
      await this.loadConfig();
      await this.loadSchema();
      await this.loadRuntimeData();
      await this.loadCrudRules();
      await this.runSmokeTests();
      
      return { 
        success: true, 
        message: `${this.metadata.name} initialized`,
        contractVersion: this.metadata.contractVersion
      };
    } catch (error) {
      console.error(`[${this.metadata.name}] Init failed:`, error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  },
  
  async loadComponent() {
    const module = await import(`./pressurePanel-simple.js`);
    this.component = module.default || module.pressurePanel;
    if (!this.component) {
      throw new Error('Component not found in module');
    }
  },
