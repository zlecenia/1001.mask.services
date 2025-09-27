module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Wyłącz wszystkie problematyczne reguły dla tej aplikacji deweloperskiej
    'no-console': 'off',
    
    // Pozwól na nieużywane zmienne - często używane w Vue
    'no-unused-vars': 'off',
    
    // Pozwól na escape characters w regex
    'no-useless-escape': 'off',
    
    // Pozwól na undefined variables - Vue i globalne zmienne
    'no-undef': 'off'
  },
  globals: {
    // Globalne zmienne dla aplikacji
    'defineConfig': 'readonly',
    'process': 'readonly',
    'global': 'writable',
    'globalThis': 'readonly',
    
    // Test globals
    'describe': 'readonly',
    'it': 'readonly',
    'test': 'readonly',
    'expect': 'readonly',
    'beforeEach': 'readonly',
    'afterEach': 'readonly',
    'beforeAll': 'readonly',
    'afterAll': 'readonly',
    'vi': 'readonly',
    'vitest': 'readonly',
    
    // Browser globals
    'window': 'readonly',
    'document': 'readonly',
    'navigator': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    'fetch': 'readonly',
    'URL': 'readonly',
    'URLSearchParams': 'readonly',
    'FormData': 'readonly',
    'WebSocket': 'readonly',
    'EventSource': 'readonly',
    'MutationObserver': 'readonly',
    'ResizeObserver': 'readonly',
    'IntersectionObserver': 'readonly',
    
    // Vue globals
    'Vue': 'readonly',
    'VueRouter': 'readonly',
    'Vuex': 'readonly'
  },
  overrides: [
    {
      // Specjalne reguły dla plików testowych
      files: ['**/*.test.js', '**/*.spec.js', '**/test/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      // Specjalne reguły dla plików konfiguracyjnych
      files: ['*.config.js', 'vite.config.js', '.eslintrc.js'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      // Specjalne reguły dla serwisów (mogą używać console do debugowania)
      files: ['**/services/*.js'],
      rules: {
        'no-console': 'warn'
      }
    }
  ]
};
