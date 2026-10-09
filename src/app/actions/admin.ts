'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/permissions';

// ─── Booking Actions ──────────────────────────────────────────────────────────

export async function confirmBooking(bookingId: string) {
  await requirePermission('bookings');
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
  });
  revalidatePath('/fr/admin/bookings');
  revalidatePath('/fr/admin');
}

export async function rejectBooking(bookingId: string) {
  await requirePermission('bookings');
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'REJECTED' },
  });
  revalidatePath('/fr/admin/bookings');
  revalidatePath('/fr/admin');
}

export async function cancelBooking(bookingId: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
  revalidatePath('/fr/admin/bookings');
  revalidatePath('/fr/admin');
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: status as any },
  });
  revalidatePath('/fr/admin/bookings');
  revalidatePath('/fr/admin');
}

// ─── Review Actions ───────────────────────────────────────────────────────────

export async function approveReview(reviewId: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
  });
  revalidatePath('/fr/admin/reviews');
}

export async function rejectReview(reviewId: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: false },
  });
  revalidatePath('/fr/admin/reviews');
}

export async function deleteReview(reviewId: string) {
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath('/fr/admin/reviews');
}

// ─── Vehicle Actions ──────────────────────────────────────────────────────────

export async function publishVehicle(vehicleId: string) {
  await requirePermission('vehicles');
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isPublished: true },
  });
  revalidatePath('/fr/admin/vehicles');
  revalidatePath('/fr/vehicles');
}

export async function unpublishVehicle(vehicleId: string) {
  await requirePermission('vehicles');
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isPublished: false },
  });
  revalidatePath('/fr/admin/vehicles');
  revalidatePath('/fr/vehicles');
}

export async function deleteVehicle(vehicleId: string) {
  await requirePermission('vehicles');
  await prisma.vehicle.delete({ where: { id: vehicleId } });
  revalidatePath('/fr/admin/vehicles');
  revalidatePath('/fr/vehicles');
}

// ─── Create Vehicle Action ────────────────────────────────────────────────────

export async function createVehicle(formData: FormData) {
  await requirePermission('vehicles');
  const brand         = formData.get('brand')         as string;
  const model         = formData.get('model')         as string;
  const version       = formData.get('version')       as string | null;
  const year          = parseInt(formData.get('year') as string);
  const registration  = formData.get('registration')  as string;
  const vin           = formData.get('vin')           as string | null;
  const mileage       = parseInt(formData.get('mileage') as string);
  const color         = formData.get('color')         as string;
  const categoryId    = formData.get('categoryId')    as string;
  const transmission  = formData.get('transmission')  as 'AUTOMATIC' | 'MANUAL';
  const fuel          = formData.get('fuel')          as 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  const seats         = parseInt(formData.get('seats') as string);
  const doors         = parseInt(formData.get('doors') as string);
  const horsepower    = formData.get('horsepower') ? parseInt(formData.get('horsepower') as string) : null;
  const descriptionFr = formData.get('descriptionFr') as string;
  const descriptionAr = formData.get('descriptionAr') as string;
  const dailyPrice    = parseFloat(formData.get('dailyPrice')    as string);
  const weeklyPrice   = formData.get('weeklyPrice')  ? parseFloat(formData.get('weeklyPrice')  as string) : null;
  const monthlyPrice  = formData.get('monthlyPrice') ? parseFloat(formData.get('monthlyPrice') as string) : null;
  const weekendPrice  = formData.get('weekendPrice') ? parseFloat(formData.get('weekendPrice') as string) : null;
  const securityDeposit = parseFloat(formData.get('securityDeposit') as string);
  const deliveryFee     = parseFloat((formData.get('deliveryFee') as string) || '0');
  const isPublished     = formData.get('isPublished') === 'PUBLISHED';
  const instantBooking  = formData.get('instantBooking') === 'on';
  const imageUrls       = (formData.getAll('imageUrl') as string[]).filter(Boolean);
  const primaryImageIdx = parseInt((formData.get('primaryImageIdx') as string) || '0');

  // Find or create a location for this vehicle
  const locationNameFr = (formData.get('locationNameFr') as string) || 'Non spécifié';
  const locationNameAr = (formData.get('locationNameAr') as string) || 'غير محدد';
  const city           = (formData.get('city') as string) || '';
  const country        = (formData.get('country') as string) || '';
  const address        = (formData.get('address') as string) || '';

  // Upsert location
  let location = await prisma.location.findFirst({
    where: { nameFr: locationNameFr, city, country },
  });
  if (!location) {
    location = await prisma.location.create({
      data: { nameFr: locationNameFr, nameAr: locationNameAr, city, country, address },
    });
  }

  // Fallback for legacy category UI that might send __berline__ etc.
  let finalCategoryId = categoryId;
  if (categoryId.startsWith('__')) {
    const fallbackName = categoryId.replace(/__/g, '');
    const capitalizedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
    let cat = await prisma.vehicleCategory.findFirst({ where: { nameFr: capitalizedName } });
    if (!cat) {
      cat = await prisma.vehicleCategory.create({ data: { nameFr: capitalizedName, nameAr: capitalizedName } });
    }
    finalCategoryId = cat.id;
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      brand,
      model,
      version: version || null,
      year,
      registration,
      vin: vin || null,
      mileage,
      color,
      categoryId: finalCategoryId,
      locationId: location.id,
      transmission,
      fuel,
      seats,
      doors,
      horsepower,
      descriptionFr,
      descriptionAr,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      weekendPrice,
      securityDeposit,
      deliveryFee,
      isPublished,
      instantBooking,
      images: imageUrls.length > 0 ? {
        create: imageUrls.map((url, i) => ({
          url,
          isPrimary: i === primaryImageIdx,
        })),
      } : undefined,
    },
  });

  revalidatePath('/fr/admin/vehicles');
  revalidatePath('/fr/vehicles');

  return vehicle.id;
}

