import type { LayoutServerLoad } from './$types';
import { CONSTANTS } from '../lib/constants';
import { initialAppState } from '../stores/tradeStore'; // Import initialAppState

export const prerender = true;

export const load: LayoutServerLoad = async ({ cookies }) => {
    const theme = cookies.get(CONSTANTS.LOCAL_STORAGE_THEME_KEY) || 'dark'; // Default to dark if no cookie
    return {
        theme,
        initialAppState // Pass initialAppState to the layout
    };
};