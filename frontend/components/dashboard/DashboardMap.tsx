"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  DriverTripStop,
} from "@/src/types/driver-dashboard";

type DriverLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: number;
};

type LocationState =
  | "loading"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

type DashboardMapProps = {
  stops?: DriverTripStop[];
  nextStop?: DriverTripStop | null;
};

export function DashboardMap({
  stops = [],
  nextStop = null,
}: DashboardMapProps) {
  const [location, setLocation] =
    useState<DriverLocation | null>(null);

  const [locationState, setLocationState] =
    useState<LocationState>("loading");

  const watchIdRef =
    useRef<number | null>(null);

  const stopWatchingLocation =
    useCallback((): void => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current,
        );

        watchIdRef.current = null;
      }
    }, []);

  const startWatchingLocation =
    useCallback((): void => {
      if (!navigator.geolocation) {
        setLocationState("unsupported");
        return;
      }

      stopWatchingLocation();
      setLocationState("loading");

      watchIdRef.current =
        navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude:
                position.coords.latitude,
              longitude:
                position.coords.longitude,
              accuracy:
                position.coords.accuracy,
              updatedAt:
                position.timestamp,
            });

            setLocationState("ready");
          },
          (error) => {
            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              setLocationState("denied");
              return;
            }

            setLocationState("error");
          },
          {
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 5_000,
          },
        );
    }, [stopWatchingLocation]);

  useEffect(() => {
    startWatchingLocation();

    return () => {
      stopWatchingLocation();
    };
  }, [
    startWatchingLocation,
    stopWatchingLocation,
  ]);

  const mapUrl = location
    ? createOpenStreetMapUrl(
        location,
        nextStop,
      )
    : null;

  const lastUpdated = location
    ? formatUpdatedTime(
        location.updatedAt,
      )
    : null;

  const completedStops =
    stops.filter(
      (stop) =>
        stop.status === "dropped_off" ||
        stop.status === "absent",
    ).length;

  const remainingStops =
    stops.filter(
      (stop) =>
        stop.status === "pending" ||
        stop.status === "picked_up",
    ).length;

  const nextStopHasCoordinates =
    nextStop?.latitude !== null &&
    nextStop?.latitude !== undefined &&
    nextStop?.longitude !== null &&
    nextStop?.longitude !== undefined;

  function handleNavigate(): void {
    if (!nextStop) {
      return;
    }

    const destination =
      nextStopHasCoordinates
        ? `${nextStop.latitude},${nextStop.longitude}`
        : nextStop.address;

    const mapsUrl =
      "https://www.google.com/maps/dir/" +
      `?api=1&destination=${encodeURIComponent(
        destination,
      )}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Live location
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Driver map
          </h2>

          {nextStop ? (
            <p className="mt-1 text-sm text-slate-500">
              Next: {nextStop.learner_name}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              No active destination
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-emerald-700">
            Tracking
          </span>
        </div>
      </div>

      {stops.length > 0 ? (
        <div className="grid grid-cols-3 border-y border-slate-100 bg-slate-50">
          <MapStat
            label="Total"
            value={stops.length}
          />

          <MapStat
            label="Completed"
            value={completedStops}
          />

          <MapStat
            label="Remaining"
            value={remainingStops}
          />
        </div>
      ) : null}

      <div className="relative h-80 bg-slate-100">
        {locationState === "ready" &&
        location &&
        mapUrl ? (
          <>
            <iframe
              key={createMapKey(
                location,
                nextStop,
              )}
              title="Driver location map"
              src={mapUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl bg-slate-950/85 px-4 py-3 text-white shadow-lg backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-300">
                    Current position
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {location.latitude.toFixed(5)}
                    {", "}
                    {location.longitude.toFixed(5)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-300">
                    Accuracy
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    ±
                    {Math.round(
                      location.accuracy,
                    )}
                    m
                  </p>
                </div>
              </div>

              {lastUpdated ? (
                <p className="mt-2 text-xs text-slate-400">
                  Updated {lastUpdated}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <MapStatus
            state={locationState}
            onRetry={
              startWatchingLocation
            }
          />
        )}
      </div>

      {nextStop ? (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Next destination
              </p>

              <p className="mt-1 truncate font-bold text-slate-900">
                {nextStop.learner_name}
              </p>

              <p className="mt-1 truncate text-sm text-slate-600">
                {nextStop.address}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNavigate}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Navigate
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type MapStatProps = {
  label: string;
  value: number;
};

function MapStat({
  label,
  value,
}: MapStatProps) {
  return (
    <div className="border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

type MapStatusProps = {
  state: LocationState;
  onRetry: () => void;
};

function MapStatus({
  state,
  onRetry,
}: MapStatusProps) {
  const content =
    getMapStatusContent(state);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white shadow-md">
        {content.icon}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {content.title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {content.description}
      </p>

      {state !== "loading" ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

function getMapStatusContent(
  state: LocationState,
) {
  switch (state) {
    case "loading":
      return {
        icon: "⌖",
        title: "Finding your location",
        description:
          "Please wait while the dashboard connects to your device GPS.",
      };

    case "denied":
      return {
        icon: "!",
        title: "Location permission needed",
        description:
          "Allow location access in your browser settings so the dashboard can track your live position.",
      };

    case "unsupported":
      return {
        icon: "×",
        title: "Location is unavailable",
        description:
          "This browser does not support device location services.",
      };

    default:
      return {
        icon: "↻",
        title: "Unable to load your location",
        description:
          "Check that location services are enabled, then try again.",
      };
  }
}

function createOpenStreetMapUrl(
  location: DriverLocation,
  nextStop: DriverTripStop | null,
): string {
  const destination =
    getStopCoordinates(nextStop);

  if (!destination) {
    return createSingleLocationMapUrl(
      location.latitude,
      location.longitude,
    );
  }

  const padding = 0.01;

  const left =
    Math.min(
      location.longitude,
      destination.longitude,
    ) - padding;

  const right =
    Math.max(
      location.longitude,
      destination.longitude,
    ) + padding;

  const bottom =
    Math.min(
      location.latitude,
      destination.latitude,
    ) - padding;

  const top =
    Math.max(
      location.latitude,
      destination.latitude,
    ) + padding;

  const boundingBox = [
    left,
    bottom,
    right,
    top,
  ].join("%2C");

  const marker =
    `${location.latitude}%2C${location.longitude}`;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${boundingBox}` +
    "&layer=mapnik" +
    `&marker=${marker}`
  );
}

function createSingleLocationMapUrl(
  latitude: number,
  longitude: number,
): string {
  const offset = 0.01;

  const left =
    longitude - offset;

  const right =
    longitude + offset;

  const top =
    latitude + offset;

  const bottom =
    latitude - offset;

  const boundingBox = [
    left,
    bottom,
    right,
    top,
  ].join("%2C");

  const marker =
    `${latitude}%2C${longitude}`;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${boundingBox}` +
    "&layer=mapnik" +
    `&marker=${marker}`
  );
}

function getStopCoordinates(
  stop: DriverTripStop | null,
): {
  latitude: number;
  longitude: number;
} | null {
  if (
    !stop ||
    stop.latitude === null ||
    stop.longitude === null
  ) {
    return null;
  }

  return {
    latitude: stop.latitude,
    longitude: stop.longitude,
  };
}

function createMapKey(
  location: DriverLocation,
  nextStop: DriverTripStop | null,
): string {
  const destination =
    getStopCoordinates(nextStop);

  return [
    location.latitude,
    location.longitude,
    destination?.latitude ?? "none",
    destination?.longitude ?? "none",
  ].join("-");
}

function formatUpdatedTime(
  timestamp: number,
): string {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  ).format(date);
}