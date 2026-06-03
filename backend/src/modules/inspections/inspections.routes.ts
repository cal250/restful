import { Role } from "@prisma/client";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { validateParams } from "../../common/middleware/validate-params.js";
import { validateQuery } from "../../common/middleware/validate-query.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import * as controller from "./inspections.controller.js";
import * as schemas from "./inspections.validation.js";

export const inspectionsRoutes = Router();

inspectionsRoutes.use(authenticate);
inspectionsRoutes.get("/", validateQuery(schemas.inspectionQuerySchema), controller.list);
inspectionsRoutes.get("/:id", validateParams(schemas.inspectionIdSchema), controller.get);
inspectionsRoutes.post("/", validate(schemas.scheduleInspectionSchema), controller.schedule);
inspectionsRoutes.patch("/:id", authorize(Role.ADMIN, Role.INSPECTOR), validateParams(schemas.inspectionIdSchema), validate(schemas.updateInspectionSchema), controller.update);
