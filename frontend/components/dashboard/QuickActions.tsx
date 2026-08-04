const actions = [
  {
    title: "Trips",
    icon: "🚌",
  },
  {
    title: "Navigate",
    icon: "📍",
  },
  {
    title: "Dispatch",
    icon: "📞",
  },
  {
    title: "Vehicle",
    icon: "🔧",
  },
];

export function QuickActions() {
  return (
    <section>
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Driver tools
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-3xl">
              {action.icon}
            </div>

            <p className="mt-3 font-semibold text-slate-900">
              {action.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}