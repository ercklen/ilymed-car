import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Locations
  const locationParis = await prisma.location.create({
    data: {
      nameFr: 'Aéroport Charles de Gaulle',
      nameAr: 'مطار شارل ديغول',
      address: 'Roissy-en-France',
      city: 'Paris',
      country: 'France',
      pickupInstrFr: 'Terminal 2D, Parking Loueurs',
      pickupInstrAr: 'المبنى 2D، موقف تأجير السيارات'
    }
  });

  // Create Categories
  const catBerline = await prisma.vehicleCategory.create({ data: { nameFr: 'Berline', nameAr: 'سيدان' } });
  const catSUV = await prisma.vehicleCategory.create({ data: { nameFr: 'SUV', nameAr: 'سيارة دفع رباعي' } });
  const catCitadine = await prisma.vehicleCategory.create({ data: { nameFr: 'Citadine', nameAr: 'سيارة مدينة' } });

  // Create Vehicles
  const vehiclesData = [
    { brand: 'BMW', model: 'Série 3', year: 2024, categoryId: catBerline.id, price: 120, fuel: 'PETROL', trans: 'AUTOMATIC' },
    { brand: 'Mercedes-Benz', model: 'Classe C', year: 2023, categoryId: catBerline.id, price: 135, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Audi', model: 'A4', year: 2023, categoryId: catBerline.id, price: 110, fuel: 'DIESEL', trans: 'AUTOMATIC' },
    { brand: 'Peugeot', model: '308', year: 2024, categoryId: catCitadine.id, price: 70, fuel: 'PETROL', trans: 'MANUAL' },
    { brand: 'Peugeot', model: '3008', year: 2023, categoryId: catSUV.id, price: 95, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Renault', model: 'Clio', year: 2024, categoryId: catCitadine.id, price: 50, fuel: 'PETROL', trans: 'MANUAL' },
    { brand: 'Renault', model: 'Captur', year: 2023, categoryId: catSUV.id, price: 80, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Volkswagen', model: 'Golf', year: 2024, categoryId: catCitadine.id, price: 75, fuel: 'PETROL', trans: 'AUTOMATIC' },
    { brand: 'Volkswagen', model: 'Tiguan', year: 2023, categoryId: catSUV.id, price: 110, fuel: 'DIESEL', trans: 'AUTOMATIC' },
    { brand: 'Mercedes-Benz', model: 'GLC', year: 2024, categoryId: catSUV.id, price: 180, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Audi', model: 'Q5', year: 2023, categoryId: catSUV.id, price: 160, fuel: 'DIESEL', trans: 'AUTOMATIC' },
    { brand: 'BMW', model: 'X3', year: 2024, categoryId: catSUV.id, price: 170, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Toyota', model: 'Corolla', year: 2023, categoryId: catBerline.id, price: 85, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Hyundai', model: 'Tucson', year: 2024, categoryId: catSUV.id, price: 100, fuel: 'HYBRID', trans: 'AUTOMATIC' },
    { brand: 'Range Rover', model: 'Evoque', year: 2024, categoryId: catSUV.id, price: 200, fuel: 'PETROL', trans: 'AUTOMATIC' },
  ];

  for (let i = 0; i < vehiclesData.length; i++) {
    const v = vehiclesData[i];
    await prisma.vehicle.create({
      data: {
        brand: v.brand,
        model: v.model,
        year: v.year,
        registration: `AB-${100+i}-CD`,
        mileage: Math.floor(Math.random() * 30000),
        color: 'Noir',
        transmission: v.trans as any,
        fuel: v.fuel as any,
        seats: 5,
        doors: 5,
        descriptionFr: `Magnifique ${v.brand} ${v.model} en excellent état.`,
        descriptionAr: `رائعة ${v.brand} ${v.model} في حالة ممتازة.`,
        dailyPrice: v.price,
        securityDeposit: 500,
        isPublished: true,
        instantBooking: true,
        categoryId: v.categoryId,
        locationId: locationParis.id,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2940&auto=format&fit=crop', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2940&auto=format&fit=crop', isPrimary: false }
          ]
        }
      }
    });
  }

  // Admin User
  await prisma.user.create({
    data: {
      email: 'admin@ridacar.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
