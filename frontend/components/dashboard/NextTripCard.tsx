import type {
  CurrentDriverTrip,
} from "@/src/types/driver-dashboard";

type NextTripCardProps = {
  trip: CurrentDriverTrip;
  loading: boolean;
  onStart: () => void;
};

export function NextTripCard({
  trip,
  loading,
  onStart,
}: NextTripCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs uppercase tracking-widest text-blue-600">
            NEXT TRIP
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {trip.trip.direction === "home_to_school"
              ? "Home → School"
              : "School → Home"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {trip.manifest.learnerCount} Learners
          </p>

        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">

          <p className="text-2xl font-bold text-blue-700">
            {trip.manifest.remainingCount}
          </p>

          <p className="text-xs text-blue-600">
            Stops
          </p>

        </div>

      </div>

      <button
        onClick={onStart}
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {loading
          ? "Starting..."
          : "Start Trip"}
      </button>

    </article>
  );
}