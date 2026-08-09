import {
  Router,
} from "express";

import {
  dropOffLearner,
  getCurrentDriverTrip,
  getDriverDashboard,
  getDriverTripManifest,
  markLearnerAbsent,
  markLearnerNoShow,
  notifyParentDriverArrived,
  pickUpLearner,
  startAfternoonRun,
  startDriverTrip,
  startMorningRun,
  undoLastDriverAction,
} from "../controllers/driver-trip.controller.js";

export const driverTripRouter =
  Router();

driverTripRouter.get(
  "/me/dashboard",
  getDriverDashboard,
);

driverTripRouter.post(
  "/me/start-morning-run",
  startMorningRun,
);

driverTripRouter.post(
  "/me/start-afternoon-run",
  startAfternoonRun,
);

driverTripRouter.post(
  "/trips/:tripId/stops/:stopId/notify-parent",
  notifyParentDriverArrived,
);

driverTripRouter.get(
  "/me/current-trip",
  getCurrentDriverTrip,
);

driverTripRouter.post(
  "/trips/:tripId/start",
  startDriverTrip,
);

driverTripRouter.get(
  "/trips/:tripId/manifest",
  getDriverTripManifest,
);

driverTripRouter.post(
  "/trips/:tripId/stops/:stopId/pick-up",
  pickUpLearner,
);

driverTripRouter.post(
  "/trips/:tripId/stops/:stopId/absent",
  markLearnerAbsent,
);

driverTripRouter.post(
  "/trips/:tripId/stops/:stopId/no-show",
  markLearnerNoShow,
);

driverTripRouter.post(
  "/trips/:tripId/stops/:stopId/drop-off",
  dropOffLearner,
);

driverTripRouter.post(
  "/trips/:tripId/undo",
  undoLastDriverAction,
);