import { notificationConfig } from "../../config/notification.config.js";
import { NotificationDeliveryError } from "../../errors/notification-delivery.error.js";
import { NotificationRepository } from "../../repositories/notification.repository.js";
import { deliverNotification } from "../../services/notification-delivery.service.js";
import { buildNotificationMessage } from "../../services/notification-message.service.js";
import { prepareDriverArrivedNotifications } from "../../services/notification-orchestrator.service.js";

import type {
  DriverArrivedEvent,
} from "../domain-event.js";

const notificationRepository =
  new NotificationRepository();

export async function handleDriverArrivedNotification(
  event: DriverArrivedEvent,
): Promise<void> {
  const notifications =
    await prepareDriverArrivedNotifications(
      event,
    );

  const results =
    await Promise.allSettled(
      notifications.map(
        async (notification) => {
          const message =
            buildNotificationMessage(
              notification,
            );

          const notificationRecord =
            await notificationRepository.create(
              {
                tripId:
                  notification.tripId,
                contactId:
                  notification.contactId,
                provider:
                  notificationConfig.provider,
                channel:
                  notificationConfig.provider,
                recipientPhone:
                  notification.phoneNumber,
                message,
              },
            );

          try {
            await notificationRepository.markSending(
              notificationRecord.id,
            );

            const deliveryResult =
              await deliverNotification({
                phoneNumber:
                  notification.phoneNumber,
                message,
              });

            await notificationRepository.setAttempts(
              notificationRecord.id,
              deliveryResult.attemptsUsed ??
                1,
            );

            await notificationRepository.markSent(
              notificationRecord.id,
              deliveryResult.providerMessageId,
              deliveryResult.providerResponse,
            );
          } catch (error) {
            await notificationRepository.markFailed(
              notificationRecord.id,
              error instanceof Error
                ? error.message
                : "Unknown notification delivery error.",
              error,
            );

            throw error;
          }
        },
      ),
    );

  results.forEach(
    (result, index) => {
      if (
        result.status === "fulfilled"
      ) {
        return;
      }

      const notification =
        notifications[index];

      const error =
        result.reason;

      if (
        error instanceof
        NotificationDeliveryError
      ) {
        console.error(
          "Driver arrival notification delivery failed.",
          {
            provider:
              error.provider,
            statusCode:
              error.statusCode,
            tripId:
              notification.tripId,
            contactId:
              notification.contactId,
            learnerIds:
              notification.learnerIds,
            eventType:
              notification.eventType,
            errorMessage:
              error.message,
          },
        );

        return;
      }

      console.error(
        "Unexpected driver arrival notification error.",
        {
          tripId:
            notification.tripId,
          contactId:
            notification.contactId,
          learnerIds:
            notification.learnerIds,
          eventType:
            notification.eventType,
          error,
        },
      );
    },
  );
}