import { validateWhatsAppConfig } from "../config/whatsapp.config.js";
import { NotificationDeliveryError } from "../errors/notification-delivery.error.js";
import { normalizePhoneNumber } from "../utils/phone-number.util.js";

import type {
  NotificationProvider,
  NotificationProviderResult,
  SendNotificationRequest,
} from "./notification-provider.js";

type WhatsAppApiResponse = {
  messaging_product?: string;

  contacts?: Array<{
    input: string;
    wa_id: string;
  }>;

  messages?: Array<{
    id: string;
    message_status?: string;
  }>;

  error?: {
    message: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_data?: {
      messaging_product?: string;
      details?: string;
    };
    fbtrace_id?: string;
  };
};

type WhatsAppTemplateParameter = {
  type: "text";
  text: string;
};

type WhatsAppTemplatePayload = {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: "body";
      parameters:
        WhatsAppTemplateParameter[];
    }>;
  };
};

type WhatsAppTextPayload = {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: {
    preview_url: boolean;
    body: string;
  };
};

type WhatsAppRequestPayload =
  | WhatsAppTemplatePayload
  | WhatsAppTextPayload;

export class WhatsAppNotificationProvider
  implements NotificationProvider
{
  private readonly config =
    validateWhatsAppConfig();

  async send(
    request: SendNotificationRequest,
  ): Promise<NotificationProviderResult> {
    const url =
      `https://graph.facebook.com/` +
      `${this.config.graphApiVersion}/` +
      `${this.config.phoneNumberId}/messages`;

    const payload =
      buildWhatsAppPayload(request);

    console.log(
      "Sending WhatsApp notification:",
      {
        phoneNumber:
          request.phoneNumber,
        eventType:
          request.message.eventType,
        messageType:
          payload.type,
        templateName:
          payload.type === "template"
            ? payload.template.name
            : null,
      },
    );

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        10_000,
      );

    let response: Response;

    try {
      response = await fetch(
        url,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${this.config.accessToken}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(payload),

          signal:
            controller.signal,
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new NotificationDeliveryError(
          "WhatsApp request timed out after 10 seconds.",
          "whatsapp",
        );
      }

      if (
        error instanceof
        NotificationDeliveryError
      ) {
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

    const rawResponseBody =
      await response.text();

    let responseBody:
      WhatsAppApiResponse = {};

    if (rawResponseBody) {
      try {
        responseBody =
          JSON.parse(
            rawResponseBody,
          ) as WhatsAppApiResponse;
      } catch {
        throw new NotificationDeliveryError(
          `WhatsApp returned an invalid response with status ${response.status}.`,
          "whatsapp",
          response.status,
          {
            rawResponseBody,
          },
        );
      }
    }

    if (!response.ok) {
      const errorDetails =
        responseBody.error
          ?.error_data
          ?.details;

      const errorMessage = [
        responseBody.error?.message,
        errorDetails,
      ]
        .filter(Boolean)
        .join(" ");

      throw new NotificationDeliveryError(
        errorMessage ||
          `WhatsApp request failed with status ${response.status}.`,
        "whatsapp",
        response.status,
        responseBody,
      );
    }

    const providerMessageId =
      responseBody.messages?.[0]?.id;

    if (!providerMessageId) {
      throw new NotificationDeliveryError(
        "WhatsApp accepted the request but did not return a message ID.",
        "whatsapp",
        response.status,
        responseBody,
      );
    }

    console.log(
      "WhatsApp notification accepted:",
      {
        eventType:
          request.message.eventType,
        providerMessageId,
        messageType:
          payload.type,
        templateName:
          payload.type === "template"
            ? payload.template.name
            : null,
      },
    );

    return {
      providerMessageId,
      providerResponse:
        responseBody,
    };
  }
}

function buildWhatsAppPayload(
  request: SendNotificationRequest,
): WhatsAppRequestPayload {
  const phoneNumber =
    normalizePhoneNumber(
      request.phoneNumber,
    );

  const whatsappTemplate =
    request.message
      .whatsappTemplate;

  if (whatsappTemplate) {
    const parameters =
      whatsappTemplate.parameters.map(
        (
          parameter,
        ): WhatsAppTemplateParameter => ({
          type: "text",
          text: parameter,
        }),
      );

    return {
      messaging_product:
        "whatsapp",

      recipient_type:
        "individual",

      to:
        phoneNumber,

      type:
        "template",

      template: {
        name:
          whatsappTemplate.name,

        language: {
          code:
            whatsappTemplate
              .languageCode,
        },

        components:
          parameters.length > 0
            ? [
                {
                  type: "body",
                  parameters,
                },
              ]
            : undefined,
      },
    };
  }

  /*
   * This fallback is useful during development
   * and inside an open WhatsApp service window.
   *
   * Business-initiated notifications should
   * eventually all have approved templates.
   */
  return {
    messaging_product:
      "whatsapp",

    recipient_type:
      "individual",

    to:
      phoneNumber,

    type:
      "text",

    text: {
      preview_url: false,
      body:
        request.message.body,
    },
  };
}