import type {
  NotificationProvider,
  NotificationProviderResult,
  SendNotificationRequest,
} from "./notification-provider.js";

export class ConsoleNotificationProvider
  implements NotificationProvider
{
  async send(
    request: SendNotificationRequest,
  ): Promise<NotificationProviderResult> {
    console.log("Delivering notification:");

    console.dir(
      {
        channel: "console",
        phoneNumber: request.phoneNumber,
        title: request.message.title,
        body: request.message.body,
        eventType: request.message.eventType,
        learnerNames: request.message.learnerNames,
        trackingLink: request.message.trackingLink,
      },
      {
        depth: null,
      },
    );

    return {
      providerResponse: {
        channel: "console",
        deliveredAt: new Date().toISOString(),
      },
    };
  }
}