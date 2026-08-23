import { prisma } from '../utils/prisma';

export const compareService = {
  async compare(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: ids } },
    });

    const map = new Map(vehicles.map((v) => [v.id, v]));

    return ids.map((id) => map.get(id)).filter(Boolean as any);
  },
};
