import { Role } from "@prisma/client";
import { z } from "zod";

/** Validates a user UUID route parameter. */
export const userIdSchema = z.object({ id: z.string().uuid() });

/** Validates admin updates to an existing user record. */
export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional()
}).refine((value) => Object.keys(value).length > 0, "At least one field is required");

/** Validates self-service profile updates. */
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional()
}).refine((value) => Object.keys(value).length > 0, "At least one field is required");

/** Validates a password change request with strength rules. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8).max(72)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "New password must be different from the current password",
  path: ["newPassword"]
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
