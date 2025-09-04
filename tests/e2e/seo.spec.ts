import { test, expect } from '@playwright/test';
import de from '../../src/locales/locales/de.json' with { type: 'json' };
import en from '../../src/locales/locales/en.json' with { type: 'json' };

test('should set the language and update meta tags', async ({ page }) => {
  // Go to the page and check for default language (english)
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(en.seo.title);

  // Scroll to the bottom of the page to find the language switcher
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Click the german language switcher and wait for the page to reload
  await page.locator('button:has-text("🇩🇪")').click();
  await page.waitForLoadState('load');

  // Check that the lang and title have changed
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page).toHaveTitle(de.seo.title);

  // Go back to english
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('button:has-text("🇬🇧")').click();
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(en.seo.title);
});
