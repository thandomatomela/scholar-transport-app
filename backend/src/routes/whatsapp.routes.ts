import { Router } from "express";

import {
  listWhatsAppConversations,
  listWhatsAppMessages,
  receiveWhatsAppWebhook,
  sendTestWhatsAppMessage,
  sendWhatsAppConversationMessage,
  verifyWhatsAppWebhook,
} from "../controllers/whatsapp.controller.js";

import {
  requireAdmin,
  requireAuth,
} from "../middleware/auth.middleware.js";

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

router.get(
  "/conversations",
  requireAuth,
  requireAdmin,
  listWhatsAppConversations,
);

router.get(
  "/conversations/:id/messages",
  requireAuth,
  requireAdmin,
  listWhatsAppMessages,
);

router.post(
  "/conversations/:id/messages",
  requireAuth,
  requireAdmin,
  sendWhatsAppConversationMessage,
);

export default router;