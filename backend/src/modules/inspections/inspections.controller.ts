import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { inspectionsService } from "./inspections.service.js";

/** Lists inspections using optional status and extinguisher filters. */
export const list: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.list(req.query as never))); } catch (error) { next(error); }
};

/** Returns full details for one inspection by UUID. */
export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.get(String(req.params.id)))); } catch (error) { next(error); }
};

/** Schedules a new inspection for an extinguisher. */
export const schedule: RequestHandler = async (req, res, next) => {
  try { res.status(201).json(success(await inspectionsService.schedule(req.body, req.user!.id), "Inspection scheduled")); } catch (error) { next(error); }
};

/** Updates an existing inspection's status, result, or notes. */
export const update: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.update(String(req.params.id), req.body), "Inspection updated")); } catch (error) { next(error); }
};
