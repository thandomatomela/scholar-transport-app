import { notificationRetryConfig } from "../config/notification-retry.config.js";
import { NotificationDeliveryError } from "../errors/notification-delivery.error.js";
import { createNotificationProvider } from "../providers/notification-provider.factory.js";
import type { NotificationProviderResult } from "../providers/notification-provider.js";
import type { NotificationMessage } from "./notification-message.service.js";

export type NotificationDeliveryRequest = {
  phoneNumber: string;
  message: NotificationMessage;
};

const notificationProvider = createNotificationProvider();

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function deliverNotification(
  request: NotificationDeliveryRequest,
): Promise<NotificationProviderResult> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= notificationRetryConfig.maxAttempts;
    attempt += 1
  ) {
    try {
      const result = await notificationProvider.send(request);

      return {
  ...result,
  attemptsUsed: attempt,
};
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof NotificationDeliveryError &&
        (error.statusCode === undefined || error.statusCode >= 500);

      if (
        !isRetryable ||
        attempt === notificationRetryConfig.maxAttempts
      ) {
        throw error;
      }

      console.warn("Notification delivery failed. Retrying.", {
        provider: error.provider,
        attempt,
        maxAttempts: notificationRetryConfig.maxAttempts,
        statusCode: error.statusCode,
        eventType: request.message.eventType,
      });

      const baseDelay =
        notificationRetryConfig.retryDelayMs *
        2 ** (attempt - 1);

      const jitter = Math.floor(Math.random() * 250);

      await wait(baseDelay + jitter);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new NotificationDeliveryError(
    "Notification delivery failed after all retry attempts.",
    "unknown",
  );
}