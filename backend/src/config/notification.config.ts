export type NotificationProviderName =
  | "console"
  | "whatsapp"
  | "sms";

function getNotificationProvider(): NotificationProviderName {
  const provider =
    process.env.NOTIFICATION_PROVIDER?.trim().toLowerCase() ??
    "console";

  switch (provider) {
    case "console":
    case "whatsapp":
    case "sms":
      return provider;

    default:
      throw new Error(
        `Unsupported notification provider: ${provider}`,
      );
  }
}

export const notificationConfig = {
  provider: getNotificationProvider(),
};