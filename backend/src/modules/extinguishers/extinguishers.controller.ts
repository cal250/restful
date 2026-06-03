import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { extinguishersService } from "./extinguishers.service.js";

/** Lists extinguishers using optional search, status, and type filters. */
export const list: RequestHandler = async (req, res, next) => {
  try { res.json(success(await extinguishersService.list(req.query as never))); } catch (error) { next(error); }
};

/** Returns full details for one extinguisher identified by UUID. */
export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await extinguishersService.get(String(req.params.id)))); } catch (error) { next(error); }
};

/** Registers a new extinguisher on behalf of the authenticated user. */
export const create: RequestHandler = async (req, res, next) => {
  try { res.status(201).json(success(await extinguishersService.create(req.body, req.user!.id), "Extinguisher created")); } catch (error) { next(error); }
};

/** Updates an existing extinguisher record. */
export const update: RequestHandler = async (req, res, next) => {
  try { res.json(success(await extinguishersService.update(String(req.params.id), req.body), "Extinguisher updated")); } catch (error) { next(error); }
};

/** Deletes an extinguisher from the inventory. */
export const remove: RequestHandler = async (req, res, next) => {
  try { res.json(success(await extinguishersService.remove(String(req.params.id)), "Extinguisher deleted")); } catch (error) { next(error); }
};
