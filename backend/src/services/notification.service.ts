import { supabase } from "../config/supabase.js";
import type { TripEventType } from "./trip.service.js";

type NotificationPreferenceColumn =
  | "receive_pickup_notifications"
  | "receive_tracking_link"
  | "receive_dropoff_notifications";

export type NotificationRecipient = {
  contactId: string;
  fullName: string;
  phoneNumber: string;
  relationship: string | null;
  priority: number;
};

function getPreferenceColumn(
  eventType: TripEventType,
): NotificationPreferenceColumn | null {
  switch (eventType) {
    case "picked_up":
      return "receive_pickup_notifications";

    case "next_for_dropoff":
      return "receive_tracking_link";

    case "dropped_off":
      return "receive_dropoff_notifications";

    case "trip_created":
      return null;
  }
}

export async function getNotificationRecipients(
  learnerId: string,
  eventType: TripEventType,
): Promise<NotificationRecipient[]> {
  const preferenceColumn = getPreferenceColumn(eventType);

  if (!preferenceColumn) {
    return [];
  }

  const { data, error } = await supabase
    .from("learner_contacts")
    .select(`
      notification_priority,
      receive_pickup_notifications,
      receive_tracking_link,
      receive_dropoff_notifications,
      contact:contacts (
        id,
        full_name,
        phone_number,
        relationship,
        whatsapp_enabled
      )
    `)
    .eq("learner_id", learnerId)
    .eq(preferenceColumn, true)
    .order("notification_priority", { ascending: true });

  if (error) {
    throw new Error(
      `Could not load notification recipients: ${error.message}`,
    );
  }

  const recipients: NotificationRecipient[] = [];

  for (const row of data ?? []) {
    const contact = Array.isArray(row.contact)
      ? row.contact[0]
      : row.contact;

    if (!contact || !contact.whatsapp_enabled) {
      continue;
    }

    recipients.push({
      contactId: contact.id,
      fullName: contact.full_name,
      phoneNumber: contact.phone_number,
      relationship: contact.relationship,
      priority: row.notification_priority,
    });
  }

  return recipients;
}