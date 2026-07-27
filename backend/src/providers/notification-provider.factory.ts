import { notificationConfig } from "../config/notification.config.js";
import { ConsoleNotificationProvider } from "./console-notification.provider.js";
import type { NotificationProvider } from "./notification-provider.js";
import { WhatsAppNotificationProvider } from "./whatsapp-notification.provider.js";

export function createNotificationProvider(): NotificationProvider {
  switch (notificationConfig.provider) {
    case "console":
      return new ConsoleNotificationProvider();

    case "whatsapp":
      return new WhatsAppNotificationProvider();

    case "sms":
      throw new Error(
        "SMS notification provider has not been implemented yet.",
      );

    default: {
      const exhaustiveCheck: never = notificationConfig.provider;

      throw new Error(
        `Unsupported notification provider: ${exhaustiveCheck}`,
      );
    }
  }
}