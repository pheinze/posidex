import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { CONSTANTS } from './lib/constants';

const themeHandler: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get(CONSTANTS.LOCAL_STORAGE_THEME_KEY) || 'dark';

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Replace the <body> tag with the theme class
			let bodyClass = '';
			if (theme !== 'dark') {
				bodyClass = `theme-${theme}`;
			}
			// Use a regex to find the <body> tag and inject the class
			return html.replace(/<body(.*?)>/, `<body class="${bodyClass}"$1>`);
		}
	});

	return response;
};

const languageHandler: Handle = async ({ event, resolve }) => {
	let lang = event.url.searchParams.get('lang');

	if (lang) {
		// Language from URL parameter, set cookie and use it
		event.cookies.set(CONSTANTS.LOCALE_COOKIE_KEY, lang, {
			path: '/',
			maxAge: 31536000
		});
	} else {
		// No URL parameter, try to get from cookie
		lang = event.cookies.get(CONSTANTS.LOCALE_COOKIE_KEY);
	}

	// If no language found yet, fall back to header
	if (!lang) {
		const acceptLanguage = event.request.headers.get('accept-language');
		lang = acceptLanguage?.includes('de') ? 'de' : 'en';
	}

	// Ensure lang is either 'de' or 'en'
	if (lang !== 'de' && lang !== 'en') {
		lang = 'en';
	}

	event.locals.lang = lang;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang)
	});
};

export const handle = sequence(languageHandler, themeHandler);
