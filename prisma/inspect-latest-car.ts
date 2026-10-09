import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  const latestCar = await prisma.vehicle.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: true,
      location: true,
    },
  });
  console.log('Latest car details:');
  console.log(JSON.stringify(latestCar, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
