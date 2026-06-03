import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(1000)
});

export const notificationIdSchema = z.object({ id: z.string().uuid() });
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
