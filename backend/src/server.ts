import "dotenv/config";

import { sendWhatsAppMessage } from "./services/whatsapp.service.js";

import cors from "cors";

import express, {
  type Request,
  type Response,
} from "express";

import {
  supabase,
} from "./config/supabase.js";

import {
  registerEventHandlers,
} from "./events/register-event-handlers.js";

import applicationRoutes from "./routes/application.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import routeRoutes from "./routes/route.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import learnerRoutes from "./routes/learner.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import tripRoutes from "./routes/trip.routes.js";

import {
  driverTripRouter,
} from "./routes/driver-trip.routes.js";

const app =
  express();

app.use(
  cors(),
);

app.use(
  express.json(),
);

app.use(
  "/applications",
  applicationRoutes,
);

app.use(
  "/parents",
  parentRoutes,
);

app.use(
  "/learners",
  learnerRoutes,
);

app.use(
  "/contacts",
  contactRoutes,
);

app.use(
  "/drivers",
  driverRoutes,
);

app.use(
  "/vehicles",
  vehicleRoutes,
);

app.use(
  "/routes",
  routeRoutes,
);

app.use(
  "/trips",
  tripRoutes,
);

app.use(
  "/notifications",
  notificationRoutes,
);

/*
 * Driver-facing operational routes.
 *
 * Examples:
 * /driver/me/dashboard
 * /driver/trips/:tripId/start
 * /driver/trips/:tripId/stops/:stopId/pick-up
 */
app.use(
  "/driver",
  driverTripRouter,
);

app.get(
  "/health",
  async (
    _request: Request,
    response: Response,
  ): Promise<void> => {
    const {
      error,
    } =
      await supabase
        .from(
          "parents",
        )
        .select(
          "id",
        )
        .limit(1);

    if (error) {
      response
        .status(500)
        .json({
          status:
            "error",

          message:
            "API is running, but Supabase is not ready",

          databaseError:
            error.message,
        });

      return;
    }

    response
      .status(200)
      .json({
        status:
          "ok",

        message:
          "Scholar transport API is connected to Supabase",
      });
  },
);

registerEventHandlers();

const port =
  Number(
    process.env.PORT,
  ) ||
  3001;

  app.post("/api/test-whatsapp", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        error: "Phone number is required",
      });
    }

    const result = await sendWhatsAppMessage(
      to,
      "Hello 👋 This is a test message from Via Nova Scholar Transport.",
    );

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("WhatsApp test failed:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
});

app.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `API running on port ${port}`,
    );
    console.log(
      `Local:   http://localhost:${port}`,
    );
    console.log(
      `Network: http://192.168.1.118:${port}`,
    );
  },
);