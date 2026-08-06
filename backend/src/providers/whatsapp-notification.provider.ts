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
      parameters: WhatsAppTemplateParameter[];
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

const WHATSAPP_REQUEST_TIMEOUT_MS = 10_000;

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

    const payload = buildWhatsAppPayload(request);

    console.log("Sending WhatsApp notification:", {
      phoneNumber: request.phoneNumber,
      normalizedPhoneNumber: payload.to,
      eventType: request.message.eventType,
      messageType: payload.type,
      templateName:
        payload.type === "template"
          ? payload.template.name
          : null,
    });

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, WHATSAPP_REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new NotificationDeliveryError(
          `WhatsApp request timed out after ${
            WHATSAPP_REQUEST_TIMEOUT_MS / 1_000
          } seconds.`,
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

    const responseBody = await parseWhatsAppResponse(response);

    if (!response.ok) {
      throw buildWhatsAppApiError(response, responseBody);
    }

    const providerMessageId = responseBody.messages?.[0]?.id;

    if (!providerMessageId) {
      throw new NotificationDeliveryError(
        "WhatsApp accepted the request but did not return a message ID.",
        "whatsapp",
        response.status,
        responseBody,
      );
    }

    console.log("WhatsApp notification accepted:", {
      eventType: request.message.eventType,
      providerMessageId,
      messageType: payload.type,
      templateName:
        payload.type === "template"
          ? payload.template.name
          : null,
    });

    return {
      providerMessageId,
      providerResponse: responseBody,
    };
  }
}

function buildWhatsAppPayload(
  request: SendNotificationRequest,
): WhatsAppRequestPayload {
  const phoneNumber = normalizePhoneNumber(
    request.phoneNumber,
  );

  const whatsappTemplate =
    request.message.whatsappTemplate;

  if (whatsappTemplate) {
    const parameters =
      whatsappTemplate.parameters.map(
        (parameter): WhatsAppTemplateParameter => ({
          type: "text",
          text: parameter,
        }),
      );

    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",

      template: {
        name: whatsappTemplate.name,

        language: {
          code: whatsappTemplate.languageCode,
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
   * Free-form text messages can generally only be sent
   * inside an open WhatsApp customer-service window.
   *
   * Business-initiated learner transport notifications,
   * such as pickup and drop-off updates, should use
   * approved WhatsApp templates.
   */
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "text",

    text: {
      preview_url: false,
      body: request.message.body,
    },
  };
}

async function parseWhatsAppResponse(
  response: Response,
): Promise<WhatsAppApiResponse> {
  const rawResponseBody = await response.text();

  if (!rawResponseBody) {
    return {};
  }

  try {
    return JSON.parse(
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

function buildWhatsAppApiError(
  response: Response,
  responseBody: WhatsAppApiResponse,
): NotificationDeliveryError {
  const errorDetails =
    responseBody.error?.error_data?.details;

  const errorMessage = [
    responseBody.error?.message,
    errorDetails,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .join(" ");

  return new NotificationDeliveryError(
    errorMessage ||
      `WhatsApp request failed with status ${response.status}.`,
    "whatsapp",
    response.status,
    responseBody,
  );
}