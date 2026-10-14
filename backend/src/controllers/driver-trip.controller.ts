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
  new TripRepository(
    supabase,
  );

const driverTripService =
  new DriverTripService(
    tripStopRepository,
    tripRepository,
  );

function getRouteParameter(
  value:
    | string
    | string[]
    | undefined,
): string | undefined {
  return Array.isArray(
    value,
  )
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

function getConflictStatusCode(
  message: string,
): number {
  if (
    message.includes(
      "not found",
    ) ||
    message.includes(
      "no longer",
    ) ||
    message.includes(
      "not currently",
    ) ||
    message.includes(
      "no driver action to undo",
    )
  ) {
    return 409;
  }

  return 500;
}

export async function startMorningRun(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    await driverTripService.startMorningRun(
      TEST_DRIVER_ID,
    );

    const dashboard =
      await driverTripService.getDriverDashboard(
        TEST_DRIVER_ID,
      );

    response
      .status(200)
      .json({
        data: dashboard,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    response
      .status(
        getConflictStatusCode(
          message,
        ),
      )
      .json({
        error: message,
      });
  }
}

export async function startAfternoonRun(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    await driverTripService.startAfternoonRun(
      TEST_DRIVER_ID,
    );

    const dashboard =
      await driverTripService.getDriverDashboard(
        TEST_DRIVER_ID,
      );

    response
      .status(200)
      .json({
        data: dashboard,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    response
      .status(
        getConflictStatusCode(
          message,
        ),
      )
      .json({
        error: message,
      });
  }
}

export async function getDriverDashboard(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    /*
     * Temporary until authentication
     * is implemented.
     *
     * Later, replace TEST_DRIVER_ID
     * with the authenticated driver's ID.
     */
    const dashboard =
      await driverTripService.getDriverDashboard(
        TEST_DRIVER_ID,
      );

    response
      .status(200)
      .json({
        data: dashboard,
      });
  } catch (error) {
    next(
      error,
    );
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
      response
        .status(404)
        .json({
          error:
            "No active or upcoming trip was found.",
        });

      return;
    }

    response
      .status(200)
      .json({
        data: currentTrip,
      });
  } catch (error) {
    next(
      error,
    );
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
        request.params
          .tripId,
      );

    if (!tripId) {
      response
        .status(400)
        .json({
          error:
            "Trip ID is required.",
        });

      return;
    }

    const manifest =
      await driverTripService.getTripManifest(
        tripId,
      );

    response
      .status(200)
      .json({
        data: manifest,
      });
  } catch (error) {
    next(
      error,
    );
  }
}

export async function startDriverTrip(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params
          .tripId,
      );

    if (!tripId) {
      response
        .status(400)
        .json({
          error:
            "Trip ID is required.",
        });

      return;
    }

    await driverTripService.startTrip(
      tripId,
    );

    response
      .status(200)
      .json({
        data: {
          tripId,
          status:
            "in_progress",
        },
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    response
      .status(
        getConflictStatusCode(
          message,
        ),
      )
      .json({
        error:
          message,
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
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
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

    response
      .status(200)
      .json({
        data:
          tripStop,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
  message.includes(
    "not found or the driver has not completed the arrival workflow",
  )
    ? 409
    : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
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
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
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

    response
      .status(200)
      .json({
        data:
          tripStop,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "not found or is no longer pending",
      )
        ? 409
        : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
      });
  }
}

export async function markLearnerNoShow(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
          error:
            "Trip ID and stop ID are required.",
        });

      return;
    }

    const tripStop =
      await driverTripService.markLearnerNoShow(
        tripId,
        stopId,
      );

    response
      .status(200)
      .json({
        data:
          tripStop,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "not found or is no longer pending",
      )
        ? 409
        : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
      });
  }
}

