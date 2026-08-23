import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { vehicleApi, type Vehicle } from '../services/vehicleApi';

type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'mileage-asc';

type Filters = {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
};

const fallbackVehicles: Vehicle[] = [
  {
    id: 'demo-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    category: 'Sedan',
    price: '27999.00',
    quantity: 4,
    color: 'Midnight Silver',
    mileage: 1200,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    description:
      'A polished daily driver with a calm cabin, excellent efficiency, and a reassuring dealership-floor presence.',
    features: ['Apple CarPlay', 'Adaptive Cruise', 'Lane Assist', 'Backup Camera'],
  },
  {
    id: 'demo-2',
    make: 'Ford',
    model: 'Bronco',
    year: 2023,
    category: 'SUV',
    price: '48900.00',
    quantity: 2,
    color: 'Oxford White',
    mileage: 8600,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    description:
      'An adventurous SUV with a bold stance, off-road attitude, and a premium-feeling cockpit.',
    features: ['4x4', 'Terrain Modes', 'Wireless Charging', 'Trail Camera'],
  },
  {
    id: 'demo-3',
    make: 'Ram',
    model: '1500',
    year: 2022,
    category: 'Truck',
    price: '52999.00',
    quantity: 0,
    color: 'Granite Crystal',
    mileage: 14900,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    description:
      'A full-size pickup with strong utility, a quiet ride, and enough capability to anchor the showroom.',
    features: ['Tow Package', 'Bed Lighting', 'Heated Seats', 'Pro Trailer Assist'],
  },
];

const fallbackImages: Record<string, string> = {
  Sedan:
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  SUV:
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
  Truck:
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  Electric:
    'https://images.unsplash.com/photo-1593941707882-a5a7f4a6b9dd?auto=format&fit=crop&w=1200&q=80',
  Wagon:
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
  Coupe:
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
  Hatchback:
    'https://images.unsplash.com/photo-1549399542-7e5d8d8f0f0c?auto=format&fit=crop&w=1200&q=80',
};

const getVehicleImage = (vehicle: Vehicle) =>
  vehicle.imageUrl ?? fallbackImages[vehicle.category] ?? fallbackImages.Sedan;

const formatCurrency = (value: string | number) =>
  Number(value).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

const formatMileage = (mileage?: number) =>
  mileage === undefined ? 'Mileage not set' : `${mileage.toLocaleString()} mi`;

const filterVehicles = (vehicles: Vehicle[], filters: Filters) =>
  vehicles.filter((vehicle) => {
    const makeMatch = vehicle.make
      .toLowerCase()
      .includes(filters.make.toLowerCase());
    const modelMatch = vehicle.model
      .toLowerCase()
      .includes(filters.model.toLowerCase());
    const categoryMatch = vehicle.category
      .toLowerCase()
      .includes(filters.category.toLowerCase());
    const priceValue = Number(vehicle.price);
    const minMatch = filters.minPrice ? priceValue >= Number(filters.minPrice) : true;
    const maxMatch = filters.maxPrice ? priceValue <= Number(filters.maxPrice) : true;

    return makeMatch && modelMatch && categoryMatch && minMatch && maxMatch;
  });

const sortVehicles = (vehicles: Vehicle[], sortBy: SortOption) => {
  const sorted = [...vehicles];

  sorted.sort((left, right) => {
    switch (sortBy) {
      case 'price-asc':
        return Number(left.price) - Number(right.price);
      case 'price-desc':
        return Number(right.price) - Number(left.price);
      case 'year-desc':
        return (right.year ?? 0) - (left.year ?? 0);
      case 'mileage-asc':
        return (left.mileage ?? Number.MAX_SAFE_INTEGER) - (right.mileage ?? Number.MAX_SAFE_INTEGER);
      case 'featured':
      default:
        return right.quantity - left.quantity;
    }
  });

  return sorted;
};

const getStatusLabel = (quantity: number) => {
  if (quantity > 3) {
    return 'In stock';
  }

  if (quantity > 0) {
    return 'Low stock';
  }

  return 'Sold out';
};

const getComparisonText = (
  vehicle: Vehicle,
  categoryAverage: number | null,
) => {
  if (categoryAverage === null) {
    return 'Category benchmark unavailable';
  }

  const delta = Number(vehicle.price) - categoryAverage;

  if (Math.abs(delta) < 1) {
    return 'Right at category average';
  }

  return delta < 0
    ? `${formatCurrency(Math.abs(delta))} below category average`
    : `${formatCurrency(delta)} above category average`;
};

