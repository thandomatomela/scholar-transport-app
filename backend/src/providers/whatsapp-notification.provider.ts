import { validateWhatsAppConfig } from "../config/whatsapp.config.js";
import { NotificationDeliveryError } from "../errors/notification-delivery.error.js";
import { normalizePhoneNumber } from "../utils/phone-number.util.js";
import type {
  NotificationProvider,
  NotificationProviderResult,
  SendNotificationRequest,
} from "./notification-provider.js";

type WhatsAppApiResponse = {
  messages?: Array<{
    id: string;
  }>;
  error?: {
    message: string;
    type?: string;
    code?: number;
  };
};

export class WhatsAppNotificationProvider
  implements NotificationProvider
{
  private readonly config = validateWhatsAppConfig();

  async send(
    request: SendNotificationRequest,
  ): Promise<NotificationProviderResult> {
    const url =
      `https://graph.facebook.com/` +
      `${this.config.graphApiVersion}/` +
      `${this.config.phoneNumberId}/messages`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizePhoneNumber(request.phoneNumber),
          type: "text",
          text: {
            preview_url: false,
            body: request.message.body,
          },
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new NotificationDeliveryError(
          "WhatsApp request timed out after 10 seconds.",
          "whatsapp",
        );
      }

      if (error instanceof NotificationDeliveryError) {
        throw error;
      }

      throw new NotificationDeliveryError(
        "Unexpected error while sending WhatsApp notification.",
        "whatsapp",
        undefined,
        error,
      );
    } finally {
      clearTimeout(timeout);
    }

    const rawResponseBody = await response.text();

    let responseBody: WhatsAppApiResponse = {};

    if (rawResponseBody) {
      try {
        responseBody = JSON.parse(rawResponseBody) as WhatsAppApiResponse;
      } catch {
        throw new NotificationDeliveryError(
          `WhatsApp returned an invalid response with status ${response.status}.`,
          "whatsapp",
          response.status,
        );
      }
    }

    if (!response.ok) {
      throw new NotificationDeliveryError(
        responseBody.error?.message ??
          `WhatsApp request failed with status ${response.status}.`,
        "whatsapp",
        response.status,
        responseBody,
      );
    }

    return {
      providerMessageId: responseBody.messages?.[0]?.id,
      providerResponse: responseBody,
    };
  }
}