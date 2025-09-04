import { _, register, init, locale as svelteLocale } from 'svelte-i18n';

// Using static imports is fine here as the JSON files are small.
// For larger dictionaries, dynamic imports (`() => import('./locales/en.json')`) are better.
import * as en from './locales/en.json';
import * as de from './locales/de.json';

// Register the locales
register('en', () => Promise.resolve(en));
register('de', () => Promise.resolve(de));

// Initialize svelte-i18n. The initialLocale will be set dynamically in the layout.
init({
  fallbackLocale: 'en',
  initialLocale: 'en',
});

// Export the translation function and the locale store
// so other components can use it.
export { _ };
export const locale = svelteLocale;
