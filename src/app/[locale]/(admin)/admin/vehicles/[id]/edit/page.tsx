import prisma from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import EditVehicleClient from './EditVehicleClient';
import { requirePermission } from '@/lib/permissions';

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  try {
    await requirePermission('vehicles');
  } catch {
    redirect('/fr/admin');
  }

  const { id } = await params;

  const [vehicle, categories] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: true,
        features: true,
        location: true,
        category: true,
      },
    }),
    prisma.vehicleCategory.findMany({ orderBy: { nameFr: 'asc' } }),
  ]);

  if (!vehicle) notFound();

  return <EditVehicleClient vehicle={vehicle} categories={categories} />;
}
