import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authApi';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(
        getAuthErrorMessage(
          error,
          'Registration failed. Try a different email and password.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 space-y-2">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Create account
          </h1>
          <p className="text-sm text-slate-600">
            Start with a secure dealership account.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
              placeholder="admin@dealer.com"
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
              placeholder="Create a strong password"
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
            className="flex w-full items-center justify-center rounded-2xl bg-coral px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-teal hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </section>

      <section className="space-y-6 text-dune">
        <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-dune/75">
          Admin ready
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          A clean workflow for inventory, sales, and role-based control.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-dune/75 sm:text-lg">
          The app is structured to separate customer actions from admin
          operations so we can plug in secure backend endpoints in the next
          phase.
        </p>
      </section>
    </div>
  );
}
