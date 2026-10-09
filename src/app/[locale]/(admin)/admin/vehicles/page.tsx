import Link from 'next/link';
import prisma from '@/lib/db';
import { publishVehicle, unpublishVehicle, deleteVehicle } from '@/app/actions/admin';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PUBLISHED:   { label: 'Publié',      color: 'bg-green-100 text-green-700'   },
  DRAFT:       { label: 'Brouillon',   color: 'bg-gray-100 text-gray-600'     },
};

export default async function AdminVehiclesPage() {
  try {
    await requirePermission('vehicles');
  } catch {
    redirect('/fr/admin');
  }

  const vehicles = await prisma.vehicle.findMany({
    include: {
      images:   { where: { isPrimary: true }, take: 1 },
      category: true,
      _count:   { select: { bookings: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion des véhicules</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} véhicules au total</p>
        </div>
        <Link
          href="/fr/admin/vehicles/new"
          className="bg-[#D4A72C] text-[#111827] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          ➕ Ajouter un véhicule
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Rechercher un véhicule..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 min-w-48 focus:ring-2 focus:ring-[#D4A72C] outline-none"
        />
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none">
          <option>Toutes les marques</option>
          {[...new Set(vehicles.map(v => v.brand))].map(brand => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none">
          <option>Toutes les catégories</option>
          {[...new Set(vehicles.map(v => v.category?.nameFr).filter(Boolean))].map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Catgorie</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Prix/jour</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Réservations</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-3xl mb-2">🚗</p>
                    <p>Aucun véhicule. <Link href="/fr/admin/vehicles/new" className="text-[#D4A72C] hover:underline">Ajouter le premier.</Link></p>
                  </td>
                </tr>
              ) : (
                vehicles.map(v => {
                  const statusKey = v.isPublished ? 'PUBLISHED' : 'DRAFT';
                  const s = STATUS_CONFIG[statusKey];
                  const primaryImage = v.images[0]?.url ?? null;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={`${v.brand} ${v.model}`}
                              className="w-12 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
                              🚗
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#111827]">{v.brand} {v.model}</p>
                            <p className="text-xs text-gray-400">{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{v.category?.nameFr ?? '—'}</td>
                      <td className="px-6 py-4 font-semibold text-[#D4A72C]">{v.dailyPrice} DH</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{v._count.bookings}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/fr/vehicles/${v.id}`}
                            target="_blank"
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg"
                          >
                            👁 Voir
                          </Link>
                          <Link
                            href={`/fr/admin/vehicles/${v.id}/edit`}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg"
                          >
                            ✏️ Modifier
                          </Link>
                          {v.isPublished ? (
                            <form action={unpublishVehicle.bind(null, v.id)}>
                              <button
                                type="submit"
                                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded-lg transition-colors"
                              >
                                ⏸ Dépublier
                              </button>
                            </form>
                          ) : (
                            <form action={publishVehicle.bind(null, v.id)}>
                              <button
                                type="submit"
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-colors"
                              >
                                ✓ Publier
                              </button>
                            </form>
                          )}
                          <form action={deleteVehicle.bind(null, v.id)}>
                            <button
                              type="submit"
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg transition-colors"
                            >
                              🗑 Supprimer
                            </button>
                          </form>
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
