import { publishDomainEvent } from "../events/event-bus.js";

import {
  TripStopRepository,
  type DriverTripStop,
  type TripStopStatus,
} from "../repositories/trip-stop.repository.js";

import {
  TripRepository,
  type DriverTrip,
} from "../repositories/trip.repository.js";

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
  recentlyCompletedTrip:
    DriverTrip | null;
};

type StopActionTimestamp = {
  stop: DriverTripStop;
  occurredAt: number;
};

export class DriverTripService {
  constructor(
    private readonly tripStopRepository:
      TripStopRepository,

    private readonly tripRepository:
      TripRepository,
  ) {}

  async startMorningRun(
    driverId: string,
  ): Promise<void> {
    await this.startRun(
      driverId,
      "home_to_school",
    );
  }

  async startAfternoonRun(
    driverId: string,
  ): Promise<void> {
    await this.startRun(
      driverId,
      "school_to_home",
    );
  }

  private async startRun(
    driverId: string,
    direction:
      | "home_to_school"
      | "school_to_home",
  ): Promise<void> {
    const trip =
      await this.tripRepository.findReusableTripForDriver(
        driverId,
        direction,
      );

    if (!trip) {
      throw new Error(
        `No ${direction} trip is available for this driver.`,
      );
    }

    await this.tripStopRepository.resetTripStops(
      trip.id,
    );

    await this.tripRepository.restartForDevelopment(
      trip.id,
    );
  }

