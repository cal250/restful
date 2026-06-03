import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./common/middleware/error-handler.js";
import { notFound } from "./common/middleware/not-found.js";
import { env } from "./config/env.js";
import { openapi } from "./docs/openapi.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { extinguishersRoutes } from "./modules/extinguishers/extinguishers.routes.js";
import { inspectionsRoutes } from "./modules/inspections/inspections.routes.js";
import { maintenanceRoutes } from "./modules/maintenance/maintenance.routes.js";
import { reportsRoutes } from "./modules/reports/reports.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ success: true, message: "API is healthy" }));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/extinguishers", extinguishersRoutes);
app.use("/api/v1/inspections", inspectionsRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);

app.use(notFound);
app.use(errorHandler);
