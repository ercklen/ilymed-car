import Link from 'next/link';
import prisma from '@/lib/db';

const fmt = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED:  'bg-green-100 text-green-800',
  PENDING:    'bg-yellow-100 text-yellow-800',
  REJECTED:   'bg-red-100 text-red-800',
  ACTIVE:     'bg-purple-100 text-purple-800',
  COMPLETED:  'bg-blue-100 text-blue-800',
  CANCELLED:  'bg-gray-100 text-gray-600',
  NO_SHOW:    'bg-orange-100 text-orange-700',
};
const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmé', PENDING: 'En attente', REJECTED: 'Rejeté',
  ACTIVE: 'Actif', COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Non présenté',
};

function RevenueChart({ data }: { data: number[] }) {
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[#D4A72C] rounded-t-sm transition-all hover:bg-yellow-500"
            style={{ height: `${(val / max) * 100}%` }}
            title={`${val.toFixed(0)} DH`}
          />
          <span className="text-[9px] text-gray-400">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboard() {
  const [
    vehicleCount,
    publishedCount,
    activeBookings,
    pendingBookings,
    todayBookingsCount,
    allBookings,
    customerCount,
    allPayments,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { isPublished: true } }),
    prisma.booking.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
      },
    }),
    prisma.booking.findMany({
      include: { user: true, vehicle: true, payment: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.payment.findMany({ where: { status: 'PAID' } }),
  ]);

  const totalRevenue = allPayments.reduce((s, p) => s + p.amount, 0);

  // Monthly revenue for current year
  const now = new Date();
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 12 }, (_, month) => {
      const start = new Date(now.getFullYear(), month, 1);
      const end   = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      return prisma.payment.aggregate({
        where: { status: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }).then(r => r._sum.amount ?? 0);
    })
  );

  const STATS = [
    { icon: '🚗', label: 'Véhicules totaux',         value: String(vehicleCount) },
    { icon: '✅', label: 'Publiés',                  value: String(publishedCount) },
    { icon: '🔑', label: 'En location',              value: String(activeBookings) },
    { icon: '⏳', label: 'En attente',               value: String(pendingBookings) },
    { icon: '📅', label: "Réservations aujourd'hui", value: String(todayBookingsCount) },
    { icon: '👥', label: 'Clients',                  value: String(customerCount) },
    { icon: '💰', label: 'Revenus totaux',            value: `${totalRevenue.toFixed(0)} DH` },
    { icon: '📊', label: `Revenus ${now.getFullYear()}`, value: `${monthlyRevenue.reduce((a,b)=>a+b,0).toFixed(0)} DH` },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenue dans votre tableau de bord ILYMED CAR</p>
        </div>
        <Link
          href="/fr/admin/vehicles/new"
          className="bg-[#D4A72C] text-[#111827] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          ➕ Ajouter un véhicule
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-[#111827] mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#111827]">Revenus mensuels (DH)</h2>
            <span className="text-sm text-gray-400">{now.getFullYear()}</span>
          </div>
          <RevenueChart data={monthlyRevenue} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#111827] mb-4">Actions rapides</h2>
          <div className="space-y-3">
            {[
              { label: '🚗 Ajouter un véhicule',     href: '/fr/admin/vehicles/new' },
              { label: '📋 Gérer les réservations',  href: '/fr/admin/bookings' },
              { label: '👥 Voir les clients',         href: '/fr/admin/customers' },
              { label: '💳 Voir les paiements',       href: '/fr/admin/payments' },
              { label: '⭐ Modérer les avis',          href: '/fr/admin/reviews' },
              { label: '⚙️ Paramètres',               href: '/fr/admin/settings' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="block px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-[#D4A72C]/10 hover:text-[#D4A72C] text-sm text-gray-700 transition-colors"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#111827]">Réservations récentes</h2>
          <Link href="/fr/admin/bookings" className="text-sm text-[#D4A72C] hover:underline">
            Voir tout
          </Link>
        </div>
        {allBookings.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Aucune réservation pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['ID','Client','Véhicule','Dates','Montant','Paiement','Statut','Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allBookings.map(booking => {
                  const payStatus = booking.payment?.status ?? 'PENDING';
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 font-medium">{booking.user.firstName} {booking.user.lastName}</td>
                      <td className="px-6 py-4 text-gray-600">{booking.vehicle.brand} {booking.vehicle.model}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {fmt(booking.pickupDate)}<br />→ {fmt(booking.returnDate)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#111827]">{booking.totalAmount.toFixed(0)} DH</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          payStatus === 'PAID'     ? 'bg-green-100 text-green-700'
                          : payStatus === 'FAILED' ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payStatus === 'PAID' ? 'Payé' : payStatus === 'FAILED' ? 'Échoué' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[booking.status] ?? ''}`}>
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/fr/admin/bookings`} className="text-xs text-blue-600 hover:underline">Voir</Link>
                          {booking.status === 'PENDING' && (
                            <span className="text-xs text-green-600 hover:underline cursor-pointer">Confirmer</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
