import prisma from '@/lib/db';
import { approveReview, rejectReview, deleteReview } from '@/app/actions/admin';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#D4A72C] text-base tracking-tight" aria-label={`${rating} étoiles sur 5`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'☆'.repeat(5 - rating)}</span>
    </span>
  );
}

export default async function AdminReviewsPage(props: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  try {
    await requirePermission('reviews');
  } catch {
    redirect('/fr/admin');
  }

  const searchParams = props.searchParams ? await props.searchParams : {};
  const activeFilter = searchParams?.filter ?? 'all';

  const reviews = await prisma.review.findMany({
    where:
      activeFilter === 'pending'
        ? { isApproved: false }
        : activeFilter === 'approved'
        ? { isApproved: true }
        : {},
    include: { user: true, vehicle: true },
    orderBy: { createdAt: 'desc' },
  });

  const approvedCount = await prisma.review.count({ where: { isApproved: true } });
  const pendingCount  = await prisma.review.count({ where: { isApproved: false } });
  const totalCount    = approvedCount + pendingCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Avis clients</h1>
          <p className="text-gray-500 text-sm mt-1">{reviews.length} avis affiché(s)</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-green-600 font-medium">Approuvés</p>
            <p className="text-lg font-bold text-green-700">{approvedCount}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-yellow-600 font-medium">En attente</p>
            <p className="text-lg font-bold text-yellow-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { label: 'Tous',       filter: 'all',      count: totalCount    },
          { label: 'En attente', filter: 'pending',  count: pendingCount  },
          { label: 'Approuvés',  filter: 'approved', count: approvedCount },
        ].map(tab => (
          <a
            key={tab.filter}
            href={`/fr/admin/reviews?filter=${tab.filter}`}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeFilter === tab.filter
                ? 'bg-[#111827] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4A72C] hover:text-[#D4A72C]'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              activeFilter === tab.filter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Commentaire</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="font-medium">Aucun avis pour ce filtre</p>
                  </td>
                </tr>
              ) : (
                reviews.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#D4A72C] rounded-full flex items-center justify-center text-[#111827] font-bold text-sm flex-shrink-0">
                          {r.user.firstName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827] whitespace-nowrap">
                            {r.user.firstName} {r.user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{r.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Véhicule */}
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      {r.vehicle.brand} {r.vehicle.model}
                    </td>

                    {/* Note */}
                    <td className="px-5 py-4">
                      <Stars rating={r.rating} />
                      <p className="text-xs text-gray-400 mt-0.5">{r.rating}/5</p>
                    </td>

                    {/* Commentaire */}
                    <td className="px-5 py-4 max-w-xs">
                      {r.comment ? (
                        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{r.comment}</p>
                      ) : (
                        <span className="text-gray-300 italic text-xs">Aucun commentaire</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {fmt(r.createdAt)}
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      {r.isApproved ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                          Approuvé
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          En attente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {!r.isApproved && (
                          <form action={approveReview.bind(null, r.id)}>
                            <button
                              type="submit"
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              ✓ Approuver
                            </button>
                          </form>
                        )}
                        {r.isApproved && (
                          <form action={rejectReview.bind(null, r.id)}>
                            <button
                              type="submit"
                              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              ✗ Rejeter
                            </button>
                          </form>
                        )}
                        <form action={deleteReview.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            onClick={e => {
                              if (!confirm('Supprimer cet avis définitivement ?')) e.preventDefault();
                            }}
                          >
                            🗑 Supprimer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
