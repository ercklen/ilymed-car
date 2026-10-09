import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ weight: ['300', '400', '500', '700', '800'], subsets: ['arabic'], variable: '--font-tajawal' });

import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'ILYMED CAR - Premium Car Rental',
  description: 'Votre voiture. Votre liberté.',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale;

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? tajawal.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${fontClass} font-sans bg-slate-50 text-gray-900 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            {props.children}
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
