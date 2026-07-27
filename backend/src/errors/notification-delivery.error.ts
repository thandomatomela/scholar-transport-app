export class NotificationDeliveryError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);

    this.name = "NotificationDeliveryError";
  }
}