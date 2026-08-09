import { supabase } from "../config/supabase.js";

import type {
  DriverArrivedEvent,
  DriverOnTheWayEvent,
  LearnerAbsentEvent,
  LearnerNoShowEvent,
  TripStateChangedEvent,
} from "../events/domain-event.js";

import type {
  DriverTripDirection,
} from "../repositories/trip.repository.js";

import {
  getNotificationRecipients,
  type NotificationEventType,
} from "./notification.service.js";

export type PreparedNotification = {
  contactId: string;
  phoneNumber: string;
  recipientName: string;
  tripId: string;
  relationship: string;

  learnerIds: string[];
  learnerNames: string[];

  pickupAddress: string | null;

  tripDirection:
    DriverTripDirection | null;

  eventType:
    NotificationEventType;
};

type LearnerRecord = {
  id: string;
  full_name: string;
};

type TripRecord = {
  id: string;
  direction:
    DriverTripDirection | null;
};

type NotificationSourceEvent =
  | TripStateChangedEvent
  | DriverArrivedEvent
  | DriverOnTheWayEvent
  | LearnerAbsentEvent
  | LearnerNoShowEvent;

async function getLearnerName(
  learnerId: string,
): Promise<string> {
  const { data, error } =
    await supabase
      .from("learners")
      .select(
        "id, full_name",
      )
      .eq(
        "id",
        learnerId,
      )
      .single<LearnerRecord>();

  if (error) {
    throw new Error(
      `Failed to load learner ${learnerId}: ${error.message}`,
    );
  }

  return data.full_name;
}

async function getTripDirection(
  tripId: string,
): Promise<DriverTripDirection | null> {
  const { data, error } =
    await supabase
      .from("trips")
      .select(
        "id, direction",
      )
      .eq(
        "id",
        tripId,
      )
      .single<TripRecord>();

  if (error) {
    throw new Error(
      `Failed to load trip ${tripId}: ${error.message}`,
    );
  }

  return data.direction;
}

export async function prepareTripNotifications(
  event:
    TripStateChangedEvent,
): Promise<
  PreparedNotification[]
> {
  return prepareNotifications(
    event,
    event.eventType,
  );
}

export async function prepareDriverArrivedNotifications(
  event:
    DriverArrivedEvent,
): Promise<
  PreparedNotification[]
> {
  return prepareNotifications(
    event,
    "driver_arrived",
  );
}

export async function prepareDriverOnTheWayNotifications(
  event:
    DriverOnTheWayEvent,
): Promise<
  PreparedNotification[]
> {
  return prepareNotifications(
    event,
    "driver_on_the_way",
  );
}

export async function prepareLearnerAbsentNotifications(
  event:
    LearnerAbsentEvent,
): Promise<
  PreparedNotification[]
> {
  return prepareNotifications(
    event,
    "learner_absent",
  );
}

export async function prepareLearnerNoShowNotifications(
  event:
    LearnerNoShowEvent,
): Promise<
  PreparedNotification[]
> {
  return prepareNotifications(
    event,
    "learner_no_show",
  );
}

async function prepareNotifications(
  event:
    NotificationSourceEvent,
  eventType:
    NotificationEventType,
): Promise<
  PreparedNotification[]
> {
  const [
    recipients,
    learnerName,
    tripDirection,
  ] = await Promise.all([
    getNotificationRecipients(
      event.learnerId,
      eventType,
    ),

    getLearnerName(
      event.learnerId,
    ),

    getTripDirection(
      event.tripId,
    ),
  ]);

  return recipients.map(
    (
      recipient,
    ): PreparedNotification => ({
      contactId:
        recipient.contactId,

      phoneNumber:
        recipient.phoneNumber,

      recipientName:
        recipient.fullName,

      tripId:
        event.tripId,

      relationship:
        recipient.relationship ??
        "Guardian",

      learnerIds: [
        event.learnerId,
      ],

      learnerNames: [
        learnerName,
      ],

      pickupAddress:
        "address" in event
          ? event.address
          : null,

      tripDirection,

      eventType,
    }),
  );
}