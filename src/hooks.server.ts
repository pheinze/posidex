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
	// This hook now only sets the initial language based on cookie or header.
	// Language switching is handled on the client.
	const langCookie = event.cookies.get(CONSTANTS.LOCALE_COOKIE_KEY);

	let lang: string;
	if (langCookie && (langCookie === 'de' || langCookie === 'en')) {
		lang = langCookie;
	} else {
		const acceptLanguage = event.request.headers.get('accept-language');
		lang = acceptLanguage?.includes('de') ? 'de' : 'en';
	}

	event.locals.lang = lang;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang)
	});
};

export const handle = sequence(languageHandler, themeHandler);