// ─── Update Vehicle Action ────────────────────────────────────────────────────

export async function updateVehicle(vehicleId: string, formData: FormData) {
  await requirePermission('vehicles');
  const brand         = formData.get('brand')         as string;
  const model         = formData.get('model')         as string;
  const version       = formData.get('version')       as string | null;
  const year          = parseInt(formData.get('year') as string);
  const mileage       = parseInt(formData.get('mileage') as string);
  const color         = formData.get('color')         as string;
  const transmission  = formData.get('transmission')  as 'AUTOMATIC' | 'MANUAL';
  const fuel          = formData.get('fuel')          as 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  const seats         = parseInt(formData.get('seats') as string);
  const doors         = parseInt(formData.get('doors') as string);
  const horsepower    = formData.get('horsepower') ? parseInt(formData.get('horsepower') as string) : null;
  const descriptionFr = formData.get('descriptionFr') as string;
  const descriptionAr = formData.get('descriptionAr') as string;
  const dailyPrice    = parseFloat(formData.get('dailyPrice')    as string);
  const weeklyPrice   = formData.get('weeklyPrice')  ? parseFloat(formData.get('weeklyPrice')  as string) : null;
  const monthlyPrice  = formData.get('monthlyPrice') ? parseFloat(formData.get('monthlyPrice') as string) : null;
  const weekendPrice  = formData.get('weekendPrice') ? parseFloat(formData.get('weekendPrice') as string) : null;
  const securityDeposit = parseFloat(formData.get('securityDeposit') as string);
  const deliveryFee     = parseFloat((formData.get('deliveryFee') as string) || '0');
  const isPublished     = formData.get('isPublished') === 'PUBLISHED';
  const imageUrls       = (formData.getAll('imageUrl') as string[]).filter(Boolean);
  const primaryImageIdx = parseInt((formData.get('primaryImageIdx') as string) || '0');

  // First delete existing images for this vehicle
  await prisma.vehicleImage.deleteMany({
    where: { vehicleId }
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      brand,
      model,
      version: version || null,
      year,
      mileage,
      color,
      transmission,
      fuel,
      seats,
      doors,
      horsepower,
      descriptionFr,
      descriptionAr,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      weekendPrice,
      securityDeposit,
      deliveryFee,
      isPublished,
      images: imageUrls.length > 0 ? {
        create: imageUrls.map((url, i) => ({
          url,
          isPrimary: i === primaryImageIdx,
        })),
      } : undefined,
    },
  });

  revalidatePath('/fr/admin/vehicles');
  revalidatePath(`/fr/vehicles/${vehicleId}`);
  revalidatePath('/fr/vehicles');
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

