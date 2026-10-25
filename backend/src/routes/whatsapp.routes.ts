import { Router } from "express";

import {
  listWhatsAppConversations,
  listWhatsAppMessages,
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

router.get(
  "/conversations",
  listWhatsAppConversations,
);

router.get(
  "/conversations/:id/messages",
  listWhatsAppMessages,
);

router.post(
  "/test",
  sendTestWhatsAppMessage,
);

export default router;