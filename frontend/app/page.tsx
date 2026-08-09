"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { NextStopCard } from "@/components/dashboard/NextStopCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodayTripsCard } from "@/components/dashboard/TodayTripsCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

import { useDriverDashboard } from "@/hooks/useDriverDashboard";
import { useWeather } from "@/hooks/useWeather";

import type {
  DriverTripDirection,
} from "@/src/types/driver-dashboard";

export default function Page() {
  const {
    dashboard,
    loading,
    actionLoading,
    error,
    refreshDashboard,
    startNextTrip,
    startMorningDriverRun,
    startAfternoonDriverRun,
    performTripStopAction,
    notifyParent,
    undoLastAction,
  } = useDriverDashboard();

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    refreshWeather,
  } = useWeather();

  if (loading) {
    return <DashboardLoadingState />;
  }

  const activeTrip =
    dashboard?.activeTrip ?? null;

  const recentlyCompletedTrip =
    dashboard?.recentlyCompletedTrip ??
    null;

  const recentlyCompletedDirection =
    recentlyCompletedTrip?.direction ??
    null;

  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
        <DashboardHeader
          driverName="Driver"
        />

        {error ? (
          <DashboardError
            message={error}
            onRetry={() => {
              void refreshDashboard();
            }}
          />
        ) : null}

        <WeatherSection
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onRetry={() => {
            void refreshWeather();
          }}
        />

        {!activeTrip ? (
          <RunLauncher
            loading={actionLoading}
            recentlyCompletedDirection={
              recentlyCompletedDirection
            }
            recentlyCompletedTripId={
              recentlyCompletedTrip?.id ??
              null
            }
            onStartMorning={() => {
              void startMorningDriverRun();
            }}
            onStartAfternoon={() => {
              void startAfternoonDriverRun();
            }}
            onUndoLastAction={() => {
              void undoLastAction();
            }}
          />
        ) : null}

        {activeTrip ? (
          <NextStopCard
            manifest={
              activeTrip.manifest
            }
            actionLoading={
              actionLoading
            }
            onStopAction={
              performTripStopAction
            }
            onNotifyParent={
              notifyParent
            }
            onUndoLastAction={
              undoLastAction
            }
          />
        ) : null}

        <DashboardMap
          stops={
            activeTrip
              ?.manifest.learners ??
            []
          }
          nextStop={
            activeTrip
              ?.manifest.nextStop ??
            null
          }
        />

        <TodayTripsCard
          activeTrip={
            activeTrip
          }
          nextTrip={
            dashboard?.nextTrip ??
            null
          }
          recentlyCompletedTrip={
            recentlyCompletedTrip
          }
          actionLoading={
            actionLoading
          }
          onStartNextTrip={() => {
            void startNextTrip();
          }}
        />

        <QuickActions />
      </div>
    </main>
  );
}

type RunLauncherProps = {
  loading: boolean;

  recentlyCompletedDirection:
    | DriverTripDirection
    | null
    | undefined;

  recentlyCompletedTripId:
    | string
    | null;

  onStartMorning:
    () => void;

  onStartAfternoon:
    () => void;

  onUndoLastAction:
    () => void;
};

