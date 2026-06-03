import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

/** Validates and parses the request body against a Zod schema. */
export function validate(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
