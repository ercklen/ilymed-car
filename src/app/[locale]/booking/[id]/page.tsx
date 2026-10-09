import Link from 'next/link';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import BookingForm from './BookingForm';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';

  const session = await auth();
  let currentUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null = null;

  if (session?.user) {
    const sessionUserId = (session.user as any).id;
    if (sessionUserId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });
      if (dbUser) {
        currentUser = {
          firstName: dbUser.firstName || '',
          lastName: dbUser.lastName || '',
          email: dbUser.email || '',
          phone: dbUser.phone || '',
        };
      }
    } else if (session.user.email) {
      const dbUser = await prisma.user.findFirst({
        where: { email: session.user.email },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });
      if (dbUser) {
        currentUser = {
          firstName: dbUser.firstName || '',
          lastName: dbUser.lastName || '',
          email: dbUser.email || '',
          phone: dbUser.phone || '',
        };
      }
    }
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      images:   true,
      category: true,
      location: true,
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  if (!vehicle || !vehicle.isPublished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <p className="text-5xl mb-4">🚗</p>
          <h1 className="text-3xl font-bold text-[#111827] mb-3">
            {isAr ? 'السيارة غير متاحة' : 'Véhicule non disponible'}
          </h1>
          <p className="text-gray-500 mb-6">
            {isAr
              ? 'لا يمكن إتمام الحجز لهذه السيارة حالياً.'
              : 'La réservation de ce véhicule n\'est pas possible actuellement.'}
          </p>
          <Link
            href={`/${locale}/vehicles`}
            className="inline-block bg-[#D4A72C] text-[#111827] font-bold px-6 py-3 rounded-2xl hover:bg-yellow-400 transition-colors"
          >
            {isAr ? 'تصفح السيارات' : 'Voir les voitures'}
          </Link>
        </div>
      </div>
    );
  }

  // Derived values
  const primaryImage =
    vehicle.images.find((img) => img.isPrimary)?.url ??
    vehicle.images[0]?.url ??
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2940&auto=format&fit=crop';

  const vehicleName  = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
  const categoryName = isAr ? vehicle.category.nameAr : vehicle.category.nameFr;
  const locationName = isAr ? vehicle.location.nameAr : vehicle.location.nameFr;

  const avgRating =
    vehicle.reviews.length > 0
      ? (vehicle.reviews.reduce((s, r) => s + r.rating, 0) / vehicle.reviews.length).toFixed(1)
      : null;

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
          <Link href={`/${locale}/vehicles/${vehicle.id}`} className="hover:text-[#111827]">
            {vehicleName}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{isAr ? 'الحجز' : 'Réservation'}</span>
        </div>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">
            {isAr ? `احجز: ${vehicleName}` : `Réserver : ${vehicleName}`}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1 text-xs font-medium">
              🏷️ {categoryName}
            </span>
            <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1 text-xs font-medium">
              📍 {locationName}
            </span>
            {avgRating && (
              <span className="inline-flex items-center gap-1 bg-white border border-gray-100 rounded-full px-3 py-1 text-xs font-medium">
                ⭐ {avgRating} ({vehicle.reviews.length} {isAr ? 'تقييم' : 'avis'})
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-[#D4A72C]/10 border border-[#D4A72C]/30 text-[#111827] rounded-full px-3 py-1 text-xs font-bold">
              {vehicle.dailyPrice} DH / {isAr ? 'يوم' : 'jour'}
            </span>
          </div>
        </div>

        {/* BookingForm — client component handles form + sticky price card */}
        <BookingForm
          vehicleId={vehicle.id}
          locale={locale}
          dailyPrice={vehicle.dailyPrice}
          securityDeposit={vehicle.securityDeposit}
          deliveryFee={vehicle.deliveryFee}
          vehicleName={vehicleName}
          primaryImage={primaryImage}
          currentUser={currentUser}
        />

        {/* Trust badges */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', fr: 'Paiement sécurisé',     ar: 'دفع آمن'           },
            { icon: '✅', fr: 'Annulation flexible',    ar: 'إلغاء مرن'         },
            { icon: '📞', fr: 'Support 24/7',           ar: 'دعم على مدار الساعة' },
            { icon: '🛡️', fr: 'Assurance incluse',     ar: 'التأمين مشمول'     },
          ].map((badge) => (
            <div
              key={badge.fr}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2"
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-semibold text-gray-700">
                {isAr ? badge.ar : badge.fr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
