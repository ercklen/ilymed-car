import Link from 'next/link';
import prisma from '@/lib/db';

// ─── Enum label maps ──────────────────────────────────────────────────────────
type Transmission = 'AUTOMATIC' | 'MANUAL';
type FuelType     = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

const transmissionLabel: Record<Transmission, { fr: string; ar: string }> = {
  AUTOMATIC: { fr: 'Automatique', ar: 'أوتوماتيك' },
  MANUAL:    { fr: 'Manuel',      ar: 'يدوي'       },
};

const fuelLabel: Record<FuelType, { fr: string; ar: string }> = {
  PETROL:   { fr: 'Essence',     ar: 'بنزين'  },
  DIESEL:   { fr: 'Diesel',      ar: 'ديزل'   },
  HYBRID:   { fr: 'Hybride',     ar: 'هجين'   },
  ELECTRIC: { fr: 'Électrique',  ar: 'كهربائي' },
};

// ─── Star renderer ────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm" aria-label={`${rating} étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';

  // Fetch vehicle from Prisma
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      images:    true,
      category:  true,
      features:  true,
      location:  true,
      reviews: {
        where:   { isApproved: true },
        include: { user: true },
        take:    5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // 404-like guard
  if (!vehicle || !vehicle.isPublished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#111827] mb-4">
            {isAr ? 'السيارة غير موجودة' : 'Véhicule introuvable'}
          </h1>
          <p className="text-gray-500 mb-6">
            {isAr
              ? 'هذه السيارة غير متاحة أو لم يتم نشرها بعد.'
              : 'Ce véhicule n\'existe pas ou n\'est pas encore publié.'}
          </p>
          <Link
            href={`/${locale}/vehicles`}
            className="inline-block bg-[#D4A72C] text-[#111827] font-bold px-6 py-3 rounded-2xl hover:bg-yellow-400 transition-colors"
          >
            {isAr ? 'العودة إلى السيارات' : 'Retour aux voitures'}
          </Link>
        </div>
      </div>
    );
  }

  // Derived values
  const avgRating =
    vehicle.reviews.length > 0
      ? vehicle.reviews.reduce((sum, r) => sum + r.rating, 0) / vehicle.reviews.length
      : 0;
  const ratingDisplay = avgRating > 0 ? avgRating.toFixed(1) : null;

  const primaryImage =
    vehicle.images.find((img) => img.isPrimary)?.url ??
    vehicle.images[0]?.url;
  const secondaryImage =
    vehicle.images.find((img) => !img.isPrimary && img.url !== primaryImage)?.url ??
    (vehicle.images.length > 1 ? vehicle.images[1]?.url : null);

  const transmissionText = transmissionLabel[vehicle.transmission][isAr ? 'ar' : 'fr'];
  const fuelText = fuelLabel[vehicle.fuel][isAr ? 'ar' : 'fr'];
  const locationName = isAr ? vehicle.location.nameAr : vehicle.location.nameFr;
  const categoryName = isAr ? vehicle.category.nameAr : vehicle.category.nameFr;
  const description = isAr ? vehicle.descriptionAr : vehicle.descriptionFr;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 px-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-1 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-[#111827]">
            {isAr ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/vehicles`} className="hover:text-[#111827]">
            {isAr ? 'السيارات' : 'Voitures'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{vehicle.brand} {vehicle.model}</span>
        </div>

        {/* Image Gallery */}
        <div className={`grid gap-4 mb-8 h-[400px] ${secondaryImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="h-full rounded-2xl overflow-hidden relative">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">
                🚗
              </div>
            )}
            {!secondaryImage && vehicle.images.length > 0 && (
              <button className="absolute bottom-4 right-4 bg-white text-[#111827] px-4 py-2 rounded-xl shadow font-semibold text-sm hover:bg-gray-100 transition-colors">
                {isAr ? 'عرض جميع الصور' : 'Voir toutes les photos'}
              </button>
            )}
          </div>
          {secondaryImage && (
            <div className="h-full rounded-2xl overflow-hidden relative hidden md:block">
              <img
                src={secondaryImage}
                alt={`${vehicle.brand} ${vehicle.model} – vue 2`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button className="absolute bottom-4 right-4 bg-white text-[#111827] px-4 py-2 rounded-xl shadow font-semibold text-sm hover:bg-gray-100 transition-colors">
                {isAr ? 'عرض جميع الصور' : 'Voir toutes les photos'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Info ──────────────────────────────────────────────── */}
          <div className="w-full lg:w-2/3 space-y-6">

            {/* Title + rating */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#D4A72C] mb-1 block">
                  {categoryName}
                </span>
                <h1 className="text-3xl font-bold text-[#111827] mb-2">
                  {vehicle.brand} {vehicle.model}{' '}
                  <span className="text-gray-400 font-normal">{vehicle.year}</span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                  {ratingDisplay ? (
                    <>
                      <Stars rating={avgRating} />
                      <span className="font-semibold text-gray-800">{ratingDisplay}</span>
                      <span>({vehicle.reviews.length} {isAr ? 'تقييم' : 'avis'})</span>
                      <span>•</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      {isAr ? 'لا توجد تقييمات بعد' : 'Pas encore d\'avis'}
                    </span>
                  )}
                  <span>📍 {locationName}</span>
                </div>
              </div>
            </div>

            {/* Specs card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#111827] mb-4">
                {isAr ? 'المواصفات' : 'Spécifications'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'مقاعد' : 'Places'}
                  </p>
                  <p className="font-semibold text-[#111827]">{vehicle.seats}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'أبواب' : 'Portes'}
                  </p>
                  <p className="font-semibold text-[#111827]">{vehicle.doors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'ناقل الحركة' : 'Transmission'}
                  </p>
                  <p className="font-semibold text-[#111827]">{transmissionText}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'وقود' : 'Carburant'}
                  </p>
                  <p className="font-semibold text-[#111827]">{fuelText}</p>
                </div>
                {vehicle.horsepower && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                      {isAr ? 'القدرة' : 'Puissance'}
                    </p>
                    <p className="font-semibold text-[#111827]">{vehicle.horsepower} ch</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'الكيلومتراج' : 'Kilométrage'}
                  </p>
                  <p className="font-semibold text-[#111827]">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                    {isAr ? 'اللون' : 'Couleur'}
                  </p>
                  <p className="font-semibold text-[#111827]">{vehicle.color}</p>
                </div>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#111827] mb-4">
                {isAr ? 'الوصف' : 'Description'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Features card */}
            {vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#111827] mb-4">
                  {isAr ? 'الميزات' : 'Équipements'}
                </h2>
                <ul className="grid grid-cols-2 gap-3">
                  {vehicle.features.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>
                      {isAr ? f.nameAr : f.nameFr}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews card */}
            {vehicle.reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#111827] mb-5">
                  {isAr ? 'التقييمات' : 'Avis clients'}
                </h2>
                <div className="space-y-5">
                  {vehicle.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#111827] text-sm">
                          {review.user.firstName} {review.user.lastName.charAt(0)}.
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
                      </div>
                      <Stars rating={review.rating} />
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Booking Widget (Sticky) ─────────────────────────────────── */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <div className="mb-5 pb-5 border-b border-gray-100">
                <span className="text-3xl font-bold text-[#111827]">{vehicle.dailyPrice} DH</span>
                <span className="text-gray-400 text-sm ml-1">{isAr ? '/ يوم' : '/ jour'}</span>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {isAr ? 'تاريخ الاستلام' : 'Date de départ'}
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {isAr ? 'تاريخ الإرجاع' : 'Date de retour'}
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-5 text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{vehicle.dailyPrice} DH × 3 {isAr ? 'أيام' : 'jours'}</span>
                  <span>{vehicle.dailyPrice * 3} DH</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{isAr ? 'رسوم الخدمة' : 'Frais de service'}</span>
                  <span>{Math.max(15, vehicle.dailyPrice * 3 * 0.1).toFixed(0)} DH</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{isAr ? 'الضمان' : 'Dpt de garantie'}</span>
                  <span>{vehicle.securityDeposit} DH</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-[#111827] text-base">
                  <span>Total</span>
                  <span>{(vehicle.dailyPrice * 3 + Math.max(15, vehicle.dailyPrice * 3 * 0.1)).toFixed(0)} DH</span>
                </div>
              </div>

              <Link
                href={`/${locale}/booking/${vehicle.id}`}
                className="block w-full bg-[#D4A72C] text-[#111827] py-3 rounded-xl font-bold text-center text-lg hover:bg-yellow-400 transition-colors"
              >
                {isAr ? 'استمر للحجز' : 'Continuer pour réserver'}
              </Link>

              <p className="text-xs text-gray-400 text-center mt-4">
                {isAr
                  ? 'لن يتم تحصيل أي مبلغ منك حتى الآن'
                  : 'Aucun montant ne sera débité pour le moment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
