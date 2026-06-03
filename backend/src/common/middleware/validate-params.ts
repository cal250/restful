import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    req.params = schema.parse(req.params);
    next();
  };
}
