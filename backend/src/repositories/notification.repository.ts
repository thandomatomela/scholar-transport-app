import { supabase } from "../config/supabase.js";
import type { NotificationMessage } from "../services/notification-message.service.js";

export type NotificationStatus =
  | "pending"
  | "sending"
  | "sent"
  | "failed";

export type CreateNotificationInput = {
  tripId: string;
  contactId: string;
  provider: string;
  channel: string;
  recipientPhone: string;
  message: NotificationMessage;
};

export type NotificationRecord = {
  id: string;
  tripId: string | null;
  contactId: string | null;
  provider: string;
  channel: string;
  eventType: string;
  recipientPhone: string;
  title: string | null;
  body: string;
  payload: Record<string, unknown> | null;
  status: NotificationStatus;
  attempts: number;
  lastAttemptAt: string | null;
  sentAt: string | null;
  failedAt: string | null;
  providerMessageId: string | null;
  providerResponse: unknown;
  errorMessage: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type NotificationRow = {
  id: string;
  trip_id: string | null;
  contact_id: string | null;
  provider: string;
  channel: string;
  event_type: string;
  recipient_phone: string;
  title: string | null;
  body: string;
  payload: Record<string, unknown> | null;
  status: NotificationStatus;
  attempts: number;
  last_attempt_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  provider_message_id: string | null;
  provider_response: unknown;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    tripId: row.trip_id,
    contactId: row.contact_id,
    provider: row.provider,
    channel: row.channel,
    eventType: row.event_type,
    recipientPhone: row.recipient_phone,
    title: row.title,
    body: row.body,
    payload: row.payload,
    status: row.status,
    attempts: row.attempts,
    lastAttemptAt: row.last_attempt_at,
    sentAt: row.sent_at,
    failedAt: row.failed_at,
    providerMessageId: row.provider_message_id,
    providerResponse: row.provider_response,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class NotificationRepository {
  async create(
    input: CreateNotificationInput,
  ): Promise<NotificationRecord> {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        trip_id: input.tripId,
        contact_id: input.contactId,
        provider: input.provider,
        channel: input.channel,
        event_type: input.message.eventType,
        recipient_phone: input.recipientPhone,
        title: input.message.title,
        body: input.message.body,
        payload: {
          learnerNames: input.message.learnerNames,
          trackingLink: input.message.trackingLink,
        },
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Failed to create notification: ${error.message}`,
      );
    }

    return mapNotification(data as NotificationRow);
  }

  async setAttempts(
  id: string,
  attempts: number,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      attempts,
      last_attempt_at: now,
      updated_at: now,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Failed to update notification attempts: ${error.message}`,
    );
  }
}

  async markSending(id: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({
        status: "sending",
        last_attempt_at: now,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to mark notification as sending: ${error.message}`,
      );
    }
  }

  async incrementAttempts(id: string): Promise<void> {
    const { data, error: readError } = await supabase
      .from("notifications")
      .select("attempts")
      .eq("id", id)
      .single();

    if (readError) {
      throw new Error(
        `Failed to read notification attempts: ${readError.message}`,
      );
    }

    const currentAttempts =
      typeof data.attempts === "number" ? data.attempts : 0;

    const { error: updateError } = await supabase
      .from("notifications")
      .update({
        attempts: currentAttempts + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(
        `Failed to increment notification attempts: ${updateError.message}`,
      );
    }
  }

  async markSent(
    id: string,
    providerMessageId?: string,
    providerResponse?: unknown,
  ): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({
        status: "sent",
        sent_at: now,
        failed_at: null,
        error_message: null,
        provider_message_id: providerMessageId ?? null,
        provider_response: providerResponse ?? null,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to mark notification as sent: ${error.message}`,
      );
    }
  }

  async markFailed(
    id: string,
    errorMessage: string,
    providerResponse?: unknown,
  ): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({
        status: "failed",
        failed_at: now,
        error_message: errorMessage,
        provider_response: providerResponse ?? null,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to mark notification as failed: ${error.message}`,
      );
    }
  }
}