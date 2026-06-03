import { ExtinguisherStatus, ExtinguisherType } from "@prisma/client";
import { z } from "zod";
import { EXTINGUISHER_SIZES } from "./extinguisher-sizes.js";

/** Status values allowed when registering a newly installed extinguisher. */
export const REGISTRATION_STATUSES = [
  ExtinguisherStatus.ACTIVE,
  ExtinguisherStatus.OUT_OF_SERVICE,
  ExtinguisherStatus.UNDER_MAINTENANCE
] as const;

const fields = {
  serialNumber: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(200),
  type: z.nativeEnum(ExtinguisherType),
  size: z.enum(EXTINGUISHER_SIZES),
  installationDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  status: z.nativeEnum(ExtinguisherStatus)
};

/** Normalizes a date to midnight UTC for day-level comparisons. */
function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Returns today's date at midnight UTC. */
function todayUtc(): Date {
  return startOfDay(new Date());
}

/** Validates installation and expiry dates against business rules for the given status. */
export function collectExtinguisherDateIssues(
  installationDate: Date,
  expiryDate: Date,
  status: ExtinguisherStatus
): { path: "installationDate" | "expiryDate" | "status"; message: string }[] {
  const issues: { path: "installationDate" | "expiryDate" | "status"; message: string }[] = [];
  const installation = startOfDay(installationDate);
  const expiry = startOfDay(expiryDate);
  const today = todayUtc();

  if (installation > today) {
    issues.push({ path: "installationDate", message: "Installation date cannot be in the future" });
  }
  if (expiry <= installation) {
    issues.push({ path: "expiryDate", message: "Expiry date must be after installation date" });
  }
  if (status === "ACTIVE" && expiry <= today) {
    issues.push({ path: "expiryDate", message: "Cannot register an active extinguisher that is already expired" });
  }

  return issues;
}

/** Adds collected date validation issues to a Zod refinement context. */
function applyExtinguisherDateIssues(
  installationDate: Date,
  expiryDate: Date,
  status: ExtinguisherStatus,
  ctx: z.RefinementCtx
): void {
  for (const issue of collectExtinguisherDateIssues(installationDate, expiryDate, status)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message, path: [issue.path] });
  }
}

/** Validates payloads used when registering a new extinguisher in the system. */
export const createExtinguisherSchema = z.object(fields).superRefine((value, ctx) => {
  if (value.status === ExtinguisherStatus.EXPIRED) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New extinguishers cannot be registered with an expired status",
      path: ["status"]
    });
  }
  applyExtinguisherDateIssues(value.installationDate, value.expiryDate, value.status, ctx);
});

/** Validates partial updates to an existing extinguisher record. */
export const updateExtinguisherSchema = z.object(fields).partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required")
  .superRefine((value, ctx) => {
    if (value.installationDate && value.expiryDate && value.status) {
      applyExtinguisherDateIssues(value.installationDate, value.expiryDate, value.status, ctx);
    }
  });

export const extinguisherIdSchema = z.object({ id: z.string().uuid() });

/** Validates optional list filters such as free-text search, status, and type. */
export const extinguisherQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(ExtinguisherStatus).optional(),
  type: z.nativeEnum(ExtinguisherType).optional()
});

export type CreateExtinguisherInput = z.infer<typeof createExtinguisherSchema>;
export type UpdateExtinguisherInput = z.infer<typeof updateExtinguisherSchema>;
export type ExtinguisherQuery = z.infer<typeof extinguisherQuerySchema>;
