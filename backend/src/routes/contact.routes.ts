import { Router } from "express";
import {
  createContact,
  linkContactToLearner,
} from "../controllers/contact.controller.js";

const router = Router();

router.post("/", createContact);
router.post("/link", linkContactToLearner);

export default router;