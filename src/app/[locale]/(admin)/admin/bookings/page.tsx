import prisma from '@/lib/db';
import { confirmBooking, rejectBooking, cancelBooking } from '@/app/actions/admin';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);

const STATUSES: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmé',   color: 'bg-green-100 text-green-700'  },
  PENDING:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE:    { label: 'En cours',   color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Terminé',    color: 'bg-blue-100 text-blue-700'    },
  CANCELLED: { label: 'Annulé',     color: 'bg-red-100 text-red-700'      },
  REJECTED:  { label: 'Rejeté',     color: 'bg-gray-100 text-gray-600'    },
  NO_SHOW:   { label: 'Non présenté', color: 'bg-orange-100 text-orange-700' },
};

const PAY: Record<string, { label: string; color: string }> = {
  PAID:     { label: 'Payé',        color: 'bg-green-100 text-green-700'  },
  PENDING:  { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  FAILED:   { label: 'Échoué',      color: 'bg-red-100 text-red-700'      },
  REFUNDED: { label: 'Remboursé',   color: 'bg-blue-100 text-blue-700'    },
};

const STATUS_FILTERS = [
  { label: 'Toutes',      status: null        },
  { label: 'En attente',  status: 'PENDING'   },
  { label: 'Confirmées',  status: 'CONFIRMED' },
  { label: 'En cours',    status: 'ACTIVE'    },
  { label: 'Terminées',   status: 'COMPLETED' },
  { label: 'Annulées',    status: 'CANCELLED' },
];

export default async function AdminBookingsPage(props: {
  searchParams?: Promise<{ status?: string }>;
}) {
  try {
    await requirePermission('bookings');
  } catch {
    redirect('/fr/admin');
  }

  const searchParams = props.searchParams ? await props.searchParams : {};
  const activeStatus = searchParams?.status ?? null;

  const bookings = await prisma.booking.findMany({
    where: activeStatus ? { status: activeStatus as any } : {},
    include: { user: true, vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Count per status for tab badges
  const allCounts = await prisma.booking.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  const totalCount = await prisma.booking.count();

  const counts: Record<string, number> = {};
  for (const entry of allCounts) {
    counts[entry.status] = entry._count._all;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} réservation(s) affichée(s)</p>
        </div>
      </div>

      {/* Filter tabs with per-status counts */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((tab) => {
          const count = tab.status ? (counts[tab.status] ?? 0) : totalCount;
          const isActive = activeStatus === tab.status;
          const href = tab.status ? `/fr/admin/bookings?status=${tab.status}` : '/fr/admin/bookings';
          return (
            <a
              key={tab.label}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#111827] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4A72C] hover:text-[#D4A72C]'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Réservation</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Dates</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Paiement</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>Aucune réservation pour ce filtre.</p>
                  </td>
                </tr>
              ) : (
                bookings.map(b => {
                  const payStatus  = b.payment?.status ?? 'PENDING';
                  const payInfo    = PAY[payStatus]     ?? PAY.PENDING;
                  const statusInfo = STATUSES[b.status] ?? STATUSES.PENDING;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{b.bookingNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#111827]">{b.user.firstName} {b.user.lastName}</p>
                        <p className="text-xs text-gray-400">{b.user.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {b.vehicle.brand} {b.vehicle.model}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {fmt(b.pickupDate)}<br />→ {fmt(b.returnDate)}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#111827]">
                        {b.totalAmount.toFixed(0)} DH
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${payInfo.color}`}>
                          {payInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {b.status === 'PENDING' && (
                            <>
                              <form action={confirmBooking.bind(null, b.id)}>
                                <button
                                  type="submit"
                                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg font-medium transition-colors"
                                >
                                  ✓ Confirmer
                                </button>
                              </form>
                              <form action={rejectBooking.bind(null, b.id)}>
                                <button
                                  type="submit"
                                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg font-medium transition-colors"
                                >
                                  ✗ Rejeter
                                </button>
                              </form>
                            </>
                          )}
                          {(b.status === 'CONFIRMED' || b.status === 'ACTIVE') && (
                            <form action={cancelBooking.bind(null, b.id)}>
                              <button
                                type="submit"
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg font-medium transition-colors"
                              >
                                Annuler
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
