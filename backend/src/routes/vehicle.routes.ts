import {
  Router,
} from "express";

import {
  createVehicle,
  getActiveVehicles,
  getVehicles,
} from "../controllers/vehicle.controller.js";

const router =
  Router();

router.get(
  "/",
  getVehicles,
);

router.get(
  "/active",
  getActiveVehicles,
);

router.post(
  "/",
  createVehicle,
);

export default router;