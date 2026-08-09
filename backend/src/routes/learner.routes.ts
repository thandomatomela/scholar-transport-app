import { Router } from "express";

import {
  createLearner,
  getLearners,
} from "../controllers/learner.controller.js";

const router =
  Router();

router.get(
  "/",
  getLearners,
);

router.post(
  "/",
  createLearner,
);

export default router;