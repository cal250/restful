import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { usersService } from "./users.service.js";

/** Lists all users (admin only). */
export const list: RequestHandler = async (_req, res, next) => {
  try { res.json(success(await usersService.list())); } catch (error) { next(error); }
};

/** Returns full details for one user by UUID (admin only). */
export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.get(String(req.params.id)))); } catch (error) { next(error); }
};

/** Updates an existing user record (admin only). */
export const update: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.update(String(req.params.id), req.body), "User updated")); } catch (error) { next(error); }
};

/** Permanently removes a user account (admin only). */
export const remove: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.remove(String(req.params.id), req.user!.id), "User deleted")); } catch (error) { next(error); }
};

/** Returns the authenticated user's profile. */
export const profile: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.get(req.user!.id))); } catch (error) { next(error); }
};

/** Updates the authenticated user's profile fields. */
export const updateProfile: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.updateProfile(req.user!.id, req.body), "Profile updated")); } catch (error) { next(error); }
};

/** Changes the authenticated user's password after verifying the current one. */
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    await usersService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json(success(null, "Password changed"));
  } catch (error) { next(error); }
};
