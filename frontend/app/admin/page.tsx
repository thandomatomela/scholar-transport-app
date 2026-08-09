const stats = [
  {
    label: "Learners",
    value: "—",
    helper: "Registered learners",
  },
  {
    label: "Drivers",
    value: "—",
    helper: "Active drivers",
  },
  {
    label: "Vehicles",
    value: "—",
    helper: "Fleet vehicles",
  },
  {
    label: "Trips Today",
    value: "—",
    helper: "Scheduled transport runs",
  },
];

const quickActions = [
  {
    title: "Add Learner",
    description:
      "Register a learner and their transport details.",
    href: "/admin/learners",
  },
  {
    title: "Manage Drivers",
    description:
      "View drivers and assignments.",
    href: "/admin/drivers",
  },
  {
    title: "Plan Routes",
    description:
      "Build and maintain transport routes.",
    href: "/admin/routes",
  },
  {
    title: "Schedule Trips",
    description:
      "Prepare upcoming morning and afternoon runs.",
    href: "/admin/trips",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-slate-500">
          Operations overview
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Back Office Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage learners, drivers, vehicles,
          routes, trips, and daily transport
          operations from one place.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          (stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {stat.helper}
              </p>
            </div>
          ),
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Today&apos;s operations
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Transport status
              </h2>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Live
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Morning runs
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                —
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Afternoon runs
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                —
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Alerts
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                —
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            System
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Operations health
          </h2>

          <div className="mt-6 space-y-4">
            <StatusRow
              label="Backend API"
              status="Connected later"
            />

            <StatusRow
              label="WhatsApp"
              status="Connected later"
            />

            <StatusRow
              label="Database"
              status="Connected later"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-500">
            Quick actions
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Common tasks
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(
            (action) => (
              <a
                key={action.title}
                href={action.href}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>

                <p className="mt-4 text-sm font-semibold text-emerald-700">
                  Open →
                </p>
              </a>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

type StatusRowProps = {
  label: string;
  status: string;
};

function StatusRow({
  label,
  status,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        {status}
      </span>
    </div>
  );
}