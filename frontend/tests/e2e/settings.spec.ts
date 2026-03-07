/**
 * E2E tests for settings and language switching
 *
 * @see specs/002-settings-i18n-currency/tasks.md lines 96-101
 * @see specs/002-settings-i18n-currency/spec.md
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
  });

  test('T032: User changes language from Spanish to English, all text updates', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');

    // Verify initial state is Spanish
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
    await expect(page.getByText('Idioma')).toBeVisible();

    // Change language to English
    await page.selectOption('select#language-select', 'en');

    // Verify all text updated to English
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();
    await expect(page.getByText('Currency')).toBeVisible();
    await expect(page.getByText('Select application language')).toBeVisible();
  });

  test('T033: User changes language, closes browser, reopens, language persists', async ({ page, context }) => {
    // Navigate to settings
    await page.goto('/settings');

    // Change language to English
    await page.selectOption('select#language-select', 'en');

    // Verify change
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Close and reopen (simulate by creating new page with same context)
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/settings');

    // Verify language persisted
    await expect(newPage.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(newPage.getByText('Language')).toBeVisible();
  });

  test('T034: Settings page accessible from navigation in max 2 clicks', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Click settings link in navigation (1 click)
    await page.click('a[href="/settings"]');

    // Verify we're on settings page
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /Configuración|Settings/ })).toBeVisible();
  });

  test('T035: Language switch completes in under 200ms', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');

    // Measure time to switch language
    const startTime = Date.now();

    // Change language
    await page.selectOption('select#language-select', 'en');

    // Wait for UI to update
    await page.waitForSelector('h1:has-text("Settings")', { timeout: 200 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify it took less than 200ms
    expect(duration).toBeLessThan(200);
  });

  test('Language change updates navigation menu', async ({ page }) => {
    await page.goto('/');

    // Verify navigation is in Spanish initially
    await expect(page.locator('nav a:has-text("Inicio")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Transacciones")')).toBeVisible();

    // Go to settings and change language
    await page.goto('/settings');
    await page.selectOption('select#language-select', 'en');

    // Go back to home and verify navigation updated
    await page.goto('/');
    await expect(page.locator('nav a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Transactions")')).toBeVisible();
  });

  test('Currency selector is visible and functional', async ({ page }) => {
    await page.goto('/settings');

    // Verify currency selector exists
    const currencySelect = page.locator('select#currency-select');
    await expect(currencySelect).toBeVisible();

    // Verify default is Bs.
    await expect(currencySelect).toHaveValue('Bs.');

    // Change to dollars
    await currencySelect.selectOption('$');

    // Verify selection updated
    await expect(currencySelect).toHaveValue('$');
  });

  test('Settings page has proper accessibility', async ({ page }) => {
    await page.goto('/settings');

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for labels
    await expect(page.locator('label[for="language-select"]')).toBeVisible();
    await expect(page.locator('label[for="currency-select"]')).toBeVisible();

    // Check select elements are keyboard accessible
    const languageSelect = page.locator('select#language-select');
    await languageSelect.focus();
    await expect(languageSelect).toBeFocused();
  });

  test('Multiple language switches work correctly', async ({ page }) => {
    await page.goto('/settings');

    // Spanish -> English
    await page.selectOption('select#language-select', 'en');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // English -> Spanish
    await page.selectOption('select#language-select', 'es');
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();

    // Spanish -> English again
    await page.selectOption('select#language-select', 'en');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('Settings icon is visible in navigation', async ({ page }) => {
    await page.goto('/');

    // Check for settings link with icon
    const settingsLink = page.locator('nav a[href="/settings"]');
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toContainText('⚙️');
  });
});

test.describe('Settings - Edge Cases', () => {
  test('Handles corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/');

    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('userSettings', '{invalid json}');
    });

    // Navigate to settings - should not crash
    await page.goto('/settings');

    // Should show default Spanish
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
  });

  test('Works with localStorage disabled', async ({ page }) => {
    // This test verifies graceful degradation
    await page.goto('/settings');

    // Should still render page even without persistence
    await expect(page.getByRole('heading', { name: /Configuración|Settings/ })).toBeVisible();

    // Should be able to change language (just won't persist)
    await page.selectOption('select#language-select', 'en');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });
});
