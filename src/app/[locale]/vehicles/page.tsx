import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import prisma from '@/lib/db';
import VehiclesClient from '@/components/vehicles/VehiclesClient';

export default async function VehiclesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const isAr = locale === 'ar';

  const [vehicles, categories] = await Promise.all([
    prisma.vehicle.findMany({
      where: { isPublished: true },
      include: {
        images: { orderBy: { isPrimary: 'desc' } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehicleCategory.findMany({ orderBy: { nameFr: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header locale={locale} />

      <main className="flex-grow py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827]">
              {isAr ? 'السيارات المتاحة' : 'Voitures disponibles'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isAr
                ? `${vehicles.length} سيارة متاحة للإيجار`
                : `${vehicles.length} véhicule(s) disponible(s) à la location`}
            </p>
          </div>

          <VehiclesClient
            vehicles={vehicles.map(v => ({
              id: v.id,
              brand: v.brand,
              model: v.model,
              year: v.year,
              transmission: v.transmission,
              fuel: v.fuel,
              seats: v.seats,
              dailyPrice: v.dailyPrice,
              category: {
                id: v.category.id,
                nameFr: v.category.nameFr,
                nameAr: v.category.nameAr,
              },
              images: v.images.map(img => ({ url: img.url })),
            }))}
            categories={categories.map(c => ({
              id: c.id,
              nameFr: c.nameFr,
              nameAr: c.nameAr,
            }))}
            locale={locale}
          />
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