const recentlyViewedKey = 'cdi.recentlyViewedVehicles';

const loadRecentlyViewed = () => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.sessionStorage.getItem(recentlyViewedKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

export function DashboardPage() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>([]);
  const [demoVehicles, setDemoVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(loadRecentlyViewed);

  const filters = useMemo(
    () => ({
      make: makeFilter,
      model: modelFilter,
      category: categoryFilter,
      minPrice,
      maxPrice,
    }),
    [categoryFilter, makeFilter, maxPrice, minPrice, modelFilter],
  );

  const hasActiveFilters =
    Boolean(makeFilter.trim()) ||
    Boolean(modelFilter.trim()) ||
    Boolean(categoryFilter.trim()) ||
    Boolean(minPrice.trim()) ||
    Boolean(maxPrice.trim());

  const liveFilteredVehicles = useMemo(
    () => filterVehicles(liveVehicles, filters),
    [filters, liveVehicles],
  );

  const showcaseMode = !demoMode && !loading && liveVehicles.length === 0;
  const activeVehicles = demoMode || showcaseMode ? demoVehicles : liveFilteredVehicles;

  const visibleVehicles = useMemo(
    () => filterVehicles(activeVehicles, filters),
    [activeVehicles, filters],
  );

  const sortedVehicles = useMemo(
    () => sortVehicles(visibleVehicles, sortBy),
    [sortBy, visibleVehicles],
  );

  const recentlyViewedVehicles = useMemo(() => {
    const map = new Map(sortedVehicles.map((vehicle) => [vehicle.id, vehicle]));
    return recentlyViewedIds
      .map((id) => map.get(id))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
  }, [recentlyViewedIds, sortedVehicles]);

  const categoryAverageByName = useMemo(() => {
    const sums = new Map<string, { total: number; count: number }>();

    activeVehicles.forEach((vehicle) => {
      const stats = sums.get(vehicle.category) ?? { total: 0, count: 0 };
      stats.total += Number(vehicle.price);
      stats.count += 1;
      sums.set(vehicle.category, stats);
    });

    const averages = new Map<string, number>();
    sums.forEach((stats, category) => {
      averages.set(category, stats.total / stats.count);
    });

    return averages;
  }, [activeVehicles]);

  const inventoryStats = useMemo(() => {
    const available = visibleVehicles.filter((vehicle) => vehicle.quantity > 0).length;
    const categories = new Set(visibleVehicles.map((vehicle) => vehicle.category)).size;
    const soldOut = visibleVehicles.filter((vehicle) => vehicle.quantity === 0).length;
    const totalValue = visibleVehicles.reduce(
      (sum, vehicle) => sum + Number(vehicle.price) * vehicle.quantity,
      0,
    );

    return {
      available,
      categories,
      soldOut,
      totalValue,
    };
  }, [visibleVehicles]);

  useEffect(() => {
    let alive = true;

    const loadVehicles = async () => {
      if (demoMode) {
        return;
      }

      setLoading(true);

      try {
        const data = await vehicleApi.search(filters);

        if (!alive) {
          return;
        }

        setLiveVehicles(data);
        setError(null);
      } catch {
        if (!alive) {
          return;
        }

        setDemoMode(true);
        setStatusMessage(
          'Live inventory is offline for now. Showing demo vehicles until your database connection is ready.',
        );
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void loadVehicles();
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [demoMode, filters]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        recentlyViewedKey,
        JSON.stringify(recentlyViewedIds.slice(0, 6)),
      );
    } catch {
      // Session storage can fail in private mode; the dashboard still works without it.
    }
  }, [recentlyViewedIds]);

  const replaceVehicle = (updatedVehicle: Vehicle) => {
    if (demoMode || showcaseMode) {
      setDemoVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
        ),
      );
      return;
    }

    setLiveVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
      ),
    );
  };

  const openVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setRecentlyViewedIds((current) => [
      vehicle.id,
      ...current.filter((id) => id !== vehicle.id),
    ].slice(0, 6));
  };

  const handlePurchase = async (vehicle: Vehicle) => {
    setActionLoadingId(vehicle.id);
    setStatusMessage(null);
    setError(null);

    try {
      if (demoMode || showcaseMode) {
        const updatedVehicle = {
          ...vehicle,
          quantity: Math.max(vehicle.quantity - 1, 0),
        };
        replaceVehicle(updatedVehicle);
        setStatusMessage(`${vehicle.make} ${vehicle.model} purchased in preview mode.`);
        return;
      }

      const response = await vehicleApi.purchase(vehicle.id);
      replaceVehicle(response.vehicle);
      setStatusMessage(response.message);
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestock = async (vehicle: Vehicle) => {
    setActionLoadingId(vehicle.id);
    setStatusMessage(null);
    setError(null);

    try {
      if (demoMode || showcaseMode) {
        const updatedVehicle = {
          ...vehicle,
          quantity: vehicle.quantity + 1,
        };
        replaceVehicle(updatedVehicle);
        setStatusMessage(`${vehicle.make} ${vehicle.model} restocked in preview mode.`);
        return;
      }

      const response = await vehicleApi.restock(vehicle.id, 1);
      replaceVehicle(response.vehicle);
      setStatusMessage(response.message);
    } catch {
      setError('Restock failed. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const selectedCategoryAverage =
    selectedVehicle !== null
      ? categoryAverageByName.get(selectedVehicle.category) ?? null
      : null;

  const closeModal = () => setSelectedVehicle(null);

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-ink px-6 py-8 shadow-soft sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4 text-dune">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-dune/75">
              Inventory overview
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Vehicle dashboard for your dealership floor plan.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-dune/75">
              Search, sort, and purchase from the inventory floor while the layout stays calm, modern, and mobile-friendly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Available', `${inventoryStats.available}`],
              ['Categories', `${inventoryStats.categories}`],
              ['Zero stock', `${inventoryStats.soldOut}`],
              ['Inventory value', formatCurrency(inventoryStats.totalValue)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-dune shadow-soft"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-dune/55">
                  {label}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Make</span>
            <input
              value={makeFilter}
              onChange={(event) => setMakeFilter(event.target.value)}
              placeholder="Toyota"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Model</span>
            <input
              value={modelFilter}
              onChange={(event) => setModelFilter(event.target.value)}
              placeholder="Camry"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Category</span>
            <input
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              placeholder="SUV"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Min</span>
              <input
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="20000"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Max</span>
              <input
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="60000"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="year-desc">Newest</option>
              <option value="mileage-asc">Lowest mileage</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-ink px-5 py-5 text-dune">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-dune/60">
              View status
            </p>
            <p className="mt-3 font-display text-3xl font-semibold">
              {sortedVehicles.length} vehicles
            </p>
          </div>
          <div className="ml-auto max-w-2xl text-sm leading-6 text-dune/72">
            {demoMode
              ? statusMessage
              : showcaseMode
                ? 'No vehicles are stored yet, so you are seeing a curated showroom preview with working purchase and restock actions.'
                : hasActiveFilters
                  ? 'Live filters are active against the backend inventory endpoint.'
                  : 'Live inventory data is connected to your backend search endpoint.'}
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setMakeFilter('');
                setModelFilter('');
                setCategoryFilter('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-dune/80 transition hover:bg-white/15"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {recentlyViewedVehicles.length > 0 ? (
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Session memory
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Recently viewed
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Quick access to the vehicles you already inspected.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentlyViewedVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => openVehicle(vehicle)}
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex gap-4 p-3">
                  <img
                    src={getVehicleImage(vehicle)}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="h-20 w-28 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {vehicle.category}
                    </p>
                    <h3 className="mt-1 truncate font-display text-xl font-semibold text-ink">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(vehicle.price)} · {vehicle.quantity} in stock
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {statusMessage && !error ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-[2rem] border border-slate-200 bg-white"
              />
            ))
          : sortedVehicles.length > 0
            ? sortedVehicles.map((vehicle) => {
                const actionBusy = actionLoadingId === vehicle.id;
                const categoryAverage = categoryAverageByName.get(vehicle.category) ?? null;
                const comparisonText = getComparisonText(vehicle, categoryAverage);
                const featuredTags =
                  vehicle.features && vehicle.features.length > 0
                    ? vehicle.features
                    : [vehicle.fuelType ?? 'Dealer ready', vehicle.transmission ?? 'Automatic'];

                return (
                  <article
                    key={vehicle.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openVehicle(vehicle)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openVehicle(vehicle);
                      }
                    }}
                    className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={getVehicleImage(vehicle)}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-ink shadow-sm backdrop-blur">
                          {vehicle.category}
                        </span>
                        {vehicle.year ? (
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-ink shadow-sm backdrop-blur">
                            {vehicle.year}
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] shadow-sm ${
                            vehicle.quantity > 3
                              ? 'bg-emerald-500 text-white'
                              : vehicle.quantity > 0
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                          }`}
                        >
                          {getStatusLabel(vehicle.quantity)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Vehicle
                          </p>
                          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                            {vehicle.make} {vehicle.model}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {vehicle.description ??
                              `${vehicle.make} ${vehicle.model} ready for the showroom floor.`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Price</p>
                          <p className="font-display text-3xl font-semibold text-ink">
                            {formatCurrency(vehicle.price)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            Mileage
                          </p>
                          <p className="mt-1 font-medium text-ink">
                            {formatMileage(vehicle.mileage)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            Fuel / transmission
                          </p>
                          <p className="mt-1 font-medium text-ink">
                            {vehicle.fuelType ?? 'Dealer spec'} ·{' '}
                            {vehicle.transmission ?? 'Automatic'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {featuredTags.slice(0, 4).map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                        {comparisonText}
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">
                            Stock remaining
                          </p>
                          <p className="font-display text-2xl font-semibold text-ink">
                            {vehicle.quantity}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={actionBusy || vehicle.quantity === 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handlePurchase(vehicle);
                          }}
                          className="rounded-2xl bg-teal px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {actionBusy ? 'Working...' : 'Purchase'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openVehicle(vehicle);
                          }}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          View details
                        </button>

                        {isAdmin ? (
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleRestock(vehicle);
                            }}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Restock +1
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            : !loading ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-soft md:col-span-2 xl:col-span-3">
                  {hasActiveFilters
                    ? 'No vehicles matched your search.'
                    : 'No vehicles are available yet.'}
                </div>
              ) : null}
      </div>

      {selectedVehicle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[280px]">
                <img
                  src={getVehicleImage(selectedVehicle)}
                  alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:bg-white"
                >
                  Close
                </button>
                <div className="absolute bottom-4 left-4 right-4 space-y-3 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                    Vehicle details
                  </p>
                  <h3 className="font-display text-4xl font-semibold">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.24em] backdrop-blur">
                      {selectedVehicle.category}
                    </span>
                    {selectedVehicle.year ? (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.24em] backdrop-blur">
                        {selectedVehicle.year}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.24em] backdrop-blur">
                      {getStatusLabel(selectedVehicle.quantity)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Listing price
                    </p>
                    <p className="mt-2 font-display text-4xl font-semibold text-ink">
                      {formatCurrency(selectedVehicle.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Category average
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {selectedCategoryAverage === null
                        ? 'Unavailable'
                        : formatCurrency(selectedCategoryAverage)}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-slate-600">
                  {selectedVehicle.description ??
                    `${selectedVehicle.make} ${selectedVehicle.model} is positioned as a strong showroom option for ${selectedVehicle.category.toLowerCase()} shoppers.`}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Mileage', formatMileage(selectedVehicle.mileage)],
                    ['Fuel', selectedVehicle.fuelType ?? 'Dealer spec'],
                    ['Transmission', selectedVehicle.transmission ?? 'Automatic'],
                    ['Color', selectedVehicle.color ?? 'Not specified'],
                    ['Stock', `${selectedVehicle.quantity} units`],
                    ['Comparison', getComparisonText(selectedVehicle, selectedCategoryAverage)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        {label}
                      </p>
                      <p className="mt-1 font-medium text-ink">{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Features
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedVehicle.features && selectedVehicle.features.length > 0
                      ? selectedVehicle.features
                      : ['Backup camera', 'Touchscreen display', 'Dealer maintained']
                    ).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handlePurchase(selectedVehicle);
                    }}
                    disabled={actionLoadingId === selectedVehicle.id || selectedVehicle.quantity === 0}
                    className="rounded-2xl bg-teal px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Purchase
                  </button>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleRestock(selectedVehicle);
                      }}
                      disabled={actionLoadingId === selectedVehicle.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Restock +1
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close vehicle details"
            className="absolute inset-0 -z-10"
            onClick={closeModal}
          />
        </div>
      ) : null}
    </section>
  );
}
