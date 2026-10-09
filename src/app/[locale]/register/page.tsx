'use client';
import { use } from "react";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/app/actions/admin';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function RegisterPage(props: { params: Promise<{ locale: string }> }) {
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
    const email    = form.get('email') as string;
    const password = form.get('password') as string;
    const confirm  = form.get('confirmPassword') as string;

    if (password !== confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError(isAr ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' : 'Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    form.set('locale', locale);

    startTransition(async () => {
      try {
        await registerUser(form);
        // Automatically sign in the user
        const loginRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          router.push(`/${locale}/login?registered=1`);
        } else {
          router.push(`/${locale}`);
          router.refresh();
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header locale={locale} />

      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-1 mb-2" dir="ltr">
                <span className="text-2xl font-bold text-[#D4A72C]">ILYMED</span>
                <span className="text-2xl font-bold text-[#111827]">CAR</span>
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {isAr ? 'إنشاء حساب جديد' : 'Créer un compte'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isAr ? 'انضم إلى مجتمع ILYMED CAR' : 'Rejoignez la communauté ILYMED CAR'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    {isAr ? 'الاسم الشخصي' : 'Prénom'} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder={isAr ? 'أحمد' : 'Jean'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    {isAr ? 'اسم العائلة' : 'Nom'} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder={isAr ? 'محمد' : 'Dupont'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {isAr ? 'البريد الإلكتروني' : 'Adresse e-mail'} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {isAr ? 'رقم الهاتف' : 'Téléphone'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+33 6 12 34 56 78"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {isAr ? 'كلمة المرور' : 'Mot de passe'} *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-500 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 rounded border-gray-300 accent-[#D4A72C]" />
                <span>
                  {isAr ? 'أوافق على ' : "J'accepte les "}
                  <a href={`/${locale}/terms`} className="text-[#D4A72C] hover:underline">
                    {isAr ? 'الشروط والأحكام' : 'conditions générales'}
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#111827] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition-colors disabled:opacity-50"
              >
                {isPending
                  ? (isAr ? 'جارٍ الإنشاء...' : 'Création en cours...')
                  : (isAr ? 'إنشاء الحساب' : 'Créer mon compte')
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isAr ? 'لديك حساب بالفعل؟ ' : 'Déjà un compte ? '}
              <Link href={`/${locale}/login`} className="text-[#D4A72C] font-semibold hover:underline">
                {isAr ? 'تسجيل الدخول' : 'Se connecter'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}

