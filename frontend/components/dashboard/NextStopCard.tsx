"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  DriverTripManifest,
  DriverTripStop,
} from "@/src/types/driver-dashboard";

type TripStopAction =
  | "pick-up"
  | "absent"
  | "drop-off";

type DriverLocation = {
  latitude: number;
  longitude: number;
};

type NextStopCardProps = {
  manifest: DriverTripManifest;
  actionLoading: boolean;
  onStopAction: (
    stopId: string,
    action: TripStopAction,
  ) => Promise<void>;
  onNotifyParent: (
    stopId: string,
  ) => Promise<void>;
};

const DOORBELL_DISTANCE_METRES = 100;

const ALLOW_DOORBELL_BYPASS =
  process.env
    .NEXT_PUBLIC_ALLOW_DOORBELL_BYPASS ===
  "true";

export function NextStopCard({
  manifest,
  actionLoading,
  onStopAction,
  onNotifyParent,
}: NextStopCardProps) {
  const stop =
    manifest.nextStop;

  const nextAction =
    manifest.nextAction;

  const [
    driverLocation,
    setDriverLocation,
  ] =
    useState<DriverLocation | null>(
      null,
    );

  const [
    locationError,
    setLocationError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    doorbellSent,
    setDoorbellSent,
  ] =
    useState(false);

  useEffect(() => {
    setDoorbellSent(false);
  }, [stop?.id]);

  useEffect(() => {
    /*
     * When the development bypass is enabled,
     * geolocation is not required in order to
     * test the doorbell.
     *
     * We still allow location tracking when
     * available so the UI can display distance,
     * but location errors will not prevent the
     * button from being used.
     */
    if (!navigator.geolocation) {
      if (!ALLOW_DOORBELL_BYPASS) {
        setLocationError(
          "Location services are unavailable.",
        );
      }

      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
          });

          setLocationError(null);
        },

        (error) => {
          if (
            ALLOW_DOORBELL_BYPASS
          ) {
            setLocationError(null);
            return;
          }

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setLocationError(
              "Location permission is required for the doorbell.",
            );

            return;
          }

          setLocationError(
            "Unable to determine your distance from this stop.",
          );
        },

        {
          enableHighAccuracy: true,
          maximumAge: 5_000,
          timeout: 15_000,
        },
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId,
      );
    };
  }, []);

  const distanceToStop =
    useMemo(() => {
      if (
        !stop ||
        !driverLocation ||
        stop.latitude === null ||
        stop.longitude === null
      ) {
        return null;
      }

      return calculateDistanceInMetres(
        driverLocation.latitude,
        driverLocation.longitude,
        stop.latitude,
        stop.longitude,
      );
    }, [
      driverLocation,
      stop,
    ]);

  if (
    !stop ||
    !nextAction
  ) {
    return null;
  }

  const learnerName =
    getLearnerName(
      stop,
    );

  const followingLearnerName =
    getFollowingLearnerName(
      manifest,
      stop.id,
      nextAction,
    );

  const isPickup =
    nextAction === "pick-up";

  const primaryAction:
    TripStopAction =
    isPickup
      ? "pick-up"
      : "drop-off";

  const stopHasCoordinates =
    stop.latitude !== null &&
    stop.longitude !== null;

  /*
   * Production:
   * Driver must be within 100 metres.
   *
   * Development/testing:
   * NEXT_PUBLIC_ALLOW_DOORBELL_BYPASS=true
   * overrides the geofence.
   */
  const isWithinDoorbellRange =
    ALLOW_DOORBELL_BYPASS ||
    (
      distanceToStop !== null &&
      distanceToStop <=
        DOORBELL_DISTANCE_METRES
    );

  const doorbellDisabled =
    actionLoading ||
    doorbellSent ||
    !isWithinDoorbellRange;

  async function handleDoorbell():
    Promise<void> {
    if (
      doorbellDisabled ||
      !stop
    ) {
      return;
    }

    await onNotifyParent(
      stop.id,
    );

    setDoorbellSent(
      true,
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Next stop
          </p>

          <h2 className="mt-2 truncate text-2xl font-bold text-slate-900">
            {learnerName}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {stop.address ||
              "Address unavailable"}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-center">
          <p className="text-xl font-bold text-slate-900">
            #{stop.sequence}
          </p>

          <p className="text-xs font-semibold text-slate-500">
            Stop
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Next after {learnerName}
        </p>

        <p className="mt-2 text-lg font-semibold text-slate-900">
          {followingLearnerName}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Doorbell
            </p>

            <p className="mt-1 text-sm text-blue-900">
              {getDoorbellMessage({
                doorbellSent,
                distanceToStop,
                stopHasCoordinates,
                locationError,
              })}
            </p>
          </div>

          {distanceToStop !== null ? (
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">
              {Math.round(
                distanceToStop,
              )}
              m away
            </span>
          ) : null}
        </div>

        <button
          type="button"
          disabled={
            doorbellDisabled
          }
          onClick={() => {
            void handleDoorbell();
          }}
          className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {doorbellSent
            ? "Parent notified"
            : "🔔 Ring Doorbell"}
        </button>
      </div>

      <button
        type="button"
        disabled={
          actionLoading
        }
        onClick={() => {
          void onStopAction(
            stop.id,
            primaryAction,
          );
        }}
        className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {actionLoading
          ? "Updating..."
          : isPickup
            ? `Pick Up ${learnerName}`
            : `Drop Off ${learnerName}`}
      </button>

      {isPickup ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={
              actionLoading
            }
            onClick={() => {
              void onStopAction(
                stop.id,
                "absent",
              );
            }}
            className="rounded-2xl bg-amber-100 px-4 py-3 font-semibold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark Absent
          </button>

          <button
            type="button"
            disabled
            title="No-show backend action still needs to be implemented."
            className="cursor-not-allowed rounded-2xl bg-red-100 px-4 py-3 font-semibold text-red-400"
          >
            No Show
          </button>
        </div>
      ) : null}

      <button
        type="button"
        disabled
        title="Undo backend action still needs to be implemented."
        className="mt-3 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-400"
      >
        ↶ Undo Last Action
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        No Show and Undo are displayed
        as workflow reminders until
        their backend actions are added.
      </p>
    </section>
  );
}

