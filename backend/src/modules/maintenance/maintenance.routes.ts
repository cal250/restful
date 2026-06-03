import { Role } from "@prisma/client";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { validateParams } from "../../common/middleware/validate-params.js";
import { validateQuery } from "../../common/middleware/validate-query.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import * as controller from "./maintenance.controller.js";
import * as schemas from "./maintenance.validation.js";

export const maintenanceRoutes = Router();

maintenanceRoutes.use(authenticate);
maintenanceRoutes.get("/", authorize(Role.ADMIN, Role.INSPECTOR), validateQuery(schemas.maintenanceQuerySchema), controller.list);
maintenanceRoutes.get("/:id", authorize(Role.ADMIN, Role.INSPECTOR), validateParams(schemas.maintenanceIdSchema), controller.get);
maintenanceRoutes.post("/", authorize(Role.ADMIN, Role.INSPECTOR), validate(schemas.createMaintenanceSchema), controller.create);
