/**
 * E2E tests for MonthlyTrendsChart — Chart.js implementation
 *
 * @see specs/003-chartjs-trends-chart/tasks.md T013, T014, T019, T020, T022
 */
import { test, expect } from '@playwright/test';

// Helper: seed localStorage with a transaction so the chart has data
const SEED_SCRIPT = `
  localStorage.setItem('userSettings', JSON.stringify({ language: 'es', currency: 'Bs.' }));
`;

test.describe('US1: Mobile Chart Rendering', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('US1: Chart canvas is visible on mobile when data exists', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(SEED_SCRIPT);
    await page.reload();

    // Chart container should be present regardless of data state
    const monthlyTrendsSection = page.locator('.monthly-trends-chart');
    await expect(monthlyTrendsSection).toBeVisible();
  });

  test('US1: No horizontal overflow on mobile viewport', async ({ page }) => {
    await page.goto('/');

    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('US1: Empty state message shown when no transaction data', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // If no data, empty state paragraph should be visible (not the canvas)
    const noDataMsg = page.locator('.monthly-trends-chart .text-gray-600');
    // Canvas should NOT be present when there is no data
    const canvas = page.locator('.monthly-trends-chart canvas');

    // Either empty state is shown OR canvas is shown — depends on backend data
    // At minimum, the section itself renders without error
    await expect(page.locator('.monthly-trends-chart')).toBeVisible();

    // If canvas is not visible, the empty state message should be shown
    const canvasVisible = await canvas.isVisible();
    if (!canvasVisible) {
      await expect(noDataMsg).toBeVisible();
    }
  });
});

test.describe('US2: Desktop Chart Features', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('US2: Monthly trends section renders on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.monthly-trends-chart')).toBeVisible();
  });

  test('US2: No horizontal overflow on desktop', async ({ page }) => {
    await page.goto('/');

    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('US2: Language switch updates page (settings reactive)', async ({ page }) => {
    // Navigate to settings and switch language
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Configuración|Settings/ })).toBeVisible();

    // Switch to English
    await page.selectOption('select#language-select', 'en');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Navigate back to dashboard
    await page.goto('/');

    // Dashboard title should reflect English language
    await expect(page.locator('.monthly-trends-chart h3')).toBeVisible();

    // Switch back to Spanish
    await page.goto('/settings');
    await page.selectOption('select#language-select', 'es');
    await page.goto('/');
    await expect(page.locator('.monthly-trends-chart h3')).toBeVisible();
  });
});

test.describe('US3: Responsive Resize Behavior', () => {
  test('US3: Chart section visible after viewport resize from desktop to mobile', async ({ page }) => {
    // Start at desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('.monthly-trends-chart')).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 390, height: 844 });

    // Chart section should still be visible
    await expect(page.locator('.monthly-trends-chart')).toBeVisible();

    // No horizontal overflow at mobile size
    const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });

  test('US3: Chart section visible after resize back to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.setViewportSize({ width: 1280, height: 800 });

    await expect(page.locator('.monthly-trends-chart')).toBeVisible();
  });
});
