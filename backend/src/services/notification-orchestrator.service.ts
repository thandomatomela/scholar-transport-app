import type { TripStateChangedEvent } from "../events/domain-event.js";
import { supabase } from "../config/supabase.js";
import {
  getNotificationRecipients,
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
  eventType: TripStateChangedEvent["eventType"];
};

type LearnerRecord = {
  id: string;
  full_name: string;
};

async function getLearnerName(learnerId: string): Promise<string> {
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
  const [recipients, learnerName] = await Promise.all([
    getNotificationRecipients(
      event.learnerId,
      event.eventType,
    ),
    getLearnerName(event.learnerId),
  ]);

  return recipients.map(
    (recipient: NotificationRecipient): PreparedNotification => ({
      contactId: recipient.contactId,
      phoneNumber: recipient.phoneNumber,
      recipientName: recipient.fullName,
      tripId: event.tripId,
      relationship: recipient.relationship ?? "Guardian",
      learnerIds: [event.learnerId],
      learnerNames: [learnerName],
      eventType: event.eventType,
    }),
  );
}