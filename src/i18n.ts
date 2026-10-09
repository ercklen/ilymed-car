import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './config';

export default getRequestConfig(async (context) => {
  let locale = 'fr';
  if (context?.requestLocale) {
    const reqLoc = await context.requestLocale;
    if (reqLoc) locale = reqLoc;
  } else if ((context as any)?.locale) {
    locale = (context as any).locale;
  }

  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
