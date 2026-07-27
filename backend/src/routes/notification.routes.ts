import { Router } from "express";
import {
  testNotificationRecipients,
} from "../controllers/notification.controller.js";

const router = Router();

router.get(
  "/test/:learnerId/:eventType",
  testNotificationRecipients,
);

export default router;