import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />

      {/* Hero */}
      <div className="bg-[#111827] text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {isAr ? 'معلومات عن ILYMED CAR' : 'À propos de ILYMED CAR'}
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {isAr ? 'سيارتك. حريتك. التزامنا.' : 'Votre voiture. Votre liberté. Notre engagement.'}
        </p>
      </div>

      <main className="flex-grow bg-[#F8FAFC] py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#111827] mb-4">
                {isAr ? 'من نحن' : 'Qui sommes-nous ?'}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {isAr
                  ? 'ILYMED CAR هي شركة تأجير سيارات فاخرة متخصصة في تقديم أفضل تجربة تنقل لعملائها. نحن نؤمن بأن كل رحلة تستحق سيارة مثالية.'
                  : 'ILYMED CAR est une agence de location de véhicules premium spécialisée dans l\'expérience de mobilité haut de gamme. Nous croyons que chaque voyage mérite une voiture parfaite.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {isAr
                  ? 'تأسست شركتنا بهدف تغيير طريقة تأجير السيارات، جاعلةً إياها تجربة بسيطة وموثوقة وفاخرة في آنٍ واحد.'
                  : 'Notre société a été fondée avec l\'ambition de transformer la location de voitures en une expérience simple, fiable et luxueuse à la fois.'}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden h-64 relative">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2940&auto=format&fit=crop"
                alt="ILYMED CAR fleet"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '15+', labelFr: 'Véhicules premium', labelAr: 'سيارة فاخرة' },
              { number: '500+', labelFr: 'Clients satisfaits', labelAr: 'عميل راضٍ' },
              { number: '4.9★', labelFr: 'Note moyenne', labelAr: 'متوسط التقييم' },
              { number: '24/7', labelFr: 'Support client', labelAr: 'دعم العملاء' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-[#D4A72C]">{stat.number}</p>
                <p className="text-sm text-gray-500 mt-1">{isAr ? stat.labelAr : stat.labelFr}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
