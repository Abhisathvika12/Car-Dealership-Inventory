import 'dotenv/config';

import { demoVehicles } from './demoVehicles';

export type SeedVehicle = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type UnsplashPhotoResult = {
  urls?: {
    regular?: string;
  };
};

type NhtsaMakeResult = {
  Make_Name?: string;
  Model_Name?: string;
  VehicleType?: string;
};

const FALLBACK_IMAGE_BY_CATEGORY: Record<string, string> = {
  Sedan: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
  SUV: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
  Truck: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  Wagon: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  Electric: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80',
  Coupe: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  Convertible: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  Minivan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  Hatchback: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
};

const categoryFallback = (category?: string) => {
  const normalized = (category ?? '').trim();
  return FALLBACK_IMAGE_BY_CATEGORY[normalized] ?? FALLBACK_IMAGE_BY_CATEGORY.default;
};

export const resolveVehicleImageUrl = async (
  make: string,
  model: string,
  category?: string,
): Promise<string> => {
  const query = [make, model, category ?? 'car'].filter(Boolean).join(' ').trim();
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();

  if (!accessKey) {
    return categoryFallback(category);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      },
    );

    if (!response.ok) {
      return categoryFallback(category);
    }

    const data = (await response.json()) as { results?: UnsplashPhotoResult[] };
    const imageUrl = data.results?.[0]?.urls?.regular;

    return imageUrl || categoryFallback(category);
  } catch {
    return categoryFallback(category);
  }
};

const vehicleTypeToCategory = (vehicleType?: string) => {
  if (!vehicleType) {
    return 'Passenger Car';
  }

  const normalized = vehicleType.trim();

  if (/sport/i.test(normalized)) {
    return 'Coupe';
  }

  if (/suv/i.test(normalized) || /utility/i.test(normalized)) {
    return 'SUV';
  }

  if (/truck/i.test(normalized)) {
    return 'Truck';
  }

  if (/van/i.test(normalized) || /minivan/i.test(normalized)) {
    return 'Minivan';
  }

  if (/hatchback/i.test(normalized)) {
    return 'Hatchback';
  }

  if (/wagon/i.test(normalized)) {
    return 'Wagon';
  }

  if (/convertible/i.test(normalized)) {
    return 'Convertible';
  }

  if (/electric/i.test(normalized) || /ev/i.test(normalized)) {
    return 'Electric';
  }

  return 'Passenger Car';
};

const basePriceByCategory: Record<string, number> = {
  Sedan: 28000,
  SUV: 36000,
  Truck: 45000,
  Wagon: 31000,
  Electric: 42000,
  Coupe: 39000,
  Convertible: 33000,
  Minivan: 38000,
  Hatchback: 24000,
  'Passenger Car': 28000,
};

const normalizeSeedVehicle = (vehicle: SeedVehicle): SeedVehicle => ({
  ...vehicle,
  make: vehicle.make.trim(),
  model: vehicle.model.trim(),
  category: vehicle.category.trim() || 'Passenger Car',
  price: Number(vehicle.price) || 0,
  quantity: Number(vehicle.quantity) || 0,
});

export const fetchVehicleCatalog = async (): Promise<SeedVehicle[]> => {
  const fallback = demoVehicles.map((vehicle) => ({
    ...vehicle,
    imageUrl: vehicle.imageUrl,
  }));

  try {
    const makeResponse = await fetch(
      'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json',
    );

    if (!makeResponse.ok) {
      return fallback;
    }

    const makeData = (await makeResponse.json()) as { Results?: NhtsaMakeResult[] };
    const makes = (makeData.Results ?? [])
      .map((result) => result.Make_Name)
      .filter((value): value is string => Boolean(value))
      .slice(0, 20);

    if (makes.length === 0) {
      return fallback;
    }

    const catalog = new Map<string, SeedVehicle>();

    for (const make of makes) {
      const modelResponse = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/2024?format=json`,
      );

      if (!modelResponse.ok) {
        continue;
      }

      const modelData = (await modelResponse.json()) as { Results?: NhtsaMakeResult[] };
      const models = (modelData.Results ?? []).filter(
        (result): result is NhtsaMakeResult & { Make_Name: string; Model_Name: string } =>
          Boolean(result.Make_Name && result.Model_Name),
      );

      for (const model of models.slice(0, 3)) {
        const key = `${model.Make_Name}-${model.Model_Name}`;

        if (catalog.has(key)) {
          continue;
        }

        const category = vehicleTypeToCategory(model.VehicleType);
        const price =
          (basePriceByCategory[category] ?? basePriceByCategory['Passenger Car']) +
          model.Model_Name.length * 180;

        catalog.set(key, {
          make: model.Make_Name,
          model: model.Model_Name,
          category,
          price,
          quantity: Math.max(1, 12 - Math.round(price / 5000)),
        });
      }
    }

    const seededVehicles = Array.from(catalog.values()).slice(0, 40);

    if (seededVehicles.length < 10) {
      return fallback;
    }

    return seededVehicles.map((vehicle) => normalizeSeedVehicle(vehicle));
  } catch {
    return fallback;
  }
};

const vehicleSeedUtils = {
  resolveVehicleImageUrl,
  fetchVehicleCatalog,
};

export default vehicleSeedUtils;

if (typeof module !== 'undefined') {
  module.exports = vehicleSeedUtils;
}