function RunLauncher({
  loading,
  recentlyCompletedDirection,
  recentlyCompletedTripId,
  onStartMorning,
  onStartAfternoon,
  onUndoLastAction,
}: RunLauncherProps) {
  const morningCompleted =
    recentlyCompletedDirection ===
    "home_to_school";

  const afternoonCompleted =
    recentlyCompletedDirection ===
    "school_to_home";

  if (afternoonCompleted) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          Driver runs
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Today&apos;s runs are complete
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Both runs have finished. You can
          undo the final drop-off or restart
          either run while the app is using
          development test data.
        </p>

        {recentlyCompletedTripId ? (
          <button
            type="button"
            disabled={loading}
            onClick={
              onUndoLastAction
            }
            className="mt-5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↶ Undo Last Drop-Off
          </button>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={
              onStartMorning
            }
            className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="text-3xl">
              🌅
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Restart Morning Run
            </h3>

            <p className="mt-1 text-sm font-semibold text-amber-800">
              Home → School
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reset all morning stops
              and begin again.
            </p>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={
              onStartAfternoon
            }
            className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-100 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="text-3xl">
              🌇
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Restart Afternoon Run
            </h3>

            <p className="mt-1 text-sm font-semibold text-indigo-800">
              School → Home
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reset all afternoon stops
              and begin again.
            </p>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Development mode: restarting a
          run resets its trip stops.
        </p>

        {loading ? (
          <RunPreparingState />
        ) : null}
      </section>
    );
  }

  if (morningCompleted) {
    return (
      <section className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
          Driver runs
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Morning run complete
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          The morning pickup and drop-off
          cycle is finished. You can undo
          the final drop-off or start the
          afternoon run when you are ready.
        </p>

        {recentlyCompletedTripId ? (
          <button
            type="button"
            disabled={loading}
            onClick={
              onUndoLastAction
            }
            className="mt-5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↶ Undo Last Drop-Off
          </button>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={
            onStartAfternoon
          }
          className="group mt-4 w-full rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-100 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl">
                🌇
              </p>

              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Start Afternoon Run
              </h3>

              <p className="mt-1 text-sm font-semibold text-indigo-800">
                School → Home
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Prepare the afternoon run
                and load the first learner
                automatically.
              </p>
            </div>

            <span className="text-xl text-indigo-700 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </button>

        {loading ? (
          <RunPreparingState />
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
        Driver runs
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Start today&apos;s morning run
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Begin the morning transport cycle.
        The app will reset the assigned
        stops and load the first learner.
      </p>

      <button
        type="button"
        disabled={loading}
        onClick={
          onStartMorning
        }
        className="group mt-6 w-full rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl">
              🌅
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Start Morning Run
            </h3>

            <p className="mt-1 text-sm font-semibold text-amber-800">
              Home → School
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Prepare the morning run
              and load the first learner
              automatically.
            </p>
          </div>

          <span className="text-xl text-amber-700 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </button>

      {loading ? (
        <RunPreparingState />
      ) : null}
    </section>
  );
}

function RunPreparingState() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

      <p className="text-sm font-semibold text-slate-700">
        Preparing run...
      </p>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

        <p className="mt-4 font-semibold text-slate-700">
          Loading dashboard...
        </p>
      </div>
    </main>
  );
}

type DashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

function DashboardError({
  message,
  onRetry,
}: DashboardErrorProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <p className="font-semibold">
        Dashboard unavailable
      </p>

      <p className="mt-1 text-sm">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
      >
        Retry dashboard
      </button>
    </section>
  );
}

type WeatherSectionProps = {
  weather: {
    temperature: number;
    condition: string;
    icon: string;
    drivingMessage: string;
  } | null;

  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

function WeatherSection({
  weather,
  loading,
  error,
  onRetry,
}: WeatherSectionProps) {
  if (loading) {
    return <WeatherLoadingState />;
  }

  if (!weather) {
    return (
      <section
        role="alert"
        className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700"
      >
        <p className="font-semibold">
          Weather unavailable
        </p>

        <p className="mt-1 text-sm">
          {error ??
            "Unable to load weather."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Retry weather
        </button>
      </section>
    );
  }

  return (
    <WeatherCard
      location="Port Elizabeth"
      temperature={
        weather.temperature
      }
      condition={
        weather.condition
      }
      icon={
        weather.icon
      }
      drivingMessage={
        weather.drivingMessage
      }
    />
  );
}

function WeatherLoadingState() {
  return (
    <section
      aria-label="Loading weather"
      className="animate-pulse rounded-3xl bg-slate-200 p-6"
    >
      <div className="h-4 w-32 rounded bg-slate-300" />

      <div className="mt-4 h-8 w-48 rounded bg-slate-300" />

      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="h-12 w-24 rounded bg-slate-300" />

        <div className="h-16 w-44 rounded-2xl bg-slate-300" />
      </div>
    </section>
  );
}