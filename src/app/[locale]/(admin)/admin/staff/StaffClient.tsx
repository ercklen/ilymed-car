'use client';

import { useState, useTransition } from 'react';
import { createStaffMember, updateStaffMember, deleteStaffMember } from '@/app/actions/staff';

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  staffPermissions: string | null;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'vehicles',  label: '🚗 Gestion des véhicules', desc: 'Consulter, ajouter et modifier les voitures' },
  { id: 'bookings',  label: '📅 Gestion des réservations', desc: 'Confirmer, annuler ou modifier les réservations' },
  { id: 'calendar',  label: '🗓️ Calendrier des disponibilités', desc: 'Consulter le planning des véhicules' },
  { id: 'customers', label: '👥 Gestion des clients', desc: 'Consulter la liste et les détails des clients' },
  { id: 'payments',  label: '💳 Gestion des paiements', desc: 'Consulter les encaissements et transactions' },
  { id: 'revenue',   label: '📈 Suivi des revenus', desc: 'Accès aux statistiques financières et graphiques' },
  { id: 'reviews',   label: '⭐ Gestion des avis', desc: 'Modérer et approuver les avis clients' },
  { id: 'messages',  label: '✉️ Boîte de réception', desc: 'Lire et répondre aux messages de contact' },
];

export default function StaffClient({ staffUsers }: { staffUsers: StaffUser[] }) {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  const [selectedRole, setSelectedRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const openCreateModal = () => {
    setEditingUser(null);
    setSelectedRole('STAFF');
    setSelectedPerms(['vehicles', 'bookings', 'calendar']);
    setError('');
    setModalMode('create');
  };

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setSelectedRole((user.role === 'ADMIN' ? 'ADMIN' : 'STAFF'));
    const perms = user.staffPermissions ? user.staffPermissions.split(',').map(p => p.trim()) : [];
    setSelectedPerms(perms);
    setError('');
    setModalMode('edit');
  };

  const togglePerm = (id: string) => {
    setSelectedPerms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    form.set('role', selectedRole);
    selectedPerms.forEach(p => form.append('permissions', p));

    startTransition(async () => {
      try {
        if (modalMode === 'create') {
          await createStaffMember(form);
        } else if (modalMode === 'edit' && editingUser) {
          await updateStaffMember(editingUser.id, form);
        }
        setModalMode(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le membre ${name} ?`)) return;
    startTransition(async () => {
      try {
        await deleteStaffMember(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Erreur');
      }
    });
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Équipe & Permissions (Staff)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez les comptes collaborateurs, modifiez leurs rôles et définissez précisément leurs autorisations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#D4A72C] text-[#111827] font-bold px-4 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2 self-start sm:self-auto text-sm shadow-sm"
        >
          <span>➕</span>
          <span>Ajouter un membre</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Collaborateur</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Permissions accordées</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staffUsers.map(user => {
              const userPerms = user.staffPermissions ? user.staffPermissions.split(',') : [];
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${user.role === 'ADMIN' ? 'bg-[#D4A72C] text-[#111827]' : 'bg-blue-600 text-white'}`}>
                        {user.firstName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827]">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'ADMIN' ? (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        ⭐ Accès Administrateur Total
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {userPerms.map(p => {
                          const info = AVAILABLE_PERMISSIONS.find(item => item.id === p);
                          return (
                            <span key={p} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {info ? info.label.split(' ')[0] + ' ' + p : p}
                            </span>
                          );
                        })}
                        {userPerms.length === 0 && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded italic">
                            Aucune permission accordée
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                      >
                        ✏️ Modifier
                      </button>
                      {user.email !== 'admin@ilymedcar.com' && (
                        <button
                          onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal - Create or Edit Staff */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#111827]">
                {modalMode === 'create' ? 'Nouveau compte collaborateur' : `Modifier : ${editingUser?.firstName} ${editingUser?.lastName}`}
              </h2>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    defaultValue={editingUser?.firstName || ''}
                    placeholder="Ex: Youssef"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    defaultValue={editingUser?.lastName || ''}
                    placeholder="Ex: Alami"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email professionnel {modalMode === 'edit' && '(Non modifiable)'}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={modalMode === 'edit'}
                  defaultValue={editingUser?.email || ''}
                  placeholder="collaborateur@ilymedcar.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C] disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingUser?.phone || ''}
                    placeholder="06 12 34 56 78"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {modalMode === 'create' ? 'Mot de passe *' : 'Nouveau mot de passe (optionnel)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={modalMode === 'create'}
                    placeholder={modalMode === 'create' ? 'Min. 8 caractères' : 'Laisser vide pour conserver'}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D4A72C]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Type de rôle</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedRole('STAFF')}
                    className={`border rounded-xl p-3 cursor-pointer flex flex-col gap-1 transition ${selectedRole === 'STAFF' ? 'border-[#D4A72C] bg-amber-50/50 ring-1 ring-[#D4A72C]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-sm text-[#111827]">👤 Staff (Personnalisé)</span>
                    <span className="text-xs text-gray-500">Accès restreint aux modules cochés ci-dessous.</span>
                  </div>
                  <div
                    onClick={() => setSelectedRole('ADMIN')}
                    className={`border rounded-xl p-3 cursor-pointer flex flex-col gap-1 transition ${selectedRole === 'ADMIN' ? 'border-[#D4A72C] bg-amber-50/50 ring-1 ring-[#D4A72C]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-sm text-[#111827]">⭐ Administrateur</span>
                    <span className="text-xs text-gray-500">Accès total à tous les modules sans restriction.</span>
                  </div>
                </div>
              </div>

              {/* Permissions list (if STAFF) */}
              {selectedRole === 'STAFF' && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-gray-800">
                      Permissions & Modules autorisés :
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPerms(AVAILABLE_PERMISSIONS.map(p => p.id))}
                        className="text-[11px] text-[#D4A72C] font-semibold hover:underline"
                      >
                        Tout cocher
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPerms([])}
                        className="text-[11px] text-gray-500 hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {AVAILABLE_PERMISSIONS.map(p => (
                      <label key={p.id} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(p.id)}
                          onChange={() => togglePerm(p.id)}
                          className="mt-0.5 rounded accent-[#D4A72C]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{p.label}</p>
                          <p className="text-[11px] text-gray-500">{p.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#111827] text-white px-5 py-2 text-sm rounded-xl font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Enregistrement...' : modalMode === 'create' ? 'Créer le compte' : 'Sauvegarder les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
