/**
 * Test setup for Vitest
 * Global configuration and utilities for testing
 */
import { vi } from 'vitest';

// Mock DOM APIs that might be missing in test environment
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock local storage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock session storage
global.sessionStorage = localStorageMock;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock Vue i18n functions
global.$t = vi.fn((key) => key);
global.$tc = vi.fn((key, count) => `${key}:${count}`);
global.$te = vi.fn(() => true);
global.$d = vi.fn((value) => value);
global.$n = vi.fn((value) => value);

// Global Vue properties mock
global.VueGlobalProperties = {
  $t: global.$t,
  $tc: global.$tc,
  $te: global.$te,
  $d: global.$d,
  $n: global.$n,
};

// Global test utilities
global.testUtils = {
  // Create mock module for testing
  createMockModule: (name, version = 'v1') => ({
    name,
    version,
    handle: vi.fn(() => ({ status: 200, message: 'Test success' })),
    init: vi.fn(),
    cleanup: vi.fn(),
    Component: {
      name: `${name}Component`,
      template: `<div class="${name}-component">Test Component</div>`,
      data: () => ({ testData: true })
    }
  }),
  
  // Create mock request object
  createMockRequest: (data = {}) => ({
    userId: 'test-user',
    timestamp: new Date().toISOString(),
    ...data
  }),
  
  // Wait for async operations
  sleep: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock FeatureRegistry for isolated tests
  createMockRegistry: () => {
    const mockRegistry = {
      features: new Map(),
      versions: new Map(),
      register: vi.fn(),
      load: vi.fn(),
      getVersions: vi.fn(() => []),
      listModules: vi.fn(() => []),
      clear: vi.fn()
    };
    return mockRegistry;
  }
};

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Cleanup after each test
afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
});

export { vi };
