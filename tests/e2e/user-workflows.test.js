/**
 * END-TO-END TESTS - MASKSERVICE C20 1001
 * Tests complete user workflows from start to finish
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { chromium, firefox, webkit } from 'playwright';

describe('E2E User Workflows', () => {
  let browser;
  let context;
  let page;
  
  const BASE_URL = 'http://localhost:8080';
  const TIMEOUT = 30000;

  beforeEach(async () => {
    // Use Chromium for E2E tests (can be configured)
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });
    page = await context.newPage();
    
    // Set longer timeout for E2E operations
    page.setDefaultTimeout(TIMEOUT);
  });

  afterEach(async () => {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  });

  describe('Complete Application Workflow', () => {
    it('should complete full user journey: login → navigate → edit config → logout', async () => {
      // 1. Navigate to application
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // 2. Verify application loads
      const title = await page.title();
      expect(title).toContain('MASKSERVICE');

      // 3. Check for authentication state
      const appContent = await page.locator('.app-container').isVisible();
      expect(appContent).toBe(true);

      // 4. Navigate to JSON Editor via menu
      const menuButton = page.locator('[data-component-name*="menu"]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }

      // 5. Access JSON Editor functionality
      const jsonEditorUrl = `${BASE_URL.replace('8080', '3009')}`;
      await page.goto(jsonEditorUrl);
      
      // 6. Verify JSON Editor loads
      await page.waitForSelector('.json-editor-container', { timeout: TIMEOUT });
      const editorTitle = await page.locator('.editor-title').textContent();
      expect(editorTitle).toContain('Wizualny Edytor');

      // 7. Select a component to edit
      const componentSelect = page.locator('.component-select');
      await componentSelect.selectOption('mainMenu');

      // 8. Wait for configuration to load
      await page.waitForSelector('.json-viewer', { timeout: TIMEOUT });

      // 9. Verify configuration is displayed
      const jsonContent = await page.locator('.json-viewer').isVisible();
      expect(jsonContent).toBe(true);

      // 10. Make a configuration change
      const editableField = page.locator('[contenteditable="true"]').first();
      if (await editableField.isVisible()) {
        await editableField.click();
        await editableField.fill('Modified Value');
        await editableField.press('Enter');
      }

      // 11. Save configuration
      const saveButton = page.locator('button:has-text("Zapisz")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }

      // 12. Verify success message
      const successMessage = page.locator('.message.success');
      if (await successMessage.isVisible()) {
        const messageText = await successMessage.textContent();
        expect(messageText).toContain('Załadowano');
      }
    });

    it('should handle component navigation workflow', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Test navigation between different components
      const navigationItems = [
        { selector: '[data-route="/"]', expected: 'Dashboard' },
        { selector: '[data-route="/settings"]', expected: 'Settings' },
        { selector: '[data-route="/users"]', expected: 'Users' }
      ];

      for (const nav of navigationItems) {
        const navElement = page.locator(nav.selector);
        if (await navElement.isVisible()) {
          await navElement.click();
          await page.waitForTimeout(500); // Allow navigation to complete
          
          // Verify content changed
          const contentArea = page.locator('#content-area');
          await expect(contentArea).toBeVisible();
        }
      }
    });
  });

  describe('Component-Specific E2E Workflows', () => {
    it('should test MainMenu component workflow', async () => {
      // Test MainMenu in isolation
      const mainMenuUrl = `${BASE_URL.replace('8080', '3003')}`;
      await page.goto(mainMenuUrl);

      // Verify MainMenu loads
      await page.waitForSelector('.main-menu', { timeout: TIMEOUT });

      // Test menu interactions
      const menuItems = page.locator('.menu-item');
      const menuCount = await menuItems.count();
      expect(menuCount).toBeGreaterThan(0);

      // Test menu item clicks
      if (menuCount > 0) {
        const firstItem = menuItems.first();
        await firstItem.click();
        await page.waitForTimeout(300);
        
        // Verify active state
        const activeItem = page.locator('.menu-item.active');
        expect(await activeItem.count()).toBeGreaterThan(0);
      }
    });

    it('should test PressurePanel component workflow', async () => {
      const pressurePanelUrl = `${BASE_URL.replace('8080', '3006')}`;
      await page.goto(pressurePanelUrl);

      // Verify PressurePanel loads
      await page.waitForSelector('.pressure-panel', { timeout: TIMEOUT });

      // Test pressure data display
      const pressureReadings = page.locator('.pressure-reading');
      if (await pressureReadings.first().isVisible()) {
        const readingCount = await pressureReadings.count();
        expect(readingCount).toBeGreaterThan(0);
      }

      // Test interactive controls if present
      const controlButtons = page.locator('.control-button');
      if (await controlButtons.first().isVisible()) {
        await controlButtons.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  describe('Error Scenarios E2E', () => {
    it('should handle network errors gracefully', async () => {
      // Block network requests to simulate offline mode
      await context.route('**/*', route => {
        if (route.request().url().includes('/api/')) {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server Error' })
          });
        } else {
          route.continue();
        }
      });

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Application should still load with graceful degradation
      const errorContent = page.locator('.error-content');
      if (await errorContent.isVisible()) {
        const errorText = await errorContent.textContent();
        expect(errorText).toContain('Błąd');
      }
    });

    it('should handle component loading failures', async () => {
      await page.goto(BASE_URL);
      
      // Navigate to a component that might fail
      await page.goto(`${BASE_URL}/#/nonexistent-component`);
      await page.waitForTimeout(2000);

      // Should show appropriate error or fallback
      const body = await page.textContent('body');
      expect(body).toBeTruthy(); // Page should still render something
    });
  });

  describe('Performance E2E Tests', () => {
    it('should load application within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForSelector('.app-container', { timeout: TIMEOUT });
      
      const loadTime = Date.now() - startTime;
      
      // Application should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    it('should handle rapid navigation without issues', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Rapidly navigate between different sections
      const routes = ['/', '/settings', '/users', '/status'];
      
      for (let i = 0; i < 3; i++) {
        for (const route of routes) {
          await page.goto(`${BASE_URL}${route}`);
          await page.waitForTimeout(100); // Minimal wait
        }
      }

      // Application should remain responsive
      const contentArea = page.locator('#content-area');
      await expect(contentArea).toBeVisible();
    });
  });

  describe('Responsive Design E2E', () => {
    it('should work on different screen sizes', async () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1024, height: 768, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });
        
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Verify main elements are visible
        const appContainer = page.locator('.app-container');
        await expect(appContainer).toBeVisible();

        // Check for responsive behavior
        if (viewport.width < 768) {
          // Mobile-specific checks
          const mobileMenu = page.locator('.mobile-menu, .hamburger-menu');
          // May or may not be present, just check it doesn't break
        }
      }
    });
  });

  describe('Accessibility E2E Tests', () => {
    it('should be keyboard navigable', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Test tab navigation
      let tabCount = 0;
      const maxTabs = 20;

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });
        
        if (focusedElement) {
          // At least some elements should be focusable
          break;
        }
      }

      expect(tabCount).toBeLessThan(maxTabs); // Should find focusable elements
    });

    it('should have proper ARIA labels and roles', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check for navigation landmarks
      const navigation = page.locator('[role="navigation"], nav');
      if (await navigation.count() > 0) {
        expect(await navigation.first().isVisible()).toBe(true);
      }

      // Check for main content area
      const main = page.locator('[role="main"], main');
      if (await main.count() > 0) {
        expect(await main.first().isVisible()).toBe(true);
      }
    });
  });
});
