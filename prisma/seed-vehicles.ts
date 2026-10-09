import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding vehicles...');

  // Upsert categories
  async function upsertCategory(nameFr: string, nameAr: string) {
    let cat = await prisma.vehicleCategory.findFirst({ where: { nameFr } });
    if (!cat) cat = await prisma.vehicleCategory.create({ data: { nameFr, nameAr } });
    return cat;
  }

  const citadine = await upsertCategory('Citadine', 'سيارة مدينة');
  const berline   = await upsertCategory('Berline',  'سيدان');
  const suv       = await upsertCategory('SUV',      'سيارة دفع رباعي');

  // Upsert location
  let location = await prisma.location.findFirst({ where: { nameFr: 'Casablanca Centre' } });
  if (!location) {
    location = await prisma.location.create({
      data: { nameFr: 'Casablanca Centre', nameAr: 'وسط الدار البيضاء', city: 'Casablanca', country: 'Maroc', address: 'Bd Mohammed V' },
    });
  }

  const vehicles = [
    {
      brand: 'Dacia', model: 'Logan', version: 'Confort', year: 2023,
      registration: 'A-12345-B', mileage: 18000, color: 'Blanc',
      transmission: 'MANUAL' as const, fuel: 'PETROL' as const, seats: 5, doors: 4, horsepower: 90,
      dailyPrice: 35, weeklyPrice: 210, monthlyPrice: 800, securityDeposit: 300, deliveryFee: 0,
      descriptionFr: 'Dacia Logan 2023 en excellent état, économique et fiable. Idéale pour vos déplacements en ville et sur longue distance.',
      descriptionAr: 'داسيا لوغان 2023 في حالة ممتازة، اقتصادية وموثوقة. مثالية للتنقل في المدينة وعلى المسافات الطويلة.',
      categoryId: berline.id,
      isPublished: true, instantBooking: true,
      image: 'https://images.unsplash.com/photo-1609752041720-75c4dfe2a4b4?q=80&w=2070&auto=format&fit=crop',
    },
    {
      brand: 'Dacia', model: 'Duster', version: 'Prestige 4x4', year: 2023,
      registration: 'A-23456-B', mileage: 12000, color: 'Gris',
      transmission: 'MANUAL' as const, fuel: 'DIESEL' as const, seats: 5, doors: 5, horsepower: 115,
      dailyPrice: 55, weeklyPrice: 330, monthlyPrice: 1200, securityDeposit: 500, deliveryFee: 0,
      descriptionFr: 'Dacia Duster 2023 4x4, robuste et polyvalent. Parfait pour les routes de montagne et les terrains difficiles du Maroc.',
      descriptionAr: 'داسيا داستر 2023 رباعي الدفع، متين ومتعدد الاستخدامات. مثالي لطرق الجبال والتضاريس الصعبة في المغرب.',
      categoryId: suv.id,
      isPublished: true, instantBooking: true,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2070&auto=format&fit=crop',
    },
    {
      brand: 'Renault', model: 'Clio', version: 'Intens', year: 2022,
      registration: 'A-34567-B', mileage: 25000, color: 'Rouge',
      transmission: 'MANUAL' as const, fuel: 'PETROL' as const, seats: 5, doors: 5, horsepower: 100,
      dailyPrice: 40, weeklyPrice: 240, monthlyPrice: 900, securityDeposit: 300, deliveryFee: 0,
      descriptionFr: 'Renault Clio 4 2022, citadine élégante et agile. Équipée de la climatisation, Bluetooth et Apple CarPlay.',
      descriptionAr: 'رينو كليو 4 2022، سيارة مدينة أنيقة وخفيفة. مجهزة بمكيف هواء وبلوتوث وأبل كاربلاي.',
      categoryId: citadine.id,
      isPublished: true, instantBooking: false,
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop',
    },
    {
      brand: 'Hyundai', model: 'Tucson', version: 'Executive', year: 2024,
      registration: 'A-45678-B', mileage: 5000, color: 'Noir',
      transmission: 'AUTOMATIC' as const, fuel: 'HYBRID' as const, seats: 5, doors: 5, horsepower: 150,
      dailyPrice: 80, weeklyPrice: 480, monthlyPrice: 1800, securityDeposit: 800, deliveryFee: 50,
      descriptionFr: 'Hyundai Tucson 2024 hybride, SUV premium avec intérieur cuir, GPS, caméra de recul et toit panoramique.',
      descriptionAr: 'هيونداي توسان 2024 هجين، SUV متميز مع داخلية جلدية، GPS، كاميرا خلفية وسقف بانورامي.',
      categoryId: suv.id,
      isPublished: true, instantBooking: true,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
    },
    {
      brand: 'Peugeot', model: '208', version: 'Allure', year: 2023,
      registration: 'A-56789-B', mileage: 20000, color: 'Bleu',
      transmission: 'AUTOMATIC' as const, fuel: 'PETROL' as const, seats: 5, doors: 5, horsepower: 110,
      dailyPrice: 45, weeklyPrice: 270, monthlyPrice: 1000, securityDeposit: 400, deliveryFee: 0,
      descriptionFr: 'Peugeot 208 2023 automatique, moderne et confortable. Parfaite pour la ville avec sa transmission automatique.',
      descriptionAr: 'بيجو 208 2023 أوتوماتيك، حديثة ومريحة. مثالية للمدينة مع ناقل الحركة الأوتوماتيكي.',
      categoryId: citadine.id,
      isPublished: true, instantBooking: true,
      image: 'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?q=80&w=2070&auto=format&fit=crop',
    },
  ];

  for (const v of vehicles) {
    const exists = await prisma.vehicle.findUnique({ where: { registration: v.registration } });
    if (!exists) {
      await prisma.vehicle.create({
        data: {
          brand: v.brand, model: v.model, version: v.version, year: v.year,
          registration: v.registration, mileage: v.mileage, color: v.color,
          transmission: v.transmission, fuel: v.fuel, seats: v.seats, doors: v.doors, horsepower: v.horsepower,
          descriptionFr: v.descriptionFr, descriptionAr: v.descriptionAr,
          dailyPrice: v.dailyPrice, weeklyPrice: v.weeklyPrice, monthlyPrice: v.monthlyPrice,
          securityDeposit: v.securityDeposit, deliveryFee: v.deliveryFee,
          isPublished: v.isPublished, instantBooking: v.instantBooking,
          categoryId: v.categoryId, locationId: location!.id,
          images: { create: [{ url: v.image, isPrimary: true }] },
        },
      });
      console.log(`✅ Created ${v.brand} ${v.model}`);
    } else {
      console.log(`⏭️  Skipped ${v.brand} ${v.model} (already exists)`);
    }
  }

  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => { prisma.$disconnect(); pool.end(); });
