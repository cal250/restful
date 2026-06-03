import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { notificationsService } from "./notifications.service.js";

/** Lists notifications for the authenticated user. */
export const list: RequestHandler = async (req, res, next) => {
  try { res.json(success(await notificationsService.listForUser(req.user!.id))); } catch (error) { next(error); }
};

/** Creates a notification for a target user (admin only). */
export const create: RequestHandler = async (req, res, next) => {
  try { res.status(201).json(success(await notificationsService.create(req.body), "Notification created")); } catch (error) { next(error); }
};

/** Marks a notification as read for the authenticated user. */
export const markRead: RequestHandler = async (req, res, next) => {
  try { res.json(success(await notificationsService.markRead(String(req.params.id), req.user!.id), "Notification read")); } catch (error) { next(error); }
};
