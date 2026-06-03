import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { maintenanceService } from "./maintenance.service.js";

/** Lists maintenance records using an optional extinguisher filter. */
export const list: RequestHandler = async (req, res, next) => {
  try { res.json(success(await maintenanceService.list(req.query as never))); } catch (error) { next(error); }
};

/** Returns full details for one maintenance record by UUID. */
export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await maintenanceService.get(String(req.params.id)))); } catch (error) { next(error); }
};

/** Logs a new maintenance action for an extinguisher. */
export const create: RequestHandler = async (req, res, next) => {
  try { res.status(201).json(success(await maintenanceService.create(req.body, req.user!.id), "Maintenance logged")); } catch (error) { next(error); }
};
