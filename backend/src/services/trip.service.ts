import { supabase } from "../config/supabase.js";
import { publishDomainEvent } from "../events/event-bus.js";

export type TripStatus =
  | "waiting_for_pickup"
  | "on_board"
  | "next_for_dropoff"
  | "completed";

export type TripEventType =
  | "trip_created"
  | "picked_up"
  | "next_for_dropoff"
  | "dropped_off";

type TransitionTripOptions = {
  tripId: string;
  fromStatus: TripStatus;
  toStatus: TripStatus;
  eventType: TripEventType;
  updates?: Record<string, string | null>;
};

export class TripTransitionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "TripTransitionError";
    this.statusCode = statusCode;
  }
}

export async function transitionTrip({
  tripId,
  fromStatus,
  toStatus,
  eventType,
  updates = {},
}: TransitionTripOptions) {
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .update({
      status: toStatus,
      ...updates,
    })
    .eq("id", tripId)
    .eq("status", fromStatus)
    .select()
    .maybeSingle();

  if (tripError) {
    throw new TripTransitionError(tripError.message, 400);
  }

  if (!trip) {
    throw new TripTransitionError(
      `Trip was not found, or it is not currently ${fromStatus}`,
      409,
    );
  }

  const { error: eventError } = await supabase
    .from("trip_events")
    .insert({
      trip_id: trip.id,
      event_type: eventType,
      event_data: {
        learner_id: trip.learner_id,
        previous_status: fromStatus,
        new_status: toStatus,
      },
    });

  if (eventError) {
    throw new TripTransitionError(
      `Trip was updated, but the event could not be recorded: ${eventError.message}`,
      500,
    );
  }

await publishDomainEvent({
  type: "trip.state_changed",
  tripId,
  learnerId: trip.learner_id,
  eventType,
  previousStatus: fromStatus,
  newStatus: toStatus,
  occurredAt: new Date().toISOString(),
});

  return trip;
}

export function markTripAsPickedUp(tripId: string) {
  return transitionTrip({
    tripId,
    fromStatus: "waiting_for_pickup",
    toStatus: "on_board",
    eventType: "picked_up",
    updates: {
      picked_up_at: new Date().toISOString(),
    },
  });
}

export function markTripAsNextForDropoff(tripId: string) {
  return transitionTrip({
    tripId,
    fromStatus: "on_board",
    toStatus: "next_for_dropoff",
    eventType: "next_for_dropoff",
  });
}

export function markTripAsDroppedOff(tripId: string) {
  return transitionTrip({
    tripId,
    fromStatus: "next_for_dropoff",
    toStatus: "completed",
    eventType: "dropped_off",
    updates: {
      dropped_off_at: new Date().toISOString(),
    },
  });
}