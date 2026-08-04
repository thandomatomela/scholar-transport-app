"use client";

type DashboardHeaderProps = {
  driverName?: string;
};

export function DashboardHeader({
  driverName = "Driver",
}: DashboardHeaderProps) {
  const now = new Date();

  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const date = new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(now);

  return (
    <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-300">
            {greeting}
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            {driverName} 👋
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {date}
          </p>

        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">

          <p className="text-xs uppercase tracking-wider text-slate-300">
            Status
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-400">
            Online
          </p>

        </div>

      </div>

    </header>
  );
}