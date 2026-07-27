import { supabase } from "../config/supabase.js";

export type TripStopStatus =
  | "pending"
  | "picked_up"
  | "absent"
  | "dropped_off";

export type DriverTripStop = {
  id: string;
  tripId: string;
  learnerId: string;
  sequence: number;
  status: TripStopStatus;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  pickedUpAt: string | null;
  droppedOffAt: string | null;
  markedAbsentAt: string | null;
  learner: {
    id: string;
    fullName: string;
  };
};

type LearnerRow = {
  id: string;
  full_name: string;
};

type TripStopRow = {
  id: string;
  trip_id: string;
  learner_id: string;
  sequence: number;
  status: TripStopStatus;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  picked_up_at: string | null;
  dropped_off_at: string | null;
  marked_absent_at: string | null;
  learner: LearnerRow[] | null;
};

export class TripStopRepository {
  async findByTripId(
  tripId: string,
): Promise<DriverTripStop[]> {
  const { data: stops, error: stopsError } = await supabase
    .from("trip_stops")
    .select(`
      id,
      trip_id,
      learner_id,
      sequence,
      status,
      address,
      latitude,
      longitude,
      picked_up_at,
      dropped_off_at,
      marked_absent_at
    `)
    .eq("trip_id", tripId)
    .order("sequence", {
      ascending: true,
    });

  if (stopsError) {
    throw new Error(
      `Failed to retrieve trip stops: ${stopsError.message}`,
    );
  }

  if (!stops || stops.length === 0) {
    return [];
  }

  const learnerIds = [
    ...new Set(
      stops.map((stop) => stop.learner_id),
    ),
  ];

  const { data: learners, error: learnersError } =
    await supabase
      .from("learners")
      .select(`
        id,
        full_name
      `)
      .in("id", learnerIds);

  if (learnersError) {
    throw new Error(
      `Failed to retrieve learners: ${learnersError.message}`,
    );
  }

  const learnerMap = new Map(
    (learners ?? []).map((learner) => [
      learner.id,
      learner,
    ]),
  );

  return stops.map((stop) => {
    const learner = learnerMap.get(stop.learner_id);

    if (!learner) {
      throw new Error(
        `Learner not found for trip stop ${stop.id}.`,
      );
    }

    return {
      id: stop.id,
      tripId: stop.trip_id,
      learnerId: stop.learner_id,
      sequence: stop.sequence,
      status: stop.status as TripStopStatus,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,
      pickedUpAt: stop.picked_up_at,
      droppedOffAt: stop.dropped_off_at,
      markedAbsentAt: stop.marked_absent_at,
      learner: {
        id: learner.id,
        fullName: learner.full_name,
      },
    };
  });
}

  async markDroppedOff(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const now = new Date().toISOString();

  const { data: stop, error: updateError } = await supabase
    .from("trip_stops")
    .update({
      status: "dropped_off",
      dropped_off_at: now,
      updated_at: now,
    })
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .eq("status", "picked_up")
    .select(`
      id,
      trip_id,
      learner_id,
      sequence,
      status,
      address,
      latitude,
      longitude,
      picked_up_at,
      dropped_off_at,
      marked_absent_at
    `)
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Failed to mark learner as dropped off: ${updateError.message}`,
    );
  }

  if (!stop) {
    throw new Error(
      "Trip stop was not found or the learner has not been picked up.",
    );
  }

  const { data: learner, error: learnerError } = await supabase
    .from("learners")
    .select(`
      id,
      full_name
    `)
    .eq("id", stop.learner_id)
    .maybeSingle();

  if (learnerError) {
    throw new Error(
      `Failed to retrieve learner: ${learnerError.message}`,
    );
  }

  if (!learner) {
    throw new Error(
      `Learner not found for trip stop ${stop.id}.`,
    );
  }

  return {
    id: stop.id,
    tripId: stop.trip_id,
    learnerId: stop.learner_id,
    sequence: stop.sequence,
    status: stop.status as TripStopStatus,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
    pickedUpAt: stop.picked_up_at,
    droppedOffAt: stop.dropped_off_at,
    markedAbsentAt: stop.marked_absent_at,
    learner: {
      id: learner.id,
      fullName: learner.full_name,
    },
  };
}

  async markAbsent(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const now = new Date().toISOString();

  const { data: stop, error: updateError } = await supabase
    .from("trip_stops")
    .update({
      status: "absent",
      marked_absent_at: now,
      picked_up_at: null,
      updated_at: now,
    })
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .eq("status", "pending")
    .select(`
      id,
      trip_id,
      learner_id,
      sequence,
      status,
      address,
      latitude,
      longitude,
      picked_up_at,
      dropped_off_at,
      marked_absent_at
    `)
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Failed to mark learner as absent: ${updateError.message}`,
    );
  }

  if (!stop) {
    throw new Error(
      "Trip stop was not found or is no longer pending.",
    );
  }

  const { data: learner, error: learnerError } = await supabase
    .from("learners")
    .select(`
      id,
      full_name
    `)
    .eq("id", stop.learner_id)
    .maybeSingle();

  if (learnerError) {
    throw new Error(
      `Failed to retrieve learner: ${learnerError.message}`,
    );
  }

  if (!learner) {
    throw new Error(
      `Learner not found for trip stop ${stop.id}.`,
    );
  }

  return {
    id: stop.id,
    tripId: stop.trip_id,
    learnerId: stop.learner_id,
    sequence: stop.sequence,
    status: stop.status as TripStopStatus,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
    pickedUpAt: stop.picked_up_at,
    droppedOffAt: stop.dropped_off_at,
    markedAbsentAt: stop.marked_absent_at,
    learner: {
      id: learner.id,
      fullName: learner.full_name,
    },
  };
}

  async markPickedUp(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const now = new Date().toISOString();

  const { data: stop, error: updateError } = await supabase
    .from("trip_stops")
    .update({
      status: "picked_up",
      picked_up_at: now,
      marked_absent_at: null,
      updated_at: now,
    })
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .eq("status", "pending")
    .select(`
      id,
      trip_id,
      learner_id,
      sequence,
      status,
      address,
      latitude,
      longitude,
      picked_up_at,
      dropped_off_at,
      marked_absent_at
    `)
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Failed to mark learner as picked up: ${updateError.message}`,
    );
  }

  if (!stop) {
    throw new Error(
      "Trip stop was not found or is no longer pending.",
    );
  }

  const { data: learner, error: learnerError } = await supabase
    .from("learners")
    .select(`
      id,
      full_name
    `)
    .eq("id", stop.learner_id)
    .maybeSingle();

  if (learnerError) {
    throw new Error(
      `Failed to retrieve learner: ${learnerError.message}`,
    );
  }

  if (!learner) {
    throw new Error(
      `Learner not found for trip stop ${stop.id}.`,
    );
  }

  return {
    id: stop.id,
    tripId: stop.trip_id,
    learnerId: stop.learner_id,
    sequence: stop.sequence,
    status: stop.status as TripStopStatus,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
    pickedUpAt: stop.picked_up_at,
    droppedOffAt: stop.dropped_off_at,
    markedAbsentAt: stop.marked_absent_at,
    learner: {
      id: learner.id,
      fullName: learner.full_name,
    },
  };
}
}