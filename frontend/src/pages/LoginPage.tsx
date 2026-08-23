import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authApi';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(
        getAuthErrorMessage(
          error,
          'Login failed. Check your credentials and try again.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-dune shadow-soft backdrop-blur sm:p-8">
        <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-dune/75">
          Secure access
        </p>
        <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Sign in to run the dealership floor plan with clarity and speed.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-dune/75 sm:text-lg">
          Authentication is backed by JWT and designed to separate user
          purchasing from admin inventory operations.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Role-aware', 'User and admin flows'],
            ['Fast', 'Streamlined dashboard access'],
            ['Safe', 'Hashed passwords and JWT'],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur"
            >
              <h2 className="font-medium text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-dune/72">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 space-y-2">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Welcome back
          </h2>
          <p className="text-sm text-slate-600">
            Sign in to access the inventory dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition placeholder:text-slate-400 focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
              placeholder="driver@dealer.com"
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-ink px-4 py-3 font-medium text-white transition hover:bg-ink/95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{' '}
          <Link className="font-medium text-teal hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
