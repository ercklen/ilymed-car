import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FAQ_DATA = [
  {
    q_fr: 'Quels documents sont nécessaires pour louer ?',
    a_fr: 'Un permis de conduire valide, une pièce d\'identité (passeport ou carte d\'identité) et une carte de crédit au nom du conducteur principal.',
    q_ar: 'ما هي المستندات المطلوبة للاستئجار؟',
    a_ar: 'رخصة قيادة سارية، وثيقة هوية (جواز سفر أو بطاقة هوية)، وبطاقة ائتمان باسم السائق الرئيسي.',
  },
  {
    q_fr: 'Puis-je annuler ma réservation ?',
    a_fr: 'Oui, les annulations sont gratuites jusqu\'à 48h avant le début de la location. Au-delà, des frais peuvent s\'appliquer selon nos conditions.',
    q_ar: 'هل يمكنني إلغاء حجزي؟',
    a_ar: 'نعم، الإلغاء مجاني حتى 48 ساعة قبل بدء الإيجار. بعد ذلك، قد تُطبَّق رسوم وفق شروطنا.',
  },
  {
    q_fr: 'Y a-t-il un kilométrage illimité ?',
    a_fr: 'La plupart de nos véhicules offrent un kilométrage illimité. Vérifiez les détails sur la fiche de chaque véhicule.',
    q_ar: 'هل هناك كيلومترات غير محدودة؟',
    a_ar: 'معظم سياراتنا تقدم كيلومترات غير محدودة. تحقق من تفاصيل كل مركبة.',
  },
  {
    q_fr: 'Quels modes de paiement acceptez-vous ?',
    a_fr: 'Nous acceptons les cartes Visa, Mastercard, American Express, ainsi que Apple Pay et Google Pay.',
    q_ar: 'ما هي طرق الدفع المقبولة؟',
    a_ar: 'نقبل بطاقات Visa وMastercard وAmerican Express وكذلك Apple Pay وGoogle Pay.',
  },
  {
    q_fr: 'Qu\'est-ce que la caution ?',
    a_fr: 'Une caution est prélevée au moment de la prise en charge du véhicule. Elle est intégralement restituée à la fin de la location si le véhicule est rendu sans dommage.',
    q_ar: 'ما هو مبلغ التأمين (الضمانة)؟',
    a_ar: 'يُحصَّل مبلغ تأمين عند استلام السيارة، ويُعاد بالكامل عند الإرجاع إذا لم يكن هناك أي ضرر.',
  },
  {
    q_fr: 'Puis-je ajouter un conducteur supplémentaire ?',
    a_fr: 'Oui, vous pouvez ajouter un conducteur supplémentaire moyennant des frais additionnels. Contactez-nous pour plus d\'informations.',
    q_ar: 'هل يمكنني إضافة سائق إضافي؟',
    a_ar: 'نعم، يمكنك إضافة سائق إضافي مقابل رسوم إضافية. تواصل معنا لمزيد من المعلومات.',
  },
];

export default async function FaqPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />
      <main className="flex-grow bg-[#F8FAFC] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-[#111827] mb-4">
              {isAr ? 'الأسئلة الشائعة' : 'Questions fréquentes'}
            </h1>
            <p className="text-gray-500">
              {isAr ? 'إجابات على أكثر الأسئلة شيوعاً.' : 'Des réponses à vos questions les plus fréquentes.'}
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-5 cursor-pointer font-semibold text-[#111827] hover:text-[#D4A72C] transition-colors list-none">
                    <span>{isAr ? faq.q_ar : faq.q_fr}</span>
                    <span className="text-[#D4A72C] text-xl transition-transform group-open:rotate-45 ml-4 rtl:mr-4 rtl:ml-0">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {isAr ? faq.a_ar : faq.a_fr}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
