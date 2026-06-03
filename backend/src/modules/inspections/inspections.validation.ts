import { InspectionStatus } from "@prisma/client";
import { z } from "zod";

/** Validates payloads used when scheduling a new inspection. */
export const scheduleInspectionSchema = z.object({
  extinguisherId: z.string().uuid(),
  inspectionDate: z.coerce.date(),
  inspectionTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
});

/** Validates updates to an inspection's status, result, and notes. */
export const updateInspectionSchema = z.object({
  status: z.nativeEnum(InspectionStatus),
  result: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional()
});

/** Validates an inspection UUID route parameter. */
export const inspectionIdSchema = z.object({ id: z.string().uuid() });

/** Validates optional list filters such as status and extinguisher ID. */
export const inspectionQuerySchema = z.object({
  status: z.nativeEnum(InspectionStatus).optional(),
  extinguisherId: z.string().uuid().optional()
});

export type ScheduleInspectionInput = z.infer<typeof scheduleInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
export type InspectionQuery = z.infer<typeof inspectionQuerySchema>;
