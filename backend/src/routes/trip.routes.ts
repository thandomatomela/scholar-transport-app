import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  getTripEvents,
  markLearnerPickedUp,
  markNextForDropoff,
  markLearnerDroppedOff,
} from "../controllers/trip.controller.js";

const router = Router();

router.get("/", getTrips);
router.get("/:tripId/events", getTripEvents);
router.get("/:tripId", getTripById);
router.post("/", createTrip);
router.patch("/:tripId/pickup", markLearnerPickedUp);
router.patch("/:tripId/next-dropoff", markNextForDropoff);
router.patch("/:tripId/dropoff", markLearnerDroppedOff);

export default router;