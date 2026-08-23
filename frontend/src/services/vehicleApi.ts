import { api } from './api';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: number;
  imageUrl?: string;
};

export const vehicleApi = {
  async list() {
    const { data } = await api.get<Vehicle[]>('/vehicles');
    return data;
  },

  async search(params: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const { data } = await api.get<{ vehicles: Vehicle[] }>('/vehicles/search', {
      params,
    });

    return data.vehicles;
  },

  async purchase(id: string) {
    const { data } = await api.post<{ message: string; vehicle: Vehicle }>(
      `/vehicles/${id}/purchase`,
    );

    return data;
  },

  async restock(id: string, quantity = 1) {
    const { data } = await api.post<{ message: string; vehicle: Vehicle }>(
      `/vehicles/${id}/restock`,
      {
        quantity,
      },
    );

    return data;
  },
};
