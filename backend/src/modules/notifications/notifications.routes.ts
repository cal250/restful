import { Role } from "@prisma/client";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { validateParams } from "../../common/middleware/validate-params.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import * as controller from "./notifications.controller.js";
import * as schemas from "./notifications.validation.js";

export const notificationsRoutes = Router();

notificationsRoutes.use(authenticate);
notificationsRoutes.get("/", controller.list);
notificationsRoutes.post("/", authorize(Role.ADMIN), validate(schemas.createNotificationSchema), controller.create);
notificationsRoutes.patch("/:id/read", validateParams(schemas.notificationIdSchema), controller.markRead);
