import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.24),_transparent_36%),linear-gradient(180deg,_#07111f_0%,_#0b1726_45%,_#f6f1e8_45%,_#f6f1e8_100%)] text-slate-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dune text-sm font-black tracking-[0.35em] text-ink shadow-soft">
            CDI
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-dune/80">
              Inventory System
            </p>
            <p className="text-xs text-dune/65">Modern dealership operations</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 text-sm text-dune shadow-soft backdrop-blur">
          {isAuthenticated ? (
            <span className="hidden rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-dune/75 sm:inline-flex">
              {role === 'ADMIN' ? 'Admin session' : 'User session'}
            </span>
          ) : (
            <span className="hidden rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-dune/75 sm:inline-flex">
              Guest access
            </span>
          )}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                'rounded-full px-4 py-2 transition',
                isActive ? 'bg-dune text-ink' : 'text-dune/80 hover:bg-white/10',
              ].join(' ')
            }
          >
            Dashboard
          </NavLink>
          {role === 'ADMIN' ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 transition',
                  isActive ? 'bg-dune text-ink' : 'text-dune/80 hover:bg-white/10',
                ].join(' ')
              }
            >
              Admin
            </NavLink>
          ) : null}
          {!isAuthenticated ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 transition',
                  isActive ? 'bg-dune text-ink' : 'text-dune/80 hover:bg-white/10',
                ].join(' ')
              }
            >
              Login
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-coral px-4 py-2 font-medium text-white transition hover:opacity-90"
            >
              Sign out
            </button>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
