import type { Request, Response } from "express";
import { whatsappConfig } from "../config/whatsapp.config.js";

export function verifyWhatsAppWebhook(
  request: Request,
  response: Response,
): void {
  const mode = request.query["hub.mode"];
  const token = request.query["hub.verify_token"];
  const challenge = request.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === whatsappConfig.verifyToken
  ) {
    response.status(200).send(challenge);
    return;
  }

  response.sendStatus(403);
}

export async function receiveWhatsAppWebhook(
  request: Request,
  response: Response,
): Promise<void> {
  console.log(
    "WhatsApp webhook received:",
    JSON.stringify(request.body, null, 2),
  );

  const entries = request.body?.entry ?? [];

  for (const entry of entries) {
    const changes = entry?.changes ?? [];

    for (const change of changes) {
      const value = change?.value;

      const messages = value?.messages ?? [];
      const contacts = value?.contacts ?? [];

      for (const message of messages) {
        const contact = contacts.find(
          (item: any) =>
            item.wa_id === message.from,
        );

        console.log("Incoming WhatsApp message:", {
          from: message.from,
          name: contact?.profile?.name ?? null,
          messageId: message.id,
          type: message.type,
          text: message.text?.body ?? null,
          timestamp: message.timestamp,
        });
      }
    }
  }

  response.sendStatus(200);
}