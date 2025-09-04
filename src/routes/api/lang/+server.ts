import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CONSTANTS } from '../../../lib/constants';

/**
 * Handles POST requests to set the language cookie.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  const { lang } = await request.json();

  if (lang === 'de' || lang === 'en') {
    cookies.set(CONSTANTS.LOCALE_COOKIE_KEY, lang, {
      path: '/',
      maxAge: 31536000, // 1 year,
      httpOnly: false, // Allow client-side script to access this cookie if needed, though not strictly necessary here
      sameSite: 'lax'
    });
    return json({ success: true });
  }

  return json({ success: false, message: 'Invalid language provided.' }, { status: 400 });
};
