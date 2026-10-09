'use client';
import { use } from "react";

import { useState, useTransition } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function LoginPage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const locale = params.locale;
  const isAr = locale === 'ar';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const email    = form.get('email')    as string;
    const password = form.get('password') as string;

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Email ou mot de passe incorrect.');
      } else {
        // Check role and redirect accordingly
        const session = await getSession();
        if ((session?.user as any)?.role === 'ADMIN') {
          router.push(`/fr/admin`);
        } else {
          router.push(`/${locale}`);
        }
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header locale={locale} />

      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-1 mb-2" dir="ltr">
                <span className="text-2xl font-bold text-[#D4A72C]">ILYMED</span>
                <span className="text-2xl font-bold text-[#111827]">CAR</span>
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {isAr ? 'تسجيل الدخول' : 'Connexion'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isAr ? 'مرحباً بعودتك!' : 'Bienvenue de retour !'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {isAr ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'votre@email.com'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[#111827]">
                    {isAr ? 'كلمة المرور' : 'Mot de passe'}
                  </label>
                  <a href="#" className="text-xs text-[#D4A72C] hover:underline">
                    {isAr ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#111827] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition-colors disabled:opacity-50"
              >
                {isPending
                  ? (isAr ? 'جارٍ الدخول...' : 'Connexion en cours...')
                  : (isAr ? 'تسجيل الدخول' : 'Se connecter')
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isAr ? 'ليس لديك حساب؟ ' : 'Pas encore de compte ? '}
              <Link href={`/${locale}/register`} className="text-[#D4A72C] font-semibold hover:underline">
                {isAr ? 'إنشاء حساب' : "S'inscrire"}
              </Link>
            </p>
          </div>

          {/* Admin hint */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Admin ?{' '}
            <Link href={`/${locale}/admin`} className="text-[#D4A72C] hover:underline">
              Accéder au panneau d'administration
            </Link>
          </p>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}

