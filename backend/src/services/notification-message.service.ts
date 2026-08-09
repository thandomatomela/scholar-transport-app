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
const WHATSAPP_LANGUAGE_CODE = "en";

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

      /*
       * Current approved Meta template order:
       *
       * {{1}} Parent name
       * {{2}} Pickup address
       * {{3}} ETA minutes
       * {{4}} Learner name
       */
      whatsappTemplate = {
        name:
          "driver_on_the_way",

        languageCode:
          WHATSAPP_LANGUAGE_CODE,

        parameters: [
          recipientFirstName,
          pickupAddress,
          TEMPORARY_ETA_MINUTES,
          learnerNames,
        ],
      };

      break;
    }

    case "driver_arrived": {
      title =
        "Driver Arrived";

      body = [
        `Good day ${recipientFirstName},`,
        "",
        `The driver has arrived at the pickup location for ${learnerNames}.`,
        "",
        `Please bring ${learnerNames} to the agreed pickup point.`,
        "",
        "Thank you,",
        "Via Nova Scholar Transport",
      ].join("\n");

      whatsappTemplate = {
        name:
          "driver_arrived",

        languageCode:
          WHATSAPP_LANGUAGE_CODE,

        parameters: [
          recipientFirstName,
          learnerNames,
        ],
      };

      break;
    }

    case "picked_up": {
      if (
        notification.tripDirection ===
        "home_to_school"
      ) {
        title =
          "Learner Picked Up";

        body = [
          `Good day ${recipientFirstName},`,
          "",
          `${learnerNames} ${
            plural ? "have" : "has"
          } been safely picked up from home and ${
            plural ? "are" : "is"
          } now on the way to school.`,
          "",
          "Thank you,",
          "Via Nova Scholar Transport",
        ].join("\n");

        whatsappTemplate = {
          name:
            "learner_picked_up_from_home",

          languageCode:
            WHATSAPP_LANGUAGE_CODE,

          parameters: [
            recipientFirstName,
            learnerNames,
          ],
        };

        break;
      }

      if (
        notification.tripDirection ===
        "school_to_home"
      ) {
        title =
          "Learner Picked Up";

        body = [
          `Good day ${recipientFirstName},`,
          "",
          `${learnerNames} ${
            plural ? "have" : "has"
          } been safely picked up from school and ${
            plural ? "are" : "is"
          } now on the way home.`,
          "",
          "Thank you,",
          "Via Nova Scholar Transport",
        ].join("\n");

        whatsappTemplate = {
          name:
            "learner_picked_up_from_school",

          languageCode:
            WHATSAPP_LANGUAGE_CODE,

          parameters: [
            recipientFirstName,
            learnerNames,
          ],
        };

        break;
      }

      body = [
        `Hi ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "have" : "has"
        } been safely picked up and ${
          plural ? "are" : "is"
        } now on board.`,
      ].join("\n");

      break;
    }

    case "next_for_dropoff": {
      title =
        "Next For Drop-Off";

      body = [
        `Good day ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "are" : "is"
        } next for drop-off.`,
        "",
        `Please be ready to receive ${
          plural
            ? "them"
            : learnerNames
        } at the agreed drop-off location.`,
        "",
        "Thank you,",
        "Via Nova Scholar Transport",
      ].join("\n");

      whatsappTemplate = {
        name:
          "learner_next_for_dropoff",

        languageCode:
          WHATSAPP_LANGUAGE_CODE,

        parameters: [
          recipientFirstName,
          learnerNames,
        ],
      };

      break;
    }

    case "dropped_off": {
      if (
        notification.tripDirection ===
        "home_to_school"
      ) {
        title =
          "Learner Dropped Off";

        body = [
          `Good day ${recipientFirstName},`,
          "",
          `${learnerNames} ${
            plural ? "have" : "has"
          } been safely dropped off at school.`,
          "",
          "Thank you,",
          "Via Nova Scholar Transport",
        ].join("\n");

        whatsappTemplate = {
          name:
            "learner_dropped_off_at_school",

          languageCode:
            WHATSAPP_LANGUAGE_CODE,

          parameters: [
            recipientFirstName,
            learnerNames,
          ],
        };

        break;
      }

      if (
        notification.tripDirection ===
        "school_to_home"
      ) {
        title =
          "Learner Dropped Off";

        body = [
          `Good day ${recipientFirstName},`,
          "",
          `${learnerNames} ${
            plural ? "have" : "has"
          } been safely dropped off at home.`,
          "",
          "Thank you,",
          "Via Nova Scholar Transport",
        ].join("\n");

        whatsappTemplate = {
          name:
            "learner_dropped_off_at_home",

          languageCode:
            WHATSAPP_LANGUAGE_CODE,

          parameters: [
            recipientFirstName,
            learnerNames,
          ],
        };

        break;
      }

      body = [
        `Hi ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "have" : "has"
        } been safely dropped off.`,
      ].join("\n");

      break;
    }

    case "learner_absent": {
      title =
        "Learner Absent";

      body = [
        `Good day ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "have" : "has"
        } been marked absent for today's transport run.`,
        "",
        "Please contact the transport office if this is incorrect.",
        "",
        "Thank you,",
        "Via Nova Scholar Transport",
      ].join("\n");

      whatsappTemplate = {
        name:
          "learner_absent",

        languageCode:
          WHATSAPP_LANGUAGE_CODE,

        parameters: [
          recipientFirstName,
          learnerNames,
        ],
      };

      break;
    }

    case "learner_no_show": {
      title =
        "Learner No Show";

      body = [
        `Good day ${recipientFirstName},`,
        "",
        `${learnerNames} ${
          plural ? "were" : "was"
        } not available for collection when the driver arrived.`,
        "",
        "The learner has been marked as a no-show for this transport run.",
        "",
        "Please contact Via Nova Scholar Transport if this is incorrect.",
        "",
        "Thank you,",
        "Via Nova Scholar Transport",
      ].join("\n");

      whatsappTemplate = {
        name:
          "learner_no_show",

        languageCode:
          WHATSAPP_LANGUAGE_CODE,

        parameters: [
          recipientFirstName,
          learnerNames,
        ],
      };

      break;
    }

    case "trip_created": {
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `A new transport trip has been scheduled for ${learnerNames}.`,
      ].join("\n");

      break;
    }

    default: {
      body = [
        `Hi ${recipientFirstName},`,
        "",
        `There is a new transport update regarding ${learnerNames}.`,
      ].join("\n");
    }
  }

  return {
    title,
    body,

    eventType:
      notification.eventType,

    learnerNames:
      notification.learnerNames,

    trackingLink:
      null,

    whatsappTemplate,
  };
}