export async function notifyParentDriverOnTheWay(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
          error:
            "Trip ID and stop ID are required.",
        });

      return;
    }

    await driverTripService.notifyParentDriverOnTheWay(
      tripId,
      stopId,
    );

    response
      .status(200)
      .json({
        data: {
          tripId,
          stopId,
          notification:
            "Parent on-the-way notification requested.",
        },
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "Trip stop was not found",
      )
        ? 404
        : message.includes(
  "Another learner is already en route",
) ||
message.includes(
  "Only a pending learner",
) ||
message.includes(
  "not currently in progress",
)
        ? 409
        : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
      });
  }
}

// Ring the Bell requires driver GPS coordinates.
export async function notifyParentDriverArrived(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
          error:
            "Trip ID and stop ID are required.",
        });

      return;
    }

    const latitude =
      request.body?.latitude;

    const longitude =
      request.body?.longitude;

    if (
      typeof latitude !==
        "number" ||
      !Number.isFinite(
        latitude,
      ) ||
      latitude < -90 ||
      latitude > 90
    ) {
      response
        .status(400)
        .json({
          error:
            "A valid latitude is required.",
        });

      return;
    }

    if (
      typeof longitude !==
        "number" ||
      !Number.isFinite(
        longitude,
      ) ||
      longitude < -180 ||
      longitude > 180
    ) {
      response
        .status(400)
        .json({
          error:
            "A valid longitude is required.",
        });

      return;
    }

    await driverTripService.notifyParentDriverArrived(
      tripId,
      stopId,
      latitude,
      longitude,
    );

    response
      .status(200)
      .json({
        data: {
          tripId,
          stopId,
          notification:
            "Parent arrival notification requested.",
        },
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "Trip stop was not found",
      )
        ? 404
        : message.includes(
              "not currently",
            ) ||
            message.includes(
              "too far",
            ) ||
            message.includes(
              "location is unavailable",
            )
          ? 409
          : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
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
        request.params
          .tripId,
      );

    const stopId =
      getRouteParameter(
        request.params
          .stopId,
      );

    if (
      !tripId ||
      !stopId
    ) {
      response
        .status(400)
        .json({
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

    response
      .status(200)
      .json({
        data:
          tripStop,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "not found or the learner has not been picked up",
      )
        ? 409
        : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
      });
  }
}

export async function undoLastDriverAction(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId =
      getRouteParameter(
        request.params
          .tripId,
      );

    if (!tripId) {
      response
        .status(400)
        .json({
          error:
            "Trip ID is required.",
        });

      return;
    }

    const tripStop =
      await driverTripService.undoLastAction(
        tripId,
      );

    response
      .status(200)
      .json({
        data:
          tripStop,
      });
  } catch (error) {
    const message =
      getErrorMessage(
        error,
      );

    const statusCode =
      message.includes(
        "no driver action to undo",
      ) ||
      message.includes(
        "There is no action to undo",
      ) ||
      message.includes(
        "not found",
      ) ||
      message.includes(
        "changed before the undo",
      )
        ? 409
        : 500;

    response
      .status(
        statusCode,
      )
      .json({
        error:
          message,
      });
  }
}
export async function initializeDriverDay(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const { DailyRunService } = await import("../services/daily-run.service.js");
    const dailyRunService = new DailyRunService(tripStopRepository, tripRepository);
    const serviceDate = typeof request.body?.serviceDate === "string"
      ? request.body.serviceDate
      : new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());
    const data = await dailyRunService.initializeDay(TEST_DRIVER_ID, serviceDate);
    response.status(200).json({ data });
  } catch (error) {
    const message = getErrorMessage(error);
    response.status(getConflictStatusCode(message)).json({ error: message });
  }
}

export async function overrideAfternoonLearner(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const tripId = getRouteParameter(request.params.tripId);
    const learnerId = getRouteParameter(request.params.learnerId);
    if (!tripId || !learnerId) {
      response.status(400).json({ error: "Trip ID and learner ID are required." });
      return;
    }
    await driverTripService.overrideAfternoonLearner(tripId, learnerId);
    response.status(200).json({ data: { tripId, learnerId, afternoonStatus: "pending" } });
  } catch (error) {
    const message = getErrorMessage(error);
    response.status(getConflictStatusCode(message)).json({ error: message });
  }
}
