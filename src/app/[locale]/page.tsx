import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import prisma from '@/lib/db';
import HeroMedia from '@/components/home/HeroMedia';

// =============================================
// FULL HOMEPAGE — ILYMED CAR
// =============================================
const CATEGORIES = [
  { icon: '🚗', labelFr: 'Berlines', labelAr: 'سيدان', count: 6 },
  { icon: '🚙', labelFr: 'SUV', labelAr: 'دفع رباعي', count: 5 },
  { icon: '🏎️', labelFr: 'Luxe', labelAr: 'فاخرة', count: 3 },
  { icon: '🚐', labelFr: 'Monospaces', labelAr: 'ميني فان', count: 2 },
  { icon: '⚡', labelFr: 'Électriques', labelAr: 'كهربائية', count: 2 },
  { icon: '🏙️', labelFr: 'Citadines', labelAr: 'سيارات مدينة', count: 4 },
];

const HOW_IT_WORKS_FR = [
  { step: '01', title: 'Choisissez votre voiture', desc: 'Parcourez notre sélection de véhicules premium et choisissez celui qui correspond à vos besoins.', icon: '🔍' },
  { step: '02', title: 'Sélectionnez vos dates', desc: 'Choisissez vos dates de départ et de retour. Vérifiez la disponibilité en temps réel.', icon: '📅' },
  { step: '03', title: 'Réservez et partez', desc: 'Confirmez votre réservation, effectuez votre paiement sécurisé et récupérez votre voiture.', icon: '🚀' },
];
const HOW_IT_WORKS_AR = [
  { step: '01', title: 'اختر سيارتك', desc: 'تصفح مجموعتنا من السيارات الفاخرة واختر ما يناسب احتياجاتك.', icon: '🔍' },
  { step: '02', title: 'حدد تواريخك', desc: 'اختر تاريخي الاستلام والإرجاع. تحقق من التوافر في الوقت الفعلي.', icon: '📅' },
  { step: '03', title: 'احجز وانطلق', desc: 'أكد حجزك، أتمم الدفع الآمن، واستلم سيارتك.', icon: '🚀' },
];

const WHY_US_FR = [
  { icon: '🚗', title: 'Large choix de véhicules', desc: 'Plus de 15 modèles premium disponibles dans toutes les catégories.' },
  { icon: '⚡', title: 'Réservation simple', desc: 'Réservez votre voiture en moins de 5 minutes depuis votre téléphone.' },
  { icon: '💰', title: 'Prix transparents', desc: 'Aucune surprise. Tous les frais sont affichés clairement avant le paiement.' },
  { icon: '🔒', title: 'Paiement sécurisé', desc: 'Paiements cryptés et sécurisés par les meilleurs standards bancaires.' },
  { icon: '📞', title: 'Assistance client', desc: 'Notre équipe est disponible 7j/7 pour vous accompagner.' },
  { icon: '✅', title: 'Véhicules contrôlés', desc: 'Chaque véhicule est inspecté et entretenu selon nos standards élevés.' },
];
const WHY_US_AR = [
  { icon: '🚗', title: 'مجموعة واسعة من السيارات', desc: 'أكثر من 15 طرازاً فاخراً متاحاً في جميع الفئات.' },
  { icon: '⚡', title: 'حجز بسيط', desc: 'احجز سيارتك في أقل من 5 دقائق من هاتفك.' },
  { icon: '💰', title: 'أسعار شفافة', desc: 'لا مفاجآت. تُعرض جميع الرسوم بوضوح قبل الدفع.' },
  { icon: '🔒', title: 'دفع آمن', desc: 'مدفوعات مشفرة وآمنة وفق أعلى معايير الأمن المصرفي.' },
  { icon: '📞', title: 'دعم العملاء', desc: 'فريقنا متاح 7 أيام في الأسبوع لمساعدتك.' },
  { icon: '✅', title: 'سيارات مفحوصة', desc: 'كل سيارة يتم فحصها وصيانتها وفق معاييرنا العالية.' },
];

const REVIEWS = [
  { name: 'Jean-Paul M.', rating: 5, text: 'Service impeccable ! La BMW était en parfait état. Je recommande vivement ILYMED CAR.', date: 'Septembre 2024' },
  { name: 'Sophie L.', rating: 5, text: 'Très professionnel, prise en charge rapide à l\'aéroport. Super expérience !', date: 'Octobre 2024' },
  { name: 'Marc D.', rating: 4, text: 'Excellent rapport qualité/prix. Le véhicule était propre et bien entretenu.', date: 'Octobre 2024' },
];

