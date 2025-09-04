import { _, register, init, getLocaleFromNavigator, locale as svelteLocale } from 'svelte-i18n';
import { writable } from 'svelte/store';

import * as en from './locales/en.json';
import * as de from './locales/de.json';

register('en', () => Promise.resolve(en));
register('de', () => Promise.resolve(de));

function getInitialLocale(): string {
  if (typeof localStorage !== 'undefined') {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'de')) {
      return storedLocale;
    }
  }
  if (typeof navigator !== 'undefined') {
    const browserLocale = getLocaleFromNavigator();
    if (browserLocale?.startsWith('de')) {
      return 'de';
    }
  }
  return 'en'; // Fallback to English
}

const initialLocaleValue = getInitialLocale();

init({
  fallbackLocale: 'en',
  initialLocale: initialLocaleValue,
});

export const locale = writable<string>(initialLocaleValue);

locale.subscribe((value) => {
  if (value) {
    svelteLocale.set(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', value);
    }
  }
});

export async function setLocale(newLocale: 'de' | 'en') {
  locale.set(newLocale);
  // Also set the cookie for subsequent SSR requests
  try {
    await fetch('/api/lang', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lang: newLocale })
    });
  } catch (e) {
    console.error('Failed to set language cookie:', e);
  }
}

export { _ };
