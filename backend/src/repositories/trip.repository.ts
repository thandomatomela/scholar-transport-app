import type {
  SupabaseClient,
} from "@supabase/supabase-js";

export type DriverTripStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DriverTripDirection =
  | "home_to_school"
  | "school_to_home";

export type DriverTrip = {
  id: string;
  driverId: string | null;
  direction: DriverTripDirection | null;
  scheduledStart: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  status: DriverTripStatus;
};

type TripRow = {
  id: string;
  driver_id: string | null;
  direction: DriverTripDirection | null;
  scheduled_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  status: DriverTripStatus;
};

const TRIP_SELECT = `
  id,
  driver_id,
  direction,
  scheduled_start,
  actual_start,
  actual_end,
  status
`;

export class TripRepository {
  constructor(
    private readonly supabase:
      SupabaseClient,
  ) {}

  async markCompleted(
    tripId: string,
  ): Promise<void> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .update({
          status:
            "completed",

          actual_end:
            new Date().toISOString(),
        })
        .eq(
          "id",
          tripId,
        )
        .eq(
          "status",
          "in_progress",
        )
        .select(
          "id",
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to complete trip: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Trip was not found or is not currently in progress.",
      );
    }
  }

  async reopenCompletedTrip(
    tripId: string,
  ): Promise<void> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .update({
          status:
            "in_progress",

          actual_end:
            null,
        })
        .eq(
          "id",
          tripId,
        )
        .eq(
          "status",
          "completed",
        )
        .select(
          "id",
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to reopen completed trip: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Trip was not found or is not currently completed.",
      );
    }
  }

  async markInProgress(
    tripId: string,
  ): Promise<void> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .update({
          status:
            "in_progress",

          actual_start:
            new Date().toISOString(),

          actual_end:
            null,
        })
        .eq(
          "id",
          tripId,
        )
        .eq(
          "status",
          "scheduled",
        )
        .select(
          "id",
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to start trip: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Trip was not found or is no longer scheduled.",
      );
    }
  }

  /**
   * Development/test helper.
   *
   * Reuses an existing scheduled or completed
   * trip and starts it again.
   *
   * In production, the back-office route
   * builder should generate fresh daily trip
   * records instead.
   */
  async restartForDevelopment(
    tripId: string,
  ): Promise<DriverTrip> {
    const now =
      new Date().toISOString();

    const { data, error } =
      await this.supabase
        .from("trips")
        .update({
          status:
            "in_progress",

          actual_start:
            now,

          actual_end:
            null,
        })
        .eq(
          "id",
          tripId,
        )
        .neq(
          "status",
          "cancelled",
        )
        .select(
          TRIP_SELECT,
        )
        .maybeSingle<TripRow>();

    if (error) {
      throw new Error(
        `Failed to restart trip: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Trip was not found or has been cancelled.",
      );
    }

    return this.toDomain(
      data,
    );
  }

  async findActiveTripForDriver(
    driverId: string,
  ): Promise<DriverTrip | null> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .select(
          TRIP_SELECT,
        )
        .eq(
          "driver_id",
          driverId,
        )
        .eq(
          "status",
          "in_progress",
        )
        .order(
          "actual_start",
          {
            ascending: false,
            nullsFirst: false,
          },
        )
        .limit(
          1,
        )
        .maybeSingle<TripRow>();

    if (error) {
      throw new Error(
        `Failed to find active driver trip: ${error.message}`,
      );
    }

    return data
      ? this.toDomain(
          data,
        )
      : null;
  }

  async findNextScheduledTripForDriver(
    driverId: string,
  ): Promise<DriverTrip | null> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .select(
          TRIP_SELECT,
        )
        .eq(
          "driver_id",
          driverId,
        )
        .eq(
          "status",
          "scheduled",
        )
        .not(
          "scheduled_start",
          "is",
          null,
        )
        .order(
          "scheduled_start",
          {
            ascending: true,
            nullsFirst: false,
          },
        )
        .limit(
          1,
        )
        .maybeSingle<TripRow>();

    if (error) {
      throw new Error(
        `Failed to find next scheduled driver trip: ${error.message}`,
      );
    }

    return data
      ? this.toDomain(
          data,
        )
      : null;
  }

  async findRecentlyCompletedTripForDriver(
    driverId: string,
  ): Promise<DriverTrip | null> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .select(
          TRIP_SELECT,
        )
        .eq(
          "driver_id",
          driverId,
        )
        .eq(
          "status",
          "completed",
        )
        .not(
          "actual_end",
          "is",
          null,
        )
        .order(
          "actual_end",
          {
            ascending: false,
            nullsFirst: false,
          },
        )
        .limit(
          1,
        )
        .maybeSingle<TripRow>();

    if (error) {
      throw new Error(
        `Failed to find recently completed driver trip: ${error.message}`,
      );
    }

    return data
      ? this.toDomain(
          data,
        )
      : null;
  }

  /**
   * Finds the most recent reusable trip
   * matching the requested morning or
   * afternoon direction.
   */
  async findReusableTripForDriver(
    driverId: string,
    direction:
      DriverTripDirection,
  ): Promise<DriverTrip | null> {
    const { data, error } =
      await this.supabase
        .from("trips")
        .select(
          TRIP_SELECT,
        )
        .eq(
          "driver_id",
          driverId,
        )
        .eq(
          "direction",
          direction,
        )
        .in(
          "status",
          [
            "scheduled",
            "completed",
          ],
        )
        .order(
          "scheduled_start",
          {
            ascending: false,
            nullsFirst: false,
          },
        )
        .limit(
          1,
        )
        .maybeSingle<TripRow>();

    if (error) {
      throw new Error(
        `Failed to find reusable driver trip: ${error.message}`,
      );
    }

    return data
      ? this.toDomain(
          data,
        )
      : null;
  }

  async findCurrentTripForDriver(
    driverId: string,
  ): Promise<DriverTrip | null> {
    const activeTrip =
      await this.findActiveTripForDriver(
        driverId,
      );

    if (activeTrip) {
      return activeTrip;
    }

    return this.findNextScheduledTripForDriver(
      driverId,
    );
  }

  private toDomain(
    row: TripRow,
  ): DriverTrip {
    return {
      id:
        row.id,

      driverId:
        row.driver_id,

      direction:
        row.direction,

      scheduledStart:
        row.scheduled_start,

      actualStart:
        row.actual_start,

      actualEnd:
        row.actual_end,

      status:
        row.status,
    };
  }
}