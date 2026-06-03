import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyRegistrationOtpSchema } from "../src/modules/auth/auth.validation.js";

describe("registerSchema", () => {
  it("normalizes valid registration input", () => {
    const result = registerSchema.parse({
      email: "USER@EXAMPLE.COM",
      password: "SecurePass1",
      firstName: " Jane ",
      lastName: " Doe "
    });
    expect(result.email).toBe("user@example.com");
    expect(result.firstName).toBe("Jane");
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password",
      firstName: "Jane",
      lastName: "Doe"
    });
    expect(result.success).toBe(false);
  });

  it("validates login and password reset requests", () => {
    expect(loginSchema.safeParse({ email: "USER@EXAMPLE.COM", password: "x" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
    expect(forgotPasswordSchema.parse({ email: " Admin@Example.COM " }).email).toBe("admin@example.com");
    expect(resetPasswordSchema.safeParse({ token: "x".repeat(32), password: "SecurePass1" }).success).toBe(true);
    expect(verifyRegistrationOtpSchema.safeParse({ email: "user@example.com", otp: "123456" }).success).toBe(true);
    expect(verifyRegistrationOtpSchema.safeParse({ email: "user@example.com", otp: "12" }).success).toBe(false);
  });
});
