import { prisma } from '../utils/prisma';

export const userFeaturesService = {
  async toggleFavorite(userId: string, vehicleId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_vehicleId: { userId, vehicleId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return false;
    }

    await prisma.favorite.create({ data: { userId, vehicleId } });
    return true;
  },

  async listFavorites(userId: string) {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r) => r.vehicle);
  },

  async addRecentlyViewed(userId: string, vehicleId: string) {
    await prisma.recentlyViewed.create({ data: { userId, vehicleId } });

    // Keep only last 5
    const keep = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true },
      skip: 5,
    });

    if (keep.length > 0) {
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: keep.map((k) => k.id) } },
      });
    }
  },

  async listRecentlyViewed(userId: string) {
    const rows = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: { vehicle: true },
      orderBy: { viewedAt: 'desc' },
      take: 5,
    });

    return rows.map((r) => r.vehicle);
  },
};
