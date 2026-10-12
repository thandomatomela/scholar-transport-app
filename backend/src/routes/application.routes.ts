import {
  Router,
} from "express";

import {
  approveApplication,
  createApplication,
  getApplicationById,
  getApplications,
  updateApplicationReview,
} from "../controllers/application.controller.js";

const router =
  Router();

router.get(
  "/",
  getApplications,
);

router.get(
  "/:id",
  getApplicationById,
);

router.post(
  "/",
  createApplication,
);

router.patch(
  "/:id/review",
  updateApplicationReview,
);

router.post(
  "/:id/approve",
  approveApplication,
);

export default router;