import "dotenv/config";

import cors from "cors";
import express from "express";

import crmRoutes from "./routes/crm.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get(
  "/health",
  (_request, response) => {
    response.status(200).json({
      success: true,
      service:
        "Via Nova Scholar Transport API",
      status: "healthy",
      timestamp:
        new Date().toISOString(),
    });
  },
);

app.use(
  "/api/whatsapp",
  whatsappRoutes,
);

app.use(
  "/api/crm",
  crmRoutes,
);

const port =
  Number(
    process.env.PORT,
  ) || 3001;

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
      `Network: http://0.0.0.0:${port}`,
    );
  },
);