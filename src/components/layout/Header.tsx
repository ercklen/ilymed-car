'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { data: session } = useSession();

  const isAr = locale === 'ar';
  const altLocale = isAr ? 'fr' : 'ar';
  const role = (session?.user as any)?.role;
  const isAdminOrStaff = role === 'ADMIN' || role === 'STAFF';

  const navLinks = isAr
    ? [
        { label: 'الرئيسية', href: `/${locale}` },
        { label: 'سياراتنا', href: `/${locale}/vehicles` },
        { label: 'كيف يعمل؟', href: `/${locale}#how-it-works` },
        { label: 'معلومات عنا', href: `/${locale}/about` },
        { label: 'الأسئلة الشائعة', href: `/${locale}/faq` },
        { label: 'اتصل بنا', href: `/${locale}/contact` },
      ]
    : [
        { label: 'Accueil', href: `/${locale}` },
        { label: 'Nos voitures', href: `/${locale}/vehicles` },
        { label: 'Comment ça marche ?', href: `/${locale}#how-it-works` },
        { label: 'À propos', href: `/${locale}/about` },
        { label: 'FAQ', href: `/${locale}/faq` },
        { label: 'Contact', href: `/${locale}/contact` },
      ];

  return (
    <header className="bg-[#111827] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2" dir="ltr">
            <span className="text-2xl font-bold tracking-widest text-[#D4A72C]">ILYMED</span>
            <span className="text-2xl font-bold text-white">CAR</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 hover:text-[#D4A72C] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            <Link
              href={`/${altLocale}`}
              className="text-sm border border-gray-600 px-3 py-1.5 rounded-full hover:border-[#D4A72C] hover:text-[#D4A72C] transition-colors"
            >
              {isAr ? 'Français' : 'العربية'}
            </Link>

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4A72C] text-[#111827] flex items-center justify-center font-bold text-xs">
                    {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-gray-200">
                    {session.user.name || session.user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-400">▼</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 text-gray-800 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">{isAr ? 'متصل كـ' : 'Connecté en tant que'}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                      {role && (
                        <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          {role}
                        </span>
                      )}
                    </div>

                    {isAdminOrStaff && (
                      <Link
                        href="/fr/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition"
                      >
                        <span>⚙️</span>
                        <span>{isAr ? 'لوحة التحكم (Admin)' : 'Espace Admin'}</span>
                      </Link>
                    )}

                    <Link
                      href={`/${locale}/my-bookings`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span>📅</span>
                      <span>{isAr ? 'حجوزاتي' : 'Mes réservations'}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                      className="flex items-center gap-2 w-full text-left rtl:text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <span>🚪</span>
                      <span>{isAr ? 'تسجيل الخروج' : 'Déconnexion'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {isAr ? 'تسجيل الدخول' : 'Connexion'}
              </Link>
            )}

            <Link
              href={`/${locale}/vehicles`}
              className="bg-[#D4A72C] text-[#111827] px-5 py-2 rounded-full font-semibold text-sm hover:bg-yellow-400 transition-colors"
            >
              {isAr ? 'احجز سيارة' : 'Réserver une voiture'}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#1a2332] border-t border-gray-700">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 px-4 text-gray-300 hover:text-[#D4A72C] hover:bg-gray-800 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-700 pt-3 mt-3">
              {session?.user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
                    <p className="text-gray-400 text-xs">{isAr ? 'متصل كـ' : 'Connecté :'}</p>
                    <p className="font-semibold text-white">{session.user.name}</p>
                  </div>
                  {isAdminOrStaff && (
                    <Link
                      href="/fr/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#D4A72C] hover:bg-gray-800 rounded-lg"
                    >
                      ⚙️ {isAr ? 'لوحة التحكم' : 'Espace Administration'}
                    </Link>
                  )}
                  <Link
                    href={`/${locale}/my-bookings`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg"
                  >
                    📅 {isAr ? 'حجوزاتي' : 'Mes réservations'}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="block w-full text-left rtl:text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg"
                  >
                    🚪 {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
                  </button>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  {isAr ? 'تسجيل الدخول' : 'Connexion'}
                </Link>
              )}
            </div>

            <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
              <Link href={`/${altLocale}`} className="text-sm border border-gray-600 px-3 py-1.5 rounded-full hover:border-[#D4A72C] hover:text-[#D4A72C] transition-colors">
                {isAr ? 'Français' : 'العربية'}
              </Link>
            </div>

            <Link
              href={`/${locale}/vehicles`}
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-[#D4A72C] text-[#111827] px-5 py-2.5 rounded-full font-semibold hover:bg-yellow-400 transition-colors mt-2"
            >
              {isAr ? 'احجز سيارة' : 'Réserver une voiture'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
