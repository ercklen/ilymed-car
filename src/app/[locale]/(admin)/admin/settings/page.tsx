'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user && (session.user as any).role !== 'ADMIN') {
    router.push('/fr/admin');
    return null;
  }

  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-2">Paramètres</h1>
      <p className="text-gray-500 mb-8">Gérez la configuration générale de ILYMED CAR.</p>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✅ Paramètres sauvegardés avec succès.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-5 flex items-center gap-2">
            🏢 Informations de l&apos;entreprise
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de l&apos;entreprise</label>
              <input
                type="text"
                defaultValue="ILYMED CAR"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gérant</label>
              <input
                type="text"
                defaultValue="Rida Youness"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone 1</label>
                <input
                  type="tel"
                  defaultValue="06 55 51 80 01"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone 2</label>
                <input
                  type="tel"
                  defaultValue="07 68 03 92 04"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email de contact</label>
              <input
                type="email"
                defaultValue="contact@ilymedcar.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-5 flex items-center gap-2">
            📅 Réservations
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Réservation instantanée</p>
                <p className="text-xs text-gray-500 mt-0.5">Les clients peuvent réserver sans confirmation manuelle</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A72C]"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Durée minimale de location (jours)</label>
              <input
                type="number"
                min={1}
                defaultValue={1}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Frais de service (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Admin Account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-5 flex items-center gap-2">
            🔐 Compte administrateur
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email admin</label>
              <input
                type="email"
                defaultValue="admin@ilymedcar.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition-colors"
          >
            Sauvegarder les paramètres
          </button>
        </div>
      </form>
    </div>
  );
}
