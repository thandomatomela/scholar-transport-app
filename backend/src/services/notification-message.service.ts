import type {
  PreparedNotification,
} from "./notification-orchestrator.service.js";

export type NotificationMessage = {
  title: string;
  body: string;
  eventType:
    PreparedNotification["eventType"];
  learnerNames: string[];
  trackingLink: string | null;
};

function getFirstName(
  fullName: string,
): string {
  const trimmedName =
    fullName.trim();

  if (!trimmedName) {
    return "there";
  }

  return trimmedName.split(/\s+/)[0];
}

function formatLearnerNames(
  learnerNames: string[],
): string {
  if (learnerNames.length === 0) {
    return "your child";
  }

  if (learnerNames.length === 1) {
    return learnerNames[0];
  }

  if (learnerNames.length === 2) {
    return (
      `${learnerNames[0]} and ` +
      learnerNames[1]
    );
  }

  const allButLast =
    learnerNames
      .slice(0, -1)
      .join(", ");

  const lastLearner =
    learnerNames[
      learnerNames.length - 1
    ];

  return (
    `${allButLast}, and ` +
    lastLearner
  );
}

export function buildNotificationMessage(
  notification:
    PreparedNotification,
): NotificationMessage {
  const recipientFirstName =
    getFirstName(
      notification.recipientName,
    );

  const learnerNames =
    formatLearnerNames(
      notification.learnerNames,
    );

  const plural =
    notification.learnerNames.length >
    1;

  let body: string;

  switch (
    notification.eventType
  ) {

    case "driver_on_the_way": {
  const pickupAddress =
    notification.pickupAddress?.trim() ||
    "the agreed pickup address";

  const learnerFirstName =
    notification.learnerNames[0]
      ?.trim()
      .split(/\s+/)[0] ||
    "the learner";

  body = [
    `Hi ${recipientFirstName},`,
    "",
    `The driver is now on the way to ${pickupAddress} to pick up ${learnerNames}.`,
    "",
    `Please make sure ${learnerFirstName} is ready.`,
  ].join("\n");

  break;
}
  
    case "driver_arrived":
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `The driver has arrived for ${learnerNames}.`,
        "",
        `Please meet the driver at the agreed ${
          plural
            ? "collection or drop-off points"
            : "collection or drop-off point"
        }.`,
      ].join("\n");
      break;

    case "picked_up":
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "have" : "has"
        } been safely picked up and ${
          plural ? "are" : "is"
        } now on board.`,
        "",
        "Thank you for choosing our scholar transport service.",
      ].join("\n");
      break;

    case "next_for_dropoff":
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "are" : "is"
        } next for drop-off.`,
        "",
        `Please be ready to receive ${
          plural
            ? "them"
            : "your child"
        }.`,
      ].join("\n");
      break;

    case "dropped_off":
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "have" : "has"
        } been safely dropped off.`,
        "",
        "Thank you for choosing our scholar transport service.",
      ].join("\n");
      break;

    case "trip_created":
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `A new transport trip has been scheduled for ${learnerNames}.`,
      ].join("\n");
      break;

    default:
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `There is a new transport update regarding ${learnerNames}.`,
      ].join("\n");
  }

  return {
    title:
  notification.eventType === "driver_arrived"
    ? "Driver Arrived"
    : notification.eventType === "driver_on_the_way"
      ? "Driver On The Way"
      : "Scholar Transport Update",
    body,
    eventType:
      notification.eventType,
    learnerNames:
      notification.learnerNames,
    trackingLink: null,
  };
}