const FAQ_FR = [
  { q: 'Quels documents sont nécessaires pour louer ?', a: 'Un permis de conduire valide, une pièce d\'identité et une carte de crédit au nom du conducteur principal.' },
  { q: 'Puis-je annuler ma réservation ?', a: 'Oui, les annulations gratuites sont possibles jusqu\'à 48h avant le début de la location.' },
  { q: 'Y a-t-il un kilométrage illimité ?', a: 'La plupart de nos véhicules offrent un kilométrage illimité. Vérifiez la fiche du véhicule.' },
  { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons les cartes Visa, Mastercard, American Express ainsi que Apple Pay et Google Pay.' },
];

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';
  const howItWorks = isAr ? HOW_IT_WORKS_AR : HOW_IT_WORKS_FR;
  const whyUs = isAr ? WHY_US_AR : WHY_US_FR;

  const featuredVehicles = await prisma.vehicle.findMany({
    where: { isPublished: true },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />

      {/* ── HERO ── */}
      <section className="relative bg-[#0B1120] text-white overflow-hidden min-h-[720px] flex items-center pt-8 pb-20">
        {/* Dynamic Video & Ultra HD Photo Background */}
        <HeroMedia isAr={isAr} locale={locale} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#D4A72C]/20 text-[#D4A72C] text-xs md:text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#D4A72C]/30 backdrop-blur-md shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#D4A72C] animate-ping"></span>
              <span>{isAr ? '✨ وكالة تأجير السيارات الفاخرة بالمغرب' : '✨ Location de voitures premium au Maroc'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 drop-shadow-md">
              {isAr ? (
                <>
                  استأجر السيارة <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A72C] via-yellow-200 to-[#D4A72C]">
                    المثالية
                  </span>{' '}
                  بكل حرية.
                </>
              ) : (
                <>
                  Louez la voiture <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A72C] via-yellow-200 to-[#D4A72C]">
                    idéale
                  </span>
                  , simplement.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              {isAr
                ? 'أسطول سيارات حديث ومعتنى به بعناية. احجز سيارتك في دقيقتين مع تسليم فوري في المطار أو الفندق.'
                : 'Parcourez notre flotte premium à Casablanca, Marrakech et dans tout le Maroc. Réservation rapide, kilométrage avantageux et assistance 7j/7.'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap items-center">
              <a
                href={`/${locale}/vehicles`}
                className="bg-[#D4A72C] text-[#111827] px-8 py-4 rounded-2xl font-black text-sm md:text-base hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-[#D4A72C]/20 flex items-center gap-2"
              >
                <span>{isAr ? 'استكشف السيارات المتاحة' : 'Explorer nos véhicules'}</span>
                <span>→</span>
              </a>
              <a
                href={`/${locale}#how-it-works`}
                className="backdrop-blur-md bg-white/10 border border-white/25 text-white px-7 py-4 rounded-2xl font-semibold text-sm md:text-base hover:bg-white/20 transition-all duration-200"
              >
                {isAr ? 'كيف يعمل؟' : 'Comment ça marche ?'}
              </a>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/15 max-w-lg">
              <div>
                <p className="text-2xl font-bold text-white">15+</p>
                <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'سيارات فاخرة' : 'Véhicules neufs'}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#D4A72C]">4.9 ★</p>
                <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'رضا الزبائن' : 'Avis clients'}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-gray-400 mt-0.5">{isAr ? 'دعم مستمر' : 'Assistance Maroc'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH WIDGET (Overlapping with elevation) ── */}
      <section className="relative z-20 px-6 -mt-10 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                <span>🔍</span>
                <span>{isAr ? 'ابحث عن سيارتك المثالية' : 'Rechercher et réserver un véhicule'}</span>
              </h2>
              <span className="hidden sm:inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {isAr ? '✓ تأكيد فوري متاح' : '✓ Confirmation immédiate'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'مكان الاستلام' : 'Lieu de prise en charge'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'الدار البيضاء، مراكش...' : 'Casablanca, Marrakech...'}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'تاريخ الاستلام' : 'Date de départ'}
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'وقت الاستلام' : 'Heure de départ'}
                </label>
                <select className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition">
                  {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','20:00','22:00'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  {isAr ? 'تاريخ الإرجاع' : 'Date de retour'}
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition"
                />
              </div>
              <div className="flex items-end">
                <a
                  href={`/${locale}/vehicles`}
                  className="w-full bg-[#111827] text-white py-3.5 rounded-xl font-bold text-center hover:bg-[#D4A72C] hover:text-[#111827] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <span>{isAr ? 'بحث' : 'Rechercher'}</span>
                  <span>🔍</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">
              {isAr ? 'تصفح حسب الفئة' : 'Explorer par catégorie'}
            </h2>
            <p className="text-gray-500">{isAr ? 'اختر نوع السيارة الذي يناسبك' : 'Choisissez le type de véhicule qui vous convient'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <a
                key={cat.labelFr}
                href={`/${locale}/vehicles`}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg hover:border-[#D4A72C] border-2 border-transparent transition-all group"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <p className="font-semibold text-sm text-[#111827] group-hover:text-[#D4A72C]">
                  {isAr ? cat.labelAr : cat.labelFr}
                </p>
                <p className="text-xs text-gray-400 mt-1">{cat.count} {isAr ? 'سيارات' : 'voitures'}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VEHICLES ── */}
      {featuredVehicles.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-[#D4A72C] text-sm font-bold tracking-wider uppercase">
                  {isAr ? 'أحدث العروض' : 'Nos meilleures offres'}
                </span>
                <h2 className="text-3xl font-bold text-[#111827] mt-1">
                  {isAr ? 'سيارات مميزة للإيجار' : 'Véhicules récents'}
                </h2>
              </div>
              <Link
                href={`/${locale}/vehicles`}
                className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#111827] hover:text-[#D4A72C] transition-colors"
              >
                <span>{isAr ? 'عرض جميع السيارات' : 'Voir tout le catalogue'}</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles.map(vehicle => {
                const primaryImg = vehicle.images[0]?.url;
                return (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                          🚗
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#111827]/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {isAr ? vehicle.category.nameAr : vehicle.category.nameFr}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#D4A72C] text-[#111827] font-black text-sm px-3 py-1 rounded-xl shadow-md">
                        {vehicle.dailyPrice} DH <span className="text-xs font-normal">/{isAr ? 'يوم' : 'j'}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#D4A72C] transition-colors">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{vehicle.year}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">
                          <span className="flex items-center gap-1">
                            🚘 {vehicle.transmission === 'AUTOMATIC' ? (isAr ? 'أوتوماتيك' : 'Auto') : (isAr ? 'يدوي' : 'Manuel')}
                          </span>
                          <span className="flex items-center gap-1">
                            ⛽ {vehicle.fuel}
                          </span>
                          <span className="flex items-center gap-1">
                            👥 {vehicle.seats} {isAr ? 'مقاعد' : 'pl.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 mt-6">
                        <Link
                          href={`/${locale}/vehicles/${vehicle.id}`}
                          className="flex-1 text-center py-2.5 border-2 border-[#111827] text-[#111827] rounded-xl font-semibold hover:bg-gray-50 transition-colors text-xs"
                        >
                          {isAr ? 'التفاصيل' : 'Détails'}
                        </Link>
                        <Link
                          href={`/${locale}/booking/${vehicle.id}`}
                          className="flex-1 text-center py-2.5 bg-[#D4A72C] text-[#111827] rounded-xl font-bold hover:bg-yellow-400 transition-colors text-xs"
                        >
                          {isAr ? 'احجز الآن' : 'Réserver'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">
              {isAr ? 'كيف يعمل؟' : 'Comment ça marche ?'}
            </h2>
            <p className="text-gray-500">{isAr ? 'ثلاث خطوات بسيطة للانطلاق' : 'Trois étapes simples pour démarrer'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-[#D4A72C]/30" />
            {howItWorks.map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 bg-[#D4A72C]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl border-2 border-[#D4A72C]/20">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-[#D4A72C] tracking-widest">{isAr ? `الخطوة ${item.step}` : `Étape ${item.step}`}</span>
                <h3 className="text-xl font-bold text-[#111827] mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ILYMED CAR ── */}
      <section className="py-20 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              {isAr ? 'لماذا تختار ILYMED CAR ؟' : 'Pourquoi choisir ILYMED CAR ?'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#D4A72C]/40 transition-colors">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">
              {isAr ? 'ما يقوله عملاؤنا' : 'Ce que disent nos clients'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#D4A72C] rounded-full flex items-center justify-center text-[#111827] font-bold">
                    {review.name[0]}
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0">
                    <p className="font-semibold text-sm text-[#111827]">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                <div className="text-[#D4A72C] mb-3">{'★'.repeat(review.rating)}</div>
                <p className="text-gray-600 text-sm leading-relaxed italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">
              {isAr ? 'الأسئلة الشائعة' : 'Questions fréquentes'}
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_FR.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-5 cursor-pointer font-semibold text-[#111827] hover:text-[#D4A72C]">
                    {faq.q}
                    <span className="text-[#D4A72C] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-20 bg-[#D4A72C]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            {isAr ? 'جاهز للانطلاق؟' : 'Prêt à partir ?'}
          </h2>
          <p className="text-[#111827]/70 text-lg mb-8">
            {isAr ? 'احجز سيارتك اليوم واستمتع بتجربة قيادة استثنائية.' : 'Réservez votre voiture aujourd\'hui et profitez d\'une expérience de conduite exceptionnelle.'}
          </p>
          <a
            href={`/${locale}/vehicles`}
            className="inline-block bg-[#111827] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            {isAr ? 'ابدأ الحجز الآن' : 'Commencer ma réservation'}
          </a>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  );
}
