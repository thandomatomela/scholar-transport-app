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

export type DriverArrivedEvent = {
  type: "driver.arrived";
  tripId: string;
  learnerId: string;
  stopId: string;
  occurredAt: string;
};

export type DriverOnTheWayEvent = {
  type: "driver.on_the_way";
  tripId: string;
  learnerId: string;
  stopId: string;
  address: string | null;
  occurredAt: string;
};

export type LearnerAbsentEvent = {
  type: "learner.absent";
  tripId: string;
  stopId: string;
  learnerId: string;
  occurredAt: string;
};

export type LearnerNoShowEvent = {
  type: "learner.no_show";
  tripId: string;
  stopId: string;
  learnerId: string;
  occurredAt: string;
};

export type DomainEvent =
  | TripStateChangedEvent
  | DriverArrivedEvent
  | DriverOnTheWayEvent
  | LearnerAbsentEvent
  | LearnerNoShowEvent;

export type DomainEventHandler<
  T extends DomainEvent = DomainEvent,
> = (
  event: T,
) => Promise<void>;