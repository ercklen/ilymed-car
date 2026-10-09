import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const fmt = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

const statusConfig: Record<string, { labelFr: string; labelAr: string; color: string }> = {
  CONFIRMED:  { labelFr: 'Confirmé',    labelAr: 'مؤكد',      color: 'bg-green-100 text-green-800' },
  COMPLETED:  { labelFr: 'Terminé',     labelAr: 'مكتمل',     color: 'bg-blue-100 text-blue-800' },
  CANCELLED:  { labelFr: 'Annulé',      labelAr: 'ملغى',      color: 'bg-red-100 text-red-800' },
  PENDING:    { labelFr: 'En attente',  labelAr: 'معلق',      color: 'bg-yellow-100 text-yellow-800' },
  ACTIVE:     { labelFr: 'En cours',    labelAr: 'جارٍ',      color: 'bg-purple-100 text-purple-800' },
  REJECTED:   { labelFr: 'Rejeté',      labelAr: 'مرفوض',     color: 'bg-gray-100 text-gray-600' },
  NO_SHOW:    { labelFr: 'Non présenté', labelAr: 'لم يحضر',  color: 'bg-orange-100 text-orange-700' },
};

export default async function MyBookingsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const userId = (session.user as any).id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      vehicle: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const completed  = bookings.filter(b => b.status === 'COMPLETED').length;
  const active     = bookings.filter(b => b.status === 'ACTIVE').length;
  const totalSpent = bookings
    .filter(b => ['CONFIRMED', 'COMPLETED', 'ACTIVE'].includes(b.status))
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const next = bookings.find(b => b.status === 'CONFIRMED' || b.status === 'PENDING');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header locale={locale} />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#111827] mb-8">
            {isAr ? 'حجوزاتي' : 'Mes réservations'}
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                labelFr: 'Prochain voyage',
                labelAr: 'الرحلة القادمة',
                value: next ? fmt(next.pickupDate) : '—',
                icon: '📅',
              },
              {
                labelFr: 'Terminées',
                labelAr: 'المكتملة',
                value: String(completed),
                icon: '✅',
              },
              {
                labelFr: 'En cours',
                labelAr: 'الجارية',
                value: String(active),
                icon: '🚗',
              },
              {
                labelFr: 'Total dépensé',
                labelAr: 'إجمالي الإنفاق',
                value: `${totalSpent.toFixed(0)} DH`,
                icon: '💳',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-sm text-gray-500">{isAr ? stat.labelAr : stat.labelFr}</p>
                <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Booking List */}
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-5xl mb-4">🚗</p>
              <p className="text-lg font-semibold text-[#111827]">
                {isAr ? 'لا توجد حجوزات بعد' : 'Aucune réservation pour le moment'}
              </p>
              <p className="text-gray-500 text-sm mt-2 mb-6">
                {isAr ? 'ابدأ بحجز سيارتك الأولى!' : 'Commencez par réserver votre première voiture !'}
              </p>
              <Link
                href={`/${locale}/vehicles`}
                className="inline-block bg-[#D4A72C] text-[#111827] px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
              >
                {isAr ? 'استكشف السيارات' : 'Explorer les voitures'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                const s = statusConfig[booking.status] ?? statusConfig.PENDING;
                const primaryImg = booking.vehicle.images[0]?.url;
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row"
                  >
                    <div className="w-full md:w-52 h-44 md:h-auto bg-gray-100 relative flex-shrink-0">
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-200">
                          🚗
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>
                            {isAr ? s.labelAr : s.labelFr}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">#{booking.bookingNumber}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#111827]">
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {fmt(booking.pickupDate)} → {fmt(booking.returnDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-2xl font-bold text-[#D4A72C]">
                          {booking.totalAmount.toFixed(0)} DH
                        </span>
                        <div className="flex gap-2 mt-3">
                          <button className="border border-gray-200 px-3 py-1.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                            {isAr ? 'التفاصيل' : 'Détails'}
                          </button>
                          {booking.status === 'CONFIRMED' && (
                            <button className="border border-red-200 text-red-600 px-3 py-1.5 rounded-xl text-sm hover:bg-red-50 transition-colors">
                              {isAr ? 'إلغاء' : 'Annuler'}
                            </button>
                          )}
                          {booking.status === 'COMPLETED' && (
                            <button className="bg-[#D4A72C] text-[#111827] px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-yellow-400 transition-colors">
                              {isAr ? 'تقييم' : 'Évaluer'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
