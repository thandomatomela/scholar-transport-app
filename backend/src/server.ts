import "dotenv/config";
import cors from "cors";
import express, {
  type Request,
  type Response,
} from "express";

import { supabase } from "./config/supabase.js";
import { registerEventHandlers } from "./events/register-event-handlers.js";

import contactRoutes from "./routes/contact.routes.js";
import learnerRoutes from "./routes/learner.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import { driverTripRouter } from "./routes/driver-trip.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/parents", parentRoutes);
app.use("/learners", learnerRoutes);
app.use("/contacts", contactRoutes);
app.use("/trips", tripRoutes);
app.use("/notifications", notificationRoutes);
app.use("/driver", driverTripRouter);

app.get(
  "/health",
  async (_request: Request, response: Response): Promise<void> => {
    const { error } = await supabase
      .from("parents")
      .select("id")
      .limit(1);

    if (error) {
      response.status(500).json({
        status: "error",
        message: "API is running, but Supabase is not ready",
        databaseError: error.message,
      });

      return;
    }

    response.status(200).json({
      status: "ok",
      message: "Scholar transport API is connected to Supabase",
    });
  },
);

registerEventHandlers();

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});