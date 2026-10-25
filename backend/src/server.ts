import "dotenv/config";

import cors from "cors";
import express from "express";

import crmRoutes from "./routes/crm.routes.js";
import publicRoutes from "./routes/public.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

const app =
  express();

/*
 * The application sits behind Nginx.
 *
 * This allows Express to correctly identify
 * the originating client's IP address.
 */
app.set(
  "trust proxy",
  1,
);

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
      status:
        "healthy",
      timestamp:
        new Date().toISOString(),
    });
  },
);

/*
 * Public API
 *
 * No login required.
 *
 * Only deliberately exposed
 * customer-facing operations
 * belong here.
 */
app.use(
  "/api/public",
  publicRoutes,
);

/*
 * WhatsApp API
 *
 * Meta webhook endpoints remain public
 * where required by WhatsApp.
 *
 * Admin WhatsApp endpoints remain
 * protected inside the WhatsApp router.
 */
app.use(
  "/api/whatsapp",
  whatsappRoutes,
);

/*
 * CRM API
 *
 * Protected by Supabase authentication
 * and admin authorization inside
 * crm.routes.ts.
 */
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