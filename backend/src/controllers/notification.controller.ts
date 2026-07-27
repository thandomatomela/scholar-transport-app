import type { Request, Response } from "express";
import {
  getNotificationRecipients,
} from "../services/notification.service.js";
import type { TripEventType } from "../services/trip.service.js";

type NotificationParams = {
  learnerId: string;
  eventType: string;
};

const allowedEventTypes: TripEventType[] = [
  "trip_created",
  "picked_up",
  "next_for_dropoff",
  "dropped_off",
];

export async function testNotificationRecipients(
  req: Request<NotificationParams>,
  res: Response,
) {
  const { learnerId, eventType } = req.params;

  if (!allowedEventTypes.includes(eventType as TripEventType)) {
    return res.status(400).json({
      error: "Invalid event type",
    });
  }

  try {
    const recipients = await getNotificationRecipients(
      learnerId,
      eventType as TripEventType,
    );

    return res.status(200).json({
      learner_id: learnerId,
      event_type: eventType,
      recipients,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";

    return res.status(500).json({
      error: message,
    });
  }
}