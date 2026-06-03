import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { inspectionsService } from "./inspections.service.js";

export const list: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.list(req.query as never))); } catch (error) { next(error); }
};
export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.get(String(req.params.id)))); } catch (error) { next(error); }
};
export const schedule: RequestHandler = async (req, res, next) => {
  try { res.status(201).json(success(await inspectionsService.schedule(req.body, req.user!.id), "Inspection scheduled")); } catch (error) { next(error); }
};
export const update: RequestHandler = async (req, res, next) => {
  try { res.json(success(await inspectionsService.update(String(req.params.id), req.body), "Inspection updated")); } catch (error) { next(error); }
};
