'use server';

import prisma from '@/lib/db';
import { createBookingSafe } from '@/lib/availability';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function submitBooking(formData: FormData) {
  const vehicleId  = formData.get('vehicleId')  as string;
  const locale     = formData.get('locale')      as string;
  const pickupDate = new Date(formData.get('pickupDate') as string);
  const returnDate = new Date(formData.get('returnDate') as string);

  // Validate dates
  if (!vehicleId || !locale || isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
    throw new Error('Données de formulaire invalides.');
  }
  if (pickupDate >= returnDate) {
    throw new Error('Les dates sont invalides. La date de retour doit être après la date de départ.');
  }

  const days = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error('Véhicule introuvable.');

  const rentalAmount = days * vehicle.dailyPrice;
  const serviceFee   = Math.max(15, rentalAmount * 0.1);
  const taxAmount    = rentalAmount * 0.1;
  const totalAmount  = rentalAmount + serviceFee + taxAmount + vehicle.deliveryFee;

  // Try to get the authenticated user first
  const session = await auth();
  let userId: string;

  if (session?.user && (session.user as any).id) {
    userId = (session.user as any).id;
  } else {
    // Guest booking: find or create user by email
    const email     = formData.get('email')     as string;
    const firstName = formData.get('firstName') as string;
    const lastName  = formData.get('lastName')  as string;
    const phone     = (formData.get('phone') as string) || null;

    if (!email || !firstName || !lastName) {
      throw new Error('Informations personnelles requises pour une réservation invité.');
    }

    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, firstName, lastName, phone },
      });
    }
    userId = user.id;
  }

  await createBookingSafe(userId, vehicleId, pickupDate, returnDate, {
    rentalAmount,
    serviceFee,
    deliveryFee: vehicle.deliveryFee,
    taxAmount,
    totalAmount,
  });

  redirect(`/${locale}/my-bookings`);
}
