import { TripRepository, type DriverTrip } from "../repositories/trip.repository.js";
import { TripStopRepository } from "../repositories/trip-stop.repository.js";

export type DailyRuns = {
  serviceDate: string;
  morningTrip: DriverTrip;
  afternoonTrip: DriverTrip;
};

export class DailyRunService {
  constructor(
    private readonly tripStopRepository: TripStopRepository,
    private readonly tripRepository: TripRepository,
  ) {}

  async initializeDay(driverId: string, serviceDate: string): Promise<DailyRuns> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
      throw new Error("serviceDate must use YYYY-MM-DD format.");
    }

    // Test/MVP source of roster: the most recent morning run for this driver.
    // Later this should come from the back-office route/learner assignment tables.
    const templateTrip = await this.tripRepository.findReusableTripForDriver(
      driverId,
      "home_to_school",
    );
    if (!templateTrip) {
      throw new Error("No morning trip is available to use as the learner roster template.");
    }
    const templateStops = await this.tripStopRepository.findByTripId(templateTrip.id);
    if (templateStops.length === 0) {
      throw new Error("The learner roster template has no trip stops.");
    }

    const morningTrip = await this.getOrCreateTrip(
      driverId,
      serviceDate,
      "home_to_school",
      `${serviceDate}T06:00:00+02:00`,
      templateStops,
    );
    const afternoonTrip = await this.getOrCreateTrip(
      driverId,
      serviceDate,
      "school_to_home",
      `${serviceDate}T13:00:00+02:00`,
      templateStops,
    );

    return { serviceDate, morningTrip, afternoonTrip };
  }

  private async getOrCreateTrip(
    driverId: string,
    serviceDate: string,
    direction: "home_to_school" | "school_to_home",
    scheduledStart: string,
    templateStops: Awaited<ReturnType<TripStopRepository["findByTripId"]>>,
  ): Promise<DriverTrip> {
    const existing = await this.tripRepository.findDailyTripForDriver(
      driverId,
      serviceDate,
      direction,
    );
    if (existing) return existing;

    try {
      const created = await this.tripRepository.createDailyTrip(
        driverId,
        serviceDate,
        direction,
        scheduledStart,
      );
      await this.tripStopRepository.createStopsFromTemplate(created.id, templateStops);
      return created;
    } catch (error) {
      // The unique daily-run index makes concurrent/repeated initialization safe.
      const concurrent = await this.tripRepository.findDailyTripForDriver(
        driverId,
        serviceDate,
        direction,
      );
      if (concurrent) return concurrent;
      throw error;
    }
  }
}
