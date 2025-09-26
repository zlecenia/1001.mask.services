/**
 * Global i18n Initialization for Industrial Display Application
 * 
 * Initializes multi-language support (PL/EN/DE) across all 6 modular components
 * Optimized for 7.9" industrial displays with touch interface
 */

import I18nService from './services/i18nService.js';

/**
 * Initialize i18n service and make it globally available
 */
async function initializeI18n() {
  try {
    console.log('🌐 Starting i18n initialization...');
    
    // Initialize the i18n service
    await I18nService.initialize();
    
    // Make i18n service globally available
    window.i18n = I18nService;
    window.$t = (key, params, options) => I18nService.t(key, params, options);
    window.$changeLanguage = (code) => I18nService.changeLanguage(code);
    window.$getCurrentLanguage = () => I18nService.getCurrentLanguage();
    window.$getSupportedLanguages = () => I18nService.getSupportedLanguages();
    
    // Create reactive Vue plugin for i18n
    if (window.Vue && window.Vue.createApp) {
      window.Vue.createI18nPlugin = function() {
        return {
          install(app) {
            // Global properties for Vue 3
            app.config.globalProperties.$t = window.$t;
            app.config.globalProperties.$changeLanguage = window.$changeLanguage;
            app.config.globalProperties.$getCurrentLanguage = window.$getCurrentLanguage;
            app.config.globalProperties.$i18n = I18nService;
            
            // Provide reactive language state
            app.provide('i18n', I18nService);
            
            // Global mixin for reactive language updates
            app.mixin({
              data() {
                return {
                  currentLanguage: I18nService.getCurrentLanguage().code
                };
              },
              
              mounted() {
                // Subscribe to language changes
                this.unsubscribeLanguageChange = I18nService.subscribe('languageChanged', (data) => {
                  this.currentLanguage = data.to;
                  this.$forceUpdate(); // Force re-render on language change
                });
              },
              
              beforeUnmount() {
                // Clean up subscription
                if (this.unsubscribeLanguageChange) {
                  this.unsubscribeLanguageChange();
                }
              }
            });
          }
        };
      };
    }
    
    // Set document language
    const currentLang = I18nService.getCurrentLanguage();
    document.documentElement.lang = currentLang.code;
    
    // Add language class to body for CSS targeting
    document.body.classList.add(`lang-${currentLang.code}`);
    
    // Subscribe to language changes for global updates
    I18nService.subscribe('languageChanged', (data) => {
      // Update document language
      document.documentElement.lang = data.to;
      
      // Update body class
      document.body.classList.remove(`lang-${data.from}`);
      document.body.classList.add(`lang-${data.to}`);
      
      // Update page title if available
      const titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.textContent = I18nService.t('global.title');
      }
      
      console.log(`🌐 Global language updated: ${data.from} → ${data.to}`);
    });
    
    // Log initialization success
    const stats = I18nService.getStats();
    console.log('✅ i18n initialization completed:', stats);
    
    // Emit custom event for components
    window.dispatchEvent(new CustomEvent('i18nReady', {
      detail: {
        service: I18nService,
        currentLanguage: currentLang,
        stats: stats
      }
    }));
    
    return I18nService;
    
  } catch (error) {
    console.error('❌ i18n initialization failed:', error);
    
    // Fallback: create minimal mock service
    window.$t = (key) => key; // Return key as fallback
    window.$changeLanguage = () => console.warn('i18n service not available');
    
    throw error;
  }
}

/**
 * Create language switcher component for header integration
 */
function createLanguageSwitcher() {
  return {
    name: 'LanguageSwitcher',
    template: `
      <div class="language-switcher">
        <button 
          v-for="lang in supportedLanguages" 
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          :class="['lang-btn', { active: lang.code === currentLanguage }]"
          :title="lang.nativeName"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span class="code">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
    `,
    data() {
      return {
        supportedLanguages: window.$getSupportedLanguages(),
        currentLanguage: window.$getCurrentLanguage().code
      };
    },
    methods: {
      changeLanguage(code) {
        if (code !== this.currentLanguage) {
          window.$changeLanguage(code);
        }
      }
    },
    mounted() {
      // Subscribe to language changes
      this.unsubscribeLanguageChange = I18nService.subscribe('languageChanged', (data) => {
        this.currentLanguage = data.to;
      });
    },
    beforeUnmount() {
      if (this.unsubscribeLanguageChange) {
        this.unsubscribeLanguageChange();
      }
    }
  };
}

/**
 * Initialize i18n when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
  initializeI18n();
}

// Export for module usage
export { initializeI18n, createLanguageSwitcher };
export default I18nService;
