import { z } from "zod";

/** Validates payloads used when logging a maintenance action. */
export const createMaintenanceSchema = z.object({
  extinguisherId: z.string().uuid(),
  actionTaken: z.string().trim().min(1).max(1000),
  issuesIdentified: z.string().trim().max(1000).optional(),
  recommendations: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
  maintenanceDate: z.coerce.date()
});

/** Validates a maintenance record UUID route parameter. */
export const maintenanceIdSchema = z.object({ id: z.string().uuid() });

/** Validates optional list filters such as extinguisher ID. */
export const maintenanceQuerySchema = z.object({ extinguisherId: z.string().uuid().optional() });

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type MaintenanceQuery = z.infer<typeof maintenanceQuerySchema>;
