import Link from 'next/link';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const isAr = locale === 'ar';

  return (
    <footer className="bg-[#111827] text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4" dir="ltr">
              <span className="text-2xl font-bold text-[#D4A72C]">ILYMED</span>
              <span className="text-2xl font-bold text-white">CAR</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {isAr ? 'سيارتك. حريتك.' : 'Votre voiture. Votre liberté.'}
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#D4A72C] hover:text-black transition-colors text-sm">f</a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#D4A72C] hover:text-black transition-colors text-sm">in</a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#D4A72C] hover:text-black transition-colors text-sm">ig</a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">{isAr ? 'التنقل' : 'Navigation'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{isAr ? 'معلومات عنا' : 'À propos'}</Link></li>
              <li><Link href={`/${locale}/vehicles`} className="hover:text-white transition-colors">{isAr ? 'سياراتنا' : 'Nos voitures'}</Link></li>
              <li><Link href={`/${locale}#how-it-works`} className="hover:text-white transition-colors">{isAr ? 'كيف يعمل؟' : 'Comment ça marche'}</Link></li>
              <li><Link href={`/${locale}/faq`} className="hover:text-white transition-colors">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{isAr ? 'اتصل بنا' : 'Contact'}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{isAr ? 'قانوني' : 'Légal'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{isAr ? 'الشروط والأحكام' : 'Conditions générales'}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{isAr ? 'سياسة الخصوصية' : 'Politique de confidentialité'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{isAr ? 'تواصل معنا' : 'Contact'}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span>📞</span>
                <span>06 55 51 80 01 / 07 68 03 92 04</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✉️</span>
                <span>contact@ilymedcar.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>{isAr ? 'الدار البيضاء، المغرب' : 'Casablanca, Maroc'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} ILYMED CAR. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
          <Link
            href={locale === 'ar' ? '/fr' : '/ar'}
            className="border border-gray-700 px-4 py-1.5 rounded-full hover:border-[#D4A72C] hover:text-[#D4A72C] transition-colors"
          >
            {locale === 'ar' ? 'Français' : 'العربية'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
