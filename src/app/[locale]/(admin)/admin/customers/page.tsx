import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);

export default async function AdminCustomersPage() {
  try {
    await requirePermission('customers');
  } catch {
    redirect('/fr/admin');
  }

  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      bookings: { include: { payment: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const customers = users.map(u => {
    const totalSpent = u.bookings.reduce((sum, booking) => {
      if (booking.payment?.status === 'PAID') {
        return sum + (booking.payment.amount ?? 0);
      }
      return sum;
    }, 0);

    return {
      id:         u.id,
      name:       `${u.firstName} ${u.lastName}`,
      email:      u.email,
      phone:      u.phone ?? '—',
      bookings:   u._count.bookings,
      totalSpent,
      joined:     fmt(u.createdAt),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} clients inscrits</p>
        </div>
        <input
          type="text"
          placeholder="🔍 Rechercher un client..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 focus:ring-2 focus:ring-[#D4A72C] outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Réservations</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total dépensé</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#D4A72C] rounded-full flex items-center justify-center text-[#111827] font-bold text-sm flex-shrink-0">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                <td className="px-6 py-4 font-semibold">{c.bookings}</td>
                <td className="px-6 py-4 font-bold text-[#D4A72C]">
                  {c.totalSpent > 0 ? `${c.totalSpent.toFixed(0)} DH` : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    Actif
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">{c.joined}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg">
                      Voir
                    </button>
                    <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg">
                      Suspendre
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
