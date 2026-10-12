import {
  Router,
} from "express";

import {
  createDriver,
  getActiveDrivers,
  getDrivers,
} from "../controllers/driver.controller.js";

const router =
  Router();

router.get(
  "/",
  getDrivers,
);

router.get(
  "/active",
  getActiveDrivers,
);

router.post(
  "/",
  createDriver,
);

export default router;