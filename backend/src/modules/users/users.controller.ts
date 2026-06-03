import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { usersService } from "./users.service.js";

export const list: RequestHandler = async (_req, res, next) => {
  try { res.json(success(await usersService.list())); } catch (error) { next(error); }
};

export const get: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.get(String(req.params.id)))); } catch (error) { next(error); }
};

export const update: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.update(String(req.params.id), req.body), "User updated")); } catch (error) { next(error); }
};

export const remove: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.remove(String(req.params.id), req.user!.id), "User deleted")); } catch (error) { next(error); }
};

export const profile: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.get(req.user!.id))); } catch (error) { next(error); }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try { res.json(success(await usersService.updateProfile(req.user!.id, req.body), "Profile updated")); } catch (error) { next(error); }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    await usersService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json(success(null, "Password changed"));
  } catch (error) { next(error); }
};