export async function registerUser(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName  = formData.get('lastName')  as string;
  const email     = formData.get('email')     as string;
  const phone     = formData.get('phone')     as string | null;
  const password  = formData.get('password')  as string;
  const locale    = formData.get('locale')    as string || 'fr';

  if (!firstName || !lastName || !email || !password) {
    throw new Error('Tous les champs obligatoires doivent être remplis.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Un compte avec cet email existe déjà.');
  }

  // Hash the password using Node.js crypto (built-in, no bcrypt needed)
  const { createHash, randomBytes } = await import('crypto');
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  const passwordHash = `${salt}:${hash}`;

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  return { success: true, email: user.email };
}

// ─── Contact Messages & Notification Actions ────────────────────────────────

export async function sendContactMessage(formData: FormData) {
  const name    = (formData.get('name') as string)?.trim();
  const email   = (formData.get('email') as string)?.trim();
  const phone   = (formData.get('phone') as string)?.trim() || null;
  const subject = (formData.get('subject') as string)?.trim() || null;
  const message = (formData.get('message') as string)?.trim();

  if (!name || !email || !message) {
    throw new Error('Veuillez remplir votre nom, votre email et votre message.');
  }

  const saved = await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone,
      subject,
      message,
      isRead: false,
    },
  });

  revalidatePath('/fr/admin/messages');
  revalidatePath('/fr/admin');
  return { success: true, id: saved.id };
}

export async function markMessageAsRead(messageId: string) {
  await requirePermission('messages');
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { isRead: true },
  });
  revalidatePath('/fr/admin/messages');
  revalidatePath('/fr/admin');
}

export async function deleteContactMessage(messageId: string) {
  await requirePermission('messages');
  await prisma.contactMessage.delete({
    where: { id: messageId },
  });
  revalidatePath('/fr/admin/messages');
  revalidatePath('/fr/admin');
}

export async function getAdminNotificationMetrics() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twoDaysLater = new Date(todayStart.getTime() + 48 * 60 * 60 * 1000);

  // 1. Unread messages
  const unreadMessagesCount = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  // 2. Pending bookings needing validation
  const pendingBookingsCount = await prisma.booking.count({
    where: { status: 'PENDING' },
  });

  // 3. Bookings reaching their return limit / due date (due today or within 24-48h, or active & overdue)
  const expiringBookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'ACTIVE'] },
      returnDate: { lte: twoDaysLater },
    },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } },
      vehicle: { select: { brand: true, model: true, registration: true } },
    },
    orderBy: { returnDate: 'asc' },
    take: 10,
  });

  // Latest unread messages for notification popup
  const latestMessages = await prisma.contactMessage.findMany({
    where: { isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    unreadMessagesCount,
    pendingBookingsCount,
    expiringBookingsCount: expiringBookings.length,
    expiringBookings: expiringBookings.map(b => {
      const diffMs = b.returnDate.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      return {
        id: b.id,
        bookingNumber: b.bookingNumber,
        customerName: `${b.user.firstName} ${b.user.lastName}`,
        customerPhone: b.user.phone,
        vehicleName: `${b.vehicle.brand} ${b.vehicle.model}`,
        registration: b.vehicle.registration,
        returnDate: b.returnDate.toISOString(),
        diffHours,
        isOverdue: diffMs < 0,
      };
    }),
    latestMessages: latestMessages.map(m => ({
      id: m.id,
      name: m.name,
      subject: m.subject || 'Message de contact',
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
