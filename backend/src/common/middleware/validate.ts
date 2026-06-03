import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
