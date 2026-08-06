import type {
  PreparedNotification,
} from "./notification-orchestrator.service.js";

export type WhatsAppTemplateMessage = {
  name: string;
  languageCode: string;
  parameters: string[];
};

export type NotificationMessage = {
  title: string;
  body: string;
  eventType:
    PreparedNotification["eventType"];
  learnerNames: string[];
  trackingLink: string | null;
  whatsappTemplate:
    WhatsAppTemplateMessage | null;
};

const TEMPORARY_ETA_MINUTES = "5";

function getFirstName(
  fullName: string,
): string {
  const trimmedName =
    fullName.trim();

  if (!trimmedName) {
    return "there";
  }

  return (
    trimmedName.split(/\s+/)[0] ??
    "there"
  );
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

  let title =
    "Scholar Transport Update";

  let body: string;

  let whatsappTemplate:
    WhatsAppTemplateMessage | null =
    null;

  switch (
    notification.eventType
  ) {
    case "driver_on_the_way": {
      const pickupAddress =
        notification.pickupAddress
          ?.trim() ||
        "the agreed pickup address";

      const learnerFirstName =
        notification.learnerNames[0]
          ?.trim()
          .split(/\s+/)[0] ||
        "the learner";

      title =
        "Driver On The Way";

      body = [
        `Good day ${recipientFirstName},`,
        "",
        `Your driver is on the way to collect ${learnerNames}.`,
        "",
        "Pickup address:",
        pickupAddress,
        "",
        `Estimated arrival: approximately ${TEMPORARY_ETA_MINUTES} minutes.`,
        "",
        `Please ensure ${learnerFirstName} is ready outside.`,
        "",
        "Thank you,",
        "Via Nova Scholar Transport",
      ].join("\n");

      whatsappTemplate = {
        name:
          "driver_on_the_way",

        /*
         * This must exactly match the language
         * shown for the approved Meta template.
         *
         * Your template was created as English,
         * which normally uses "en".
         */
        languageCode: "en",

        /*
         * Variable order must match Meta:
         *
         * {{1}} Parent name
         * {{2}} Learner name
         * {{3}} Pickup address
         * {{4}} ETA minutes
         */
        parameters: [
          recipientFirstName,
          learnerNames,
          pickupAddress,
          TEMPORARY_ETA_MINUTES,
        ],
      };

      break;
    }

    case "driver_arrived":
      title =
        "Driver Arrived";

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
    title,
    body,
    eventType:
      notification.eventType,
    learnerNames:
      notification.learnerNames,
    trackingLink: null,
    whatsappTemplate,
  };
}