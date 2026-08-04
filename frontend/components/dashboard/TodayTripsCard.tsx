import { ActiveTripCard } from "@/components/dashboard/ActiveTripCard";
import { NextTripCard } from "@/components/dashboard/NextTripCard";
import { NoUpcomingTripsCard } from "@/components/dashboard/NoUpcomingTripsCard";
import { RecentTripCard } from "@/components/dashboard/RecentTripCard";

import type {
  CurrentDriverTrip,
  DriverTrip,
} from "@/src/types/driver-dashboard";

type TodayTripsCardProps = {
  activeTrip: CurrentDriverTrip | null;
  nextTrip: CurrentDriverTrip | null;
  recentlyCompletedTrip: DriverTrip | null;
  actionLoading: boolean;
  onStartNextTrip: () => void;
};

export function TodayTripsCard({
  activeTrip,
  nextTrip,
  recentlyCompletedTrip,
  actionLoading,
  onStartNextTrip,
}: TodayTripsCardProps) {
  const hasUpcomingTrip =
    activeTrip !== null || nextTrip !== null;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today&apos;s trips
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Driver schedule
          </h2>
        </div>

        <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          {getTripCount(activeTrip, nextTrip)} scheduled
        </div>
      </div>

      <div className="space-y-4">
        {activeTrip ? (
          <ActiveTripCard trip={activeTrip} />
        ) : null}

        {nextTrip ? (
          <NextTripCard
            trip={nextTrip}
            loading={actionLoading}
            onStart={onStartNextTrip}
          />
        ) : null}

        {!hasUpcomingTrip ? (
          <NoUpcomingTripsCard />
        ) : null}

        {recentlyCompletedTrip ? (
          <RecentTripCard
            trip={recentlyCompletedTrip}
          />
        ) : null}
      </div>
    </section>
  );
}

function getTripCount(
  activeTrip: CurrentDriverTrip | null,
  nextTrip: CurrentDriverTrip | null,
): number {
  let count = 0;

  if (activeTrip) {
    count += 1;
  }

  if (nextTrip) {
    count += 1;
  }

  return count;
}