import {
  Router,
} from "express";

import {
  createRoute,
  getActiveRoutes,
  getRoutes,
} from "../controllers/route.controller.js";

const router =
  Router();

router.get(
  "/",
  getRoutes,
);

router.get(
  "/active",
  getActiveRoutes,
);

router.post(
  "/",
  createRoute,
);

export default router;