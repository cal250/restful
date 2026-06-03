import { z } from "zod";

const password = z.string().min(8).max(72)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

/** Validates payloads used when registering a new account. */
export const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password,
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50)
});

/** Validates credentials submitted for login. */
export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

/** Validates the email address for a password reset request. */
export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: "Email is required" }).trim().min(1, "Email is required").email().transform((value) => value.toLowerCase())
});

/** Validates a reset token and new password pair. */
export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password
});

/** Validates the OTP submitted to complete registration. */
export const verifyRegistrationOtpSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, "Verification code must be a 6-digit number")
});

/** Validates the email address used to resend a registration OTP. */
export const resendRegistrationOtpSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase())
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyRegistrationOtpInput = z.infer<typeof verifyRegistrationOtpSchema>;
