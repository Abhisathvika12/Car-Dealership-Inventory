import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Premium inventory display',
    body: 'The layout is tuned to feel like a thoughtful dealership product instead of a generic dashboard.',
  },
  {
    title: 'Role-aware access',
    body: 'Customer and admin experiences stay separate so the app can scale cleanly as we add more operations.',
  },
  {
    title: 'Inventory operations',
    body: 'Search, purchase, restock, and CRUD workflows are all planned around the same visual system.',
  },
];

export function LandingPage() {
  return (
    <section className="space-y-10 py-6">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-7 text-dune">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-dune/70">
            Car Dealership Inventory System
          </span>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
            A portfolio-ready dealership experience with sharp UI and real
            workflow structure.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-dune/75">
            Built as a full-stack take-home project with TypeScript, Express,
            Prisma, PostgreSQL, React, Vite, and Tailwind. The app is organized
            to scale from authentication to inventory operations without losing
            visual polish.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-2xl bg-coral px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-medium text-dune transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Ready', 'Backend auth and middleware'],
              ['Styled', 'Responsive Tailwind layout'],
              ['Planned', 'Vehicles, search, purchase'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-dune/55">
                  {label}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
          <div className="rounded-[1.5rem] bg-dune p-5 text-ink">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-teal">
                  Dealership pulse
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  Inventory at a glance
                </h2>
              </div>
              <div className="rounded-full bg-ink px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-dune">
                Live-ready
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['Sedan stock', '24 vehicles', 'Healthy'],
                ['SUV stock', '16 vehicles', 'Balanced'],
                ['Truck stock', '08 vehicles', 'Tight'],
              ].map(([label, amount, note]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="text-xs text-slate-500">{note}</p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink">
                    {amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-dune shadow-soft backdrop-blur"
          >
            <h3 className="font-display text-2xl font-semibold text-white">
              {item.title}
            </h3>
            <p className="mt-3 leading-7 text-dune/72">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

