import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function AdminRevenuePage() {
  try {
    await requirePermission('revenue');
  } catch {
    redirect('/fr/admin');
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: { notIn: ['CANCELLED', 'REJECTED'] },
    },
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  // Group by month
  const monthlyMap: Record<string, number> = {};
  const vehicleRevMap: Record<string, { brand: string; model: string; count: number; total: number }> = {};

  bookings.forEach(b => {
    const monthKey = new Date(b.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + b.totalAmount;

    const vKey = b.vehicleId;
    if (!vehicleRevMap[vKey]) {
      vehicleRevMap[vKey] = {
        brand: b.vehicle.brand,
        model: b.vehicle.model,
        count: 0,
        total: 0,
      };
    }
    vehicleRevMap[vKey].count += 1;
    vehicleRevMap[vKey].total += b.totalAmount;
  });

  const topVehicles = Object.values(vehicleRevMap).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Rapports de Revenus & Performance</h1>
        <p className="text-gray-500 text-sm mt-1">Analyse détaillée du chiffre d&apos;affaires généré.</p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Chiffre d&apos;Affaires Global</p>
          <p className="text-3xl font-extrabold text-[#D4A72C] mt-2">{totalRevenue.toFixed(0)} DH</p>
          <p className="text-xs text-gray-400 mt-1">Toutes réservations validées</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Revenu Moyen / Dossier</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(0) : '0'} DH
          </p>
          <p className="text-xs text-gray-400 mt-1">Panier moyen</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Véhicules Rentabilisés</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{topVehicles.length}</p>
          <p className="text-xs text-gray-400 mt-1">Ayant généré des locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Revenus par Période</h2>
          <div className="space-y-3">
            {Object.entries(monthlyMap).map(([month, amount]) => {
              const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
              return (
                <div key={month}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-700">{month}</span>
                    <span className="text-[#D4A72C] font-bold">{amount.toFixed(0)} DH</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D4A72C] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(monthlyMap).length === 0 && (
              <p className="text-xs text-gray-400 italic">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Top Generating Vehicles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Top Véhicules par Rentabilité</h2>
          <div className="divide-y divide-gray-50">
            {topVehicles.map((v, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold flex items-center justify-center text-gray-600">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-xs text-gray-900">{v.brand} {v.model}</p>
                    <p className="text-[11px] text-gray-400">{v.count} location(s)</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#111827]">{v.total.toFixed(0)} DH</span>
              </div>
            ))}
            {topVehicles.length === 0 && (
              <p className="text-xs text-gray-400 italic">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
