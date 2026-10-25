import { Router } from "express";

import {
  listWhatsAppConversations,
  listWhatsAppMessages,
  receiveWhatsAppWebhook,
  sendTestWhatsAppMessage,
  verifyWhatsAppWebhook,
  sendWhatsAppConversationMessage,
} from "../controllers/whatsapp.controller.js";

const router = Router();

router.get(
  "/webhook",
  verifyWhatsAppWebhook,
);

router.post(
  "/conversations/:id/messages",
  sendWhatsAppConversationMessage,
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