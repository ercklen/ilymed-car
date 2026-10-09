import prisma from '@/lib/db';
import AddVehicleClient from './AddVehicleClient';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function AddVehiclePage() {
  try {
    await requirePermission('vehicles');
  } catch {
    redirect('/fr/admin');
  }

  const categories = await prisma.vehicleCategory.findMany({
    orderBy: { nameFr: 'asc' },
    select: { id: true, nameFr: true },
  });

  return <AddVehicleClient categories={categories} />;
}
