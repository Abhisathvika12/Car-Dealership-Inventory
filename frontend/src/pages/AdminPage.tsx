export function AdminPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Admin operations
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
          Vehicle management workspace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          This phase includes the shell for add, edit, delete, and restock
          workflows. The live actions will be connected after the backend CRUD
          endpoints are in place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Add vehicle
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Placeholder form for Phase 9.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Restock actions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Admin-only inventory controls will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}

