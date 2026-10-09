import prisma from '@/lib/db';
import Link from 'next/link';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function AdminCalendarPage() {
  try {
    await requirePermission('calendar');
  } catch {
    redirect('/fr/admin');
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { isPublished: true },
    include: {
      bookings: {
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
        },
        include: { user: true },
      },
    },
    orderBy: { brand: 'asc' },
  });

  // Next 14 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const fmtDay = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(d);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Calendrier & Planning des Véhicules</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vision globale de la flotte et des réservations sur les 14 prochains jours.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Disponible</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> En cours / Confirmé</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> En attente</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3.5 text-left font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 z-10 shadow-sm">
                Véhicule
              </th>
              {days.map((day, idx) => (
                <th key={idx} className="px-2 py-3.5 text-center font-semibold text-gray-600 border-l border-gray-100 min-w-[65px]">
                  {fmtDay(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-white z-10 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span>🚗</span>
                    <span className="truncate max-w-[140px]">{v.brand} {v.model}</span>
                  </div>
                </td>
                {days.map((day, idx) => {
                  const dayTime = day.getTime();
                  // Check booking overlap
                  const activeBooking = v.bookings.find(b => {
                    const p = new Date(b.pickupDate).setHours(0,0,0,0);
                    const r = new Date(b.returnDate).setHours(23,59,59,999);
                    return dayTime >= p && dayTime <= r;
                  });

                  return (
                    <td key={idx} className="px-1 py-2 text-center border-l border-gray-100">
                      {activeBooking ? (
                        <div
                          title={`${activeBooking.user.firstName} ${activeBooking.user.lastName} (${activeBooking.status})`}
                          className={`py-1.5 px-1 rounded font-semibold text-[10px] text-white truncate ${
                            activeBooking.status === 'CONFIRMED' || activeBooking.status === 'ACTIVE'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        >
                          {activeBooking.user.firstName[0]}. {activeBooking.user.lastName}
                        </div>
                      ) : (
                        <span className="text-gray-300">―</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
