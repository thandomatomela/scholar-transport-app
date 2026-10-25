import { Router } from "express";

import {
  receiveWhatsAppWebhook,
  sendTestWhatsAppMessage,
  verifyWhatsAppWebhook,
} from "../controllers/whatsapp.controller.js";

const router = Router();

router.get(
  "/webhook",
  verifyWhatsAppWebhook,
);

router.post(
  "/webhook",
  receiveWhatsAppWebhook,
);

router.post(
  "/test",
  sendTestWhatsAppMessage,
);

export default router;