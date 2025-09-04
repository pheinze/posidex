import type { LayoutServerLoad } from './$types';
import { CONSTANTS } from '../lib/constants';
import { initialTradeState } from '../stores/tradeStore'; // Import initialTradeState

export const prerender = false;

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const theme = cookies.get(CONSTANTS.LOCAL_STORAGE_THEME_KEY) || 'dark'; // Default to dark if no cookie
	const lang = locals.lang;

	// Dynamically import the locales
	const locales = await (lang === 'de'
		? import('../locales/locales/de.json')
		: import('../locales/locales/en.json'));

	const seo = locales.seo;

	return {
		theme,
		initialTradeState, // Pass initialTradeState to the layout
		lang,
		seo
	};
};