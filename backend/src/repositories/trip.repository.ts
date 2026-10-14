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
  serviceDate: string | null;
};

type TripRow = {
  id: string;
  driver_id: string | null;
  direction: DriverTripDirection | null;
  scheduled_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  status: DriverTripStatus;
  service_date: string | null;
};

const TRIP_SELECT = `
  id,
  driver_id,
  direction,
  scheduled_start,
  actual_start,
  actual_end,
  status,
  service_date
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

  async findById(tripId: string): Promise<DriverTrip | null> {
    const { data, error } = await this.supabase
      .from("trips")
      .select(TRIP_SELECT)
      .eq("id", tripId)
      .maybeSingle<TripRow>();
    if (error) throw new Error(`Failed to find trip: ${error.message}`);
    return data ? this.toDomain(data) : null;
  }

  async findDailyTripForDriver(
    driverId: string,
    serviceDate: string,
    direction: DriverTripDirection,
  ): Promise<DriverTrip | null> {
    const { data, error } = await this.supabase
      .from("trips")
      .select(TRIP_SELECT)
      .eq("driver_id", driverId)
      .eq("service_date", serviceDate)
      .eq("direction", direction)
      .maybeSingle<TripRow>();

    if (error) {
      throw new Error(`Failed to find daily trip: ${error.message}`);
    }

    return data ? this.toDomain(data) : null;
  }

  async createDailyTrip(
    driverId: string,
    serviceDate: string,
    direction: DriverTripDirection,
    scheduledStart: string,
  ): Promise<DriverTrip> {
    const { data, error } = await this.supabase
      .from("trips")
      .insert({
        learner_id: null,
        driver_id: driverId,
        service_date: serviceDate,
        direction,
        scheduled_start: scheduledStart,
        status: "scheduled",
        actual_start: null,
        actual_end: null,
      })
      .select(TRIP_SELECT)
      .single<TripRow>();

    if (error) {
      throw new Error(`Failed to create daily trip: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async assertInProgress(tripId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate trip status: ${error.message}`);
    }
    if (!data) {
      throw new Error("Trip is not currently in progress.");
    }
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

      serviceDate:
        row.service_date,
    };
  }
}