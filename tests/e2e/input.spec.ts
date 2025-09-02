import { test, expect } from '@playwright/test';

// WARNING: These tests are failing due to complex reactive logic in the Svelte application
// that clears the input fields upon recalculation. The core logic in `inputUtils.ts` has been
// verified with unit tests, but these E2E tests require deeper knowledge of the application's
// state management to pass.

test.describe('Number Input Stepper Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should increment integer without adding decimals', async ({ page }) => {
    const riskInput = page.locator('#risk-percentage');
    await expect(riskInput).toBeVisible();
    await riskInput.fill('1');
    await riskInput.press('ArrowUp');
    await expect(riskInput).toHaveValue('2');
  });

  test('should increment decimal according to its precision', async ({ page }) => {
    const addTpButton = page.locator('#add-tp-btn');
    await expect(addTpButton).toBeVisible();
    await addTpButton.click();
    const priceInput = page.locator('#tp-price-0');
    await expect(priceInput).toBeVisible();
    await priceInput.fill('1.23');
    await priceInput.press('ArrowUp');
    await expect(priceInput).toHaveValue('1.24');
  });
});
