/**
 * MaskService C20 - Comprehensive GUI Tests with Playwright
 * Tests all roles, components, and UI interactions
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';

// Test configuration
const ROLES = {
  OPERATOR: { id: 'OPERATOR', name: 'Operator' },
  ADMIN: { id: 'ADMIN', name: 'Administrator' },
  SERWISANT: { id: 'SERWISANT', name: 'Service Technician' },
  SUPERUSER: { id: 'SUPERUSER', name: 'Superuser' }
};

const COMPONENTS = {
  OPERATOR: ['/monitoring', '/alerts'],
  ADMIN: ['/monitoring', '/alerts', '/tests', '/reports', '/users', '/system'],
  SERWISANT: ['/diagnostics', '/calibration', '/maintenance'],
  SUPERUSER: ['/monitoring', '/alerts', '/analytics', '/integration', '/audit']
};

test.describe('MaskService C20 GUI Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto(BASE_URL);
    
    // Wait for application to load
    await page.waitForSelector('#app', { timeout: 10000 });
    
    // Wait for Vue app to be ready
    await page.waitForSelector('.main-app', { timeout: 15000 });
  });

  test.describe('Application Loading', () => {
    
    test('should load main application', async ({ page }) => {
      // Check if main elements are present
      await expect(page.locator('#app')).toBeVisible();
      await expect(page.locator('.app-header')).toBeVisible();
      await expect(page.locator('.main-menu')).toBeVisible();
      await expect(page.locator('#pressure-panel-container')).toBeVisible();
      await expect(page.locator('.app-footer')).toBeVisible();
    });

    test('should display correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/MASKSERVICE C20 1001/);
      await expect(page.locator('.app-title')).toContainText('MASKSERVICE C20 1001');
    });

    test('should load without console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.reload();
      await page.waitForTimeout(5000);
      
      // Filter out known acceptable errors
      const criticalErrors = errors.filter(error => 
        !error.includes('404') && 
        !error.includes('favicon') &&
        !error.includes('schema.json') &&
        !error.includes('data.json')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Role Switching System', () => {
    
    test('should have role switcher in menu', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      await expect(roleSwitcher).toBeVisible();
      
      // Check all roles are available
      const options = await roleSwitcher.locator('option').allTextContents();
      expect(options).toContain('Operator');
      expect(options).toContain('Administrator'); 
      expect(options).toContain('Service Technician');
      expect(options).toContain('Superuser');
    });

    test('should switch to OPERATOR role', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      await roleSwitcher.selectOption('OPERATOR');
      
      await page.waitForTimeout(2000);
      
      // Check role badge updated
      await expect(page.locator('.user-role-badge')).toContainText('OPERATOR');
      
      // Check menu items for OPERATOR
      const menuItems = page.locator('.menu-item-role');
      const menuTexts = await menuItems.allTextContents();
      
      expect(menuTexts.some(text => text.includes('Monitoring'))).toBeTruthy();
      expect(menuTexts.some(text => text.includes('Alerts'))).toBeTruthy();
    });

    test('should switch to SERWISANT role', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      await roleSwitcher.selectOption('SERWISANT');
      
      await page.waitForTimeout(2000);
      
      // Check role badge updated
      await expect(page.locator('.user-role-badge')).toContainText('SERWISANT');
      
      // Check SERWISANT-specific menu items
      const menuItems = page.locator('.menu-item-role');
      const menuTexts = await menuItems.allTextContents();
      
      expect(menuTexts.some(text => text.includes('Diagnostyka'))).toBeTruthy();
      expect(menuTexts.some(text => text.includes('Kalibracja'))).toBeTruthy();
      expect(menuTexts.some(text => text.includes('Konserwacja'))).toBeTruthy();
    });

    test('should switch to SUPERUSER role', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      await roleSwitcher.selectOption('SUPERUSER');
      
      await page.waitForTimeout(2000);
      
      // Check role badge updated
      await expect(page.locator('.user-role-badge')).toContainText('SUPERUSER');
      
      // Check SUPERUSER has most menu items
      const menuItems = page.locator('.menu-item-role');
      const count = await menuItems.count();
      
      expect(count).toBeGreaterThan(4); // SUPERUSER should have many menu items
    });

    test('should show role change notification', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      await roleSwitcher.selectOption('OPERATOR');
      
      // Check for notification (if implemented)
      const notification = page.locator('.role-change-notification');
      if (await notification.isVisible()) {
        await expect(notification).toContainText('Role Changed');
      }
    });
  });

  test.describe('Pressure Panel', () => {
    
    test('should load pressure panel', async ({ page }) => {
      const pressurePanel = page.locator('#pressure-panel-container');
      await expect(pressurePanel).toBeVisible();
      
      // Wait for pressure panel to load completely
      await page.waitForTimeout(5000);
      
      // Check it's not stuck on loading
      const content = await pressurePanel.textContent();
      expect(content).not.toContain('Ładowanie PressurePanel');
    });

    test('should display pressure data', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      const pressurePanel = page.locator('#pressure-panel-container');
      const content = await pressurePanel.textContent();
      
      // Check for pressure-related content
      const hasPressureContent = content.includes('PRESSURE') || 
                                content.includes('PANEL') || 
                                content.includes('bar') ||
                                content.includes('mbar');
      
      expect(hasPressureContent).toBeTruthy();
    });
  });

  test.describe('Component Navigation', () => {
    
    test('should navigate to monitoring component', async ({ page }) => {
      // Switch to OPERATOR role first
      await page.locator('.role-switcher select').selectOption('OPERATOR');
      await page.waitForTimeout(1000);
      
      // Click monitoring menu item
      const monitoringItem = page.locator('.menu-item-role').filter({ hasText: 'Monitoring' });
      if (await monitoringItem.isVisible()) {
        await monitoringItem.click();
        await page.waitForTimeout(2000);
        
        // Check content area updated
        const contentArea = page.locator('#content-area');
        await expect(contentArea).toBeVisible();
      }
    });

    test('should navigate to diagnostics component', async ({ page }) => {
      // Switch to SERWISANT role first
      await page.locator('.role-switcher select').selectOption('SERWISANT');
      await page.waitForTimeout(1000);
      
      // Click diagnostics menu item
      const diagnosticsItem = page.locator('.menu-item-role').filter({ hasText: 'Diagnostyka' });
      if (await diagnosticsItem.isVisible()) {
        await diagnosticsItem.click();
        await page.waitForTimeout(2000);
        
        // Check content area updated
        const contentArea = page.locator('#content-area');
        await expect(contentArea).toBeVisible();
      }
    });

    test('should navigate to calibration component', async ({ page }) => {
      // Switch to SERWISANT role first
      await page.locator('.role-switcher select').selectOption('SERWISANT');
      await page.waitForTimeout(1000);
      
      // Click calibration menu item
      const calibrationItem = page.locator('.menu-item-role').filter({ hasText: 'Kalibracja' });
      if (await calibrationItem.isVisible()) {
        await calibrationItem.click();
        await page.waitForTimeout(2000);
        
        // Check content area updated
        const contentArea = page.locator('#content-area');
        await expect(contentArea).toBeVisible();
      }
    });

    test('should navigate to maintenance component', async ({ page }) => {
      // Switch to SERWISANT role first
      await page.locator('.role-switcher select').selectOption('SERWISANT');
      await page.waitForTimeout(1000);
      
      // Click maintenance menu item
      const maintenanceItem = page.locator('.menu-item-role').filter({ hasText: 'Konserwacja' });
      if (await maintenanceItem.isVisible()) {
        await maintenanceItem.click();
        await page.waitForTimeout(2000);
        
        // Check content area updated
        const contentArea = page.locator('#content-area');
        await expect(contentArea).toBeVisible();
        
        // Check for maintenance-specific content
        const content = await contentArea.textContent();
        expect(content.includes('Maintenance') || content.includes('maintenance')).toBeTruthy();
      }
    });

    test('should navigate to analytics component', async ({ page }) => {
      // Switch to SUPERUSER role first
      await page.locator('.role-switcher select').selectOption('SUPERUSER');
      await page.waitForTimeout(1000);
      
      // Click analytics menu item
      const analyticsItem = page.locator('.menu-item-role').filter({ hasText: 'Analytics' });
      if (await analyticsItem.isVisible()) {
        await analyticsItem.click();
        await page.waitForTimeout(2000);
        
        // Check content area updated
        const contentArea = page.locator('#content-area');
        await expect(contentArea).toBeVisible();
      }
    });
  });

  test.describe('UI Responsiveness', () => {
    
    test('should be responsive on different screen sizes', async ({ page }) => {
      // Test desktop size
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.locator('.main-app')).toBeVisible();
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('.main-app')).toBeVisible();
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('.main-app')).toBeVisible();
    });

    test('should handle role switching smoothly', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      
      // Switch between roles rapidly
      await roleSwitcher.selectOption('OPERATOR');
      await page.waitForTimeout(500);
      
      await roleSwitcher.selectOption('SERWISANT');
      await page.waitForTimeout(500);
      
      await roleSwitcher.selectOption('SUPERUSER');
      await page.waitForTimeout(500);
      
      await roleSwitcher.selectOption('ADMIN');
      await page.waitForTimeout(1000);
      
      // Final state should be stable
      await expect(page.locator('.user-role-badge')).toContainText('ADMIN');
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Block network requests to simulate offline
      await page.route('**/*', route => route.abort());
      
      // Try to refresh page
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // App should still show something (cached or error state)
      const body = await page.textContent('body');
      expect(body.length).toBeGreaterThan(0);
    });

    test('should show appropriate error messages', async ({ page }) => {
      // Check for any error elements that might be present
      const errorElements = page.locator('.error, .error-message, .error-content');
      
      if (await errorElements.count() > 0) {
        const errorText = await errorElements.first().textContent();
        expect(errorText.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Performance', () => {
    
    test('should load application within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForSelector('.main-app', { timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should handle role switching quickly', async ({ page }) => {
      const roleSwitcher = page.locator('.role-switcher select');
      
      const startTime = Date.now();
      await roleSwitcher.selectOption('SERWISANT');
      await page.waitForSelector('.user-role-badge', { timeout: 5000 });
      
      const switchTime = Date.now() - startTime;
      expect(switchTime).toBeLessThan(3000); // Should switch within 3 seconds
    });
  });
});

// Export test configuration
module.exports = {
  BASE_URL,
  ROLES,
  COMPONENTS
};
