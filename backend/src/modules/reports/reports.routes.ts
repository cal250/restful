import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import * as controller from "./reports.controller.js";

export const reportsRoutes = Router();

reportsRoutes.use(authenticate);
reportsRoutes.get("/", controller.dashboard);
reportsRoutes.get("/export.csv", controller.csv);
reportsRoutes.get("/export.pdf", controller.pdf);
