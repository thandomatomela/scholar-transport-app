import { supabase } from "../config/supabase.js";

import type {
  DriverArrivedEvent,
  DriverOnTheWayEvent,
  TripStateChangedEvent,
} from "../events/domain-event.js";

import {
  getNotificationRecipients,
  type NotificationEventType,
  type NotificationRecipient,
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
  eventType: NotificationEventType;
};

type LearnerRecord = {
  id: string;
  full_name: string;
};

type NotificationSourceEvent =
  | TripStateChangedEvent
  | DriverArrivedEvent
  | DriverOnTheWayEvent;

async function getLearnerName(
  learnerId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("learners")
    .select("id, full_name")
    .eq("id", learnerId)
    .single<LearnerRecord>();

  if (error) {
    throw new Error(
      `Failed to load learner ${learnerId}: ${error.message}`,
    );
  }

  return data.full_name;
}

export async function prepareTripNotifications(
  event: TripStateChangedEvent,
): Promise<PreparedNotification[]> {
  return prepareNotifications(
    event,
    event.eventType,
  );
}

export async function prepareDriverArrivedNotifications(
  event: DriverArrivedEvent,
): Promise<PreparedNotification[]> {
  return prepareNotifications(
    event,
    "driver_arrived",
  );
}

export async function prepareDriverOnTheWayNotifications(
  event: DriverOnTheWayEvent,
): Promise<PreparedNotification[]> {
  return prepareNotifications(
    event,
    "driver_on_the_way",
  );
}

async function prepareNotifications(
  event: NotificationSourceEvent,
  eventType: NotificationEventType,
): Promise<PreparedNotification[]> {
  const [recipients, learnerName] =
    await Promise.all([
      getNotificationRecipients(
        event.learnerId,
        eventType,
      ),
      getLearnerName(
        event.learnerId,
      ),
    ]);

  return recipients.map(
  (recipient): PreparedNotification => ({
    contactId: recipient.contactId,
    phoneNumber: recipient.phoneNumber,
    recipientName: recipient.fullName,
    tripId: event.tripId,
    relationship:
      recipient.relationship ?? "Guardian",
    learnerIds: [event.learnerId],
    learnerNames: [learnerName],
    pickupAddress:
      "address" in event
        ? event.address
        : null,
    eventType,
  }),
);
}