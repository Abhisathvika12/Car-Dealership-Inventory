import { prisma } from '../src/utils/prisma';
import { demoVehicles } from '../src/utils/demoVehicles';

async function main() {
  const count = await prisma.vehicle.count();

  if (count > 0) {
    console.log('Vehicles already exist, skipping seed');
    return;
  }

  await prisma.vehicle.createMany({
    data: demoVehicles,
  });

  console.log(`Seeded ${demoVehicles.length} vehicles`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
