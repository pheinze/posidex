import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CONSTANTS } from '../../../lib/constants';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { lang } = await request.json();

  if (lang === 'de' || lang === 'en') {
    cookies.set(CONSTANTS.LOCALE_COOKIE_KEY, lang, {
      path: '/',
      maxAge: 31536000, // 1 year
    });
    return json({ success: true });
  }

  return json({ success: false }, { status: 400 });
};
