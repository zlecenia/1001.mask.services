/**
 * JSON Editor Component Tests (Vitest format)
 * Tests for visual JSON configuration editor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import JsonEditorModule from './index.js';

describe('JSON Editor Component', () => {
  let componentModule;

  beforeEach(async () => {
    componentModule = JsonEditorModule;
  });

  describe('Component Structure', () => {
    it('should have correct exports', () => {
      expect(componentModule).toBeDefined();
      expect(componentModule.component).toBeDefined();
      expect(componentModule.metadata).toBeDefined();
      expect(componentModule.init).toBeDefined();
      expect(componentModule.handle).toBeDefined();
    });

    it('should have correct metadata', () => {
      const metadata = componentModule.metadata;
      expect(metadata.name).toBe('jsonEditor');
      expect(metadata.version).toBe('0.1.0');
      expect(metadata.description).toBeDefined();
      expect(metadata.capabilities).toBeDefined();
    });
  });

  describe('Component Methods', () => {
    it('should initialize correctly', async () => {
      const context = { store: null };
      const result = await componentModule.init(context);
      
      expect(result).toBeDefined();
      expect(result.component).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle loadConfig action', async () => {
      const result = await componentModule.handle('loadConfig');
      expect(result).toBeDefined();
    });

    it('should handle unknown actions gracefully', async () => {
      const result = await componentModule.handle('unknownAction');
      expect(result.success).toBe(false);
    });
  });
});
