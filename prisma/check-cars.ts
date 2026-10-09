import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  const cars = await prisma.vehicle.findMany({
    select: {
      id: true,
      brand: true,
      model: true,
      registration: true,
      isPublished: true,
      createdAt: true,
      images: {
        select: {
          url: true,
          isPrimary: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Found ${cars.length} vehicles in database:`);
  cars.forEach(c => {
    console.log(`- [${c.isPublished ? 'PUBLISHED' : 'DRAFT'}] ${c.brand} ${c.model} (${c.registration}) | Images: ${c.images.length} (Primary: ${c.images.some(i => i.isPrimary)})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
