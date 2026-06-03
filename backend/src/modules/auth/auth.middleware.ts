import { Role } from "@prisma/client";
import { RequestHandler } from "express";
import { AppError } from "../../common/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import { tokenService } from "./token.service.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"));
    return;
  }
  try {
    const payload = tokenService.verifyAccessToken(header.slice(7));
    const session = await authRepository.findActiveSession(payload.jti);
    if (!session) throw new Error("Session not active");
    req.user = { id: payload.sub, role: payload.role, tokenId: payload.jti };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
  }
};

export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError("You do not have permission", 403, "FORBIDDEN"));
      return;
    }
    next();
  };
}
