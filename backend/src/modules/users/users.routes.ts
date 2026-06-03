import { Role } from "@prisma/client";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { validateParams } from "../../common/middleware/validate-params.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import * as controller from "./users.controller.js";
import { changePasswordSchema, updateProfileSchema, updateUserSchema, userIdSchema } from "./users.validation.js";

export const usersRoutes = Router();

usersRoutes.use(authenticate);
usersRoutes.get("/profile", controller.profile);
usersRoutes.patch("/profile", validate(updateProfileSchema), controller.updateProfile);
usersRoutes.post("/profile/change-password", validate(changePasswordSchema), controller.changePassword);
usersRoutes.get("/", authorize(Role.ADMIN), controller.list);
usersRoutes.get("/:id", authorize(Role.ADMIN), validateParams(userIdSchema), controller.get);
usersRoutes.patch("/:id", authorize(Role.ADMIN), validateParams(userIdSchema), validate(updateUserSchema), controller.update);
usersRoutes.delete("/:id", authorize(Role.ADMIN), validateParams(userIdSchema), controller.remove);
