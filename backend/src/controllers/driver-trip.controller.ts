import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { supabase } from "../config/supabase.js";
import { TripStopRepository } from "../repositories/trip-stop.repository.js";
import { TripRepository } from "../repositories/trip.repository.js";
import { DriverTripService } from "../services/driver-trip.service.js";

const TEST_DRIVER_ID =
  "84ce3bda-45e7-458a-bead-9fdaf75f0828";

const tripStopRepository =
  new TripStopRepository();

const tripRepository =
  new TripRepository(supabase);

const driverTripService =
  new DriverTripService(
    tripStopRepository,
    tripRepository,
  );

function getRouteParameter(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export async function getDriverDashboard(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    /*
     * Temporary until authentication is implemented.
     *
     * Later, replace TEST_DRIVER_ID with the
     * authenticated driver's ID.
     */
    const dashboard =
      await driverTripService.getDriverDashboard(
        TEST_DRIVER_ID,
      );

    /*
     * This endpoint always returns 200.
     *
     * It is valid for activeTrip, nextTrip, or
     * recentlyCompletedTrip to be null.
     */
    response.status(200).json({
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentDriverTrip(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentTrip =
      await driverTripService.getCurrentTripForDriver(
        TEST_DRIVER_ID,
      );

    if (!currentTrip) {
      response.status(404).json({
        error:
          "No active or upcoming trip was found.",
      });

      return;
    }

    response.status(200).json({
      data: currentTrip,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDriverTripManifest(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params.tripId,
      );

    if (!tripId) {
      response.status(400).json({
        error: "Trip ID is required.",
      });

      return;
    }

    const manifest =
      await driverTripService.getTripManifest(
        tripId,
      );

    response.status(200).json({
      data: manifest,
    });
  } catch (error) {
    next(error);
  }
}

export async function startDriverTrip(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params.tripId,
      );

    if (!tripId) {
      response.status(400).json({
        error: "Trip ID is required.",
      });

      return;
    }

    await driverTripService.startTrip(
      tripId,
    );

    response.status(200).json({
      data: {
        tripId,
        status: "in_progress",
      },
    });
  } catch (error) {
    const message =
      getErrorMessage(error);

    response.status(500).json({
      error: message,
    });
  }
}

export async function pickUpLearner(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params.tripId,
      );

    const stopId =
      getRouteParameter(
        request.params.stopId,
      );

    if (!tripId || !stopId) {
      response.status(400).json({
        error:
          "Trip ID and stop ID are required.",
      });

      return;
    }

    const tripStop =
      await driverTripService.pickUpLearner(
        tripId,
        stopId,
      );

    response.status(200).json({
      data: tripStop,
    });
  } catch (error) {
    const message =
      getErrorMessage(error);

    const statusCode =
      message.includes(
        "not found or is no longer pending",
      )
        ? 409
        : 500;

    response.status(statusCode).json({
      error: message,
    });
  }
}

export async function markLearnerAbsent(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params.tripId,
      );

    const stopId =
      getRouteParameter(
        request.params.stopId,
      );

    if (!tripId || !stopId) {
      response.status(400).json({
        error:
          "Trip ID and stop ID are required.",
      });

      return;
    }

    const tripStop =
      await driverTripService.markLearnerAbsent(
        tripId,
        stopId,
      );

    response.status(200).json({
      data: tripStop,
    });
  } catch (error) {
    const message =
      getErrorMessage(error);

    const statusCode =
      message.includes(
        "not found or is no longer pending",
      )
        ? 409
        : 500;

    response.status(statusCode).json({
      error: message,
    });
  }
}

export async function dropOffLearner(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params.tripId,
      );

    const stopId =
      getRouteParameter(
        request.params.stopId,
      );

    if (!tripId || !stopId) {
      response.status(400).json({
        error:
          "Trip ID and stop ID are required.",
      });

      return;
    }

    const tripStop =
      await driverTripService.dropOffLearner(
        tripId,
        stopId,
      );

    response.status(200).json({
      data: tripStop,
    });
  } catch (error) {
    const message =
      getErrorMessage(error);

    const statusCode =
      message.includes(
        "not found or the learner has not been picked up",
      )
        ? 409
        : 500;

    response.status(statusCode).json({
      error: message,
    });
  }
}