  async getDriverDashboard(
    driverId: string,
  ): Promise<DriverDashboard> {
    const [
      activeTripRecord,
      nextTripRecord,
      recentlyCompletedTrip,
    ] =
      await Promise.all([
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

    const activeTrip =
      activeTripRecord
        ? {
            trip:
              activeTripRecord,

            manifest:
              await this.getTripManifest(
                activeTripRecord.id,
              ),
          }
        : null;

    const nextTrip =
      nextTripRecord
        ? {
            trip:
              nextTripRecord,

            manifest:
              await this.getTripManifest(
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
      await this.getTripManifest(
        trip.id,
      );

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

  async notifyParentDriverArrived(
    tripId: string,
    stopId: string,
  ): Promise<void> {
    const stops =
      await this.tripStopRepository.findByTripId(
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

    await publishDomainEvent({
      type:
        "driver.arrived",

      tripId,

      stopId,

      learnerId:
        stop.learnerId,

      occurredAt:
        new Date().toISOString(),
    });
  }

  async pickUpLearner(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    console.log(
      "Starting learner pickup:",
      {
        tripId,
        stopId,
      },
    );

    const updatedStop =
      await this.tripStopRepository.markPickedUp(
        tripId,
        stopId,
      );

    console.log(
      "Learner marked as picked up:",
      {
        stopId:
          updatedStop.id,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    console.log(
      "Publishing picked_up event:",
      {
        tripId,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    await publishDomainEvent({
      type:
        "trip.state_changed",

      tripId,

      learnerId:
        updatedStop.learnerId,

      eventType:
        "picked_up",

      previousStatus:
        "waiting_for_pickup",

      newStatus:
        "on_board",

      occurredAt:
        new Date().toISOString(),
    });

    console.log(
      "picked_up event published.",
    );

    const manifest =
      await this.getTripManifest(
        tripId,
      );

    console.log(
      "Manifest after pickup:",
      {
        currentPhase:
          manifest.currentPhase,

        nextAction:
          manifest.nextAction,

        nextStopId:
          manifest.nextStop?.id ??
          null,

        nextLearnerId:
          manifest.nextStop
            ?.learnerId ??
          null,

        nextLearnerName:
          manifest.nextStop
            ?.learner.fullName ??
          null,
      },
    );

    const nextStop =
      manifest.currentPhase ===
      "pickup"
        ? manifest.nextStop
        : null;

    if (!nextStop) {
      console.log(
        "No next pickup stop found. On-the-way notification not published.",
      );

      return updatedStop;
    }

    console.log(
      "Publishing driver.on_the_way:",
      {
        tripId,

        stopId:
          nextStop.id,

        learnerId:
          nextStop.learnerId,

        learnerName:
          nextStop.learner.fullName,

        address:
          nextStop.address,
      },
    );

    await publishDomainEvent({
      type:
        "driver.on_the_way",

      tripId,

      stopId:
        nextStop.id,

      learnerId:
        nextStop.learnerId,

      address:
        nextStop.address,

      occurredAt:
        new Date().toISOString(),
    });

    console.log(
      "driver.on_the_way event published.",
    );

    return updatedStop;
  }

  async markLearnerAbsent(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    console.log(
      "Starting learner absence:",
      {
        tripId,
        stopId,
      },
    );

    const updatedStop =
      await this.tripStopRepository.markAbsent(
        tripId,
        stopId,
      );

    console.log(
      "Learner marked as absent:",
      {
        stopId:
          updatedStop.id,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    await publishDomainEvent({
      type:
        "learner.absent",

      tripId,

      stopId:
        updatedStop.id,

      learnerId:
        updatedStop.learnerId,

      occurredAt:
        new Date().toISOString(),
    });

    console.log(
      "learner.absent event published.",
    );

    return updatedStop;
  }

  async markLearnerNoShow(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    console.log(
      "Starting learner no-show:",
      {
        tripId,
        stopId,
      },
    );

    const updatedStop =
      await this.tripStopRepository.markNoShow(
        tripId,
        stopId,
      );

    console.log(
      "Learner marked as no-show:",
      {
        stopId:
          updatedStop.id,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    await publishDomainEvent({
      type:
        "learner.no_show",

      tripId,

      stopId:
        updatedStop.id,

      learnerId:
        updatedStop.learnerId,

      occurredAt:
        new Date().toISOString(),
    });

    console.log(
      "learner.no_show event published.",
    );

    return updatedStop;
  }

  async dropOffLearner(
    tripId: string,
    stopId: string,
  ): Promise<DriverTripStop> {
    console.log(
      "Starting learner drop-off:",
      {
        tripId,
        stopId,
      },
    );

    const updatedStop =
      await this.tripStopRepository.markDroppedOff(
        tripId,
        stopId,
      );

    console.log(
      "Learner marked as dropped off:",
      {
        stopId:
          updatedStop.id,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    console.log(
      "Publishing dropped_off event:",
      {
        tripId,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,
      },
    );

    await publishDomainEvent({
      type:
        "trip.state_changed",

      tripId,

      learnerId:
        updatedStop.learnerId,

      eventType:
        "dropped_off",

      previousStatus:
        "next_for_dropoff",

      newStatus:
        "completed",

      occurredAt:
        new Date().toISOString(),
    });

    console.log(
      "dropped_off event published.",
    );

    const manifest =
      await this.getTripManifest(
        tripId,
      );

    console.log(
      "Manifest after drop-off:",
      {
        currentPhase:
          manifest.currentPhase,

        nextAction:
          manifest.nextAction,

        nextStopId:
          manifest.nextStop?.id ??
          null,

        nextLearnerId:
          manifest.nextStop
            ?.learnerId ??
          null,

        nextLearnerName:
          manifest.nextStop
            ?.learner.fullName ??
          null,
      },
    );

    if (
      manifest.currentPhase ===
        "complete" ||
      !manifest.nextStop
    ) {
      await this.tripRepository.markCompleted(
        tripId,
      );

      console.log(
        "Trip marked as completed.",
      );

      return updatedStop;
    }

    if (
      manifest.currentPhase ===
      "dropoff"
    ) {
      const nextStop =
        manifest.nextStop;

      console.log(
        "Publishing next_for_dropoff event:",
        {
          tripId,

          learnerId:
            nextStop.learnerId,

          learnerName:
            nextStop.learner.fullName,
        },
      );

      await publishDomainEvent({
        type:
          "trip.state_changed",

        tripId,

        learnerId:
          nextStop.learnerId,

        eventType:
          "next_for_dropoff",

        previousStatus:
          "on_board",

        newStatus:
          "next_for_dropoff",

        occurredAt:
          new Date().toISOString(),
      });

      console.log(
        "next_for_dropoff event published.",
      );
    }

    return updatedStop;
  }

  async undoLastAction(
    tripId: string,
  ): Promise<DriverTripStop> {
    console.log(
      "Starting undo last action:",
      {
        tripId,
      },
    );

    const stops =
      await this.tripStopRepository.findByTripId(
        tripId,
      );

    if (
      stops.length === 0
    ) {
      throw new Error(
        "No trip stops were found.",
      );
    }

    const lastAction =
      this.findMostRecentStopAction(
        stops,
      );

    if (!lastAction) {
      throw new Error(
        "There is no driver action to undo.",
      );
    }

    const {
      stop,
    } = lastAction;

    console.log(
      "Last action identified:",
      {
        stopId:
          stop.id,

        learnerId:
          stop.learnerId,

        learnerName:
          stop.learner.fullName,

        status:
          stop.status,
      },
    );

    /*
     * If the last learner was dropped off,
     * dropOffLearner() may already have marked
     * the entire trip completed.
     *
     * Reopen it BEFORE restoring the learner
     * to picked_up.
     */
    if (
      stop.status ===
      "dropped_off"
    ) {
      const manifestBeforeUndo =
        await this.getTripManifest(
          tripId,
        );

      if (
        manifestBeforeUndo.currentPhase ===
        "complete"
      ) {
        console.log(
          "Reopening completed trip before undo.",
        );

        await this.tripRepository.reopenCompletedTrip(
          tripId,
        );

        console.log(
          "Completed trip reopened.",
        );
      }
    }

    const updatedStop =
      await this.tripStopRepository.undoStopAction(
        tripId,
        stop.id,
      );

    console.log(
      "Last stop action undone:",
      {
        stopId:
          updatedStop.id,

        learnerId:
          updatedStop.learnerId,

        learnerName:
          updatedStop.learner.fullName,

        status:
          updatedStop.status,
      },
    );

    /*
     * IMPORTANT:
     *
     * Undo changes operational state only.
     *
     * We do NOT publish the normal pickup,
     * drop-off, absent, or no-show events here,
     * because that would send another ordinary
     * parent notification with the wrong meaning.
     *
     * Later we can add a dedicated corrective
     * notification such as:
     *
     * "Please disregard the previous update."
     */

    return updatedStop;
  }

  private findMostRecentStopAction(
    stops:
      DriverTripStop[],
  ): StopActionTimestamp | null {
    const actions:
      StopActionTimestamp[] = [];

    for (
      const stop of stops
    ) {
      const occurredAt =
        this.getStopActionTimestamp(
          stop,
        );

      if (
        occurredAt === null
      ) {
        continue;
      }

      actions.push({
        stop,
        occurredAt,
      });
    }

    if (
      actions.length === 0
    ) {
      return null;
    }

    actions.sort(
      (
        firstAction,
        secondAction,
      ) =>
        secondAction.occurredAt -
        firstAction.occurredAt,
    );

    return (
      actions[0] ??
      null
    );
  }

  private getStopActionTimestamp(
    stop:
      DriverTripStop,
  ): number | null {
    let timestamp:
      string | null =
      null;

    switch (
      stop.status
    ) {
      case "picked_up":
        timestamp =
          stop.pickedUpAt;
        break;

      case "dropped_off":
        timestamp =
          stop.droppedOffAt;
        break;

      case "absent":
      case "no_show":
        timestamp =
          stop.markedAbsentAt;
        break;

      case "pending":
        return null;
    }

    if (!timestamp) {
      return null;
    }

    const parsedTimestamp =
      Date.parse(
        timestamp,
      );

    if (
      Number.isNaN(
        parsedTimestamp,
      )
    ) {
      return null;
    }

    return parsedTimestamp;
  }

  async getTripManifest(
    tripId: string,
  ): Promise<DriverTripManifest> {
    const stops =
      await this.tripStopRepository.findByTripId(
        tripId,
      );

    const orderedStops =
      [...stops].sort(
        (
          firstStop,
          secondStop,
        ) =>
          firstStop.sequence -
          secondStop.sequence,
      );

    const nextPendingStop =
      orderedStops.find(
        (stop) =>
          stop.status ===
          "pending",
      );

    const nextPickedUpStop =
      orderedStops.find(
        (stop) =>
          stop.status ===
          "picked_up",
      );

    let currentPhase:
      DriverTripPhase;

    let nextAction:
      DriverTripNextAction;

    let nextStop:
      DriverTripStop | null;

    if (
      nextPendingStop
    ) {
      currentPhase =
        "pickup";

      nextAction =
        "pick-up";

      nextStop =
        nextPendingStop;
    } else if (
      nextPickedUpStop
    ) {
      currentPhase =
        "dropoff";

      nextAction =
        "drop-off";

      nextStop =
        nextPickedUpStop;
    } else {
      currentPhase =
        "complete";

      nextAction =
        null;

      nextStop =
        null;
    }

    const completedCount =
      orderedStops.filter(
        (stop) =>
          stop.status ===
            "absent" ||
          stop.status ===
            "no_show" ||
          stop.status ===
            "dropped_off",
      ).length;

    return {
      tripId,

      currentPhase,

      nextAction,

      nextStop,

      learnerCount:
        orderedStops.length,

      completedCount,

      remainingCount:
        orderedStops.length -
        completedCount,

      learners:
        orderedStops,
    };
  }
}