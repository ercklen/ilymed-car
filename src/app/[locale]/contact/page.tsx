import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactFormClient from './ContactFormClient';

export default async function ContactPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header locale={locale} />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-[#111827] mb-4">
              {isAr ? 'تواصل معنا' : 'Contactez-nous'}
            </h1>
            <p className="text-gray-500 text-lg">
              {isAr ? 'نحن هنا للمساعدة. أرسل لنا رسالة.' : 'Nous sommes là pour vous aider. Envoyez-nous un message.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form Client */}
            <ContactFormClient isAr={isAr} />

            {/* Info */}
            <div className="space-y-6">
              {[
                { icon: '📞', titleFr: 'Téléphone', titleAr: 'رقم الهاتف', valFr: '06 55 51 80 01 / 07 68 03 92 04', valAr: '06 55 51 80 01 / 07 68 03 92 04' },
                { icon: '👤', titleFr: 'Gérant', titleAr: 'المدير', valFr: 'Rida Youness', valAr: 'رضا يونس' },
                { icon: '✉️', titleFr: 'Email', titleAr: 'البريد الإلكتروني', valFr: 'contact@ilymedcar.com', valAr: 'contact@ilymedcar.com' },
                { icon: '📍', titleFr: 'Adresse', titleAr: 'العنوان', valFr: 'Aéroport Mohammed V / Centre-ville, Casablanca, Maroc', valAr: 'مطار محمد الخامس / وسط المدينة، الدار البيضاء، المغرب' },
                { icon: '🕐', titleFr: 'Horaires', titleAr: 'ساعات العمل', valFr: 'Lun–Dim : 07h00 – 22h00', valAr: 'الاثنين–الأحد: 07:00 – 22:00' },
              ].map((info, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="text-3xl">{info.icon}</div>
                  <div>
                    <p className="font-semibold text-[#111827]">{isAr ? info.titleAr : info.titleFr}</p>
                    <p className="text-gray-500 text-sm mt-1">{isAr ? info.valAr : info.valFr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
