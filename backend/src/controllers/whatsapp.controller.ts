import type { Request, Response } from "express";
import { whatsappConfig } from "../config/whatsapp.config.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";


export async function sendTestWhatsAppMessage(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const { to } = request.body;

    if (!to) {
      response.status(400).json({
        success: false,
        error: "Phone number is required",
      });
      return;
    }

    const result = await sendWhatsAppMessage(
      to,
      "Hello 👋 This is a test message from Via Nova Scholar Transport.",
    );

    response.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("WhatsApp test failed:", error);

    response.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
}

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