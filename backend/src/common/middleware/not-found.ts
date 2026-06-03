import { RequestHandler } from "express";

/** Responds with 404 when no matching route handler is found. */
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found", code: "ROUTE_NOT_FOUND" });
};
