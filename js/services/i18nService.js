/**
 * Internationalization (i18n) Service for Multi-language Support
 * 
 * Supports Polish (PL), English (EN), and German (DE) languages
 * Optimized for industrial 7.9" display applications
 * 
 * Features:
 * - Dynamic language switching
 * - Nested translation keys with fallbacks
 * - Pluralization support
 * - Number and date formatting
 * - Vue.js reactive integration
 * - Local storage persistence
 */

class I18nService {
  constructor() {
    this.currentLanguage = 'pl'; // Default to Polish
    this.fallbackLanguage = 'en';
    this.translations = {};
    this.subscribers = new Map();
    this.formatters = {};
    
    // Supported languages configuration
    this.supportedLanguages = {
      pl: {
        code: 'pl',
        name: 'Polski',
        nativeName: 'Polski',
        flag: '🇵🇱',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: { decimal: ',', thousand: ' ' }
      },
      en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        rtl: false,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: { decimal: '.', thousand: ',' }
      },
      de: {
        code: 'de',
        name: 'Deutsch',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: { decimal: ',', thousand: '.' }
      }
    };
    
    this.initializeFormatters();
  }

  /**
   * Initialize the i18n service
   */
  async initialize() {
    console.log('🌐 Initializing i18n service...');
    
    try {
      // Load saved language preference
      const savedLanguage = this.loadLanguagePreference();
      if (savedLanguage && this.supportedLanguages[savedLanguage]) {
        this.currentLanguage = savedLanguage;
      }
      
      // Load all translation files
      await this.loadAllTranslations();
      
      // Set up reactive integration
      this.setupReactiveIntegration();
      
      console.log(`✅ i18n service initialized with language: ${this.currentLanguage}`);
      return true;
      
    } catch (error) {
      console.error('❌ i18n service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load all translation files
   */
  async loadAllTranslations() {
    const loadPromises = Object.keys(this.supportedLanguages).map(async (lang) => {
      try {
        const response = await fetch(`/locales/${lang}.json`);
        if (response.ok) {
          this.translations[lang] = await response.json();
          console.log(`📄 Loaded ${lang} translations`);
        } else {
          console.warn(`⚠️ Failed to load ${lang} translations:`, response.status);
        }
      } catch (error) {
        console.error(`❌ Error loading ${lang} translations:`, error);
      }
    });
    
    await Promise.all(loadPromises);
    
    // Validate that we have at least one language loaded
    if (Object.keys(this.translations).length === 0) {
      throw new Error('No translation files could be loaded');
    }
  }

  /**
   * Get translated text for a key
   */
  t(key, params = {}, options = {}) {
    const { 
      language = this.currentLanguage, 
      fallback = true, 
      count = null 
    } = options;
    
    let translation = this.getNestedTranslation(key, language);
    
    // Fallback to default language if not found
    if (!translation && fallback && language !== this.fallbackLanguage) {
      translation = this.getNestedTranslation(key, this.fallbackLanguage);
    }
    
    // Fallback to key if still not found
    if (!translation) {
      console.warn(`⚠️ Translation not found for key: ${key}`);
      return key;
    }
    
    // Handle pluralization
    if (count !== null && typeof translation === 'object') {
      translation = this.pluralize(translation, count, language);
    }
    
    // Handle string interpolation
    if (typeof translation === 'string') {
      translation = this.interpolate(translation, params);
    }
    
    return translation;
  }

  /**
   * Get nested translation by key path
   */
  getNestedTranslation(key, language) {
    const translations = this.translations[language];
    if (!translations) return null;
    
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Handle pluralization
   */
  pluralize(translation, count, language) {
    // Polish pluralization rules
    if (language === 'pl') {
      if (count === 1) return translation.one || translation;
      if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
        return translation.few || translation.other || translation;
      }
      return translation.many || translation.other || translation;
    }
    
    // English/German pluralization rules
    if (count === 1) {
      return translation.one || translation;
    } else {
      return translation.other || translation.many || translation;
    }
  }

  /**
   * String interpolation
   */
  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Change current language
   */
  async changeLanguage(languageCode) {
    if (!this.supportedLanguages[languageCode]) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }
    
    if (languageCode === this.currentLanguage) {
      return; // No change needed
    }
    
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = languageCode;
    
    // Save preference
    this.saveLanguagePreference(languageCode);
    
    // Update document language
    document.documentElement.lang = languageCode;
    
    // Notify subscribers
    this.notifySubscribers('languageChanged', {
      from: previousLanguage,
      to: languageCode,
      config: this.supportedLanguages[languageCode]
    });
    
    console.log(`🌐 Language changed to: ${languageCode}`);
  }

  /**
   * Get current language configuration
   */
  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      ...this.supportedLanguages[this.currentLanguage]
    };
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Object.values(this.supportedLanguages);
  }

  /**
   * Format number according to current language
   */
  formatNumber(number, options = {}) {
    const config = this.supportedLanguages[this.currentLanguage];
    const { decimal, thousand } = config.numberFormat;
    
    const {
      decimals = 1,
      useThousandSeparator = true,
      prefix = '',
      suffix = ''
    } = options;
    
    let formatted = Number(number).toFixed(decimals);
    
    if (useThousandSeparator && thousand) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
      formatted = parts.join(decimal);
    } else {
      formatted = formatted.replace('.', decimal);
    }
    
    return prefix + formatted + suffix;
  }

  /**
   * Format date according to current language
   */
  formatDate(date, options = {}) {
    const config = this.supportedLanguages[this.currentLanguage];
    const { includeTime = false, format = null } = options;
    
    const d = new Date(date);
    const targetFormat = format || (includeTime ? 
      `${config.dateFormat} ${config.timeFormat}` : 
      config.dateFormat
    );
    
    // Simple date formatting (in production, consider using a library like date-fns)
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    
    return targetFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Format sensor values for industrial display
   */
  formatSensorValue(value, unit, options = {}) {
    const { precision = 1, showUnit = true } = options;
    
    const formattedValue = this.formatNumber(value, { decimals: precision });
    
    if (showUnit && unit) {
      return `${formattedValue} ${unit}`;
    }
    
    return formattedValue;
  }

  /**
   * Subscribe to language change events
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * Notify subscribers of events
   */
  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in i18n subscriber callback:`, error);
        }
      });
    }
  }

  /**
   * Setup reactive integration for Vue components
   */
  setupReactiveIntegration() {
    // Create global $t function for Vue components
    if (typeof window !== 'undefined') {
      window.i18n = this;
      
      // Global translation function
      window.$t = (key, params, options) => this.t(key, params, options);
      
      // Global language change function
      window.$changeLanguage = (code) => this.changeLanguage(code);
    }
  }

  /**
   * Initialize number and date formatters
   */
  initializeFormatters() {
    this.formatters = {
      pressure: (value, unit = 'bar') => this.formatSensorValue(value, unit, { precision: 1 }),
      temperature: (value, unit = '°C') => this.formatSensorValue(value, unit, { precision: 1 }),
      percentage: (value) => this.formatSensorValue(value, '%', { precision: 0 }),
      time: (date) => this.formatDate(date, { includeTime: true }),
      shortDate: (date) => this.formatDate(date),
      uptime: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
    };
  }

  /**
   * Get formatter function
   */
  getFormatter(type) {
    return this.formatters[type] || ((value) => String(value));
  }

  /**
   * Save language preference to localStorage
   */
  saveLanguagePreference(languageCode) {
    try {
      localStorage.setItem('maskservice-language', languageCode);
    } catch (error) {
      console.warn('⚠️ Could not save language preference:', error);
    }
  }

  /**
   * Load language preference from localStorage
   */
  loadLanguagePreference() {
    try {
      return localStorage.getItem('maskservice-language');
    } catch (error) {
      console.warn('⚠️ Could not load language preference:', error);
      return null;
    }
  }

  /**
   * Add or update translations dynamically
   */
  addTranslations(language, translations) {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    
    // Deep merge translations
    this.translations[language] = this.deepMerge(this.translations[language], translations);
    
    console.log(`📝 Added translations for ${language}`);
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Get translation statistics
   */
  getStats() {
    const stats = {};
    
    Object.keys(this.supportedLanguages).forEach(lang => {
      const translations = this.translations[lang];
      stats[lang] = {
        loaded: !!translations,
        keyCount: translations ? this.countKeys(translations) : 0,
        lastUpdated: translations?.meta?.lastUpdated || null
      };
    });
    
    return {
      currentLanguage: this.currentLanguage,
      supportedLanguages: Object.keys(this.supportedLanguages),
      languages: stats
    };
  }

  /**
   * Count translation keys recursively
   */
  countKeys(obj, count = 0) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        count = this.countKeys(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }
}

// Export singleton instance
export default new I18nService();
