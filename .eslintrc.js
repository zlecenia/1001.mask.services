module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
  },
  globals: {
    Vue: 'readonly',
    process: 'readonly',
  },
};
