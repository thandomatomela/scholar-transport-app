import { notificationConfig } from "../../config/notification.config.js";
import { NotificationDeliveryError } from "../../errors/notification-delivery.error.js";
import { NotificationRepository } from "../../repositories/notification.repository.js";
import { deliverNotification } from "../../services/notification-delivery.service.js";
import { buildNotificationMessage } from "../../services/notification-message.service.js";
import { prepareDriverOnTheWayNotifications } from "../../services/notification-orchestrator.service.js";

import type {
  DriverOnTheWayEvent,
} from "../domain-event.js";

const notificationRepository =
  new NotificationRepository();

export async function handleDriverOnTheWayNotification(
  event: DriverOnTheWayEvent,
): Promise<void> {
  console.log(
    "Handling driver.on_the_way:",
    event,
  );

  const notifications =
    await prepareDriverOnTheWayNotifications(
      event,
    );

  console.log(
    "Prepared on-the-way notifications:",
    {
      count: notifications.length,
      notifications,
    },
  );

  if (notifications.length === 0) {
    console.warn(
      "No eligible recipients found for driver.on_the_way.",
      {
        tripId: event.tripId,
        stopId: event.stopId,
        learnerId: event.learnerId,
      },
    );

    return;
  }

  const results =
    await Promise.allSettled(
      notifications.map(
        async (notification) => {
          console.log(
            "Creating on-the-way notification:",
            {
              tripId:
                notification.tripId,
              contactId:
                notification.contactId,
              phoneNumber:
                notification.phoneNumber,
              learnerNames:
                notification.learnerNames,
            },
          );

          const message =
            buildNotificationMessage(
              notification,
            );

          const notificationRecord =
            await notificationRepository.create({
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
            });

          console.log(
            "Notification record created:",
            {
              notificationId:
                notificationRecord.id,
              status:
                notificationRecord.status,
            },
          );

          try {
            await notificationRepository.markSending(
              notificationRecord.id,
            );

            console.log(
              "Delivering on-the-way notification:",
              {
                notificationId:
                  notificationRecord.id,
                phoneNumber:
                  notification.phoneNumber,
              },
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

            console.log(
              "On-the-way notification sent:",
              {
                notificationId:
                  notificationRecord.id,
                providerMessageId:
                  deliveryResult.providerMessageId,
              },
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
          "Driver on-the-way notification delivery failed.",
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
        "Unexpected driver on-the-way notification error.",
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