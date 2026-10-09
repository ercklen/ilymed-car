'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Category = { id: string; nameFr: string; nameAr: string };
type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  seats: number;
  dailyPrice: number;
  category: Category;
  images: { url: string }[];
};

interface Props {
  vehicles: Vehicle[];
  categories: Category[];
  locale: string;
}

export default function VehiclesClient({ vehicles, categories, locale }: Props) {
  const isAr = locale === 'ar';

  const maxVehiclePrice = useMemo(() => {
    if (!vehicles.length) return 1000;
    const highest = Math.max(...vehicles.map(v => v.dailyPrice || 0));
    return Math.max(highest, 500);
  }, [vehicles]);

  const [priceMax, setPriceMax] = useState(maxVehiclePrice);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('price_asc');

  const toggleCategory = (id: string) =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );

  const filtered = useMemo(() => {
    let result = vehicles.filter(v => v.dailyPrice <= priceMax);
    if (selectedCategories.length > 0)
      result = result.filter(v => selectedCategories.includes(v.category.id));
    if (selectedTransmission)
      result = result.filter(v => v.transmission === selectedTransmission);
    if (selectedFuel)
      result = result.filter(v => v.fuel === selectedFuel);

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.dailyPrice - b.dailyPrice);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.dailyPrice - a.dailyPrice);

    return result;
  }, [vehicles, priceMax, selectedCategories, selectedTransmission, selectedFuel, sortBy]);

  const fuelLabel = (fuel: string) => {
    const map: Record<string, [string, string]> = {
      PETROL: ['Essence', 'بنزين'],
      DIESEL: ['Diesel', 'ديزل'],
      HYBRID: ['Hybride', 'هجين'],
      ELECTRIC: ['Électrique', 'كهربائي'],
    };
    return isAr ? (map[fuel]?.[1] ?? fuel) : (map[fuel]?.[0] ?? fuel);
  };

  const transmLabel = (t: string) =>
    t === 'AUTOMATIC' ? (isAr ? 'أوتوماتيك' : 'Auto') : (isAr ? 'يدوي' : 'Manuel');

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-6">
          <h2 className="text-lg font-bold text-[#111827]">
            {isAr ? '🔍 التصفيات' : '🔍 Filtres'}
          </h2>

          {/* Price */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-[#111827]">
                {isAr ? 'السعر (يومياً)' : 'Prix (par jour)'}
              </h3>
              <span className="text-sm font-bold text-[#D4A72C]">{priceMax} DH</span>
            </div>
            <input
              type="range"
              min={30}
              max={maxVehiclePrice}
              value={priceMax}
              onChange={e => setPriceMax(+e.target.value)}
              className="w-full accent-[#D4A72C]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>30 DH</span><span>{maxVehiclePrice} DH</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="font-semibold text-sm text-[#111827] mb-3">
              {isAr ? 'الفئة' : 'Catégorie'}
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded accent-[#D4A72C]"
                  />
                  <span className="text-gray-800">{isAr ? cat.nameAr : cat.nameFr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <h3 className="font-semibold text-sm text-[#111827] mb-3">
              {isAr ? 'ناقل الحركة' : 'Transmission'}
            </h3>
            <div className="space-y-2">
              {[['', isAr ? 'الكل' : 'Toutes'], ['AUTOMATIC', isAr ? 'أوتوماتيك' : 'Automatique'], ['MANUAL', isAr ? 'يدوي' : 'Manuelle']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer hover:text-black">
                  <input
                    type="radio"
                    name="transmission"
                    value={val}
                    checked={selectedTransmission === val}
                    onChange={() => setSelectedTransmission(val)}
                    className="accent-[#D4A72C]"
                  />
                  <span className="text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel */}
          <div>
            <h3 className="font-semibold text-sm text-[#111827] mb-3">
              {isAr ? 'نوع الوقود' : 'Carburant'}
            </h3>
            <div className="space-y-2">
              {[['', isAr ? 'الكل' : 'Tous'], ['PETROL', 'Essence / بنزين'], ['DIESEL', 'Diesel / ديزل'], ['HYBRID', 'Hybride / هجين'], ['ELECTRIC', 'Électrique / كهربائي']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer hover:text-black">
                  <input
                    type="radio"
                    name="fuel"
                    value={val}
                    checked={selectedFuel === val}
                    onChange={() => setSelectedFuel(val)}
                    className="accent-[#D4A72C]"
                  />
                  <span className="text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setPriceMax(500); setSelectedCategories([]); setSelectedTransmission(''); setSelectedFuel(''); }}
            className="w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            {isAr ? 'إعادة تعيين' : 'Réinitialiser'}
          </button>
        </div>
      </aside>

      {/* Vehicle List */}
      <main className="flex-1">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-[#111827]">{filtered.length}</span>{' '}
            {isAr ? 'سيارة متاحة' : 'voiture(s) disponible(s)'}
          </p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A72C] outline-none"
          >
            <option value="price_asc">{isAr ? 'السعر: الأقل أولاً' : 'Prix croissant'}</option>
            <option value="price_desc">{isAr ? 'السعر: الأعلى أولاً' : 'Prix décroissant'}</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-[#111827]">
              {isAr ? 'لا توجد سيارات بهذه المعايير' : 'Aucun véhicule ne correspond à vos critères'}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              {isAr ? 'حاول تغيير التصفيات' : 'Essayez de modifier vos filtres'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="w-full md:w-64 h-52 md:h-auto bg-gray-100 relative flex-shrink-0">
                  {vehicle.images[0] ? (
                    <img
                      src={vehicle.images[0].url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">🚗</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-[#111827]">
                          {vehicle.brand} {vehicle.model}{' '}
                          <span className="text-gray-400 text-base font-normal">{vehicle.year}</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {isAr ? vehicle.category.nameAr : vehicle.category.nameFr}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#D4A72C]">{vehicle.dailyPrice} DH</span>
                        <span className="text-gray-400 text-sm"> / {isAr ? 'يوم' : 'jour'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-4">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        🚘 {transmLabel(vehicle.transmission)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        ⛽ {fuelLabel(vehicle.fuel)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        👥 {vehicle.seats} {isAr ? 'مقاعد' : 'places'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Link
                      href={`/${locale}/vehicles/${vehicle.id}`}
                      className="flex-1 text-center py-2.5 border-2 border-[#111827] text-[#111827] rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      {isAr ? 'عرض التفاصيل' : 'Voir les détails'}
                    </Link>
                    <Link
                      href={`/${locale}/booking/${vehicle.id}`}
                      className="flex-1 text-center py-2.5 bg-[#D4A72C] text-[#111827] rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm"
                    >
                      {isAr ? 'احجز الآن' : 'Réserver'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
