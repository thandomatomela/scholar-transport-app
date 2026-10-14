import { supabase } from "../config/supabase.js";

export type TripStopStatus =
  | "pending"
  | "en_route"
  | "arrived"
  | "picked_up"
  | "absent"
  | "no_show"
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

type TripStopDatabaseRow = {
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
};

const TRIP_STOP_SELECT = `
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
`;

export class TripStopRepository {
  async resetTripStops(
    tripId: string,
  ): Promise<void> {
    const now =
      new Date().toISOString();

    const { error } =
      await supabase
        .from("trip_stops")
        .update({
          status:
            "pending",

          picked_up_at:
            null,

          dropped_off_at:
            null,

          marked_absent_at:
            null,

          updated_at:
            now,
        })
        .eq(
          "trip_id",
          tripId,
        );

    if (error) {
      throw new Error(
        `Failed to reset trip stops: ${error.message}`,
      );
    }
  }

  async createStopsFromTemplate(
    tripId: string,
    templateStops: DriverTripStop[],
  ): Promise<void> {
    if (templateStops.length === 0) return;

    const rows = templateStops.map((stop) => ({
      trip_id: tripId,
      learner_id: stop.learnerId,
      sequence: stop.sequence,
      status: "pending" as TripStopStatus,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,
      picked_up_at: null,
      dropped_off_at: null,
      marked_absent_at: null,
    }));

    const { error } = await supabase.from("trip_stops").insert(rows);
    if (error) {
      throw new Error(`Failed to create daily trip stops: ${error.message}`);
    }
  }

  async setLearnerStatusForTrip(
    tripId: string,
    learnerId: string,
    status: "pending" | "absent" | "no_show",
  ): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("trip_stops")
      .update({
        status,
        picked_up_at: null,
        dropped_off_at: null,
        marked_absent_at: status === "pending" ? null : now,
        updated_at: now,
      })
      .eq("trip_id", tripId)
      .eq("learner_id", learnerId);

    if (error) {
      throw new Error(`Failed to update paired-run learner status: ${error.message}`);
    }
  }

  async findByTripId(
    tripId: string,
  ): Promise<DriverTripStop[]> {
    const {
      data: stops,
      error: stopsError,
    } =
      await supabase
        .from("trip_stops")
        .select(
          TRIP_STOP_SELECT,
        )
        .eq(
          "trip_id",
          tripId,
        )
        .order(
          "sequence",
          {
            ascending: true,
          },
        );

    if (stopsError) {
      throw new Error(
        `Failed to retrieve trip stops: ${stopsError.message}`,
      );
    }

    if (
      !stops ||
      stops.length === 0
    ) {
      return [];
    }

    const learnerIds = [
      ...new Set(
        stops.map(
          (stop) =>
            stop.learner_id,
        ),
      ),
    ];

    const {
      data: learners,
      error: learnersError,
    } =
      await supabase
        .from("learners")
        .select(`
          id,
          full_name
        `)
        .in(
          "id",
          learnerIds,
        );

    if (learnersError) {
      throw new Error(
        `Failed to retrieve learners: ${learnersError.message}`,
      );
    }

    const learnerMap =
      new Map(
        (learners ?? []).map(
          (learner) => [
            learner.id,
            learner,
          ],
        ),
      );

    return stops.map(
      (stop) => {
        const learner =
          learnerMap.get(
            stop.learner_id,
          );

        if (!learner) {
          throw new Error(
            `Learner not found for trip stop ${stop.id}.`,
          );
        }

        return {
          id:
            stop.id,

          tripId:
            stop.trip_id,

          learnerId:
            stop.learner_id,

          sequence:
            stop.sequence,

          status:
            stop.status as TripStopStatus,

          address:
            stop.address,

          latitude:
            stop.latitude,

          longitude:
            stop.longitude,

          pickedUpAt:
            stop.picked_up_at,

          droppedOffAt:
            stop.dropped_off_at,

          markedAbsentAt:
            stop.marked_absent_at,

          learner: {
            id:
              learner.id,

            fullName:
              learner.full_name,
          },
        };
      },
    );
  }

  async markEnRoute(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const now =
    new Date().toISOString();

  const {
    data: stop,
    error,
  } =
    await supabase
      .from("trip_stops")
      .update({
        status:
          "en_route",

        updated_at:
          now,
      })
      .eq(
        "id",
        stopId,
      )
      .eq(
        "trip_id",
        tripId,
      )
      .eq(
        "status",
        "pending",
      )
      .select(
        TRIP_STOP_SELECT,
      )
      .maybeSingle();

  if (error) {
  if (
    error.code === "23505"
  ) {
    throw new Error(
      "Another learner is already en route for this trip.",
    );
  }

  throw new Error(
    `Failed to mark learner as en route: ${error.message}`,
  );
}

  if (!stop) {
    throw new Error(
      "Trip stop was not found or is no longer pending.",
    );
  }

  return this.attachLearner(
    stop,
  );
}

