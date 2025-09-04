import { test, expect } from '@playwright/test';
import de from '../../src/locales/locales/de.json' with { type: 'json' };
import en from '../../src/locales/locales/en.json' with { type: 'json' };

test('should switch language on client and persist for next SSR', async ({ page, context }) => {
  // 1. Go to the page and check for default language (english)
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(en.seo.title);
  // Check a UI element for the initial language
  await expect(page.locator('#view-journal-btn-desktop')).toHaveText(en.app.journalButton);

  // 2. Scroll to the language switcher and click the german button
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('button[title="German"]').click();

  // 3. Check that the UI updates instantly (client-side)
  await expect(page.locator('#view-journal-btn-desktop')).toHaveText(de.app.journalButton);

  // 4. Check that the SEO title has NOT changed yet
  await expect(page).toHaveTitle(en.seo.title);

  // 5. Check that the cookie was set
  await expect(async () => {
    const cookies = await context.cookies();
    expect(cookies.find(c => c.name === 'lang' && c.value === 'de')).toBeTruthy();
  }).toPass();

  // 6. Reload the page
  await page.reload();

  // 7. Now, check that the server has rendered the German version
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page).toHaveTitle(de.seo.title);
  await expect(page.locator('#view-journal-btn-desktop')).toHaveText(de.app.journalButton);
});
