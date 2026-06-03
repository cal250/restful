import { z } from "zod";

const password = z.string().min(8).max(72)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password,
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50)
});

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: "Email is required" }).trim().min(1, "Email is required").email().transform((value) => value.toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