type DoorbellMessageOptions = {
  doorbellSent: boolean;
  distanceToStop:
    number | null;
  stopHasCoordinates:
    boolean;
  locationError:
    string | null;
};

function getDoorbellMessage({
  doorbellSent,
  distanceToStop,
  stopHasCoordinates,
  locationError,
}: DoorbellMessageOptions): string {
  if (doorbellSent) {
    return (
      "The parent has been told " +
      "that the driver is outside."
    );
  }

  if (
    ALLOW_DOORBELL_BYPASS
  ) {
    return (
      "Doorbell test mode is enabled."
    );
  }

  if (
    !stopHasCoordinates
  ) {
    return (
      "Add GPS coordinates to this " +
      "stop to enable the doorbell."
    );
  }

  if (locationError) {
    return locationError;
  }

  if (
    distanceToStop === null
  ) {
    return (
      "Checking your distance from " +
      "the pickup address..."
    );
  }

  if (
    distanceToStop <=
    DOORBELL_DISTANCE_METRES
  ) {
    return (
      "You are close enough to " +
      "notify the parent that you " +
      "are outside."
    );
  }

  return (
    `The doorbell unlocks within ` +
    `${DOORBELL_DISTANCE_METRES} ` +
    `metres of the stop.`
  );
}

function getFollowingLearnerName(
  manifest:
    DriverTripManifest,
  currentStopId: string,
  action: NonNullable<
    DriverTripManifest[
      "nextAction"
    ]
  >,
): string {
  const currentIndex =
    manifest.learners.findIndex(
      (learner) =>
        learner.id ===
        currentStopId,
    );

  if (
    currentIndex < 0
  ) {
    return "No further learner";
  }

  const remainingLearners =
    manifest.learners.slice(
      currentIndex + 1,
    );

  const followingStop =
    action === "pick-up"
      ? remainingLearners.find(
          (learner) =>
            learner.status ===
            "pending",
        )
      : remainingLearners.find(
          (learner) =>
            learner.status ===
            "picked_up",
        );

  if (followingStop) {
    return getLearnerName(
      followingStop,
    );
  }

  return action === "pick-up"
    ? "Pickup phase nearly complete"
    : "Final drop-off";
}

function getLearnerName(
  stop:
    DriverTripStop,
): string {
  const compatibleStop =
    stop as DriverTripStop & {
      learner_name?: string;

      learner?: {
        fullName?: string;
        full_name?: string;
      };
    };

  return (
    compatibleStop
      .learner_name ||
    compatibleStop
      .learner?.fullName ||
    compatibleStop
      .learner?.full_name ||
    "Learner"
  );
}

function calculateDistanceInMetres(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
): number {
  const earthRadiusMetres =
    6_371_000;

  const firstLatitudeRadians =
    toRadians(
      firstLatitude,
    );

  const secondLatitudeRadians =
    toRadians(
      secondLatitude,
    );

  const latitudeDifference =
    toRadians(
      secondLatitude -
        firstLatitude,
    );

  const longitudeDifference =
    toRadians(
      secondLongitude -
        firstLongitude,
    );

  const haversine =
    Math.sin(
      latitudeDifference / 2,
    ) ** 2 +
    Math.cos(
      firstLatitudeRadians,
    ) *
      Math.cos(
        secondLatitudeRadians,
      ) *
      Math.sin(
        longitudeDifference / 2,
      ) ** 2;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(
        haversine,
      ),
      Math.sqrt(
        1 - haversine,
      ),
    );

  return (
    earthRadiusMetres *
    angularDistance
  );
}

function toRadians(
  degrees: number,
): number {
  return (
    degrees *
    (Math.PI / 180)
  );
}