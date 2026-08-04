export type TripStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DriverTripDirection =
  | "home_to_school"
  | "school_to_home";

export type DriverTripPhase =
  | "pickup"
  | "dropoff"
  | "complete";

export type DriverTripNextAction =
  | "pick-up"
  | "drop-off"
  | null;

export type DriverTripStopStatus =
  | "pending"
  | "picked_up"
  | "absent"
  | "dropped_off";

export type DriverTripStop = {
  id: string;
  sequence: number;
  status: DriverTripStopStatus;

  learner_name: string;
  address: string;

  latitude: number | null;
  longitude: number | null;

  scheduled_time: string | null;
  actual_arrival: string | null;
};

export type DriverTripManifest = {
  tripId: string;

  currentPhase: DriverTripPhase;

  nextAction: DriverTripNextAction;

  nextStop: DriverTripStop | null;

  learnerCount: number;

  completedCount: number;

  remainingCount: number;

  learners: DriverTripStop[];
};

export type DriverTrip = {
  id: string;

  status: TripStatus;

  direction?: DriverTripDirection;

  scheduled_start?: string | null;
  scheduled_end?: string | null;

  actual_start?: string | null;
  actual_end?: string | null;
};

export type CurrentDriverTrip = {
  trip: DriverTrip;
  manifest: DriverTripManifest;
};

export type DriverDashboard = {
  activeTrip: CurrentDriverTrip | null;
  nextTrip: CurrentDriverTrip | null;
  recentlyCompletedTrip: DriverTrip | null;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};