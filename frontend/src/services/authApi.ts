import { api } from './api';

export type AuthResponse = {
  token: string;
  role: 'USER' | 'ADMIN';
};

type ApiError = {
  message?: string;
};

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  async register(payload: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },
};

export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: ApiError } }).response;
    return response?.data?.message ?? fallback;
  }

  return fallback;
};
