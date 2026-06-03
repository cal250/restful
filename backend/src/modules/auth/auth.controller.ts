import { RequestHandler } from "express";
import { success } from "../../common/http/api-response.js";
import { authService } from "./auth.service.js";

/** Registers a new user account and returns auth credentials. */
export const register: RequestHandler = async (req, res, next) => {
  try {
    res.status(201).json(success(await authService.register(req.body), "Account created"));
  } catch (error) { next(error); }
};

/** Authenticates a user and returns an access token. */
export const login: RequestHandler = async (req, res, next) => {
  try {
    res.json(success(await authService.login(req.body), "Login successful"));
  } catch (error) { next(error); }
};

/** Revokes the current session and signs the user out. */
export const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logout(req.user!.tokenId);
    res.json(success(null, "Logout successful"));
  } catch (error) { next(error); }
};

/** Initiates a password reset flow for the supplied email address. */
export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    const data = process.env.NODE_ENV === "production" ? null : { resetToken: token };
    res.json(success(data, "If the account exists, reset instructions have been created"));
  } catch (error) { next(error); }
};

/** Sets a new password using a valid reset token. */
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json(success(null, "Password reset successful"));
  } catch (error) { next(error); }
};
