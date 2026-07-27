import { subscribeToDomainEvent } from "./event-bus.js";
import { handleTripNotification } from "./handlers/trip-notification.handler.js";

export function registerEventHandlers(): void {
  subscribeToDomainEvent(
    "trip.state_changed",
    handleTripNotification,
  );
}