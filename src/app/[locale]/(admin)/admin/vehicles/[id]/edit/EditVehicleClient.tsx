'use client';

import React, { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateVehicle } from '@/app/actions/admin';

type Category = { id: string; nameFr: string; nameAr: string };
type Vehicle = {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  registration: string;
  vin: string | null;
  mileage: number;
  color: string;
  categoryId: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  horsepower: number | null;
  descriptionFr: string;
  descriptionAr: string;
  dailyPrice: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  weekendPrice: number | null;
  securityDeposit: number;
  deliveryFee: number;
  isPublished: boolean;
  instantBooking: boolean;
  images?: { url: string; isPrimary: boolean }[];
};

interface Props {
  vehicle: Vehicle;
  categories: Category[];
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-base font-bold text-[#111827] border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, name, type = 'text', defaultValue, required, placeholder,
}: {
  label: string; name: string; type?: string; defaultValue?: string;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
      />
    </div>
  );
}

function PublishOption({
  name, value, label, checked,
}: {
  name: string; value: string; label: string; checked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="accent-[#D4A72C]"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

// ─── Image entry: can be a URL string or a File to be uploaded ────────────────
interface ImageEntry {
  preview: string;      // what the browser shows (blob:// for files, https:// for urls)
  value: string;        // what gets sent to server (https:// url or base64 data URI)
  isLocal: boolean;     // true = came from local file input
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EditVehicleClient({ vehicle, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // imageEntries holds all images (existing + newly added)
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>(
    (vehicle.images || []).map(img => ({
      preview: img.url,
      value: img.url,
      isLocal: false,
    }))
  );
  const initialPrimary = vehicle.images?.findIndex(img => img.isPrimary) ?? 0;
  const [primaryIdx, setPrimaryIdx] = useState(Math.max(0, initialPrimary));

  // Handle local file selection → convert to base64 data URIs
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const newEntries: ImageEntry[] = await Promise.all(
        files.map(async file => ({
          preview: URL.createObjectURL(file),
          value: await fileToDataUri(file),  // base64 for server
          isLocal: true,
        }))
      );
      setImageEntries(prev => [...prev, ...newEntries]);
    } finally {
      setUploading(false);
      // reset input so the same file can be selected again
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Handle URL input
  const handleAddImageUrl = () => {
    const url = prompt("Entrez l'URL complète de l'image (https://...):");
    if (!url || !url.startsWith('http')) {
      if (url) alert("L'URL doit commencer par https://");
      return;
    }
    setImageEntries(prev => [...prev, { preview: url, value: url, isLocal: false }]);
  };

  // Remove an image
  const removeImage = (idx: number) => {
    setImageEntries(prev => prev.filter((_, j) => j !== idx));
    if (primaryIdx >= idx && primaryIdx > 0) {
      setPrimaryIdx(p => p - 1);
    } else if (primaryIdx === idx) {
      setPrimaryIdx(0);
    }
  };

  async function handleSubmit(formData: FormData) {
    setError('');
    setSuccess('');

    // Build imageUrl list from our entries (values, not previews)
    const urlsToSend = imageEntries.map(e => e.value);
    urlsToSend.forEach(url => formData.append('imageUrl', url));
    formData.set('primaryImageIdx', String(primaryIdx));

    startTransition(async () => {
      try {
        await updateVehicle(vehicle.id, formData);
        setSuccess('✅ Véhicule mis à jour avec succès !');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Modifier — {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Mettez à jour les informations du véhicule.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/fr/admin/vehicles')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit}>
        {/* A – Informations de base */}
        <Section title="A. Informations de base">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Marque" name="brand" defaultValue={vehicle.brand} required />
            <Field label="Modèle" name="model" defaultValue={vehicle.model} required />
            <Field label="Version" name="version" defaultValue={vehicle.version ?? ''} />
            <Field label="Année" name="year" type="number" defaultValue={String(vehicle.year)} required />
            <Field label="Kilométrage" name="mileage" type="number" defaultValue={String(vehicle.mileage)} required />
            <Field label="Couleur" name="color" defaultValue={vehicle.color} required />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
              <select
                name="categoryId"
                defaultValue={vehicle.categoryId}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameFr}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* B – Spécifications */}
        <Section title="B. Spécifications techniques">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
              <select name="transmission" defaultValue={vehicle.transmission}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none">
                <option value="AUTOMATIC">Automatique</option>
                <option value="MANUAL">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Carburant</label>
              <select name="fuel" defaultValue={vehicle.fuel}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none">
                <option value="PETROL">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybride</option>
                <option value="ELECTRIC">Électrique</option>
              </select>
            </div>
            <Field label="Nombre de places" name="seats" type="number" defaultValue={String(vehicle.seats)} required />
            <Field label="Nombre de portes" name="doors" type="number" defaultValue={String(vehicle.doors)} required />
            <Field label="Puissance (cv)" name="horsepower" type="number" defaultValue={vehicle.horsepower ? String(vehicle.horsepower) : ''} />
          </div>
        </Section>

        {/* C – Description */}
        <Section title="C. Description">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Français)</label>
              <textarea name="descriptionFr" rows={5} defaultValue={vehicle.descriptionFr}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (العربية)</label>
              <textarea name="descriptionAr" rows={5} dir="rtl" defaultValue={vehicle.descriptionAr}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none resize-none" />
            </div>
          </div>
        </Section>

        {/* D – Tarification */}
        <Section title="D. Tarification">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Prix / jour (DH)" name="dailyPrice" type="number" defaultValue={String(vehicle.dailyPrice)} required />
            <Field label="Prix / semaine (DH)" name="weeklyPrice" type="number" defaultValue={vehicle.weeklyPrice ? String(vehicle.weeklyPrice) : ''} />
            <Field label="Prix / mois (DH)" name="monthlyPrice" type="number" defaultValue={vehicle.monthlyPrice ? String(vehicle.monthlyPrice) : ''} />
            <Field label="Prix week-end (DH)" name="weekendPrice" type="number" defaultValue={vehicle.weekendPrice ? String(vehicle.weekendPrice) : ''} />
            <Field label="Caution (DH)" name="securityDeposit" type="number" defaultValue={String(vehicle.securityDeposit)} required />
            <Field label="Frais de livraison (DH)" name="deliveryFee" type="number" defaultValue={String(vehicle.deliveryFee)} />
          </div>
        </Section>

        {/* E – Statut */}
        <Section title="E. Statut de publication">
          <div className="flex gap-3 flex-wrap">
            <PublishOption name="isPublished" value="PUBLISHED" label="✅ Publié" checked={vehicle.isPublished} />
            <PublishOption name="isPublished" value="DRAFT" label="📝 Brouillon" checked={!vehicle.isPublished} />
          </div>
        </Section>

        {/* F – Photos */}
        <Section title="F. Photos du véhicule">
          <p className="text-xs text-gray-500 mb-3">
            Ajoutez des photos depuis votre appareil ou via une URL.
            La photo marquée <strong>★ Principale</strong> sera l&apos;image de couverture.
          </p>

          <div className="flex gap-3 mb-4 flex-wrap">
            {/* File picker */}
            <div
              className={`flex-1 min-w-[220px] border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'border-amber-300 bg-amber-50' : 'border-gray-300 hover:border-[#D4A72C]'}`}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              <div className="text-4xl mb-3">{uploading ? '⏳' : '📸'}</div>
              <p className="font-semibold text-gray-700 text-sm">
                {uploading ? 'Chargement en cours...' : 'Cliquez pour choisir des photos'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Plusieurs fichiers acceptés</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImages}
                disabled={uploading}
              />
            </div>

            {/* URL button */}
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="self-center px-4 py-3 border border-[#D4A72C] text-[#D4A72C] rounded-xl text-sm font-medium hover:bg-[#D4A72C]/10 flex items-center gap-2 transition-colors"
            >
              <span>🔗</span>
              <span>Ajouter une URL</span>
            </button>
          </div>

          {/* Preview grid */}
          {imageEntries.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {imageEntries.map((entry, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${i === primaryIdx ? 'border-[#D4A72C] shadow-lg' : 'border-transparent'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.preview}
                    alt={`Aperçu ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Controls overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                    <button
                      type="button"
                      onClick={() => setPrimaryIdx(i)}
                      className={`text-[11px] px-2 py-0.5 rounded font-bold w-full text-center ${i === primaryIdx ? 'bg-[#D4A72C] text-[#111827]' : 'bg-white/80 text-gray-800 hover:bg-[#D4A72C] hover:text-[#111827]'}`}
                    >
                      {i === primaryIdx ? '★ Principale' : '☆ Principale'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-[11px] px-2 py-0.5 rounded font-bold w-full text-center bg-red-500 text-white hover:bg-red-600"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                  {/* Primary badge */}
                  {i === primaryIdx && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#D4A72C] text-[10px] text-center font-bold text-[#111827] py-0.5">
                      Principale
                    </div>
                  )}
                  {/* New badge */}
                  {entry.isLocal && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-[9px] text-white font-bold px-1 rounded">
                      NEW
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              Aucune photo pour ce véhicule — ajoutez-en ci-dessus.
            </div>
          )}

          {imageEntries.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {imageEntries.length} photo(s) · survolez une image pour gérer
            </p>
          )}
        </Section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-8 mt-2">
          <button
            type="button"
            onClick={() => router.push('/fr/admin/vehicles')}
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || uploading}
            className="px-8 py-3 bg-[#D4A72C] text-[#111827] rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin inline-block" />
                <span>Enregistrement...</span>
              </>
            ) : (
              '💾 Sauvegarder les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
