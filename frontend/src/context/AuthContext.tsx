import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { authApi } from '../services/authApi';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../services/tokenStore';

type AuthRole = 'USER' | 'ADMIN' | null;

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  role: AuthRole;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [role, setRole] = useState<AuthRole>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      role,
      token,
      login: async (payload: LoginPayload) => {
        const response = await authApi.login(payload);
        setAccessToken(response.token);
        setToken(response.token);
        setRole(response.role);
      },
      register: async (payload: RegisterPayload) => {
        const response = await authApi.register(payload);
        setAccessToken(response.token);
        setToken(response.token);
        setRole(response.role);
      },
      logout: () => {
        clearAccessToken();
        setToken(null);
        setRole(null);
      },
    }),
    [role, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
