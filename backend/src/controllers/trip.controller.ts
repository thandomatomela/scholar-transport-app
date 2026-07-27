import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import {
  markTripAsDroppedOff,
  markTripAsNextForDropoff,
  markTripAsPickedUp,
  TripTransitionError,
} from "../services/trip.service.js";

type TripParams = {
  tripId: string;
};

type CreateTripBody = {
  learner_id?: string;
};

function handleTripTransitionError(
  error: unknown,
  res: Response,
) {
  if (error instanceof TripTransitionError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  const message =
    error instanceof Error
      ? error.message
      : "An unexpected error occurred";

  return res.status(500).json({
    error: message,
  });
}

export async function getTripById(
  req: Request<TripParams>,
  res: Response,
) {
  const { tripId } = req.params;

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select(`
      id,
      status,
      picked_up_at,
      dropped_off_at,
      created_at,
      learner:learners (
        id,
        full_name,
        school_name,
        learner_contacts (
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
        )
      )
    `)
    .eq("id", tripId)
    .maybeSingle();

  if (tripError) {
    return res.status(400).json({
      error: tripError.message,
    });
  }

  if (!trip) {
    return res.status(404).json({
      error: "Trip not found",
    });
  }

  const { data: events, error: eventsError } = await supabase
    .from("trip_events")
    .select(`
      id,
      event_type,
      event_data,
      created_at
    `)
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (eventsError) {
    return res.status(400).json({
      error: eventsError.message,
    });
  }

  return res.status(200).json({
    ...trip,
    events: events ?? [],
  });
}

export async function getTripEvents(
  req: Request<TripParams>,
  res: Response,
) {
  const { tripId } = req.params;

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .maybeSingle();

  if (tripError) {
    return res.status(400).json({
      error: tripError.message,
    });
  }

  if (!trip) {
    return res.status(404).json({
      error: "Trip not found",
    });
  }

  const { data: events, error: eventsError } = await supabase
    .from("trip_events")
    .select(`
      id,
      event_type,
      event_data,
      created_at
    `)
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (eventsError) {
    return res.status(400).json({
      error: eventsError.message,
    });
  }

  return res.status(200).json({
    trip_id: tripId,
    events: events ?? [],
  });
}

export async function markLearnerDroppedOff(
  req: Request<TripParams>,
  res: Response,
) {
  try {
    const trip = await markTripAsDroppedOff(
      req.params.tripId,
    );

    return res.status(200).json(trip);
  } catch (error: unknown) {
    return handleTripTransitionError(error, res);
  }
}

export async function markNextForDropoff(
  req: Request<TripParams>,
  res: Response,
) {
  try {
    const trip = await markTripAsNextForDropoff(
      req.params.tripId,
    );

    return res.status(200).json(trip);
  } catch (error: unknown) {
    return handleTripTransitionError(error, res);
  }
}

export async function getTrips(
  _req: Request,
  res: Response,
) {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id,
      status,
      picked_up_at,
      dropped_off_at,
      created_at,
      learner:learners (
        id,
        full_name,
        school_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(200).json(data ?? []);
}

export async function markLearnerPickedUp(
  req: Request<TripParams>,
  res: Response,
) {
  try {
    const { tripId } = req.params;

    const trip = await markTripAsPickedUp(tripId);

    return res.status(200).json(trip);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";

    const statusCode =
      message.includes("not found") ||
      message.includes("already been picked up")
        ? 409
        : 500;

    return res.status(statusCode).json({
      error: message,
    });
  }
}

export async function createTrip(
  req: Request<Record<string, never>, unknown, CreateTripBody>,
  res: Response,
) {
  const { learner_id } = req.body ?? {};

  if (!learner_id) {
    return res.status(400).json({
      error: "learner_id is required",
    });
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      learner_id,
      status: "waiting_for_pickup",
    })
    .select()
    .single();

  if (tripError) {
    return res.status(400).json({
      error: tripError.message,
    });
  }

  const { error: eventError } = await supabase
    .from("trip_events")
    .insert({
      trip_id: trip.id,
      event_type: "trip_created",
      event_data: {
        learner_id,
      },
    });

  if (eventError) {
    return res.status(500).json({
      error: "Trip was created, but the trip event failed",
      details: eventError.message,
      trip,
    });
  }

  return res.status(201).json(trip);
}