import { Role } from "@prisma/client";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { validateParams } from "../../common/middleware/validate-params.js";
import { validateQuery } from "../../common/middleware/validate-query.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import * as controller from "./extinguishers.controller.js";
import * as schemas from "./extinguishers.validation.js";

export const extinguishersRoutes = Router();

extinguishersRoutes.use(authenticate);
extinguishersRoutes.get("/", validateQuery(schemas.extinguisherQuerySchema), controller.list);
extinguishersRoutes.get("/:id", validateParams(schemas.extinguisherIdSchema), controller.get);
extinguishersRoutes.post("/", authorize(Role.ADMIN), validate(schemas.createExtinguisherSchema), controller.create);
extinguishersRoutes.patch("/:id", authorize(Role.ADMIN), validateParams(schemas.extinguisherIdSchema), validate(schemas.updateExtinguisherSchema), controller.update);
extinguishersRoutes.delete("/:id", authorize(Role.ADMIN), validateParams(schemas.extinguisherIdSchema), controller.remove);
