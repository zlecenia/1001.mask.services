/**
 * Integration Test Setup
 * Shared setup for integration tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up integration test environment...');
  
  // Setup global test environment
  global.TEST_ENV = 'integration';
  
  // Mock console to reduce test noise (optional)
  if (process.env.VITEST_QUIET) {
    global.originalConsole = { ...console };
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Restore console
  if (global.originalConsole) {
    Object.assign(console, global.originalConsole);
  }
});

// Setup for each test
beforeEach(async () => {
  // Reset any global state before each test
  if (global.window) {
    // Clear any window properties that might affect tests
    delete global.window.Vue;
    delete global.window.Vuex;
  }
});

afterEach(async () => {
  // Clean up after each test
  // This helps prevent test interference
});

// Global test utilities
global.testUtils = {
  // Create mock context for component testing
  createMockContext: (overrides = {}) => ({
    store: {
      state: {
        auth: { user: { role: 'ADMIN' }, isAuthenticated: true },
        system: { language: 'pl', deviceStatus: 'ONLINE' },
        ...overrides.storeState
      },
      commit: (mutation, payload) => {
        console.log(`Mock store commit: ${mutation}`, payload);
      },
      dispatch: (action, payload) => {
        console.log(`Mock store dispatch: ${action}`, payload);
        return Promise.resolve({ success: true });
      },
      ...overrides.store
    },
    router: {
      push: (route) => console.log(`Mock router push: ${route}`),
      replace: (route) => console.log(`Mock router replace: ${route}`),
      beforeEach: (guard) => console.log('Mock router beforeEach registered'),
      ...overrides.router
    },
    ...overrides
  }),

  // Create mock component response
  createMockResponse: (success = true, data = {}, error = null) => ({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  }),

  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock fetch for testing
  mockFetch: (responseData, options = {}) => {
    const mockResponse = {
      ok: options.ok !== false,
      status: options.status || 200,
      statusText: options.statusText || 'OK',
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData))
    };
    
    return Promise.resolve(mockResponse);
  }
};

// Add performance monitoring for tests
global.performance = global.performance || {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {}
};

export {};
