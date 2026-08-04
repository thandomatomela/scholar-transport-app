import type {
  CurrentDriverTrip,
} from "@/src/types/driver-dashboard";

type ActiveTripCardProps = {
  trip: CurrentDriverTrip;
};

export function ActiveTripCard({
  trip,
}: ActiveTripCardProps) {
  const { manifest } = trip;

  const progress =
    manifest.learnerCount === 0
      ? 0
      : Math.round(
          (manifest.completedCount /
            manifest.learnerCount) *
            100,
        );

  return (
    <article className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Active trip
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {getDirectionLabel(
                trip.trip.direction,
              )}
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              {getPhaseLabel(
                manifest.currentPhase,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-500/20 px-4 py-3 text-center">
            <p className="text-3xl font-bold">
              {manifest.remainingCount}
            </p>

            <p className="text-xs text-slate-300">
              Stops left
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>
              {manifest.completedCount} of{" "}
              {manifest.learnerCount} completed
            </span>

            <span>{progress}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {manifest.nextStop ? (
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Next stop
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">
                  {manifest.nextStop.learner_name}
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {manifest.nextStop.address}
                </p>

                {manifest.nextAction ? (
                  <p className="mt-3 text-sm font-semibold text-emerald-300">
                    {getActionLabel(
                      manifest.nextAction,
                    )}
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">
                #{manifest.nextStop.sequence}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">
              Trip complete
            </p>

            <p className="mt-1 text-sm text-slate-300">
              All scheduled stops have been completed.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!manifest.nextStop}
        className="w-full bg-emerald-500 py-4 text-sm font-bold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {manifest.nextStop
          ? "Navigate to Next Stop"
          : "Trip Complete"}
      </button>
    </article>
  );
}

function getDirectionLabel(
  direction:
    | "home_to_school"
    | "school_to_home"
    | undefined,
): string {
  switch (direction) {
    case "home_to_school":
      return "Home → School";

    case "school_to_home":
      return "School → Home";

    default:
      return "Driver Trip";
  }
}

function getPhaseLabel(
  phase: "pickup" | "dropoff" | "complete",
): string {
  switch (phase) {
    case "pickup":
      return "Pickup phase";

    case "dropoff":
      return "Drop-off phase";

    case "complete":
      return "Trip complete";
  }
}

function getActionLabel(
  action: "pick-up" | "drop-off",
): string {
  return action === "pick-up"
    ? "Next action: Pick up learner"
    : "Next action: Drop off learner";
}