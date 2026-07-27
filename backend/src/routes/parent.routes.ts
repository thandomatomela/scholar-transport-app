import { Router } from "express";
import { createParent } from "../controllers/parent.controller.js";

const router = Router();

router.post("/", createParent);

export default router;