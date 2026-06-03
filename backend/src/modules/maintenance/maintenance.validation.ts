import { z } from "zod";

export const createMaintenanceSchema = z.object({
  extinguisherId: z.string().uuid(),
  actionTaken: z.string().trim().min(1).max(1000),
  issuesIdentified: z.string().trim().max(1000).optional(),
  recommendations: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
  maintenanceDate: z.coerce.date()
});

export const maintenanceIdSchema = z.object({ id: z.string().uuid() });
export const maintenanceQuerySchema = z.object({ extinguisherId: z.string().uuid().optional() });

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type MaintenanceQuery = z.infer<typeof maintenanceQuerySchema>;
