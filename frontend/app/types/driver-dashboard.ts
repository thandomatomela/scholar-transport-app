export type TripStopStatus =
  | "pending"
  | "picked_up"
  | "absent"
  | "dropped_off";

export type TripPhase =
  | "pickup"
  | "dropoff"
  | "complete";

export type TripAction =
  | "pick-up"
  | "drop-off"
  | null;

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

export type DriverTripManifest = {
  tripId: string;
  currentPhase: TripPhase;
  nextAction: TripAction;
  nextStop: DriverTripStop | null;
  learnerCount: number;
  completedCount: number;
  remainingCount: number;
  learners: DriverTripStop[];
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
};