import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/auth/auth.repository.js", () => ({
  authRepository: {
    findUserByEmail: vi.fn(),
    createUser: vi.fn(),
    createResetToken: vi.fn(),
    createSession: vi.fn(),
    findActiveSession: vi.fn(),
    revokeSession: vi.fn(),
    findResetToken: vi.fn(),
    resetPassword: vi.fn(),
    findRegistrationOtp: vi.fn(),
    upsertRegistrationOtp: vi.fn(),
    incrementRegistrationOtpAttempts: vi.fn(),
    deleteRegistrationOtp: vi.fn()
  }
}));
vi.mock("../src/modules/auth/password.service.js", () => ({
  passwordService: { hash: vi.fn(), verify: vi.fn() }
}));
vi.mock("../src/modules/auth/token.service.js", () => ({
  tokenService: {
    createTokenId: vi.fn(() => "token-id"),
    signAccessToken: vi.fn(() => "jwt"),
    getExpiry: vi.fn(() => new Date("2030-01-01")),
    createResetToken: vi.fn(() => ({ token: "reset", tokenHash: "hash" })),
    hashResetToken: vi.fn((value: string) => `hash:${value}`),
    createRegistrationOtp: vi.fn(() => ({ otp: "123456" }))
  }
}));

import { authRepository } from "../src/modules/auth/auth.repository.js";
import { authService } from "../src/modules/auth/auth.service.js";
import { passwordService } from "../src/modules/auth/password.service.js";

const user = {
  id: "user-id", email: "user@example.com", passwordHash: "hash", firstName: "Jane",
  lastName: "Doe", role: Role.USER, isActive: true, createdAt: new Date(), updatedAt: new Date()
};
const input = { email: user.email, password: "SecurePass1", firstName: "Jane", lastName: "Doe" };
const pendingRegistration = {
  id: "pending-id",
  email: user.email,
  passwordHash: "hash",
  firstName: "Jane",
  lastName: "Doe",
  otp: "123456",
  expiresAt: new Date("2030-01-01"),
  attempts: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(passwordService.hash).mockResolvedValue("hash");
    vi.mocked(passwordService.verify).mockResolvedValue(true);
  });

  it("starts registration with an OTP instead of creating the account immediately", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    await expect(authService.register(input)).resolves.toMatchObject({
      email: user.email,
      expiresInMinutes: 10
    });
    expect(authRepository.upsertRegistrationOtp).toHaveBeenCalled();
    expect(authRepository.createUser).not.toHaveBeenCalled();
  });

  it("prevents duplicate registration", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(user);
    await expect(authService.register(input)).rejects.toMatchObject({ code: "USER_EMAIL_EXISTS" });
  });

  it("verifies registration OTP and creates the account", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(authRepository.findRegistrationOtp).mockResolvedValue(pendingRegistration);
    vi.mocked(authRepository.createUser).mockResolvedValue(user);
    await expect(authService.verifyRegistrationOtp({ email: user.email, otp: "123456" }))
      .resolves.toMatchObject({ token: "jwt", user: { email: user.email } });
    expect(authRepository.deleteRegistrationOtp).toHaveBeenCalledWith(user.email);
  });

  it("rejects invalid registration OTP codes", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(authRepository.findRegistrationOtp).mockResolvedValue(pendingRegistration);
    await expect(authService.verifyRegistrationOtp({ email: user.email, otp: "000000" }))
      .rejects.toMatchObject({ code: "INVALID_REGISTRATION_OTP" });
    expect(authRepository.incrementRegistrationOtpAttempts).toHaveBeenCalledWith(user.email);
  });

  it("logs in active users and rejects invalid or inactive users", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(user);
    await expect(authService.login(input)).resolves.toMatchObject({ token: "jwt" });
    vi.mocked(passwordService.verify).mockResolvedValue(false);
    await expect(authService.login(input)).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    vi.mocked(passwordService.verify).mockResolvedValue(true);
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ ...user, isActive: false });
    await expect(authService.login(input)).rejects.toMatchObject({ code: "ACCOUNT_INACTIVE" });
  });

  it("creates reset tokens without revealing unknown accounts", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    await expect(authService.forgotPassword("missing@example.com")).resolves.toBeUndefined();
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(user);
    await expect(authService.forgotPassword(user.email)).resolves.toBe("reset");
    expect(authRepository.createResetToken).toHaveBeenCalled();
  });

  it("resets passwords only with valid unused tokens", async () => {
    vi.mocked(authRepository.findResetToken).mockResolvedValue(null);
    await expect(authService.resetPassword("bad", "NewPass2")).rejects.toMatchObject({ code: "INVALID_RESET_TOKEN" });
    vi.mocked(authRepository.findResetToken).mockResolvedValue({
      id: "reset-id", tokenHash: "hash", expiresAt: new Date("2030-01-01"), usedAt: null,
      createdAt: new Date(), userId: user.id, user
    });
    await authService.resetPassword("good", "NewPass2");
    expect(authRepository.resetPassword).toHaveBeenCalled();
  });

  it("revokes sessions on logout", async () => {
    await authService.logout("token-id");
    expect(authRepository.revokeSession).toHaveBeenCalledWith("token-id");
  });
});
