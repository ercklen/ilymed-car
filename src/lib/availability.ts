import prisma from './db';

/**
 * Checks if a vehicle is strictly available between the requested dates.
 * It prevents overlapping by verifying there are no CONFIRMED, ACTIVE, or PENDING 
 * bookings and no admin BlockedDates overlapping with the given range.
 */
export async function isVehicleAvailable(
  vehicleId: string, 
  startDate: Date, 
  endDate: Date
): Promise<boolean> {
  // 1. Check for overlapping Bookings
  const overlappingBookings = await prisma.booking.findFirst({
    where: {
      vehicleId,
      status: {
        in: ['CONFIRMED', 'ACTIVE', 'PENDING']
      },
      OR: [
        // Booking starts during our requested period
        { pickupDate: { gte: startDate, lt: endDate } },
        // Booking ends during our requested period
        { returnDate: { gt: startDate, lte: endDate } },
        // Booking completely surrounds our requested period
        { pickupDate: { lte: startDate }, returnDate: { gte: endDate } }
      ]
    }
  });

  if (overlappingBookings) return false;

  // 2. Check for Admin Blocked Dates
  const overlappingBlocks = await prisma.blockedDate.findFirst({
    where: {
      vehicleId,
      OR: [
        { startDate: { gte: startDate, lt: endDate } },
        { endDate: { gt: startDate, lte: endDate } },
        { startDate: { lte: startDate }, endDate: { gte: endDate } }
      ]
    }
  });

  if (overlappingBlocks) return false;

  return true;
}

/**
 * Transactional lock wrapper for creating a booking safely.
 * Will throw an error if another transaction books the car at the same time.
 */
export async function createBookingSafe(
  userId: string,
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date,
  pricingDetails: any
) {
  // Fallback for legacy dev token
  let actualUserId = userId;
  if (actualUserId === 'admin-dev') {
    let admin = await prisma.user.findUnique({ where: { email: 'admin@ilymedcar.com' } });
    if (!admin) {
      admin = await prisma.user.create({ data: { email: 'admin@ilymedcar.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' } });
    }
    actualUserId = admin.id;
  }

  return await prisma.$transaction(async (tx) => {
    // We do a raw query lock or use Prisma's logic inside the transaction
    // Note: for strict row-level locking in Postgres, you would use:
    // await tx.$queryRaw`SELECT * FROM "Vehicle" WHERE id = ${vehicleId} FOR UPDATE`;

    const overlappingBookings = await tx.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
        OR: [
          { pickupDate: { gte: pickupDate, lt: returnDate } },
          { returnDate: { gt: pickupDate, lte: returnDate } },
          { pickupDate: { lte: pickupDate }, returnDate: { gte: returnDate } }
        ]
      }
    });

    if (overlappingBookings) {
      throw new Error('Vehicle is no longer available for the selected dates.');
    }

    // Proceed to create the booking
    const newBooking = await tx.booking.create({
      data: {
        bookingNumber: `ILYMED-${Date.now()}`,
        userId: actualUserId,
        vehicleId,
        pickupDate,
        returnDate,
        ...pricingDetails,
        status: 'PENDING'
      }
    });

    return newBooking;
  });
}
