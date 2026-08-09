import {
  subscribeToDomainEvent,
} from "./event-bus.js";

import {
  handleDriverArrivedNotification,
} from "./handlers/driver-arrived-notification.handler.js";

import {
  handleDriverOnTheWayNotification,
} from "./handlers/driver-on-the-way-notification.handler.js";

import {
  handleLearnerAbsentNotification,
} from "./handlers/learner-absent-notification.handler.js";

import {
  handleLearnerNoShowNotification,
} from "./handlers/learner-no-show-notification.handler.js";

import {
  handleTripNotification,
} from "./handlers/trip-notification.handler.js";

export function registerEventHandlers(): void {
  subscribeToDomainEvent(
    "trip.state_changed",
    handleTripNotification,
  );

  subscribeToDomainEvent(
    "driver.arrived",
    handleDriverArrivedNotification,
  );

  subscribeToDomainEvent(
    "driver.on_the_way",
    handleDriverOnTheWayNotification,
  );

  subscribeToDomainEvent(
    "learner.absent",
    handleLearnerAbsentNotification,
  );

  subscribeToDomainEvent(
    "learner.no_show",
    handleLearnerNoShowNotification,
  );
}