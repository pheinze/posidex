import { _, register, init, locale as svelteLocale } from 'svelte-i18n';

// Register locales
// Using static imports for simplicity as they are small files
import * as en from './locales/en.json';
import * as de from './locales/de.json';

register('en', () => Promise.resolve(en));
register('de', () => Promise.resolve(de));


// Initialize svelte-i18n
init({
  fallbackLocale: 'en',
  initialLocale: 'en', // This will be the default on the client until the layout loads
});

// Export the translation function
export { _ };

// Export the locale store so components can react to changes
export const locale = svelteLocale;
