export function NoUpcomingTripsCard() {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        🚌
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        No upcoming trips
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        You have no active or scheduled trips right now.
      </p>
    </article>
  );
}