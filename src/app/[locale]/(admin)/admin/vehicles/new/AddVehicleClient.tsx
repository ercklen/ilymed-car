'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createVehicle } from '@/app/actions/admin';

const FEATURES = [
  'Climatisation', 'Bluetooth', 'GPS', 'USB', 'Apple CarPlay', 'Android Auto',
  'Régulateur de vitesse', 'Capteurs de stationnement', 'Caméra de recul',
  'Toit ouvrant', 'Sièges en cuir', 'Siège enfant', 'Wi-Fi',
];

interface ImageEntry {
  preview: string;   // blob:// or https:// for display
  value: string;     // base64 data URI or https:// for server
  isLocal: boolean;
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddVehicleClient({ categories }: { categories: { id: string; nameFr: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [publishStatus, setPublishStatus] = useState('PUBLISHED');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleFeature = (f: string) =>
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const newEntries: ImageEntry[] = await Promise.all(
        files.map(async file => ({
          preview: URL.createObjectURL(file),
          value: await fileToDataUri(file),
          isLocal: true,
        }))
      );
      setImageEntries(prev => [...prev, ...newEntries]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt("Entrez l'URL complète de l'image (https://...):");
    if (!url) return;
    if (!url.startsWith('http')) {
      alert("L'URL doit commencer par https://");
      return;
    }
    setImageEntries(prev => [...prev, { preview: url, value: url, isLocal: false }]);
  };

  const removeImage = (idx: number) => {
    setImageEntries(prev => prev.filter((_, j) => j !== idx));
    if (primaryIdx >= idx && primaryIdx > 0) setPrimaryIdx(p => p - 1);
    else if (primaryIdx === idx) setPrimaryIdx(0);
  };

  async function handleSubmit(formData: FormData) {
    setError('');
    formData.set('isPublished', publishStatus);
    // Send the real values (base64 or https urls), NOT blob URLs
    imageEntries.forEach(entry => formData.append('imageUrl', entry.value));
    formData.set('primaryImageIdx', String(primaryIdx));

    startTransition(async () => {
      try {
        const vehicleId = await createVehicle(formData);
        router.push(`/fr/admin/vehicles/${vehicleId}/edit`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Ajouter un véhicule</h1>
          <p className="text-gray-500 text-sm mt-1">Remplissez tous les champs pour publier votre véhicule.</p>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit}>
        {/* A – Basic Info */}
        <Section title="A. Informations de base">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Marque *" name="brand" placeholder="BMW" required />
            <Field label="Modle *" name="model" placeholder="Série 3" required />
            <Field label="Version" name="version" placeholder="320i" />
            <Field label="Année *" name="year" type="number" placeholder="2024" required />
            <Field label="Immatriculation *" name="registration" placeholder="AB-123-CD" required />
            <Field label="VIN" name="vin" placeholder="WBA..." />
            <Field label="Kilométrage *" name="mileage" type="number" placeholder="15000" required />
            <Field label="Couleur *" name="color" placeholder="Noir" required />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catgorie *</label>
              <select
                name="categoryId"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
              >
                <option value="">-- Choisir une catégorie --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameFr}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* B – Specs */}
        <Section title="B. Spécifications techniques">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission *</label>
              <select
                name="transmission"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
              >
                <option value="AUTOMATIC">Automatique</option>
                <option value="MANUAL">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Carburant *</label>
              <select
                name="fuel"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
              >
                <option value="PETROL">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybride</option>
                <option value="ELECTRIC">Électrique</option>
              </select>
            </div>
            <Field label="Nombre de places *" name="seats" type="number" placeholder="5" required />
            <Field label="Nombre de portes *" name="doors" type="number" placeholder="4" required />
            <Field label="Puissance (cv)" name="horsepower" type="number" placeholder="184" />
          </div>
        </Section>

        {/* C – Description */}
        <Section title="C. Description">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Français) *</label>
              <textarea
                name="descriptionFr"
                rows={5}
                required
                placeholder="Décrivez le véhicule en français..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (العربية) *</label>
              <textarea
                name="descriptionAr"
                rows={5}
                required
                dir="rtl"
                placeholder="اكتب وصف السيارة باللغة العربية..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none resize-none"
              />
            </div>
          </div>
        </Section>

        {/* D – Pricing */}
        <Section title="D. Tarification">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Prix / jour (DH) *" name="dailyPrice" type="number" placeholder="120" required />
            <Field label="Prix / semaine (DH)" name="weeklyPrice" type="number" placeholder="700" />
            <Field label="Prix / mois (DH)" name="monthlyPrice" type="number" placeholder="2400" />
            <Field label="Prix week-end (DH)" name="weekendPrice" type="number" placeholder="150" />
            <Field label="Caution (DH) *" name="securityDeposit" type="number" placeholder="500" required />
            <Field label="Frais de livraison (DH)" name="deliveryFee" type="number" placeholder="0" />
          </div>
        </Section>

        {/* E – Location */}
        <Section title="E. Localisation">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Pays *" name="country" placeholder="Maroc" defaultValue="Maroc" required />
            <Field label="Ville *" name="city" placeholder="Casablanca" defaultValue="Casablanca" required />
            <Field label="Adresse" name="address" placeholder="Aéroport Mohammed V / Centre-ville" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Field label="Nom du lieu (FR)" name="locationNameFr" placeholder="Casablanca Centre" />
            <Field label="اسم الموقع (AR)" name="locationNameAr" placeholder="وسط الدار البيضاء" />
          </div>
        </Section>

        {/* F – Images */}
        <Section title="F. Photos du véhicule">
          <p className="text-xs text-gray-500 mb-3">
            Ajoutez des photos depuis votre appareil ou via une URL.
            La photo marquée <strong>★ Principale</strong> sera l&apos;image de couverture.
          </p>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div
              className={`flex-1 min-w-[220px] border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'border-amber-300 bg-amber-50' : 'border-gray-300 hover:border-[#D4A72C]'}`}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              <div className="text-4xl mb-3">{uploading ? '⏳' : '📸'}</div>
              <p className="font-semibold text-gray-700 text-sm">
                {uploading ? 'Chargement en cours...' : 'Cliquez pour choisir des photos'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Plusieurs fichiers acceptés</p>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} disabled={uploading} />
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="self-center px-4 py-3 border border-[#D4A72C] text-[#D4A72C] rounded-xl text-sm font-medium hover:bg-[#D4A72C]/10 flex items-center gap-2"
            >
              <span>🔗</span>
              <span>Ajouter une URL</span>
            </button>
          </div>
          {imageEntries.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
              {imageEntries.map((entry, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 ${i === primaryIdx ? 'border-[#D4A72C]' : 'border-transparent'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.preview} alt="" className="w-full h-full object-cover" />
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
                  {i === primaryIdx && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#D4A72C] text-[10px] text-center font-bold text-[#111827] py-0.5">
                      Principale
                    </div>
                  )}
                  {entry.isLocal && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-[9px] text-white font-bold px-1 rounded">NEW</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              Aucune photo ajoutée — utilisez le bouton ci-dessus.
            </div>
          )}
          {imageEntries.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">{imageEntries.length} photo(s) · survolez une image pour gérer</p>
          )}
        </Section>

        {/* G – Status */}
        <Section title="G. Statut de publication">
          <div className="flex gap-3 flex-wrap">
            {['DRAFT', 'PUBLISHED'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setPublishStatus(s)}
                className={`px-5 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  publishStatus === s
                    ? 'border-[#D4A72C] bg-[#D4A72C]/10 text-[#D4A72C]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s === 'DRAFT' ? '📝 Brouillon' : '✅ Publier immédiatement'}
              </button>
            ))}
          </div>
        </Section>

        {/* Bottom action bar */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.push('/fr/admin/vehicles')}
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-[#D4A72C] text-[#111827] rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : '✓ Enregistrer le véhicule'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-base font-bold text-[#111827] mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition"
      />
    </div>
  );
}
