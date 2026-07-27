import { TripStopRepository } from "../repositories/trip-stop.repository.js";
import {
  TripRepository,
  type DriverTrip,
} from "../repositories/trip.repository.js";

type DriverTripStop = Awaited<
  ReturnType<TripStopRepository["findByTripId"]>
>[number];

export type DriverTripPhase =
  | "pickup"
  | "dropoff"
  | "complete";

export type DriverTripNextAction =
  | "pick-up"
  | "drop-off"
  | null;

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

export type CurrentDriverTrip = {
  trip: DriverTrip;
  manifest: DriverTripManifest;
};

export type DriverDashboard = {
  activeTrip: CurrentDriverTrip | null;
  nextTrip: CurrentDriverTrip | null;
  recentlyCompletedTrip: DriverTrip | null;
};

export class DriverTripService {
  constructor(
    private readonly tripStopRepository: TripStopRepository,
    private readonly tripRepository: TripRepository,
  ) {}

  async getDriverDashboard(
    driverId: string,
  ): Promise<DriverDashboard> {
    const [
      activeTripRecord,
      nextTripRecord,
      recentlyCompletedTrip,
    ] = await Promise.all([
      this.tripRepository.findActiveTripForDriver(
        driverId,
      ),
      this.tripRepository.findNextScheduledTripForDriver(
        driverId,
      ),
      this.tripRepository.findRecentlyCompletedTripForDriver(
        driverId,
      ),
    ]);

    const activeTrip = activeTripRecord
      ? {
          trip: activeTripRecord,
          manifest: await this.getTripManifest(
            activeTripRecord.id,
          ),
        }
      : null;

    const nextTrip = nextTripRecord
      ? {
          trip: nextTripRecord,
          manifest: await this.getTripManifest(
            nextTripRecord.id,
          ),
        }
      : null;

    return {
      activeTrip,
      nextTrip,
      recentlyCompletedTrip,
    };
  }

  async getCurrentTripForDriver(
    driverId: string,
  ): Promise<CurrentDriverTrip | null> {
    const trip =
      await this.tripRepository.findCurrentTripForDriver(
        driverId,
      );

    if (!trip) {
      return null;
    }

    const manifest =
      await this.getTripManifest(trip.id);

    return {
      trip,
      manifest,
    };
  }

  async startTrip(
    tripId: string,
  ): Promise<void> {
    await this.tripRepository.markInProgress(
      tripId,
    );
  }

  async pickUpLearner(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    return this.tripStopRepository.markPickedUp(
      tripId,
      stopId,
    );
  }

  async markLearnerAbsent(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    return this.tripStopRepository.markAbsent(
      tripId,
      stopId,
    );
  }

  async dropOffLearner(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    const updatedStop =
      await this.tripStopRepository.markDroppedOff(
        tripId,
        stopId,
      );

    const manifest =
      await this.getTripManifest(tripId);

    if (
      manifest.currentPhase === "complete"
    ) {
      await this.tripRepository.markCompleted(
        tripId,
      );
    }

    return updatedStop;
  }

  async getTripManifest(
    tripId: string,
  ): Promise<DriverTripManifest> {
    const stops =
      await this.tripStopRepository.findByTripId(
        tripId,
      );

    const orderedStops = [...stops].sort(
      (firstStop, secondStop) =>
        firstStop.sequence -
        secondStop.sequence,
    );

    const nextPendingStop =
      orderedStops.find(
        (stop) =>
          stop.status === "pending",
      );

    const nextPickedUpStop =
      orderedStops.find(
        (stop) =>
          stop.status === "picked_up",
      );

    let currentPhase: DriverTripPhase;
    let nextAction: DriverTripNextAction;
    let nextStop: DriverTripStop | null;

    if (nextPendingStop) {
      currentPhase = "pickup";
      nextAction = "pick-up";
      nextStop = nextPendingStop;
    } else if (nextPickedUpStop) {
      currentPhase = "dropoff";
      nextAction = "drop-off";
      nextStop = nextPickedUpStop;
    } else {
      currentPhase = "complete";
      nextAction = null;
      nextStop = null;
    }

    const completedCount =
      orderedStops.filter(
        (stop) =>
          stop.status === "absent" ||
          stop.status === "dropped_off",
      ).length;

    return {
      tripId,
      currentPhase,
      nextAction,
      nextStop,
      learnerCount: orderedStops.length,
      completedCount,
      remainingCount:
        orderedStops.length -
        completedCount,
      learners: orderedStops,
    };
  }
}