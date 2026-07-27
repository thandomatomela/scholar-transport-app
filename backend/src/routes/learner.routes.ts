import { Router } from "express";
import { createLearner } from "../controllers/learner.controller.js";

const router = Router();

router.post("/", createLearner);

export default router;