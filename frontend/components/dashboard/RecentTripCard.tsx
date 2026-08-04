import type {
  DriverTrip,
  DriverTripDirection,
} from "@/src/types/driver-dashboard";

type RecentTripCardProps = {
  trip: DriverTrip;
};

export function RecentTripCard({
  trip,
}: RecentTripCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
          ✓
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            RECENT TRIP
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {getDirectionLabel(trip.direction)}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Completed {formatDateTime(trip.actual_end)}
          </p>
        </div>
      </div>
    </article>
  );
}

function getDirectionLabel(
  direction:
    | DriverTripDirection
    | null
    | undefined,
) {
  switch (direction) {
    case "home_to_school":
      return "Home → School";

    case "school_to_home":
      return "School → Home";

    default:
      return "Driver Trip";
  }
}

function formatDateTime(
  value: string | null | undefined,
) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}