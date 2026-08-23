import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mt-4 text-slate-600">
        The route you requested does not exist yet.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 font-medium text-white transition hover:bg-ink/95"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

