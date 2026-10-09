import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);

export default async function AdminPaymentsPage() {
  try {
    await requirePermission('payments');
  } catch {
    redirect('/fr/admin');
  }

  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      vehicle: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCollected = bookings.reduce((sum, b) => {
    return b.payment?.status === 'PAID' ? sum + (b.payment.amount ?? b.totalAmount) : sum;
  }, 0);

  const pendingAmount = bookings.reduce((sum, b) => {
    return b.payment?.status !== 'PAID' && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
      ? sum + b.totalAmount
      : sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Paiements & Encaissements</h1>
          <p className="text-gray-500 text-sm mt-1">Historique des transactions et règlements clients.</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Encaissé</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{totalCollected.toFixed(0)} DH</p>
          <p className="text-xs text-gray-400 mt-1">Transactions validées</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">En attente de paiement</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">{pendingAmount.toFixed(0)} DH</p>
          <p className="text-xs text-gray-400 mt-1">À régler à la prise en charge</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Volume transactions</p>
          <p className="text-2xl font-bold text-[#111827] mt-2">{bookings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Dossiers traités</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Référence Dossier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Mode de paiement</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map(b => {
              const isPaid = b.payment?.status === 'PAID';
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {b.bookingNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{b.user.firstName} {b.user.lastName}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {b.vehicle.brand} {b.vehicle.model}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111827]">
                    {b.totalAmount.toFixed(0)} DH
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {b.payment?.paymentMethod || 'Sur place / Espèces ou Carte'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {isPaid ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {fmt(b.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
