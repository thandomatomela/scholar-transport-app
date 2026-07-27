import type { NotificationMessage } from "../services/notification-message.service.js";

export type SendNotificationRequest = {
  phoneNumber: string;
  message: NotificationMessage;
};

export type NotificationProviderResult = {
  providerMessageId?: string;
  providerResponse?: unknown;
  attemptsUsed?: number;
};

export interface NotificationProvider {
  send(
    request: SendNotificationRequest,
  ): Promise<NotificationProviderResult>;
}