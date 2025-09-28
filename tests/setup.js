/**
 * Vitest Test Setup for Node.js 18 compatibility
 * Fixes common issues with older Node versions
 */

import { vi } from 'vitest';

// Mock global objects that might not exist in test environment
global.fetch = global.fetch || vi.fn();
global.localStorage = global.localStorage || {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = global.sessionStorage || {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock DOM APIs that might be missing
global.IntersectionObserver = global.IntersectionObserver || vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

global.ResizeObserver = global.ResizeObserver || vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock console methods to reduce noise
const originalConsole = console;
global.console = {
  ...originalConsole,
  // Keep important logs but suppress noise
  log: vi.fn((...args) => {
    const message = args.join(' ');
    if (!message.includes('Vite') && !message.includes('hmr')) {
      originalConsole.log(...args);
    }
  }),
  warn: vi.fn((...args) => {
    const message = args.join(' ');
    if (!message.includes('deprecated') && !message.includes('EBADENGINE')) {
      originalConsole.warn(...args);
    }
  }),
  error: originalConsole.error,
  info: originalConsole.info,
  debug: vi.fn(), // Suppress debug messages
};

// Suppress specific error types that are not critical
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress known non-critical errors
  if (message.includes('webidl-conversions') ||
      message.includes('Cannot read properties of undefined') ||
      message.includes('lru-cache') ||
      message.includes('EBADENGINE')) {
    return; // Suppress these errors
  }
  
  originalError(...args);
};

// Setup fake timers for consistent testing
vi.useFakeTimers();

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  flushPromises: () => new Promise(resolve => setTimeout(resolve, 0)),
  mockFetch: (response) => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(typeof response === 'string' ? response : JSON.stringify(response))
    });
  }
};

console.log('✅ Test setup completed for Node.js 18 compatibility');
