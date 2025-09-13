import { test, expect } from '@playwright/test';

test('main trade calculation flow', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('/');

  // Wait for the main calculator wrapper to be visible
  await expect(page.locator('.calculator-wrapper')).toBeVisible();

  // 2. Fill out the input fields
  await page.locator('#account-size').fill('10000');
  await page.locator('#risk-percentage').fill('2');
  await page.locator('#entry-price-input').fill('50000');
  await page.locator('#stop-loss-price-input').fill('49000');

  // 3. Check that the results are displayed correctly
  // Use the same values as the integration test

  // Position Size
  const positionSize = page.locator('#position-size');
  await expect(positionSize).toHaveText('0.2');

  // Required Margin
  const requiredMargin = page.locator('#required-margin');
  await expect(requiredMargin).toHaveText('1,000'); // The UI adds a comma for thousands

  // Net Loss
  const netLoss = page.locator('#net-loss');
  await expect(netLoss).toHaveText('-219.8');
});
