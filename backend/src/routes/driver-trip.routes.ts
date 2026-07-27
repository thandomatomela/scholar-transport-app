import { Router } from "express";

import {
  dropOffLearner,
  getCurrentDriverTrip,
  getDriverDashboard,
  getDriverTripManifest,
  markLearnerAbsent,
  pickUpLearner,
  startDriverTrip,
} from "../controllers/driver-trip.controller.js";

export const driverTripRouter = Router();

driverTripRouter.get(
  "/me/dashboard",
  getDriverDashboard,
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
  "/trips/:tripId/stops/:stopId/drop-off",
  dropOffLearner,
);