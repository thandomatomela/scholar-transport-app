"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchDriverDashboard,
  notifyParentDriverArrived,
  startAfternoonRun,
  startDriverTrip,
  startMorningRun,
  undoLastDriverAction,
  updateDriverTripStop,
} from "@/services/driver-dashboard.service";

import type {
  DriverDashboard,
} from "@/src/types/driver-dashboard";

type TripStopAction =
  | "pick-up"
  | "absent"
  | "no-show"
  | "drop-off";

type UseDriverDashboardResult = {
  dashboard: DriverDashboard | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;

  refreshDashboard:
    () => Promise<void>;

  startNextTrip:
    () => Promise<void>;

  startMorningDriverRun:
    () => Promise<void>;

  startAfternoonDriverRun:
    () => Promise<void>;

  performTripStopAction: (
    stopId: string,
    action: TripStopAction,
  ) => Promise<void>;

  notifyParent: (
    stopId: string,
  ) => Promise<void>;

  undoLastAction:
    () => Promise<void>;
};

export function useDriverDashboard():
  UseDriverDashboardResult {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<DriverDashboard | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /*
   * Immediate guard against duplicate
   * taps before React has time to
   * re-render and disable buttons.
   */
  const actionInFlightRef =
    useRef(false);

  const refreshDashboard =
    useCallback(
      async (): Promise<void> => {
        try {
          setError(null);

          const nextDashboard =
            await fetchDriverDashboard();

          setDashboard(
            nextDashboard,
          );
        } catch (caughtError) {
          setDashboard(null);

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "An unexpected error occurred.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  const startNextTrip =
    useCallback(
      async (): Promise<void> => {
        const nextTrip =
          dashboard?.nextTrip;

        if (
          !nextTrip ||
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        try {
          setActionLoading(true);
          setError(null);

          await startDriverTrip(
            nextTrip.trip.id,
          );

          await refreshDashboard();
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "An unexpected error occurred.",
          );
        } finally {
          actionInFlightRef.current =
            false;

          setActionLoading(false);
        }
      },
      [
        dashboard?.nextTrip,
        refreshDashboard,
      ],
    );

  const startMorningDriverRun =
    useCallback(
      async (): Promise<void> => {
        if (
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        try {
          setActionLoading(true);
          setError(null);

          const nextDashboard =
            await startMorningRun();

          setDashboard(
            nextDashboard,
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to start the morning run.",
          );
        } finally {
          actionInFlightRef.current =
            false;

          setActionLoading(false);
        }
      },
      [],
    );

  const startAfternoonDriverRun =
    useCallback(
      async (): Promise<void> => {
        if (
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        try {
          setActionLoading(true);
          setError(null);

          const nextDashboard =
            await startAfternoonRun();

          setDashboard(
            nextDashboard,
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to start the afternoon run.",
          );
        } finally {
          actionInFlightRef.current =
            false;

          setActionLoading(false);
        }
      },
      [],
    );

  const performTripStopAction =
    useCallback(
      async (
        stopId: string,
        action: TripStopAction,
      ): Promise<void> => {
        const activeTrip =
          dashboard?.activeTrip;

        if (
          !activeTrip ||
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        try {
          setActionLoading(true);
          setError(null);

          await updateDriverTripStop(
            activeTrip.trip.id,
            stopId,
            action,
          );

          await refreshDashboard();
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "An unexpected error occurred.",
          );
        } finally {
          actionInFlightRef.current =
            false;

          setActionLoading(false);
        }
      },
      [
        dashboard?.activeTrip,
        refreshDashboard,
      ],
    );

  const notifyParent =
    useCallback(
      async (
        stopId: string,
      ): Promise<void> => {
        const activeTrip =
          dashboard?.activeTrip;

        if (
          !activeTrip ||
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        try {
          setActionLoading(true);
          setError(null);

          await notifyParentDriverArrived(
            activeTrip.trip.id,
            stopId,
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to notify the parent.",
          );
        } finally {
          actionInFlightRef.current =
            false;

          setActionLoading(false);
        }
      },
      [
        dashboard?.activeTrip,
      ],
    );

  const undoLastAction =
  useCallback(
    async (): Promise<void> => {
      const tripId =
        dashboard?.activeTrip?.trip.id ??
        dashboard?.recentlyCompletedTrip?.id ??
        null;

      if (
        !tripId ||
        actionInFlightRef.current
      ) {
        return;
      }

      actionInFlightRef.current =
        true;

      try {
        setActionLoading(true);
        setError(null);

        await undoLastDriverAction(
          tripId,
        );

        await refreshDashboard();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to undo the last driver action.",
        );
      } finally {
        actionInFlightRef.current =
          false;

        setActionLoading(false);
      }
    },
    [
      dashboard?.activeTrip,
      dashboard?.recentlyCompletedTrip,
      refreshDashboard,
    ],
  );
  return {
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
  };
}