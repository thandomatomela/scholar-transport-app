import type {
  TripEventType,
  TripStatus,
} from "../services/trip.service.js";

export type TripStateChangedEvent = {
  type: "trip.state_changed";
  tripId: string;
  learnerId: string;
  eventType: TripEventType;
  previousStatus: TripStatus;
  newStatus: TripStatus;
  occurredAt: string;
};

export type DomainEvent = TripStateChangedEvent;

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void>;