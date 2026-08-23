import { prisma } from './prisma';
import { demoVehicles } from './demoVehicles';

export const ensureDemoVehicles = async () => {
  const count = await prisma.vehicle.count();

  if (count > 0) {
    return false;
  }

  await prisma.vehicle.createMany({
    data: demoVehicles,
  });

  return true;
};