async markArrived(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const now =
    new Date().toISOString();

  const {
    data: stop,
    error,
  } =
    await supabase
      .from("trip_stops")
      .update({
        status:
          "arrived",

        updated_at:
          now,
      })
      .eq(
        "id",
        stopId,
      )
      .eq(
        "trip_id",
        tripId,
      )
      .eq(
        "status",
        "en_route",
      )
      .select(
        TRIP_STOP_SELECT,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to mark learner as arrived: ${error.message}`,
    );
  }

  if (!stop) {
    throw new Error(
      "Trip stop was not found or the learner is not currently en route.",
    );
  }

  return this.attachLearner(
    stop,
  );
}

  async markPickedUp(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    const now =
      new Date().toISOString();

    const {
      data: stop,
      error,
    } =
      await supabase
        .from("trip_stops")
        .update({
          status:
            "picked_up",

          picked_up_at:
            now,

          marked_absent_at:
            null,

          updated_at:
            now,
        })
        .eq(
          "id",
          stopId,
        )
        .eq(
          "trip_id",
          tripId,
        )
        .eq(
          "status",
          "arrived",
        )
        .select(
          TRIP_STOP_SELECT,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to mark learner as picked up: ${error.message}`,
      );
    }

    if (!stop) {
  throw new Error(
    "Trip stop was not found or the driver has not completed the arrival workflow.",
  );
}

    return this.attachLearner(
      stop,
    );
  }

  async markDroppedOff(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    const now =
      new Date().toISOString();

    const {
      data: stop,
      error,
    } =
      await supabase
        .from("trip_stops")
        .update({
          status:
            "dropped_off",

          dropped_off_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          stopId,
        )
        .eq(
          "trip_id",
          tripId,
        )
        .eq(
          "status",
          "picked_up",
        )
        .select(
          TRIP_STOP_SELECT,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to mark learner as dropped off: ${error.message}`,
      );
    }

    if (!stop) {
      throw new Error(
        "Trip stop was not found or the learner has not been picked up.",
      );
    }

    return this.attachLearner(
      stop,
    );
  }

  async markAbsent(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    const now =
      new Date().toISOString();

    const {
      data: stop,
      error,
    } =
      await supabase
        .from("trip_stops")
        .update({
          status:
            "absent",

          marked_absent_at:
            now,

          picked_up_at:
            null,

          updated_at:
            now,
        })
        .eq(
          "id",
          stopId,
        )
        .eq(
          "trip_id",
          tripId,
        )
        .eq(
          "status",
          "pending",
        )
        .select(
          TRIP_STOP_SELECT,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to mark learner as absent: ${error.message}`,
      );
    }

    if (!stop) {
      throw new Error(
        "Trip stop was not found or is no longer pending.",
      );
    }

    return this.attachLearner(
      stop,
    );
  }

  async markNoShow(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    const now =
      new Date().toISOString();

    const {
      data: stop,
      error,
    } =
      await supabase
        .from("trip_stops")
        .update({
          status:
            "no_show",

          /*
           * Temporary:
           * no-show currently shares
           * marked_absent_at.
           */
          marked_absent_at:
            now,

          picked_up_at:
            null,

          updated_at:
            now,
        })
        .eq(
          "id",
          stopId,
        )
        .eq(
          "trip_id",
          tripId,
        )
        .eq(
          "status",
          "arrived",
        )
        .select(
          TRIP_STOP_SELECT,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to mark learner as no-show: ${error.message}`,
      );
    }

    if (!stop) {
  throw new Error(
    "Trip stop was not found or the driver has not arrived at the pickup location.",
  );
}

    return this.attachLearner(
      stop,
    );
  }

  async undoStopAction(
  tripId: string,
  stopId: string,
): Promise<DriverTripStop> {
  const stops =
    await this.findByTripId(
      tripId,
    );

  const stop =
    stops.find(
      (candidate) =>
        candidate.id ===
        stopId,
    );

  if (!stop) {
    throw new Error(
      "Trip stop was not found.",
    );
  }

  if (
    stop.status ===
    "pending"
  ) {
    throw new Error(
      "There is no action to undo for this stop.",
    );
  }

  const now =
    new Date().toISOString();

  let nextStatus:
    TripStopStatus;

  let updates: {
    status: TripStopStatus;
    picked_up_at?: string | null;
    dropped_off_at?: string | null;
    marked_absent_at?: string | null;
    updated_at: string;
  };

  switch (stop.status) {
    case "en_route": {
      nextStatus =
        "pending";

      updates = {
        status:
          nextStatus,

        picked_up_at:
          null,

        dropped_off_at:
          null,

        marked_absent_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    case "arrived": {
      nextStatus =
        "en_route";

      updates = {
        status:
          nextStatus,

        picked_up_at:
          null,

        dropped_off_at:
          null,

        marked_absent_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    case "picked_up": {
      nextStatus =
        "arrived";

      updates = {
        status:
          nextStatus,

        picked_up_at:
          null,

        dropped_off_at:
          null,

        marked_absent_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    case "absent": {
      nextStatus =
        "pending";

      updates = {
        status:
          nextStatus,

        marked_absent_at:
          null,

        picked_up_at:
          null,

        dropped_off_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    case "no_show": {
      nextStatus =
        "arrived";

      updates = {
        status:
          nextStatus,

        marked_absent_at:
          null,

        picked_up_at:
          null,

        dropped_off_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    case "dropped_off": {
      nextStatus =
        "picked_up";

      updates = {
        status:
          nextStatus,

        /*
         * Keep picked_up_at because
         * the learner is back on board.
         */
        dropped_off_at:
          null,

        marked_absent_at:
          null,

        updated_at:
          now,
      };

      break;
    }

    default: {
      throw new Error(
        `Cannot undo stop status ${stop.status}.`,
      );
    }
  }

  const {
    data: updatedStop,
    error,
  } =
    await supabase
      .from("trip_stops")
      .update(
        updates,
      )
      .eq(
        "id",
        stopId,
      )
      .eq(
        "trip_id",
        tripId,
      )
      /*
       * Concurrency guard:
       * only undo if the status is still
       * what we just inspected.
       */
      .eq(
        "status",
        stop.status,
      )
      .select(
        TRIP_STOP_SELECT,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to undo trip stop action: ${error.message}`,
    );
  }

  if (!updatedStop) {
    throw new Error(
      "The trip stop changed before the undo could be completed.",
    );
  }

  return this.attachLearner(
    updatedStop,
  );
}

  private async attachLearner(
    stop:
      TripStopDatabaseRow,
  ): Promise<DriverTripStop> {
    const {
      data: learner,
      error,
    } =
      await supabase
        .from("learners")
        .select(`
          id,
          full_name
        `)
        .eq(
          "id",
          stop.learner_id,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to retrieve learner: ${error.message}`,
      );
    }

    if (!learner) {
      throw new Error(
        `Learner not found for trip stop ${stop.id}.`,
      );
    }

    return {
      id:
        stop.id,

      tripId:
        stop.trip_id,

      learnerId:
        stop.learner_id,

      sequence:
        stop.sequence,

      status:
        stop.status as TripStopStatus,

      address:
        stop.address,

      latitude:
        stop.latitude,

      longitude:
        stop.longitude,

      pickedUpAt:
        stop.picked_up_at,

      droppedOffAt:
        stop.dropped_off_at,

      markedAbsentAt:
        stop.marked_absent_at,

      learner: {
        id:
          learner.id,

        fullName:
          learner.full_name,
      },
    };
  }
}