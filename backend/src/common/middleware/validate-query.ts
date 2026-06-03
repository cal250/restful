import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

/** Validates and parses query string parameters against a Zod schema. */
export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    Object.assign(req.query, schema.parse(req.query));
    next();
  };
}
