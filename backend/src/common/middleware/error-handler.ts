import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message, code: error.code });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, message: "Validation failed", code: "VALIDATION_ERROR", errors: error.flatten() });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ success: false, message: "A unique value already exists", code: "DUPLICATE_VALUE" });
    return;
  }
  res.status(500).json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" });
};
